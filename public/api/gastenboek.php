<?php
/*
  Gastenboek van wesleyvaders.nl.
  GET                  de laatste 100 berichten, nieuwste eerst
  GET ?start=1         een ondertekend tijdstempel voor het formulier
  POST                 een nieuw bericht plaatsen

  De data staat buiten public_html, want de FTP-deploy gooit alles weg
  wat niet in dist/ zit. Waar precies staat in gastenboek-pad.php.
*/

require __DIR__ . '/gastenboek-pad.php';

$datamap = gastenboek_datamap();
$bestand = $datamap . '/berichten.json';
$geheimBestand = $datamap . '/geheim.txt';
$ipBestand = $datamap . '/ips.json';

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: https://wesleyvaders.nl');
header('Access-Control-Allow-Methods: GET, POST');
header('Access-Control-Allow-Headers: Content-Type');

if (!is_dir($datamap) && !mkdir($datamap, 0700, true)) {
  fout(500, 'De opslag is niet beschikbaar.');
}
if (!file_exists($geheimBestand)) {
  file_put_contents($geheimBestand, bin2hex(random_bytes(32)), LOCK_EX);
}
$geheim = trim((string)file_get_contents($geheimBestand));

function fout(int $code, string $melding): void {
  http_response_code($code);
  echo json_encode(['fout' => $melding]);
  exit;
}

function lees(string $pad): array {
  if (!file_exists($pad)) return [];
  $data = json_decode((string)file_get_contents($pad), true);
  return is_array($data) ? $data : [];
}

function bewaar(string $pad, array $data): void {
  file_put_contents($pad, json_encode($data, JSON_UNESCAPED_UNICODE), LOCK_EX);
}

$methode = $_SERVER['REQUEST_METHOD'] ?? 'GET';

if ($methode === 'GET') {
  if (isset($_GET['start'])) {
    $t = time();
    echo json_encode(['t' => $t, 'sig' => hash_hmac('sha256', (string)$t, $geheim)]);
    exit;
  }
  $alle = array_reverse(lees($bestand));
  $totaal = count($alle);
  $offset = max(0, (int)($_GET['offset'] ?? 0));
  $limiet = min(50, max(1, (int)($_GET['limiet'] ?? 10)));

  $uit = [];
  foreach (array_slice($alle, $offset, $limiet) as $b) {
    $uit[] = [
      'naam' => htmlspecialchars($b['naam'] ?? '', ENT_QUOTES),
      'bericht' => htmlspecialchars($b['bericht'] ?? '', ENT_QUOTES),
      'datum' => $b['datum'] ?? ''
    ];
  }
  echo json_encode([
    'totaal' => $totaal,
    'offset' => $offset,
    'meer' => $offset + count($uit) < $totaal,
    'berichten' => $uit
  ]);
  exit;
}

if ($methode !== 'POST') {
  fout(405, 'Alleen GET en POST.');
}

$in = json_decode((string)file_get_contents('php://input'), true);
if (!is_array($in)) $in = $_POST;

// honeypot: mensen zien dit veld niet, bots vullen het in
if (!empty($in['website'])) {
  fout(400, 'Er ging iets mis. Probeer het later nog eens.');
}

// ondertekend tijdstempel: het formulier moet minstens 4 seconden open staan
$t = (int)($in['t'] ?? 0);
$sig = (string)($in['sig'] ?? '');
if ($t <= 0 || !hash_equals(hash_hmac('sha256', (string)$t, $geheim), $sig)) {
  fout(400, 'Het formulier is verlopen. Ververs de pagina en probeer het opnieuw.');
}
if (time() - $t < 4) {
  fout(400, 'Dat ging wel heel snel. Probeer het nog eens.');
}

$naam = trim(strip_tags((string)($in['naam'] ?? '')));
$bericht = trim(strip_tags((string)($in['bericht'] ?? '')));

if ($naam === '' || $bericht === '') {
  fout(400, 'Vul een naam en een bericht in.');
}
if (mb_strlen($naam) > 40) {
  fout(400, 'Hou de naam onder de 40 tekens.');
}
if (mb_strlen($bericht) > 1200) {
  fout(400, 'Hou het bericht onder de 1200 tekens.');
}
foreach (['http', 'https', 'www.'] as $verboden) {
  if (stripos($bericht, $verboden) !== false || stripos($naam, $verboden) !== false) {
    fout(400, 'Links zijn niet toegestaan in het gastenboek.');
  }
}

// maximaal 3 berichten per uur per IP; alleen een hash van het IP bewaren
$ipHash = hash('sha256', ($_SERVER['REMOTE_ADDR'] ?? '') . $geheim);
$grens = time() - 3600;
$ips = lees($ipBestand);
foreach ($ips as $hash => $tijden) {
  $ips[$hash] = array_values(array_filter($tijden, fn($x) => $x > $grens));
  if (!$ips[$hash]) unset($ips[$hash]);
}
if (count($ips[$ipHash] ?? []) >= 3) {
  fout(429, 'Rustig aan. Probeer het over een uurtje nog eens.');
}
$ips[$ipHash][] = time();
bewaar($ipBestand, $ips);

$berichten = lees($bestand);
$berichten[] = [
  'id' => bin2hex(random_bytes(8)),
  'naam' => $naam,
  'bericht' => $bericht,
  'datum' => date('c')
];
bewaar($bestand, $berichten);

echo json_encode(['ok' => true]);
