# Formularze i `send_mail.php`

Wszystkie formularze wysyłają `POST` (FormData) do `send_mail.php`, który wysyła maila funkcją PHP `mail()` na `kontakt@bodycreator.com.pl`. Odpowiedź to zawsze JSON: `{ success, ok, error?, message?, code? }`.

## Formularze

| Strona | `id` formularza | Typ zgłoszenia | Pola |
|---|---|---|---|
| `rezerwacja.html` | `reservationForm` | rezerwacja konsultacji | `imie`, `telefon`, `email`, `zgoda_dane`, `zgoda_newsletter` |
| `formularzeventowy.html` | `eventForm` | przedsprzedaż karnetów | jak wyżej + `formularz=event` |
| (ścieżka ogólna) | — | wiadomość kontaktowa | `name`, `email`, `phone?`, `subject?`, `message` |

`send_mail.php` rozpoznaje typ zgłoszenia tak:
- obecność `imie` lub `telefon` oznacza rezerwację;
- `formularz=event` oznacza wariant eventowy (inny temat maila);
- w pozostałych przypadkach to wiadomość ogólna.

Zgody są wysyłane jako `tak`.

## Antyspam (od 2026-09-21)

Dwie warstwy, sprawdzane przed jakąkolwiek obróbką danych:

1. **Honeypoty**: ukryte pola `website` i `pole_kontrolne`. Jeśli coś w nich jest, zgłoszenie zostaje odrzucone po cichu.
2. **Token czasowy podpisany HMAC:**
   - Strona przy wejściu robi `GET send_mail.php?token=1` (z `cache: 'no-store'`) i dostaje `{ token, min_seconds, max_seconds }`.
   - Token to `timestamp.hmac_sha256(timestamp, sekret)`, wysyłany w polu `as_token`.
   - Zgłoszenie szybciej niż **3 s** od wydania tokenu albo z podrobionym tokenem: cicha odmowa.
   - Token starszy niż **3 h**: błąd 400 `code: token_expired`. Strona pobiera wtedy nowy token i ponawia wysyłkę.
3. **Cicha odmowa** oznacza odpowiedź `success: true`, żeby bot nie szukał obejścia.

**Sekret** generuje się sam przy pierwszym żądaniu i trafia do pliku `.antispam_secret` w katalogu strony (blokowany przez `.htaccess`, w `.gitignore`). Gdy zapis się nie uda, trafia do katalogu tymczasowego serwera. Ostatnia deska ratunku: wartość wyliczona z parametrów pliku.

## Zasady przy zmianach

- Nowy formularz musi pobierać token, mieć oba honeypoty i obsłużyć `token_expired`. Wzór: skrypt w `rezerwacja.html`.
- Dane wejściowe są przepuszczane przez `htmlspecialchars`, a mail jest `text/plain` UTF-8. Nie przechodź na HTML w mailu bez escapowania.
- `Reply-To` ustawiany jest na adres z formularza, więc można odpowiadać klientowi bezpośrednio.
- Testu wysyłki nie da się zrobić na `python -m http.server` (brak PHP). Lokalnie użyj `php -S localhost:8000` albo testuj na serwerze po uzgodnieniu z użytkownikiem. Pamiętaj, że to wysyła prawdziwego maila do klienta.
