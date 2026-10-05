# SlideStudy

Upload PDF, PPTX, or TXT lecture files to create flashcards and a scored practice quiz. Includes a sample lecture, pasted notes, source references, and responsive styling.

This download contains the complete app source adapted to a standalone React + TypeScript + Vite project. It needs no ChatGPT hosting services, account, API key, or backend. The original hosted app is unchanged.

## Run on your Mac

1. Install Node.js 22.13 or newer from https://nodejs.org/ (Node 22 recommended).
2. Unzip the download and open the `slide-study` folder in VS Code.
3. Open Terminal > New Terminal and run:

```bash
npm install
npm run dev
```

Open the localhost link shown in the terminal. Keep that terminal running. Press Control+C to stop it.

## Put the source on GitHub

1. Create a new empty GitHub repository named `slide-study`. Do not initialize it with a README, license, or gitignore; this folder already has a README and gitignore.
2. In VS Code's terminal, inside the extracted `slide-study` folder, run these commands. Replace `YOUR_USERNAME` with your actual GitHub username:

```bash
git init
git add .
git commit -m "Add SlideStudy app"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/slide-study.git
git push -u origin main
```

Authenticate to GitHub if prompted. You can also use VS Code's Source Control > Publish to GitHub instead of the terminal Git commands.

The repository root must contain `package.json`, `index.html`, and `.github/workflows/deploy.yml`, not an extra surrounding `slide-study` folder. The Git workflow includes hidden files automatically.

## Launch with GitHub Pages

1. In the repository, open Settings > Pages.
2. Under Build and deployment, set Source to **GitHub Actions**.
3. Open Actions > Deploy SlideStudy > Run workflow > main > Run workflow. This also retries if the initial push ran before Pages was enabled.
4. Wait for both build and deploy to finish successfully. Open the published link in the deployment or Settings > Pages. For the example repository it is usually `https://YOUR_USERNAME.github.io/slide-study/`.

Future pushes to `main` publish your changes automatically. Hosting availability for private repositories depends on your GitHub plan. A public repository exposes your source and a Pages deployment is generally publicly accessible; choose repository visibility deliberately.

Official guide: https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages

## Editing

- `app/page.tsx`: main interface and session state
- `app/globals.css`: styling
- `lib/extract.ts`: PDF, PPTX, and text parsing
- `lib/study.ts`: flashcard and quiz generation
- `vite.config.ts`: standalone build configuration
- `.github/workflows/deploy.yml`: GitHub Pages build and deployment

Check a production build locally:

```bash
npm run build
npm run preview
```

## Limits and privacy

- Generation uses text rules, not an AI model. It creates definition and fill-in-the-blank questions; review them against your lecture.
- Files are processed in the browser and are not uploaded to a server.
- Scanned images, diagrams, and speaker notes are not read. Export older PPT/Keynote files to text-based PDF or PPTX.
- Maximum file size is 20 MB; PDF/PPTX files can contain up to 250 pages/slides.
- Up to 60 flashcards and 10 quiz questions per set.
- Reloading or closing the page clears the session. There is no saved-deck database.

Dependencies retain their own licenses. The vendored stylesheet's license is included in `vendor/`. The PDF worker is copied from the installed pdfjs-dist dependency by `npm install`.
