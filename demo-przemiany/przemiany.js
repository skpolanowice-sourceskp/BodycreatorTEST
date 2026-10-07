/* Body Creator — wspólna logika sekcji Przemiany.
   Czyta dane z window.BC_PRZEMIANY (przemiany-data.js; docelowo z backendu). */
(function () {
    'use strict';

    var D = window.BC_PRZEMIANY || { areas: [], categories: [], cases: [], trainers: {} };

    function esc(s) {
        return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
            return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
        });
    }

    // Polska odmiana: plural(5, ['przemiana', 'przemiany', 'przemian'])
    function plural(n, forms) {
        if (n === 1) return forms[0];
        var d = n % 10, h = n % 100;
        return (d >= 2 && d <= 4 && !(h >= 12 && h <= 14)) ? forms[1] : forms[2];
    }

    var BC = {
        data: D,
        esc: esc,
        plural: plural,
        age: function (n) { return n ? n + ' ' + plural(n, ['rok', 'lata', 'lat']) : ''; },
        param: function (name) { return new URLSearchParams(location.search).get(name); },
        area: function (id) { return D.areas.find(function (a) { return a.id === id; }); },
        category: function (slug) { return D.categories.find(function (c) { return c.slug === slug; }); },
        categoriesIn: function (areaId) { return D.categories.filter(function (c) { return c.area === areaId; }); },
        casesIn: function (slug) { return D.cases.filter(function (c) { return c.category === slug; }); },
        caseById: function (id) { return D.cases.find(function (c) { return c.id === id; }); },
        isStory: function (c) { return !!c.story; },
        caseUrl: function (c) { return 'case-study.html?id=' + encodeURIComponent(c.id); },
        categoryUrl: function (slug) { return 'kategoria.html?k=' + encodeURIComponent(slug); },
        areaUrl: function (id) { return 'przemiany.html#' + encodeURIComponent(id); },

        // "Kasia, 31 lat · 5 miesięcy" — z pominięciem pustych pól ('' gdy brak wszystkich)
        whoLine: function (c) {
            var who = [c.name, BC.age(c.age)].filter(Boolean).join(', ');
            return [who, c.duration].filter(Boolean).join(' · ');
        },

        altFor: function (c) {
            var cat = BC.category(c.category);
            return 'Przemiana' + (c.name ? ': ' + c.name : '') + (cat ? ' (' + cat.title.toLowerCase() + ')' : '') + ', Body Creator Wrocław';
        },

        sliderHTML: function (c, alt) {
            return '<div class="ba-slider" data-ba>' +
                '<img class="ba-before" src="' + esc(c.before) + '" alt="' + esc(alt) + ' – przed" loading="lazy">' +
                '<img class="ba-after" src="' + esc(c.after) + '" alt="' + esc(alt) + ' – po" loading="lazy">' +
                '<div class="ba-handle"></div>' +
                '<span class="ba-label ba-label-before">Przed</span><span class="ba-label ba-label-after">Po</span>' +
                '</div>';
        },

        initSliders: function (root) {
            (root || document).querySelectorAll('[data-ba]:not([data-ba-ready])').forEach(function (slider) {
                slider.setAttribute('data-ba-ready', '');
                var before = slider.querySelector('.ba-before');
                var handle = slider.querySelector('.ba-handle');
                var dragging = false;
                function set(x) {
                    var r = slider.getBoundingClientRect();
                    var p = Math.max(2, Math.min(98, ((x - r.left) / r.width) * 100));
                    before.style.clipPath = 'inset(0 ' + (100 - p) + '% 0 0)';
                    handle.style.left = p + '%';
                }
                // Linki wewnątrz karty nie mogą odpalać się po przeciągnięciu suwaka
                slider.addEventListener('click', function (e) { e.preventDefault(); e.stopPropagation(); });
                slider.addEventListener('pointerdown', function (e) {
                    dragging = true; set(e.clientX);
                    if (e.pointerType === 'mouse') slider.setPointerCapture(e.pointerId);
                });
                slider.addEventListener('pointermove', function (e) { if (dragging) set(e.clientX); });
                ['pointerup', 'pointercancel', 'pointerleave'].forEach(function (t) {
                    slider.addEventListener(t, function () { dragging = false; });
                });
                // Dotyk: przesuwamy w poziomie, pionowy scroll strony zostaje (touch-action: pan-y)
                slider.addEventListener('touchmove', function (e) { set(e.touches[0].clientX); }, { passive: true });
            });
        },

        initReveal: function (root) {
            var els = (root || document).querySelectorAll('.reveal:not(.in)');
            if (!('IntersectionObserver' in window)) { els.forEach(function (el) { el.classList.add('in'); }); return; }
            var io = new IntersectionObserver(function (entries) {
                entries.forEach(function (en) {
                    if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); }
                });
            }, { rootMargin: '0px 0px -8% 0px' });
            els.forEach(function (el) { io.observe(el); });
        },

        notFound: function (mount, msg) {
            mount.innerHTML = '<section class="cs-missing"><div class="container">' +
                '<span class="section-label">Przemiany</span>' +
                '<h1 class="h-section">' + esc(msg) + '</h1>' +
                '<p>Ta strona mogła zostać przeniesiona. Wybierz cel z listy wszystkich przemian.</p>' +
                '<a class="btn btn-primary" href="przemiany.html">Wszystkie przemiany <i class="fas fa-arrow-right"></i></a>' +
                '</div></section>';
        }
    };

    window.BC = BC;

    /* ---------- Chrome strony: loader, nawigacja, smooth scroll ---------- */
    var loader = document.getElementById('page-loader');
    if (loader) {
        var start = Date.now();
        var hide = function () {
            setTimeout(function () {
                loader.style.opacity = '0';
                loader.style.visibility = 'hidden';
                setTimeout(function () { loader.remove(); }, 700);
            }, Math.max(0, 600 - (Date.now() - start)));
        };
        if (document.readyState === 'complete') hide(); else window.addEventListener('load', hide);
    }

    document.addEventListener('DOMContentLoaded', function () {
        var toggle = document.getElementById('navToggle');
        var overlay = document.getElementById('navOverlay');
        if (toggle && overlay) {
            toggle.addEventListener('click', function () { toggle.classList.toggle('active'); overlay.classList.toggle('active'); });
            overlay.querySelectorAll('a').forEach(function (a) {
                a.addEventListener('click', function () { toggle.classList.remove('active'); overlay.classList.remove('active'); });
            });
        }
        var nav = document.getElementById('navbar');
        var onScroll = function () { if (nav) nav.classList.toggle('scrolled', window.scrollY > 50); };
        window.addEventListener('scroll', onScroll, { passive: true });
        onScroll();

        if (window.Lenis && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
            var lenis = new Lenis({ duration: 1.4, easing: function (t) { return Math.min(1, 1.001 - Math.pow(2, -10 * t)); }, smoothWheel: true, touchMultiplier: 1.5 });
            BC.lenis = lenis;
            (function raf(t) { lenis.raf(t); requestAnimationFrame(raf); })(0);
        }
    });
})();
