/* Body Creator — rotujące tło wideo (crossfade między klipami klubu).
   Klipy są już spowolnione/przyciemnione/odbarwione w plikach (video/bg/). */
(function () {
    'use strict';

    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    var CLIPS = [
        { src: 'video/bg/bg-20260630_204725.mp4', pos: 'center top' },
        { src: 'video/bg/bg-20260630_204754.mp4', pos: 'center center' },
        { src: 'video/bg/bg-20260630_204844.mp4', pos: 'center top' }
    ];
    var FADE_S = 1.6; // ile sekund przed końcem klipu zaczyna się przejście

    var css =
        '.bgr-wrap{position:fixed;inset:0;z-index:-2;overflow:hidden;background:#0a0a0a;}' +
        '.bgr-wrap video{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;' +
        'opacity:0;transition:opacity ' + FADE_S + 's ease;will-change:opacity;}' +
        '.bgr-wrap video.bgr-on{opacity:1;}' +
        '.bgr-scrim{position:fixed;inset:0;z-index:-1;pointer-events:none;' +
        'background:rgba(0,0,0,.55);}';
    var style = document.createElement('style');
    style.textContent = css;
    document.head.appendChild(style);

    var wrap = document.createElement('div');
    wrap.className = 'bgr-wrap';
    wrap.setAttribute('aria-hidden', 'true');
    var scrim = document.createElement('div');
    scrim.className = 'bgr-scrim';
    scrim.setAttribute('aria-hidden', 'true');

    function mkVideo() {
        var v = document.createElement('video');
        v.muted = true;
        v.setAttribute('muted', '');
        v.setAttribute('playsinline', '');
        v.preload = 'auto';
        wrap.appendChild(v);
        return v;
    }
    var layers = [mkVideo(), mkVideo()];
    var active = 0;
    var idx = Math.floor(Math.random() * CLIPS.length); // każda strona startuje innym klipem
    var switching = false;

    function play(v) {
        var p = v.play();
        if (p && p.catch) p.catch(function () {});
    }

    function loadInto(v, i) {
        v.src = CLIPS[i].src;
        v.style.objectPosition = CLIPS[i].pos;
        v.load();
    }

    function swap() {
        if (switching) return;
        switching = true;
        var cur = layers[active];
        var nxt = layers[1 - active];
        play(nxt);
        nxt.classList.add('bgr-on');
        cur.classList.remove('bgr-on');
        active = 1 - active;
        setTimeout(function () {
            cur.pause();
            idx = (idx + 1) % CLIPS.length;
            loadInto(cur, (idx + 1) % CLIPS.length); // przygotuj kolejny klip
            switching = false;
        }, FADE_S * 1000 + 100);
    }

    function watch(v) {
        v.addEventListener('timeupdate', function () {
            if (v === layers[active] && v.duration && v.duration - v.currentTime <= FADE_S) swap();
        });
        v.addEventListener('ended', function () {
            if (v === layers[active]) swap();
        });
    }
    watch(layers[0]);
    watch(layers[1]);

    function start() {
        document.body.insertBefore(scrim, document.body.firstChild);
        document.body.insertBefore(wrap, document.body.firstChild);
        loadInto(layers[0], idx);
        loadInto(layers[1], (idx + 1) % CLIPS.length);
        layers[0].classList.add('bgr-on');
        play(layers[0]);
    }

    // oszczędzaj transfer i baterię, gdy karta w tle
    document.addEventListener('visibilitychange', function () {
        var v = layers[active];
        if (document.hidden) v.pause();
        else play(v);
    });

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', start);
    } else {
        start();
    }
})();
