<?php
/* Body Creator — panel Przemian. Logowanie i cała logika po stronie panel.js + api.php. */
define('PRZ_PANEL', true);
require __DIR__ . '/lib.php';
header('Cache-Control: no-store');
header('X-Robots-Tag: noindex, nofollow');
$hasPassword = prz_password_hash() !== null;
?><!DOCTYPE html>
<html lang="pl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="robots" content="noindex, nofollow">
    <title>Panel Przemian | Body Creator</title>
    <link rel="icon" type="image/png" href="../../favicon.png">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css">
    <link rel="stylesheet" href="panel.css?v=<?= filemtime(__DIR__ . '/panel.css') ?>">
</head>
<body>
    <header class="topbar">
        <a class="brand" href="#/"><img src="../../logobezpodpisu.png" alt="" width="28" height="28"><span>Panel Przemian</span></a>
        <nav class="topbar-actions" id="topActions" hidden>
            <a class="icon-btn" href="../przemiany.html" target="_blank" rel="noopener" title="Zobacz stronę"><i class="fas fa-arrow-up-right-from-square"></i><span>Strona</span></a>
            <button class="icon-btn" type="button" id="logoutBtn" title="Wyloguj"><i class="fas fa-right-from-bracket"></i><span>Wyloguj</span></button>
        </nav>
    </header>

    <main id="app" class="wrap">
        <?php if (!$hasPassword): ?>
            <section class="card login">
                <h1>Panel nie jest jeszcze skonfigurowany</h1>
                <p class="muted">Brakuje pliku z hasłem. Uruchom <code>php admin/ustaw-haslo.php "haslo"</code> i wgraj <code>dane/haslo.php</code> na serwer.</p>
            </section>
        <?php else: ?>
            <p class="muted loading"><i class="fas fa-circle-notch fa-spin"></i> Ładowanie…</p>
        <?php endif; ?>
    </main>

    <div class="toast" id="toast" role="status" aria-live="polite"></div>

    <?php if ($hasPassword): ?>
    <script src="panel.js?v=<?= filemtime(__DIR__ . '/panel.js') ?>"></script>
    <?php endif; ?>
</body>
</html>
