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
  }

  function openMenu() {
    hamburger.classList.add('is-active');
    hamburger.setAttribute('aria-expanded', 'true');
    hamburger.setAttribute('aria-label', 'メニューを閉じる');
    nav.classList.add('is-open');
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
  };

  function validateField(name) {
    var rule = rules[name];
    if (!rule) return true;

    var field = form.querySelector('[name="' + name + '"]');
    var fieldErrorEl = document.getElementById(name + '-error');
    if (!field || !fieldErrorEl) return true;

    var value = field.value.trim();
    var message = '';

    if (rule.required && value === '') {
      message = rule.label + 'をご入力ください';
    } else if (rule.pattern && value !== '' && !rule.pattern.test(value)) {
      message = rule.patternMessage;
    } else if (rule.minLength && value.length > 0 && value.length < rule.minLength) {
      message = rule.minLengthMessage;
    }

    if (message) {
      fieldErrorEl.textContent = message;
      field.classList.add('is-error');
      return false;
    } else {
      fieldErrorEl.textContent = '';
      field.classList.remove('is-error');
      return true;
    }
  }

  // フォーカスが外れたときとエラー中の入力時にリアルタイム検証
  Object.keys(rules).forEach(function (name) {
    var field = form.querySelector('[name="' + name + '"]');
    if (!field) return;
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
      if (firstError) firstError.focus();
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
