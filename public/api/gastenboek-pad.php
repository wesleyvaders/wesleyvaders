<?php
/*
  Waar de gastenboekdata staat. Eén plek, gebruikt door beide eindpunten.

  Het pad wordt afgeleid van dit bestand zelf, dus er staat nergens een
  gebruikersnaam of servernaam in:

    .../domains/wesleyvaders.nl/public_html/api/  <- dit bestand
    .../domains/wesleyvaders.nl/gastenboek-data/  <- de berichten

  Dat is buiten public_html, dus de FTP-deploy blijft eraf, en het valt
  binnen de domeinmap zodat je het in DirectAdmin gewoon terugvindt bij
  de rest van de site. Verhuist de site ooit naar een andere host of
  verandert de accountnaam, dan klopt het nog steeds.

  GB_DATA is er voor lokaal testen. Het oude losse pad blijft werken
  zolang de berichten daar nog staan, zodat er niets omvalt tijdens de
  verhuizing.
*/

function gastenboek_datamap(): string {
  $env = getenv('GB_DATA');
  if ($env) return $env;

  $oud = '/home/cm32678/gastenboek-data';
  if (is_file($oud . '/berichten.json')) return $oud;

  return dirname(__DIR__, 2) . '/gastenboek-data';
}
