'use strict';

// =============================================
// ヘッダー: スクロール時のシャドウ
// =============================================
(function initHeaderScroll() {
  var header = document.getElementById('site-header');
  if (!header) return;

  function onScroll() {
    header.classList.toggle('is-scrolled', window.scrollY > 10);
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
})();


// =============================================
// ハンバーガーメニュー
// =============================================
(function initMobileMenu() {
  var hamburger = document.getElementById('hamburger');
  var nav = document.getElementById('global-nav');
  if (!hamburger || !nav) return;

  function closeMenu() {
    hamburger.classList.remove('is-active');
    hamburger.setAttribute('aria-expanded', 'false');
    hamburger.setAttribute('aria-label', 'メニューを開く');
    nav.classList.remove('is-open');
    document.body.style.overflow = ''; // スクロールロック解除
  }

  function openMenu() {
    hamburger.classList.add('is-active');
    hamburger.setAttribute('aria-expanded', 'true');
    hamburger.setAttribute('aria-label', 'メニューを閉じる');
    nav.classList.add('is-open');
    document.body.style.overflow = 'hidden'; // スクロールロック（2026-07-02: メニュー開中の背景スクロール防止）
  }

  hamburger.addEventListener('click', function () {
    nav.classList.contains('is-open') ? closeMenu() : openMenu();
  });

  nav.querySelectorAll('.nav-link').forEach(function (link) {
    link.addEventListener('click', closeMenu);
  });

  document.addEventListener('click', function (e) {
    if (nav.classList.contains('is-open') &&
        !nav.contains(e.target) &&
        !hamburger.contains(e.target)) {
      closeMenu();
    }
  });

  window.addEventListener('resize', function () {
    if (window.innerWidth >= 768) closeMenu();
  });
})();


// =============================================
// スクロールアニメーション（IntersectionObserver）
// =============================================
(function initFadeIn() {
  var elements = document.querySelectorAll('.fade-in');
  if (!elements.length) return;

  if (!('IntersectionObserver' in window)) {
    elements.forEach(function (el) { el.classList.add('is-visible'); });
    return;
  }

  var observer = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.1, rootMargin: '0px 0px -32px 0px' }
  );

  elements.forEach(function (el) { observer.observe(el); });
})();


