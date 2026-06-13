# CookList AI Deployment Guide

Since CookList AI is a client-side static web application (HTML, CSS, Vanilla JS), it can be deployed for free on any static hosting platform. Below are step-by-step deployment instructions for the most popular platforms.

---

## 1. Vercel (Recommended)
Vercel is the easiest way to deploy static frontend projects. It integrates with GitHub and auto-deploys on every commit.

### Via Vercel Web Dashboard (No CLI):
1. Push your code to a GitHub, GitLab, or Bitbucket repository.
2. Sign in to [Vercel](https://vercel.com).
3. Click **Add New** > **Project**.
4. Import your git repository.
5. In **Build & Development Settings**, leave everything as default (Vercel automatically detects static HTML/CSS/JS files).
6. Click **Deploy**. Your app will be live on a `vercel.app` subdomain in under 30 seconds!

### Via Vercel CLI:
1. Install the CLI: `npm install -g vercel`
2. Run `vercel` in your project folder:
   ```bash
   vercel
   ```
3. Follow the CLI prompts to log in and set up your project. Keep the default settings.
4. Run `vercel --prod` to deploy to production.

---

## 2. Netlify
Netlify provides instant static hosting and supports Git integrations as well as manual drag-and-drop.

### Drag and Drop (Easiest):
1. Sign in to [Netlify](https://netlify.com).
2. Go to the **Sites** tab.
3. Scroll to the bottom and drag-and-drop the `cooklist-ai` directory into the upload box.
4. Netlify will deploy it instantly and provide a live URL!

### Via Git Integration:
1. Connect your repository to Netlify via the web dashboard.
2. Under build settings, leave the Build Command empty and set the Publish directory to `./` (or the folder containing `index.html`).
3. Click **Deploy Site**.

---

## 3. GitHub Pages
If your repository is already on GitHub, you can host it for free directly from GitHub Pages.

1. Go to your repository on GitHub.
2. Click **Settings** (top bar).
3. Scroll down the left sidebar and click **Pages**.
4. Under **Build and deployment** > **Source**, select **Deploy from a branch**.
5. Under **Branch**, select your branch (e.g., `main`) and folder `/ (root)`.
6. Click **Save**.
7. Within 1-2 minutes, GitHub will deploy your site. You can monitor the progress under the **Actions** tab. Your site will be live at `https://<your-username>.github.io/<repository-name>/`.

---

## 4. Local Deployment
To run a production-ready HTTP server locally on your system, you can use:

### Python (Built-in):
```bash
python3 -m http.server 8000
```
Then visit `http://localhost:8000`.

### Node.js (serve package):
```bash
npm install -g serve
serve -s .
```
Then visit `http://localhost:3000`.
