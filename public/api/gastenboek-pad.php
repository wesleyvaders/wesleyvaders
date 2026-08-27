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

  GB_DATA is er voor lokaal testen.

  Tot 27 augustus 2026 stond de data in /home/cm32678/gastenboek-data,
  buiten de domeinmap. Daar kwam je in DirectAdmin niet bij. Die
  terugvaloptie is eruit nu de map verhuisd is; welke map er gebruikt
  wordt staat onderaan de beheerpagina.
*/

function gastenboek_datamap(): string {
  $env = getenv('GB_DATA');
  if ($env) return $env;

  return dirname(__DIR__, 2) . '/gastenboek-data';
}