// =============================================
// フッター著作権年の自動更新
// =============================================
(function initFooterYear() {
  var yearEl = document.getElementById('footer-year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();
})();


// =============================================
// お問い合わせフォーム（バリデーション + Formspree送信）
//
// TODO: Formspree の設定手順
//   1. https://formspree.io にアクセスしてアカウント登録（無料）
//   2. "New Form" でフォームを作成し、受信先メールアドレスを設定
//   3. 発行されたフォームID（例: xyzabcde）を下記 FORMSPREE_FORM_ID に入力
//   4. スパム対策が必要な場合は Formspree の reCAPTCHA 設定を有効化
// =============================================
(function initContactForm() {
  // TODO: Formspree のフォームIDをここに入力してください（例: 'xyzabcde'）
  var FORMSPREE_FORM_ID = 'xreydklq';
  var FORMSPREE_URL = 'https://formspree.io/f/' + FORMSPREE_FORM_ID;

  var form = document.getElementById('contact-form');
  var successEl = document.getElementById('form-success');
  var errorEl = document.getElementById('form-error-general');
  var submitBtn = document.getElementById('submit-btn');
  if (!form) return;

  // バリデーションルール（必須項目のみ定義、任意項目は対象外）
  var rules = {
    name: {
      required: true,
      label: 'お名前',
    },
    email: {
      required: true,
      label: 'メールアドレス',
      pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
      patternMessage: '正しいメールアドレスの形式で入力してください',
    },
    category: {
      required: true,
      label: 'お問い合わせ種別',
    },
    message: {
      required: true,
      label: 'お問い合わせ内容',
      minLength: 10,
      minLengthMessage: '10文字以上でご記入ください',
    },
    // 個人情報の取扱いへの同意（2026-08-13 追加）
    consent: {
      required: true,
      label: '個人情報の取扱いへの同意',
      checkbox: true,
      requiredMessage: '個人情報の取扱いにご同意ください',
      errorTarget: '#consent-label', // エラー表示は input でなくラベル全体に付ける
    },
  };

  function validateField(name) {
    var rule = rules[name];
    if (!rule) return true;

    var field = form.querySelector('[name="' + name + '"]');
    var fieldErrorEl = document.getElementById(name + '-error');
    if (!field || !fieldErrorEl) return true;

    var errorTarget = rule.errorTarget ? form.querySelector(rule.errorTarget) : field;
    if (!errorTarget) errorTarget = field;

    var value = field.value.trim();
    var message = '';

    if (rule.checkbox) {
      if (rule.required && !field.checked) {
        message = rule.requiredMessage || (rule.label + 'が必要です');
      }
    } else if (rule.required && value === '') {
      message = rule.label + 'をご入力ください';
    } else if (rule.pattern && value !== '' && !rule.pattern.test(value)) {
      message = rule.patternMessage;
    } else if (rule.minLength && value.length > 0 && value.length < rule.minLength) {
      message = rule.minLengthMessage;
    }

    if (message) {
      fieldErrorEl.textContent = message;
      errorTarget.classList.add('is-error');
      field.setAttribute('aria-invalid', 'true');
      return false;
    } else {
      fieldErrorEl.textContent = '';
      errorTarget.classList.remove('is-error');
      field.removeAttribute('aria-invalid');
      return true;
    }
  }

  // フォーカスが外れたときとエラー中の入力時にリアルタイム検証
  Object.keys(rules).forEach(function (name) {
    var field = form.querySelector('[name="' + name + '"]');
    if (!field) return;
    if (rules[name].checkbox) {
      // チェックボックスは change のみ（blur では未チェック状態で赤くなり煩わしいため）
      field.addEventListener('change', function () { validateField(name); });
      return;
    }
    field.addEventListener('blur', function () { validateField(name); });
    field.addEventListener('input', function () {
      if (field.classList.contains('is-error')) validateField(name);
    });
  });

  function setSubmitting(isSubmitting) {
    submitBtn.disabled = isSubmitting;
    submitBtn.textContent = isSubmitting ? '送信しています…' : 'お問い合わせを送信';
  }

  function showSuccess() {
    form.hidden = true;
    if (errorEl) errorEl.hidden = true;
    if (successEl) {
      successEl.hidden = false;
      successEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }

  function showNetworkError() {
    if (errorEl) {
      errorEl.hidden = false;
      errorEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();

    // 全フィールドをバリデート
    var isValid = true;
    Object.keys(rules).forEach(function (name) {
      if (!validateField(name)) isValid = false;
    });

    if (!isValid) {
      var firstError = form.querySelector('.is-error');
      if (firstError) {
        // .is-error はラベル等の非フォーカス要素にも付くため、中の入力要素へ移す
        var focusTarget = typeof firstError.focus === 'function' &&
          firstError.matches('input, select, textarea')
          ? firstError
          : firstError.querySelector('input, select, textarea');
        if (focusTarget) {
          focusTarget.focus();
        } else {
          firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }
      return;
    }

    // エラー表示をリセット
    if (errorEl) errorEl.hidden = true;

    setSubmitting(true);

    fetch(FORMSPREE_URL, {
      method: 'POST',
      body: new FormData(form),
      headers: { 'Accept': 'application/json' },
    })
    .then(function (res) {
      if (res.ok) {
        showSuccess();
      } else {
        throw new Error('server_error');
      }
    })
    .catch(function () {
      setSubmitting(false);
      showNetworkError();
    });
  });
})();


// =============================================
// ヘッダー scrolled クラス + スクロール進行バー
// =============================================
(function initScrollProgress() {
  // 進行バー要素を動的生成
  var bar = document.createElement('div');
  bar.id = 'scroll-progress-bar';
  bar.setAttribute('aria-hidden', 'true');
  document.body.appendChild(bar);

  var header = document.getElementById('site-header');
  var ticking = false;

  function update() {
    var scrollY = window.scrollY;
    var docH = document.documentElement.scrollHeight - window.innerHeight;
    var pct = docH > 0 ? (scrollY / docH) * 100 : 0;
    bar.style.width = pct.toFixed(1) + '%';

    // scrolled クラス（既存の is-scrolled に加えて scrolled も付与）
    if (header) {
      header.classList.toggle('scrolled', scrollY > 60);
    }

    ticking = false;
  }

  window.addEventListener('scroll', function () {
    if (!ticking) {
      window.requestAnimationFrame(update);
      ticking = true;
    }
  }, { passive: true });

  update();
})();


// =============================================
// Hero 見出し stagger（行ごとに span.hero-line を付与）
// =============================================
(function initHeroHeadingStagger() {
  // reduced-motion ならスキップ
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  var heading = document.querySelector('.hero-heading');
  if (!heading) return;

  // innerHTML を改行（<br>）で分割して span.hero-line でラップ
  var html = heading.innerHTML;
  // <br> / <br/> / <br /> を区切り文字として分割
  var parts = html.split(/<br\s*\/?>/i);
  if (parts.length < 2) return; // 改行がなければスキップ

  heading.innerHTML = parts.map(function (part, i) {
    return '<span class="hero-line">' + part + '</span>';
  }).join('');
})();


// =============================================
// Hero コンテンツ 初期フェードイン
// =============================================
(function initHeroLoad() {
  var heroContent = document.querySelector('.hero-content');
  if (!heroContent) return;

  // reduced-motion ならスキップ（hero-line も即表示）
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    heroContent.classList.add('hero-loaded');
    heroContent.querySelectorAll('.hero-line').forEach(function (el) {
      el.style.opacity = '1';
      el.style.transform = 'none';
    });
    return;
  }

  // 次フレームで付与することで transition が発火する
  window.requestAnimationFrame(function () {
    window.requestAnimationFrame(function () {
      heroContent.classList.add('hero-loaded');
    });
  });
})();


// =============================================
// スクロール連動フェードイン（IntersectionObserver + stagger）
// =============================================
(function initReveal() {
  // 対象要素にクラスを付与する処理
  function addRevealClasses() {
    // セクション見出し
    document.querySelectorAll('.section-header').forEach(function (el) {
      el.classList.add('reveal');
    });

    // グループ単位でstagger付与するヘルパー
    function staggerGroup(selector) {
      document.querySelectorAll(selector).forEach(function (el, i) {
        el.classList.add('reveal');
        var delay = i % 6; // 最大delay-6まで
        if (delay > 0) el.classList.add('reveal--delay-' + delay);
      });
    }

    staggerGroup('.pillar-card');
    staggerGroup('.service-card');
    staggerGroup('.case-card');
    staggerGroup('.strength-item');
    staggerGroup('.flow-item');
    staggerGroup('.issue-item');
    staggerGroup('.number-item');
    staggerGroup('.faq-item');
    staggerGroup('.trust-banner-item');
  }

  // reduced-motion の場合: クラスだけ付けて即 is-visible にして終了
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    addRevealClasses();
    document.querySelectorAll('.reveal').forEach(function (el) {
      el.classList.add('is-visible');
    });
    return;
  }

  // IntersectionObserver 非対応ブラウザのフォールバック
  if (!('IntersectionObserver' in window)) {
    addRevealClasses();
    document.querySelectorAll('.reveal').forEach(function (el) {
      el.classList.add('is-visible');
    });
    return;
  }

  addRevealClasses();

  var observer = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: '0px 0px -24px 0px' }
  );

  document.querySelectorAll('.reveal').forEach(function (el) {
    observer.observe(el);
  });
})();


