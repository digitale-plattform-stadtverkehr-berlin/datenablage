# Azure-Datenablage

Weboberfläche um Daten in einem Azure-Cloud Blob-Storage anzuzeigen.

Das System ist unter der Adresse https://api.viz.berlin.de/daten/verkehrsdetektion im Einsatz. 

## Deployment / Systemvorraussetzungen

Die Projekt-Dateien können auf einem Webserver bereitgestellt werden.

Im Blob-Container muss der öffentliche Lesezugriff über die Blob-API erlaubt sein.

Für die Spalte Beschreibung kann im Blob ein Metadaten Eintrag mit dem Schlüssel `description` eingetragen werden.

## Anpassung

Die Domain des Speicherkontos muss in der Datei `js/browser.js` angepasst werden.

Die Angabe des Daten-Containers erfolgt in der Einbindung in die HTML-Datei.
