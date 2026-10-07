// Sanchez Masonry — site interactions (vanilla JS, no build step)

document.addEventListener('DOMContentLoaded', function () {

  /* Header: shrink + go opaque after scrolling past the hero */
  var header = document.querySelector('.site-header');
  function onScroll() {
    if (window.scrollY > 40) header.classList.add('is-scrolled');
    else header.classList.remove('is-scrolled');
  }
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  /* Mobile nav toggle */
  var menuToggle = document.querySelector('.menu-toggle');
  var mobileNav = document.querySelector('.mobile-nav');
  if (menuToggle && mobileNav) {
    menuToggle.addEventListener('click', function () {
      mobileNav.classList.toggle('open');
    });
    mobileNav.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () {
        mobileNav.classList.remove('open');
      });
    });
  }

  /* Scroll reveal — fade/rise elements into view once */
  var revealTargets = document.querySelectorAll(
    '.reveal, .service-card, .why-card, .timeline-step, .review-card, .faq-intro, .section-heading, .craft-content, .area-copy, .contact-copy, .estimate-form'
  );
  revealTargets.forEach(function (el) {
    el.classList.add('reveal');
  });

  if ('IntersectionObserver' in window) {
    var revealObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry, i) {
          if (entry.isIntersecting) {
            var el = entry.target;
            var delay = Array.prototype.indexOf.call(
              el.parentElement ? el.parentElement.children : [],
              el
            );
            el.style.transitionDelay = Math.min(delay * 70, 350) + 'ms';
            el.classList.add('in-view');
            revealObserver.unobserve(el);
          }
        });
      },
      { threshold: 0.15, rootMargin: '0px 0px -60px 0px' }
    );
    revealTargets.forEach(function (el) {
      revealObserver.observe(el);
    });
  } else {
    revealTargets.forEach(function (el) {
      el.classList.add('in-view');
    });
  }

  /* FAQ accordion */
  var faqItems = document.querySelectorAll('.faq-item');
  faqItems.forEach(function (item) {
    var btn = item.querySelector('button');
    btn.addEventListener('click', function () {
      var isOpen = item.classList.contains('open');
      faqItems.forEach(function (other) {
        other.classList.remove('open');
        other.querySelector('button').setAttribute('aria-expanded', 'false');
      });
      if (!isOpen) {
        item.classList.add('open');
        btn.setAttribute('aria-expanded', 'true');
      }
    });
  });

  /* Project filter */
  var filterButtons = document.querySelectorAll('.filters button');
  var projectCards = document.querySelectorAll('.project-card');
  filterButtons.forEach(function (btn) {
    btn.addEventListener('click', function () {
      filterButtons.forEach(function (b) {
        b.classList.remove('active');
      });
      btn.classList.add('active');
      var filter = btn.textContent.trim();
      projectCards.forEach(function (card) {
        var show = filter === 'All Work' || card.getAttribute('data-category') === filter;
        card.classList.toggle('is-hidden', !show);
      });
    });
  });

  /* Project lightbox */
  var lightboxEl = null;
  function openLightbox(card) {
    var img = card.querySelector('img');
    var title = card.querySelector('h3');
    var meta = card.querySelector('.project-info span');
    lightboxEl = document.createElement('div');
    lightboxEl.className = 'lightbox';
    lightboxEl.innerHTML =
      '<img src="' + img.src + '" alt="' + img.alt + '"/>' +
      '<button aria-label="Close">' +
      '<svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>' +
      '</button>' +
      '<div><span>' + (meta ? meta.textContent : '') + '</span><h3>' + (title ? title.textContent : '') + '</h3></div>';
    document.body.appendChild(lightboxEl);
    document.body.style.overflow = 'hidden';
    lightboxEl.addEventListener('click', function (e) {
      if (e.target === lightboxEl || e.target.closest('button')) closeLightbox();
    });
  }
  function closeLightbox() {
    if (lightboxEl) {
      lightboxEl.remove();
      lightboxEl = null;
      document.body.style.overflow = '';
    }
  }
  projectCards.forEach(function (card) {
    card.addEventListener('click', function () {
      openLightbox(card);
    });
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') closeLightbox();
  });

  /* Estimate form — client-side validation + success state.
     Posts via fetch when hosted on Netlify (data-netlify form); otherwise
     just confirms locally. Replace with your own backend/endpoint as needed. */
  var form = document.querySelector('.estimate-form');
  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();

      var honeypot = form.querySelector('[name="bot-field"]');
      if (honeypot && honeypot.value) return; // likely a bot, drop silently

      if (!form.checkValidity()) {
        form.reportValidity();
        return;
      }

      var submitBtn = form.querySelector('.form-button');
      var originalLabel = submitBtn.innerHTML;
      submitBtn.disabled = true;
      submitBtn.innerHTML = 'Sending…';

      var formData = new FormData(form);
      var body = new URLSearchParams(formData).toString();

      fetch('/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: body
      })
        .catch(function () {
          /* Not hosted on Netlify (e.g. local preview) — show success anyway */
        })
        .finally(function () {
          showFormSuccess(form);
        });
    });
  }

  function showFormSuccess(formEl) {
    var wrapper = formEl.parentElement;
    var success = document.createElement('div');
    success.className = 'form-success';
    success.innerHTML =
      '<span><svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg></span>' +
      '<h3>Thank you!</h3>' +
      '<p>We received your request and will reach out shortly to schedule your complimentary on-site estimate.</p>' +
      '<button type="button">Send another request</button>';
    formEl.replaceWith(success);
    success.querySelector('button').addEventListener('click', function () {
      success.replaceWith(formEl);
      formEl.reset();
    });
  }

});
