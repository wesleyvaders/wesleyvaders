<?php
/*
  Bericht uit het gastenboek verwijderen, op basis van het token in
  /home/cm32678/gastenboek-data/token.txt (wordt aangemaakt als het
  nog niet bestaat; lees het daar uit).

  POST met JSON:
    { "token": "..." }                       de volledige lijst met id's
    { "token": "...", "id": "..." }          bericht weggooien
    { "token": "...", "id": "...",           naam of bericht aanpassen,
      "naam": "...", "bericht": "..." }      bijvoorbeeld bij een typefout

  Staat er een naam of bericht in de aanvraag, dan wordt er gewijzigd
  en niet verwijderd.
*/

$datamap = getenv('GB_DATA') ?: '/home/cm32678/gastenboek-data';
$bestand = $datamap . '/berichten.json';
$tokenBestand = $datamap . '/token.txt';

header('Content-Type: application/json; charset=utf-8');

if (!is_dir($datamap) && !mkdir($datamap, 0700, true)) {
  http_response_code(500); echo json_encode(['fout' => 'De opslag is niet beschikbaar.']); exit;
}
if (!file_exists($tokenBestand)) {
  file_put_contents($tokenBestand, bin2hex(random_bytes(24)), LOCK_EX);
}
$token = trim((string)file_get_contents($tokenBestand));

if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
  http_response_code(405); echo json_encode(['fout' => 'Alleen POST.']); exit;
}

$in = json_decode((string)file_get_contents('php://input'), true);
if (!is_array($in)) $in = $_POST;

if (!hash_equals($token, (string)($in['token'] ?? ''))) {
  http_response_code(403); echo json_encode(['fout' => 'Ongeldig token.']); exit;
}

$berichten = file_exists($bestand)
  ? (json_decode((string)file_get_contents($bestand), true) ?: [])
  : [];

$id = (string)($in['id'] ?? '');
if ($id === '') {
  echo json_encode($berichten); exit;
}

// wijzigen: alleen de velden die zijn meegestuurd
$wijzigt = array_key_exists('naam', $in) || array_key_exists('bericht', $in);
if ($wijzigt) {
  $gevonden = false;
  foreach ($berichten as &$b) {
    if (($b['id'] ?? '') !== $id) continue;
    $gevonden = true;
    $was = ['naam' => $b['naam'] ?? '', 'bericht' => $b['bericht'] ?? ''];
    if (array_key_exists('naam', $in)) {
      $naam = trim(strip_tags((string)$in['naam']));
      if ($naam === '' || mb_strlen($naam) > 40) {
        http_response_code(400); echo json_encode(['fout' => 'Naam is leeg of langer dan 40 tekens.']); exit;
      }
      $b['naam'] = $naam;
    }
    if (array_key_exists('bericht', $in)) {
      $bericht = trim(strip_tags((string)$in['bericht']));
      if ($bericht === '' || mb_strlen($bericht) > 1200) {
        http_response_code(400); echo json_encode(['fout' => 'Bericht is leeg of langer dan 1200 tekens.']); exit;
      }
      $b['bericht'] = $bericht;
    }
    $nu = ['naam' => $b['naam'], 'bericht' => $b['bericht']];
    break;
  }
  unset($b);
  if (!$gevonden) {
    http_response_code(404); echo json_encode(['fout' => 'Geen bericht met dat id.']); exit;
  }
  file_put_contents($bestand, json_encode($berichten, JSON_UNESCAPED_UNICODE), LOCK_EX);
  echo json_encode(['ok' => true, 'gewijzigd' => $id, 'was' => $was, 'nu' => $nu]);
  exit;
}

$over = array_values(array_filter($berichten, fn($b) => ($b['id'] ?? '') !== $id));
if (count($over) === count($berichten)) {
  http_response_code(404); echo json_encode(['fout' => 'Geen bericht met dat id.']); exit;
}
file_put_contents($bestand, json_encode($over, JSON_UNESCAPED_UNICODE), LOCK_EX);

echo json_encode(['ok' => true, 'verwijderd' => $id]);