// =============================================
// 数値カウントアップ（about-numbers の数字のみ）
// threshold を高め（0.25）にして確実に発火
// =============================================
(function initCountUp() {
  // reduced-motion の場合は何もしない（値はそのまま表示）
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  if (!('IntersectionObserver' in window)) return;

  // 数字のみのテキストを持つ .number-value を対象にする
  var candidates = document.querySelectorAll('.number-value');
  var targets = [];

  candidates.forEach(function (el) {
    var text = el.textContent.trim();
    var num = parseFloat(text);
    // NaN（"B2B" や "継続" 等）は除外
    if (!isNaN(num) && String(num) === text) {
      targets.push({ el: el, end: num, animated: false });
    }
  });

  if (!targets.length) return;

  function runCountUp(el, end) {
    var start = 0;
    var duration = 900; // ms
    var startTime = null;

    function step(timestamp) {
      if (!startTime) startTime = timestamp;
      var elapsed = timestamp - startTime;
      var progress = Math.min(elapsed / duration, 1);
      // easeOutQuad
      var eased = 1 - (1 - progress) * (1 - progress);
      var current = Math.round(start + (end - start) * eased);
      el.textContent = current;
      if (progress < 1) {
        window.requestAnimationFrame(step);
      } else {
        el.textContent = end;
      }
    }

    window.requestAnimationFrame(step);
  }

  // threshold 0.25 + rootMargin なし = 要素の25%が viewport に入った時点で発火
  var observer = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;

        var data = targets.find(function (t) { return t.el === entry.target; });
        if (!data || data.animated) return;

        data.animated = true;
        observer.unobserve(entry.target);
        runCountUp(data.el, data.end);
      });
    },
    { threshold: 0.25, rootMargin: '0px 0px 0px 0px' }
  );

  targets.forEach(function (t) { observer.observe(t.el); });
})();


// =============================================
// スムーススクロール（固定ヘッダー分のオフセット補正）
// =============================================
(function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
    anchor.addEventListener('click', function (e) {
      var targetId = anchor.getAttribute('href');
      if (targetId === '#') return;

      var targetEl = document.querySelector(targetId);
      if (!targetEl) return;

      e.preventDefault();

      var headerHeight = parseInt(
        getComputedStyle(document.documentElement).getPropertyValue('--header-height'),
        10
      ) || 64;

      window.scrollTo({
        top: targetEl.getBoundingClientRect().top + window.scrollY - headerHeight,
        behavior: 'smooth',
      });
    });
  });
})();
