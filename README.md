### 2D Jump and Run — Webseite / Deployment

Dieses Repository enthält ein kleines 2D-Jump-and-Run-Spiel (`index.html`, `game.js`, `style.css`).

Zwei einfache Möglichkeiten, das Spiel online verfügbar zu machen:

1) Lokal testen (schnell)

- Mit Python 3 (einfach):

```bash
cd <repo-folder>
python3 -m http.server 8000
# Dann im Browser öffnen: http://localhost:8000
```

- Oder mit `npm` + `serve`:

```bash
npm install -g serve
serve .
# öffnet lokalen Webserver
```

2) Auf GitHub Pages veröffentlichen (automatisch)

- Push das Repo zu GitHub (z. B. `origin/main`).
- Es ist bereits eine GitHub Actions-Workflowdatei im Pfad `.github/workflows/gh-pages.yml`, die bei jedem Push die Seite nach `gh-pages` deployed.
- Aktiviere GitHub Pages in den Einstellungen deiner Repository-Seite, falls erforderlich (Branch: `gh-pages`).

HINWEIS: Die Workflow-Datei nutzt den standardmäßigen `peaceiris/actions-gh-pages`-Action. Du musst nichts weiter konfigurieren — nur pushen. Falls du ein privates Repo nutzt, prüfe, ob Actions und Pages aktiviert sind.

Wenn du möchtest, richte ich stattdessen ein zweistufiges Menü oder ein kleines Landing-Layout für die Webseite ein.
# alex_dev