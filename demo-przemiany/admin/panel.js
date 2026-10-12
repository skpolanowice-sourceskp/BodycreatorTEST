/* Body Creator — panel Przemian (front).
   Widoki (hash):
     #/                     cele w obszarach
     #/cel/<slug>           ustawienia celu + lista jego przemian
     #/cel/<slug>/nowa      nowa przemiana
     #/przemiana/<id>       edycja przemiany
     #/haslo                zmiana hasła
   Dane i zapis: api.php. Każdy zapis od razu publikuje zmiany na stronie. */
(function () {
    'use strict';

    var app = document.getElementById('app');
    var S = { data: null, csrf: '', chunk: 1024 * 1024, area: null, dirty: false };
    var PHOTO_W = 500, PHOTO_H = 800;

    /* ===== POMOCNICZE ===== */

    function h(s) {
        return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
            return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
        });
    }

    function plural(n, forms) {
        if (n === 1) return forms[0];
        var d = n % 10, t = n % 100;
        return (d >= 2 && d <= 4 && !(t >= 12 && t <= 14)) ? forms[1] : forms[2];
    }

    function przemian(n) { return n + ' ' + plural(n, ['przemiana', 'przemiany', 'przemian']); }

    // Ścieżki w danych są względem demo-przemiany/, panel leży piętro niżej
    function src(path) { return path ? '../' + path : ''; }

    function toast(msg, isError) {
        var t = document.getElementById('toast');
        t.textContent = msg;
        t.className = 'toast show' + (isError ? ' is-error' : '');
        clearTimeout(toast.timer);
        toast.timer = setTimeout(function () { t.className = 'toast'; }, isError ? 6000 : 2600);
    }

    function areaOf(id) { return S.data.areas.find(function (a) { return a.id === id; }); }
    function catOf(slug) { return S.data.categories.find(function (c) { return c.slug === slug; }); }
    function caseOf(id) { return S.data.cases.find(function (c) { return c.id === id; }); }
    function casesIn(slug) { return S.data.cases.filter(function (c) { return c.category === slug; }); }

    function applyState(res) {
        S.data = res.data;
        S.csrf = res.csrf;
        S.chunk = res.chunk || S.chunk;
        document.getElementById('topActions').hidden = false;
    }

    /* ===== API ===== */

    // Pliki (body) idą jako surowe body z parametrami w adresie: serwer nie ma katalogu tmp dla multipart
    function api(action, data, body, params, onProgress) {
        var fd = null;
        if (!body) {
            fd = new FormData();
            if (data) fd.append('data', JSON.stringify(data));
        }
        var query = 'a=' + encodeURIComponent(action);
        if (params) Object.keys(params).forEach(function (k) { query += '&' + k + '=' + encodeURIComponent(params[k]); });
        return new Promise(function (resolve, reject) {
            var xhr = new XMLHttpRequest();
            xhr.open('POST', 'api.php?' + query);
            xhr.setRequestHeader('X-CSRF-Token', S.csrf);
            if (onProgress) xhr.upload.onprogress = function (e) { if (e.lengthComputable) onProgress(e.loaded); };
            xhr.onload = function () {
                var res;
                try { res = JSON.parse(xhr.responseText); } catch (e) { res = { ok: false, error: 'Nieoczekiwana odpowiedź serwera (' + xhr.status + ').' }; }
                if (xhr.status === 401 && action !== 'login') { S.data = null; renderLogin('Sesja wygasła. Zaloguj się ponownie.'); }
                if (res.ok) resolve(res); else reject(Object.assign(new Error(res.error || 'Błąd'), { status: xhr.status }));
            };
            xhr.onerror = function () { reject(Object.assign(new Error('Brak połączenia z serwerem.'), { status: 0 })); };
            if (body) xhr.setRequestHeader('Content-Type', 'application/octet-stream');
            xhr.send(body || fd);
        });
    }

    function mutate(action, data) {
        return api(action, data).then(function (res) { applyState(res); return res; })
            .catch(function (err) { toast(err.message, true); throw err; });
    }

    /* ===== LOGOWANIE ===== */

    function renderLogin(msg) {
        document.getElementById('topActions').hidden = true;
        app.innerHTML =
            '<form class="card login" id="loginForm">' +
                '<span class="label">Body Creator</span>' +
                '<h1>Panel Przemian</h1>' +
                (msg ? '<p class="notice">' + h(msg) + '</p>' : '') +
                '<label class="field"><span>Hasło</span><input type="password" name="password" autocomplete="current-password" required autofocus></label>' +
                '<button class="btn btn-primary" type="submit">Zaloguj <i class="fas fa-arrow-right"></i></button>' +
            '</form>';
        var form = document.getElementById('loginForm');
        form.addEventListener('submit', function (e) {
            e.preventDefault();
            var btn = form.querySelector('button');
            btn.disabled = true;
            var fd = new FormData(form);
            fetch('api.php?a=login', { method: 'POST', body: fd, credentials: 'same-origin' })
                .then(function (r) { return r.json(); })
                .then(function (res) {
                    if (!res.ok) throw new Error(res.error);
                    applyState(res);
                    route();
                })
                .catch(function (err) { btn.disabled = false; renderLogin(err.message || 'Błąd logowania.'); });
        });
    }

    document.getElementById('logoutBtn').addEventListener('click', function () {
        api('logout').finally(function () { S.data = null; location.hash = '#/'; renderLogin('Wylogowano.'); });
    });

    /* ===== ROUTER ===== */

    function route() {
        if (!S.data) return;
        S.dirty = false;
        var parts = location.hash.replace(/^#\/?/, '').split('/').map(decodeURIComponent);
        if (parts[0] === 'cel' && parts[2] === 'nowa') return renderCaseForm(null, parts[1]);
        if (parts[0] === 'cel' && parts[1]) return renderCategory(parts[1]);
        if (parts[0] === 'przemiana' && parts[1]) return renderCaseForm(parts[1]);
        if (parts[0] === 'haslo') return renderPassword();
        renderHome();
    }

    var lastHash = location.hash;
    window.addEventListener('hashchange', function () {
        if (S.dirty && !confirm('Masz niezapisane zmiany. Wyjść bez zapisywania?')) {
            history.replaceState(null, '', lastHash);
            return;
        }
        lastHash = location.hash;
        route();
        window.scrollTo(0, 0);
    });
    window.addEventListener('beforeunload', function (e) { if (S.dirty) { e.preventDefault(); e.returnValue = ''; } });

    function go(hash) { S.dirty = false; location.hash = hash; }

    /* ===== WIDOK: CELE ===== */

    function renderHome() {
        var D = S.data;
        if (!S.area || !areaOf(S.area)) S.area = D.areas[0].id;

        var tabs = D.areas.map(function (a) {
            var n = D.categories.filter(function (c) { return c.area === a.id; }).length;
            return '<button type="button" class="tab' + (a.id === S.area ? ' is-active' : '') + '" data-area="' + h(a.id) + '">' + h(a.name) + ' <small>' + n + '</small></button>';
        }).join('');

        var cats = D.categories.filter(function (c) { return c.area === S.area; });
        var rows = cats.map(function (c, i) {
            var all = casesIn(c.slug), visible = all.filter(function (x) { return x.visible; }).length;
            var hidden = all.length - visible;
            var status = !c.visible ? '<span class="badge badge-off">Ukryty</span>'
                : (!visible ? '<span class="badge">' + (D.settings.hideEmpty ? 'Niewidoczny (pusty)' : 'Na stronie: „Wkrótce”') + '</span>' : '');
            return '<li class="row' + (c.visible ? '' : ' is-off') + '">' +
                '<a class="row-main" href="#/cel/' + encodeURIComponent(c.slug) + '">' +
                    '<strong>' + h(c.title) + '</strong>' +
                    '<span class="muted">' + przemian(visible) + (hidden ? ', ukryte: ' + hidden : '') + '</span>' + status +
                '</a>' +
                rowActions('category', c.slug, c.visible, i === 0, i === cats.length - 1) +
            '</li>';
        }).join('');

        app.innerHTML =
            '<div class="page-head"><div><span class="label">Przemiany</span><h1>Cele</h1></div>' +
                '<button class="btn btn-primary btn-sm" type="button" id="addCat"><i class="fas fa-plus"></i> Dodaj cel</button></div>' +
            '<p class="muted intro">Kafelki celów na stronie Przemian. Kolejność i widoczność zmieniasz tutaj, przemiany po kliknięciu w cel.</p>' +
            '<div class="tabs" role="tablist">' + tabs + '</div>' +
            '<form class="card add-form" id="catForm" hidden>' + categoryFields({ area: S.area, visible: true }) +
                '<div class="actions"><button class="btn btn-primary btn-sm" type="submit">Dodaj cel</button>' +
                '<button class="btn btn-ghost btn-sm" type="button" data-cancel>Anuluj</button></div></form>' +
            (rows ? '<ul class="list">' + rows + '</ul>' : '<p class="empty">W tym obszarze nie ma jeszcze celów.</p>') +
            '<label class="switch-row card"><input type="checkbox" id="hideEmpty"' + (D.settings.hideEmpty ? ' checked' : '') + '>' +
                '<span><strong>Ukrywaj puste cele</strong><span class="muted">Cele bez widocznych przemian nie pokażą się na stronie (zamiast kafelka „Wkrótce”).</span></span></label>';

        app.querySelectorAll('.tab').forEach(function (t) {
            t.addEventListener('click', function () { S.area = t.dataset.area; renderHome(); });
        });

        var form = document.getElementById('catForm');
        document.getElementById('addCat').addEventListener('click', function () {
            form.hidden = false;
            form.querySelector('[name=area]').value = S.area;
            form.querySelector('[name=title]').focus();
        });
        form.querySelector('[data-cancel]').addEventListener('click', function () { form.hidden = true; form.reset(); });
        form.addEventListener('submit', function (e) {
            e.preventDefault();
            var data = readCategoryForm(form);
            mutate('category-save', data).then(function (res) {
                toast('Dodano cel „' + data.title + '”.');
                S.area = data.area;
                go('#/cel/' + encodeURIComponent(res.slug));
            }).catch(function () {});
        });

        document.getElementById('hideEmpty').addEventListener('change', function () {
            mutate('settings-save', { hideEmpty: this.checked }).then(function () { toast('Zapisano.'); renderHome(); }).catch(renderHome);
        });

        bindRowActions(renderHome);
    }

    function rowActions(type, key, visible, first, last) {
        return '<div class="row-actions">' +
            '<button class="icon-btn" type="button" data-move="up" data-type="' + type + '" data-key="' + h(key) + '"' + (first ? ' disabled' : '') + ' title="Wyżej" aria-label="Przesuń wyżej"><i class="fas fa-arrow-up"></i></button>' +
            '<button class="icon-btn" type="button" data-move="down" data-type="' + type + '" data-key="' + h(key) + '"' + (last ? ' disabled' : '') + ' title="Niżej" aria-label="Przesuń niżej"><i class="fas fa-arrow-down"></i></button>' +
            '<button class="icon-btn' + (visible ? ' is-on' : '') + '" type="button" data-toggle="' + (visible ? '0' : '1') + '" data-type="' + type + '" data-key="' + h(key) + '" title="' + (visible ? 'Widoczny, kliknij, żeby ukryć' : 'Ukryty, kliknij, żeby pokazać') + '" aria-label="' + (visible ? 'Ukryj' : 'Pokaż') + '"><i class="fas ' + (visible ? 'fa-eye' : 'fa-eye-slash') + '"></i></button>' +
        '</div>';
    }

    function bindRowActions(rerender) {
        app.querySelectorAll('[data-move]').forEach(function (b) {
            b.addEventListener('click', function () {
                b.disabled = true;
                mutate('move', { type: b.dataset.type, key: b.dataset.key, dir: b.dataset.move }).then(rerender, rerender);
            });
        });
        app.querySelectorAll('[data-toggle]').forEach(function (b) {
            b.addEventListener('click', function () {
                b.disabled = true;
                var on = b.dataset.toggle === '1';
                mutate('toggle', { type: b.dataset.type, key: b.dataset.key, visible: on })
                    .then(function () { toast(on ? 'Widoczne na stronie.' : 'Ukryte. Dane zostają w panelu.'); rerender(); }, rerender);
            });
        });
    }

    /* ===== WIDOK: CEL ===== */

    function categoryFields(c) {
        var areas = S.data.areas.map(function (a) {
            return '<option value="' + h(a.id) + '"' + (a.id === c.area ? ' selected' : '') + '>' + h(a.name) + '</option>';
        }).join('');
        return '<label class="field"><span>Nazwa celu</span><input name="title" maxlength="80" required value="' + h(c.title) + '" placeholder="np. Ból barku"></label>' +
            '<label class="field"><span>Obszar</span><select name="area">' + areas + '</select></label>' +
            '<label class="field"><span>Krótki opis <em>opcjonalnie</em></span><input name="tagline" maxlength="200" value="' + h(c.tagline) + '" placeholder="Jedno zdanie, widoczne w Google pod nazwą strony"></label>' +
            '<label class="check"><input type="checkbox" name="visible"' + (c.visible ? ' checked' : '') + '> Widoczny na stronie</label>';
    }

    function readCategoryForm(form, slug) {
        return {
            slug: slug || '',
            title: form.elements.title.value,
            area: form.elements.area.value,
            tagline: form.elements.tagline.value,
            visible: form.elements.visible.checked
        };
    }

    function renderCategory(slug) {
        var c = catOf(slug);
        if (!c) { app.innerHTML = '<p class="empty">Nie ma takiego celu. <a href="#/">Wróć do listy</a></p>'; return; }
        S.area = c.area;
        var list = casesIn(slug);

        var rows = list.map(function (x, i) {
            var thumb = x.after
                ? '<img src="' + h(src(x.after)) + '" alt="" loading="lazy">'
                : '<span class="thumb-icon"><i class="fas ' + (x.quote ? 'fa-quote-left' : 'fa-align-left') + '"></i></span>';
            var title = [x.highlight, x.name].filter(Boolean).join(' · ') || summary(x);
            var tags = [];
            if (x.goal || x.actions || x.effects) tags.push('opis');
            if (x.video) tags.push('wideo');
            if (!x.after && x.quote && !(x.goal || x.actions || x.effects)) tags.push('opinia');
            if (x.after && !(x.goal || x.actions || x.effects)) tags.push('zdjęcia');
            return '<li class="row' + (x.visible ? '' : ' is-off') + '">' +
                '<a class="row-main has-thumb" href="#/przemiana/' + encodeURIComponent(x.id) + '">' +
                    '<span class="thumb">' + thumb + '</span>' +
                    '<span class="row-text"><strong>' + h(title) + '</strong>' +
                    '<span class="tags">' + tags.map(function (t) { return '<span class="tag">' + t + '</span>'; }).join('') +
                    (x.visible ? '' : '<span class="badge badge-off">Ukryta</span>') + '</span></span>' +
                '</a>' +
                rowActions('case', x.id, x.visible, i === 0, i === list.length - 1) +
            '</li>';
        }).join('');

        app.innerHTML =
            '<a class="back" href="#/"><i class="fas fa-arrow-left"></i> Cele</a>' +
            '<div class="page-head"><div><span class="label">' + h(areaOf(c.area).name) + '</span><h1>' + h(c.title) + '</h1></div>' +
                '<a class="btn btn-ghost btn-sm" href="../kategoria.html?k=' + encodeURIComponent(c.slug) + '" target="_blank" rel="noopener">Zobacz na stronie <i class="fas fa-arrow-up-right-from-square"></i></a></div>' +

            '<section class="section"><div class="section-head"><h2>Przemiany <small>' + list.length + '</small></h2>' +
                '<a class="btn btn-primary btn-sm" href="#/cel/' + encodeURIComponent(c.slug) + '/nowa"><i class="fas fa-plus"></i> Dodaj przemianę</a></div>' +
                (rows ? '<ul class="list">' + rows + '</ul>' : '<p class="empty">Ten cel nie ma jeszcze przemian. Na stronie pokaże się jako „Wkrótce”.</p>') +
                (list.length > 1 ? '<p class="muted hint">Kolejność tutaj to kolejność na stronie. Przemiany z opisem są zawsze nad samymi zdjęciami.</p>' : '') +
            '</section>' +

            '<form class="card section" id="catEdit"><h2>Ustawienia celu</h2>' + categoryFields(c) +
                '<p class="muted hint">Adres strony celu: <code>kategoria.html?k=' + h(c.slug) + '</code>. Nie zmienia się przy zmianie nazwy, więc linki działają dalej.</p>' +
                '<div class="actions"><button class="btn btn-primary btn-sm" type="submit">Zapisz</button>' +
                '<button class="btn btn-danger btn-sm" type="button" id="catDelete"><i class="fas fa-trash"></i> Usuń cel</button></div>' +
            '</form>';

        var form = document.getElementById('catEdit');
        form.addEventListener('input', function () { S.dirty = true; });
        form.addEventListener('submit', function (e) {
            e.preventDefault();
            mutate('category-save', readCategoryForm(form, slug)).then(function () { toast('Zapisano cel.'); S.dirty = false; renderCategory(slug); }).catch(function () {});
        });
        document.getElementById('catDelete').addEventListener('click', function () {
            if (list.length) {
                toast('Ten cel ma przemiany. Przenieś je do innego celu albo ukryj cel.', true);
                return;
            }
            if (!confirm('Usunąć cel „' + c.title + '” na stałe?')) return;
            mutate('category-delete', { slug: slug }).then(function () { toast('Usunięto cel.'); go('#/'); }).catch(function () {});
        });

        bindRowActions(function () { renderCategory(slug); });
    }

    function summary(x) {
        var t = x.goal || x.quote || x.effects || (Array.isArray(x.actions) ? x.actions[0] : x.actions) || 'Przemiana';
        return t.length > 70 ? t.slice(0, 68) + '…' : t;
    }

    /* ===== WIDOK: PRZEMIANA ===== */

    function renderCaseForm(id, newInSlug) {
        var existing = id ? caseOf(id) : null;
        if (id && !existing) { app.innerHTML = '<p class="empty">Nie ma takiej przemiany. <a href="#/">Wróć do listy</a></p>'; return; }
        var x = existing ? JSON.parse(JSON.stringify(existing)) : { category: newInSlug, visible: true };
        var cat = catOf(x.category);
        if (!cat) { app.innerHTML = '<p class="empty">Nie ma takiego celu. <a href="#/">Wróć do listy</a></p>'; return; }
        var isPain = cat.area === 'bol';
        var actionsText = Array.isArray(x.actions) ? x.actions.join('\n') : (x.actions || '');

        var catOptions = S.data.areas.map(function (a) {
            var opts = S.data.categories.filter(function (c) { return c.area === a.id; }).map(function (c) {
                return '<option value="' + h(c.slug) + '"' + (c.slug === x.category ? ' selected' : '') + '>' + h(c.title) + (c.visible ? '' : ' (ukryty)') + '</option>';
            }).join('');
            return '<optgroup label="' + h(a.name) + '">' + opts + '</optgroup>';
        }).join('');

        app.innerHTML =
            '<a class="back" href="#/cel/' + encodeURIComponent(cat.slug) + '"><i class="fas fa-arrow-left"></i> ' + h(cat.title) + '</a>' +
            '<div class="page-head"><div><span class="label">' + h(cat.title) + '</span><h1>' + (existing ? 'Edycja przemiany' : 'Nowa przemiana') + '</h1></div></div>' +
            '<p class="muted intro">Wypełnij tylko to, co masz. Puste pola nie pokażą się na stronie.</p>' +

            '<form id="caseForm" novalidate>' +
                '<section class="card section"><h2>Zdjęcia przed i po</h2>' +
                    '<p class="muted hint">Po wybraniu zdjęcia ustawisz kadr (pion 5:8). Bez zdjęć przemiana pokaże się jako opis albo opinia.</p>' +
                    '<div class="photos">' + photoSlot('before', 'Przed', x.before) + photoSlot('after', 'Po', x.after) + '</div>' +
                '</section>' +

                '<section class="card section"><h2>Opis</h2>' +
                    '<p class="muted hint">Z opisem przemiana dostaje duży blok na stronie celu (zdjęcia, opis i wideo). Bez opisu trafia do siatki zdjęć.</p>' +
                    '<label class="field"><span>' + (isPain ? 'Opis problemu' : 'Cel') + '</span><textarea name="goal" rows="3" maxlength="1200">' + h(x.goal) + '</textarea></label>' +
                    '<label class="field"><span>Podjęte działania <em>jeden punkt w linii</em></span><textarea name="actions" rows="4">' + h(actionsText) + '</textarea></label>' +
                    '<label class="field"><span>Efekty współpracy</span><textarea name="effects" rows="3" maxlength="1200">' + h(x.effects) + '</textarea></label>' +
                '</section>' +

                '<section class="card section"><h2>Wideo <em>opcjonalnie</em></h2>' +
                    '<p class="muted hint">Plik MP4, najlepiej pionowy (9:16). Pokazuje się pod opisem.</p>' +
                    '<div class="video-slot" id="videoSlot"></div>' +
                '</section>' +

                '<section class="card section"><h2>Podpis <em>opcjonalnie</em></h2>' +
                    '<p class="muted hint">Zostaw puste, żeby ukryć podpis. Pokażą się tylko uzupełnione pola.</p>' +
                    '<div class="grid-2">' +
                        '<label class="field"><span>Wynik</span><input name="highlight" maxlength="40" value="' + h(x.highlight) + '" placeholder="np. −11 kg"></label>' +
                        '<label class="field"><span>Imię</span><input name="name" maxlength="40" value="' + h(x.name) + '"></label>' +
                        '<label class="field"><span>Wiek</span><input name="age" inputmode="numeric" pattern="[0-9]*" maxlength="3" value="' + h(x.age) + '"></label>' +
                        '<label class="field"><span>Czas współpracy</span><input name="duration" maxlength="40" value="' + h(x.duration) + '" placeholder="np. 5 miesięcy"></label>' +
                    '</div>' +
                '</section>' +

                '<section class="card section"><h2>Opinia klienta <em>opcjonalnie</em></h2>' +
                    '<p class="muted hint">Przemiana bez zdjęć i bez opisu pokaże się jako karta z tą opinią.</p>' +
                    '<label class="field"><span>Cytat</span><textarea name="quote" rows="3" maxlength="1200">' + h(x.quote) + '</textarea></label>' +
                    (isPain || x.condition ? '<label class="field"><span>Schorzenie</span><input name="condition" maxlength="120" value="' + h(x.condition) + '" placeholder="np. Dyskopatia L5-S1"></label>' : '') +
                '</section>' +

                '<section class="card section"><h2>Publikacja</h2>' +
                    '<label class="field"><span>Cel</span><select name="category">' + catOptions + '</select></label>' +
                    '<label class="check"><input type="checkbox" name="visible"' + (x.visible ? ' checked' : '') + '> Widoczna na stronie</label>' +
                '</section>' +

                '<div class="sticky-actions">' +
                    '<button class="btn btn-primary" type="submit"><i class="fas fa-check"></i> Zapisz</button>' +
                    (existing ? '<button class="btn btn-danger btn-sm" type="button" id="caseDelete"><i class="fas fa-trash"></i> Usuń</button>' : '') +
                '</div>' +
            '</form>';

        var form = document.getElementById('caseForm');
        var media = { before: x.before || '', after: x.after || '', video: x.video || '' };
        var busy = 0;

        form.addEventListener('input', function () { S.dirty = true; });

        /* Zdjęcia */
        ['before', 'after'].forEach(function (key) {
            var slot = form.querySelector('[data-photo="' + key + '"]');
            var input = slot.querySelector('input[type=file]');
            slot.querySelector('[data-pick]').addEventListener('click', function () { input.click(); });
            input.addEventListener('change', function () {
                var file = input.files[0];
                input.value = '';
                if (!file) return;
                openCropper(file).then(function (blob) {
                    if (!blob) return;
                    busy++;
                    slot.classList.add('is-busy');
                    return uploadFile(blob, 'image', function () {}).then(function (path) {
                        media[key] = path;
                        S.dirty = true;
                        setPhoto(slot, path);
                    }).catch(function (err) { toast(err.message, true); })
                      .finally(function () { busy--; slot.classList.remove('is-busy'); });
                });
            });
            slot.querySelector('[data-remove]').addEventListener('click', function () {
                media[key] = '';
                S.dirty = true;
                setPhoto(slot, '');
            });
        });

        /* Wideo */
        var videoSlot = document.getElementById('videoSlot');
        function drawVideo() {
            videoSlot.innerHTML = media.video
                ? '<video src="' + h(src(media.video)) + '" controls preload="metadata" playsinline></video>' +
                  '<div class="actions"><button class="btn btn-ghost btn-sm" type="button" data-vpick>Zmień film</button>' +
                  '<button class="btn btn-ghost btn-sm" type="button" data-vremove>Usuń film</button></div>'
                : '<button class="drop" type="button" data-vpick><i class="fas fa-film"></i><span>Wybierz film MP4</span></button>';
            videoSlot.insertAdjacentHTML('beforeend', '<input type="file" accept="video/mp4" hidden>');
            var input = videoSlot.querySelector('input');
            videoSlot.querySelector('[data-vpick]').addEventListener('click', function () { input.click(); });
            var rm = videoSlot.querySelector('[data-vremove]');
            if (rm) rm.addEventListener('click', function () { media.video = ''; S.dirty = true; drawVideo(); });
            input.addEventListener('change', function () {
                var file = input.files[0];
                if (!file) return;
                if (file.type && file.type !== 'video/mp4') { toast('Wybierz plik MP4.', true); return; }
                busy++;
                videoSlot.innerHTML = '<div class="progress"><div class="progress-bar"></div></div><p class="muted" data-pct>Wysyłanie filmu… 0%</p>';
                uploadFile(file, 'video', function (p) {
                    videoSlot.querySelector('.progress-bar').style.width = (p * 100) + '%';
                    videoSlot.querySelector('[data-pct]').textContent = 'Wysyłanie filmu… ' + Math.round(p * 100) + '%';
                }).then(function (path) {
                    media.video = path;
                    S.dirty = true;
                }).catch(function (err) { toast(err.message, true); })
                  .finally(function () { busy--; drawVideo(); });
            });
        }
        drawVideo();

        /* Zapis */
        form.addEventListener('submit', function (e) {
            e.preventDefault();
            if (busy) { toast('Poczekaj, aż pliki się wyślą.', true); return; }
            var data = {
                id: existing ? existing.id : '',
                category: form.elements.category.value,
                before: media.before, after: media.after, video: media.video,
                goal: form.elements.goal.value, actions: form.elements.actions.value, effects: form.elements.effects.value,
                highlight: form.elements.highlight.value, name: form.elements.name.value, age: form.elements.age.value.trim(), duration: form.elements.duration.value,
                quote: form.elements.quote.value, condition: form.elements.condition ? form.elements.condition.value : (x.condition || ''),
                visible: form.elements.visible.checked
            };
            var btn = form.querySelector('[type=submit]');
            btn.disabled = true;
            mutate('case-save', data).then(function (res) {
                toast(existing ? 'Zapisano zmiany.' : 'Dodano przemianę.');
                go('#/cel/' + encodeURIComponent(data.category));
                return res;
            }).catch(function () { btn.disabled = false; });
        });

        var del = document.getElementById('caseDelete');
        if (del) del.addEventListener('click', function () {
            if (!confirm('Usunąć tę przemianę na stałe? Jeśli chcesz ją tylko zdjąć ze strony, odznacz „Widoczna na stronie”.')) return;
            mutate('case-delete', { id: existing.id }).then(function () { toast('Usunięto przemianę.'); go('#/cel/' + encodeURIComponent(existing.category)); }).catch(function () {});
        });
    }

    function photoSlot(key, label, path) {
        return '<div class="photo" data-photo="' + key + '">' +
            '<span class="photo-label">' + label + '</span>' +
            '<div class="photo-frame">' + (path ? '<img src="' + h(src(path)) + '" alt="">' : '<i class="fas fa-image"></i>') +
                '<span class="photo-busy"><i class="fas fa-circle-notch fa-spin"></i></span></div>' +
            '<div class="photo-actions"><button class="btn btn-ghost btn-sm" type="button" data-pick>' + (path ? 'Zmień' : 'Wybierz') + '</button>' +
            '<button class="btn btn-ghost btn-sm" type="button" data-remove' + (path ? '' : ' hidden') + '>Usuń</button></div>' +
            '<input type="file" accept="image/*" hidden>' +
        '</div>';
    }

    function setPhoto(slot, path) {
        slot.querySelector('.photo-frame').innerHTML = (path ? '<img src="' + h(src(path)) + '" alt="">' : '<i class="fas fa-image"></i>') +
            '<span class="photo-busy"><i class="fas fa-circle-notch fa-spin"></i></span>';
        slot.querySelector('[data-pick]').textContent = path ? 'Zmień' : 'Wybierz';
        slot.querySelector('[data-remove]').hidden = !path;
    }

    /* ===== WIDOK: ZMIANA HASŁA ===== */

    function renderPassword() {
        app.innerHTML =
            '<a class="back" href="#/"><i class="fas fa-arrow-left"></i> Cele</a>' +
            '<div class="page-head"><div><span class="label">Ustawienia</span><h1>Zmiana hasła</h1></div></div>' +
            '<form class="card section narrow" id="passForm">' +
                '<label class="field"><span>Obecne hasło</span><input type="password" name="current" autocomplete="current-password" required></label>' +
                '<label class="field"><span>Nowe hasło <em>co najmniej 8 znaków</em></span><input type="password" name="new" autocomplete="new-password" minlength="8" required></label>' +
                '<label class="field"><span>Powtórz nowe hasło</span><input type="password" name="repeat" autocomplete="new-password" minlength="8" required></label>' +
                '<label class="check"><input type="checkbox" id="showPass"> Pokaż hasła</label>' +
                '<p class="muted hint">Po zmianie inne urządzenia zalogowane do panelu zostaną wylogowane.</p>' +
                '<div class="actions"><button class="btn btn-primary btn-sm" type="submit">Zmień hasło</button></div>' +
            '</form>';
        var form = document.getElementById('passForm');
        document.getElementById('showPass').addEventListener('change', function () {
            var type = this.checked ? 'text' : 'password';
            form.querySelectorAll('input[name]').forEach(function (i) { i.type = type; });
        });
        form.addEventListener('submit', function (e) {
            e.preventDefault();
            var el = form.elements;
            if (el['new'].value.length < 8) { toast('Nowe hasło musi mieć co najmniej 8 znaków.', true); return; }
            if (el['new'].value !== el.repeat.value) { toast('Nowe hasła nie są takie same.', true); return; }
            var btn = form.querySelector('[type=submit]');
            btn.disabled = true;
            mutate('password-change', { current: el.current.value, 'new': el['new'].value, repeat: el.repeat.value })
                .then(function () { toast('Hasło zmienione.'); go('#/'); })
                .catch(function () { btn.disabled = false; });
        });
    }

    /* ===== WYSYŁANIE PLIKÓW W CZĘŚCIACH (rozmiar części podaje serwer) ===== */

    function uploadFile(file, kind, onProgress) {
        var uid = Array.prototype.map.call(crypto.getRandomValues(new Uint8Array(16)), function (b) { return ('0' + b.toString(16)).slice(-2); }).join('');
        var size = file.size, chunk = S.chunk;
        function send(offset, attempt) {
            var part = file.slice(offset, Math.min(offset + chunk, size));
            return api('upload', null, part, { kind: kind, uid: uid, offset: offset, total: size }, function (loaded) {
                onProgress(Math.min(1, (offset + loaded) / size));
            }).then(function (res) {
                if (res.done) return res.path;
                return send(res.received, 0);
            }, function (err) {
                // Zerwane połączenie: ponów tę samą część (do 3 razy)
                if (err.status === 0 && attempt < 3) return new Promise(function (r) { setTimeout(r, 1500); }).then(function () { return send(offset, attempt + 1); });
                throw err;
            });
        }
        return send(0, 0);
    }

    /* ===== KADROWANIE ZDJĘCIA (5:8, 500×800) ===== */

    function openCropper(file) {
        return new Promise(function (resolve) {
            var url = URL.createObjectURL(file);
            var img = new Image();
            img.onerror = function () { URL.revokeObjectURL(url); toast('Nie udało się otworzyć zdjęcia. Wybierz JPG, PNG lub WEBP.', true); resolve(null); };
            img.onload = function () {
                var modal = document.createElement('div');
                modal.className = 'modal';
                modal.innerHTML =
                    '<div class="modal-card" role="dialog" aria-modal="true" aria-label="Kadrowanie zdjęcia">' +
                        '<h2>Ustaw kadr</h2><p class="muted hint">Przesuń zdjęcie palcem lub myszą, powiększ suwakiem.</p>' +
                        '<div class="crop-frame"><img alt="" draggable="false"></div>' +
                        '<label class="zoom"><i class="fas fa-magnifying-glass-minus"></i><input type="range" min="1" max="4" step="0.01" value="1" aria-label="Powiększenie"><i class="fas fa-magnifying-glass-plus"></i></label>' +
                        '<div class="actions"><button class="btn btn-primary btn-sm" type="button" data-ok>Użyj zdjęcia</button>' +
                        '<button class="btn btn-ghost btn-sm" type="button" data-cancel>Anuluj</button></div>' +
                    '</div>';
                document.body.appendChild(modal);
                document.body.classList.add('no-scroll');

                var frame = modal.querySelector('.crop-frame');
                var view = frame.querySelector('img');
                var range = modal.querySelector('input[type=range]');
                view.src = url;
                var iw = img.naturalWidth, ih = img.naturalHeight;
                var W, H, base, zoom = 1, tx = 0, ty = 0;

                function layout() {
                    W = frame.clientWidth; H = frame.clientHeight;
                    base = Math.max(W / iw, H / ih);
                }
                function clamp() {
                    var s = base * zoom;
                    tx = Math.min(0, Math.max(W - iw * s, tx));
                    ty = Math.min(0, Math.max(H - ih * s, ty));
                }
                function draw() {
                    clamp();
                    var s = base * zoom;
                    view.style.width = (iw * s) + 'px';
                    view.style.height = (ih * s) + 'px';
                    view.style.transform = 'translate(' + tx + 'px,' + ty + 'px)';
                }
                // Powiększenie względem punktu (środek kadru lub środek gestu)
                function zoomTo(z, cx, cy) {
                    z = Math.max(1, Math.min(4, z));
                    var k = z / zoom;
                    tx = cx - (cx - tx) * k;
                    ty = cy - (cy - ty) * k;
                    zoom = z;
                    range.value = z;
                    draw();
                }

                layout();
                tx = (W - iw * base) / 2;
                ty = (H - ih * base) / 2;
                draw();

                var pointers = {}, pinch = null;
                frame.addEventListener('pointerdown', function (e) {
                    frame.setPointerCapture(e.pointerId);
                    pointers[e.pointerId] = { x: e.clientX, y: e.clientY };
                    pinch = null;
                });
                frame.addEventListener('pointermove', function (e) {
                    var p = pointers[e.pointerId];
                    if (!p) return;
                    var ids = Object.keys(pointers);
                    if (ids.length === 1) {
                        tx += e.clientX - p.x; ty += e.clientY - p.y;
                        p.x = e.clientX; p.y = e.clientY;
                        draw();
                        return;
                    }
                    p.x = e.clientX; p.y = e.clientY;
                    var a = pointers[ids[0]], b = pointers[ids[1]];
                    var dist = Math.hypot(a.x - b.x, a.y - b.y);
                    var r = frame.getBoundingClientRect();
                    var cx = (a.x + b.x) / 2 - r.left, cy = (a.y + b.y) / 2 - r.top;
                    if (pinch) zoomTo(pinch.zoom * dist / pinch.dist, cx, cy);
                    else pinch = { dist: dist, zoom: zoom };
                });
                function up(e) { delete pointers[e.pointerId]; pinch = null; }
                frame.addEventListener('pointerup', up);
                frame.addEventListener('pointercancel', up);
                frame.addEventListener('wheel', function (e) {
                    e.preventDefault();
                    var r = frame.getBoundingClientRect();
                    zoomTo(zoom * (e.deltaY < 0 ? 1.08 : 1 / 1.08), e.clientX - r.left, e.clientY - r.top);
                }, { passive: false });
                range.addEventListener('input', function () { zoomTo(parseFloat(range.value), W / 2, H / 2); });
                function onResize() {
                    var oldW = W;
                    layout();
                    var k = W / oldW;
                    tx *= k; ty *= k;
                    draw();
                }
                window.addEventListener('resize', onResize);

                function close(result) {
                    window.removeEventListener('resize', onResize);
                    document.removeEventListener('keydown', onKey);
                    modal.remove();
                    document.body.classList.remove('no-scroll');
                    URL.revokeObjectURL(url);
                    resolve(result);
                }
                function onKey(e) { if (e.key === 'Escape') close(null); }
                document.addEventListener('keydown', onKey);
                modal.querySelector('[data-cancel]').addEventListener('click', function () { close(null); });
                modal.querySelector('[data-ok]').addEventListener('click', function () {
                    var canvas = document.createElement('canvas');
                    canvas.width = PHOTO_W; canvas.height = PHOTO_H;
                    var ctx = canvas.getContext('2d');
                    ctx.imageSmoothingQuality = 'high';
                    var k = PHOTO_W / W, s = base * zoom;
                    ctx.drawImage(img, tx * k, ty * k, iw * s * k, ih * s * k);
                    // Safari nie koduje WEBP: wtedy JPG
                    canvas.toBlob(function (blob) {
                        if (blob && blob.type === 'image/webp') return close(blob);
                        canvas.toBlob(function (jpg) { close(jpg); }, 'image/jpeg', 0.86);
                    }, 'image/webp', 0.85);
                });
            };
            img.src = url;
        });
    }

    /* ===== START ===== */

    fetch('api.php?a=state', { credentials: 'same-origin', cache: 'no-store' })
        .then(function (r) { return r.json(); })
        .then(function (res) {
            if (!res.ok) return renderLogin();
            applyState(res);
            route();
        })
        .catch(function () { renderLogin('Brak połączenia z serwerem.'); });
})();
