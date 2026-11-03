<?php
/* Body Creator — panel Przemian: API (JSON).
   GET  api.php?a=state                 dane panelu (po zalogowaniu)
   POST api.php?a=<akcja>               zmiany, wymagają nagłówka X-CSRF-Token
   Każda zmiana zapisuje dane/przemiany.json i generuje ../przemiany-data.js. */

define('PRZ_PANEL', true);
require __DIR__ . '/lib.php';

header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store');
header('X-Robots-Tag: noindex, nofollow');

function prz_respond($payload, $status = 200) {
    http_response_code($status);
    echo json_encode($payload, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}

function prz_state($data) {
    return [
        'ok' => true,
        'csrf' => prz_csrf_token(),
        'chunk' => PRZ_CHUNK_BYTES,
        'data' => $data,
    ];
}

$action = isset($_GET['a']) ? (string)$_GET['a'] : '';
$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';

try {
    if ($action === 'login') {
        if ($method !== 'POST') throw new PrzError('Niedozwolona metoda.', 405);
        prz_login($_POST['password'] ?? '');
        prz_respond(prz_state(prz_load()));
    }

    if (!prz_is_logged_in()) throw new PrzError('Zaloguj się ponownie.', 401);

    if ($method === 'GET') {
        if ($action !== 'state') throw new PrzError('Nieznana akcja.', 404);
        prz_respond(prz_state(prz_load()));
    }
    if ($method !== 'POST') throw new PrzError('Niedozwolona metoda.', 405);
    prz_check_csrf();

    // Pola formularzy przychodzą jako JSON w polu "data"; pliki jako surowe body (parametry w adresie)
    $in = isset($_POST['data']) ? json_decode((string)$_POST['data'], true) : [];
    if (!is_array($in)) throw new PrzError('Nieprawidłowe dane.');

    switch ($action) {
        case 'logout':
            prz_logout();
            prz_respond(['ok' => true]);

        case 'password-change':
            prz_change_password($in['current'] ?? '', $in['new'] ?? '', $in['repeat'] ?? '');
            prz_respond(prz_state(prz_load()));

        case 'upload':
            prz_respond(['ok' => true] + prz_upload_chunk($_GET['kind'] ?? '', $_GET['uid'] ?? '', $_GET['offset'] ?? -1, $_GET['total'] ?? 0));

        case 'category-save':
            list($data, $slug) = prz_mutate(function (&$d) use ($in) {
                $slug = (string)($in['slug'] ?? '');
                if ($slug === '') {
                    $cat = prz_validate_category($in, $d, null);
                    $slug = prz_unique(prz_slugify($cat['title']), array_column($d['categories'], 'slug'));
                    $d['categories'][] = ['slug' => $slug] + $cat;
                } else {
                    // Slug się nie zmienia, żeby nie psuć linków
                    $i = prz_find_index($d['categories'], 'slug', $slug);
                    if ($i < 0) throw new PrzError('Nie ma takiego celu.', 404);
                    $d['categories'][$i] = prz_validate_category($in, $d, $d['categories'][$i]);
                }
                return $slug;
            });
            prz_respond(prz_state($data) + ['slug' => $slug]);

        case 'category-delete':
            list($data) = prz_mutate(function (&$d) use ($in) {
                $slug = (string)($in['slug'] ?? '');
                $i = prz_find_index($d['categories'], 'slug', $slug);
                if ($i < 0) throw new PrzError('Nie ma takiego celu.', 404);
                if (prz_find_index($d['cases'], 'category', $slug) >= 0) {
                    throw new PrzError('Ten cel ma przemiany. Przenieś je do innego celu albo ukryj cel zamiast go usuwać.');
                }
                array_splice($d['categories'], $i, 1);
            });
            prz_respond(prz_state($data));

        case 'case-save':
            list($data, $id) = prz_mutate(function (&$d) use ($in) {
                $id = (string)($in['id'] ?? '');
                if ($id === '') {
                    $case = prz_validate_case($in, $d, null);
                    $base = prz_slugify(($case['name'] ?? 'przemiana') . '-' . $case['category']);
                    $id = prz_unique($base, array_column($d['cases'], 'id'));
                    // Nowa przemiana trafia na koniec swojego celu
                    $pos = count($d['cases']);
                    foreach ($d['cases'] as $k => $c) if ($c['category'] === $case['category']) $pos = $k + 1;
                    array_splice($d['cases'], $pos, 0, [['id' => $id] + $case]);
                } else {
                    $i = prz_find_index($d['cases'], 'id', $id);
                    if ($i < 0) throw new PrzError('Nie ma takiej przemiany.', 404);
                    $d['cases'][$i] = prz_validate_case($in, $d, $d['cases'][$i]);
                }
                return $id;
            });
            prz_respond(prz_state($data) + ['id' => $id]);

        case 'case-delete':
            list($data) = prz_mutate(function (&$d) use ($in) {
                $i = prz_find_index($d['cases'], 'id', (string)($in['id'] ?? ''));
                if ($i < 0) throw new PrzError('Nie ma takiej przemiany.', 404);
                array_splice($d['cases'], $i, 1);
            });
            prz_respond(prz_state($data));

        case 'toggle':
            // Szybkie przełączenie widoczności z listy
            list($data) = prz_mutate(function (&$d) use ($in) {
                $list = ($in['type'] ?? '') === 'case' ? 'cases' : 'categories';
                $key = $list === 'cases' ? 'id' : 'slug';
                $i = prz_find_index($d[$list], $key, (string)($in['key'] ?? ''));
                if ($i < 0) throw new PrzError('Nie znaleziono elementu.', 404);
                $d[$list][$i]['visible'] = !empty($in['visible']);
            });
            prz_respond(prz_state($data));

        case 'move':
            // Przesunięcie o jedno miejsce w obrębie obszaru (cele) albo celu (przemiany)
            list($data) = prz_mutate(function (&$d) use ($in) {
                $isCase = ($in['type'] ?? '') === 'case';
                $list = $isCase ? 'cases' : 'categories';
                $key = $isCase ? 'id' : 'slug';
                $group = $isCase ? 'category' : 'area';
                $i = prz_find_index($d[$list], $key, (string)($in['key'] ?? ''));
                if ($i < 0) throw new PrzError('Nie znaleziono elementu.', 404);
                $step = ($in['dir'] ?? '') === 'up' ? -1 : 1;
                for ($j = $i + $step; $j >= 0 && $j < count($d[$list]); $j += $step) {
                    if ($d[$list][$j][$group] === $d[$list][$i][$group]) {
                        $tmp = $d[$list][$i];
                        $d[$list][$i] = $d[$list][$j];
                        $d[$list][$j] = $tmp;
                        break;
                    }
                }
            });
            prz_respond(prz_state($data));

        case 'settings-save':
            list($data) = prz_mutate(function (&$d) use ($in) {
                $d['settings']['hideEmpty'] = !empty($in['hideEmpty']);
            });
            prz_respond(prz_state($data));

        default:
            throw new PrzError('Nieznana akcja.', 404);
    }
} catch (PrzError $e) {
    prz_respond(['ok' => false, 'error' => $e->getMessage()], $e->status);
} catch (Throwable $e) {
    error_log('[panel przemian] ' . $e);
    prz_respond(['ok' => false, 'error' => 'Błąd serwera. Spróbuj ponownie za chwilę.'], 500);
}
