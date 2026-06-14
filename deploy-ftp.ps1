# Uploads the icon fix (2 new assets + 8 HTML pages) to the web root via FTP/FTPS/SFTP.
# Reads credentials from deploy.ftp.json (gitignored). Run:  ./deploy-ftp.ps1 [-DryRun]
param([switch]$DryRun)
$ErrorActionPreference = 'Stop'
$root = $PSScriptRoot
$cfgPath = Join-Path $root 'deploy.ftp.json'
if (-not (Test-Path $cfgPath)) { throw "Brak deploy.ftp.json - uzupelnij dane FTP." }
$cfg = Get-Content $cfgPath -Raw | ConvertFrom-Json
$proto = ("$($cfg.protocol)").ToLower()
if (-not $cfg.host) { throw "Uzupelnij 'host' w deploy.ftp.json." }
if ($cfg.port) { $port = [int]$cfg.port } elseif ($proto -eq 'sftp') { $port = 22 } else { $port = 21 }
$scheme = if ($proto -eq 'sftp') { 'sftp' } else { 'ftp' }   # 'ftps' = explicit FTP over TLS, uses ftp:// + --ssl-reqd
$remote = ("$($cfg.remoteDir)").TrimEnd('/')

$files = @(
  'favicon.ico','apple-touch-icon.png',
  'index.html','kalkulator.html','kontakt.html','o-nas.html',
  'oferta.html','polityka-prywatnosci.html','przemiany.html','rezerwacja.html'
)

Write-Host "Target: $scheme`://$($cfg.host):$port$remote/  (protocol=$proto)" -ForegroundColor Cyan
$ok = 0; $fail = 0
foreach ($f in $files) {
  $local = Join-Path $root $f
  if (-not (Test-Path $local)) { Write-Host "MISSING  $f" -ForegroundColor Red; $fail++; continue }
  $url = "{0}://{1}:{2}{3}/{4}" -f $scheme, $cfg.host, $port, $remote, $f
  if ($DryRun) { Write-Host "DRY-RUN  $f  ->  $url"; continue }
  $a = @('-sS','--fail-with-body','--connect-timeout','25','-T', $local, '--user', ("{0}:{1}" -f $cfg.user, $cfg.password))
  if ($proto -eq 'ftps') { $a += '--ssl-reqd' }
  if ($proto -eq 'sftp') { $a += '--insecure' }              # skip known_hosts for one-off deploy
  if ($scheme -eq 'ftp') { $a += '--ftp-create-dirs' }
  $a += $url
  $out = & curl @a 2>&1
  if ($LASTEXITCODE -eq 0) { Write-Host "OK       $f" -ForegroundColor Green; $ok++ }
  else { Write-Host "FAIL     $f  (curl exit $LASTEXITCODE)" -ForegroundColor Red; if ($out) { Write-Host "         $out" -ForegroundColor DarkYellow }; $fail++ }
}
if (-not $DryRun) { Write-Host "`nDone: $ok OK, $fail failed." -ForegroundColor Cyan }
