# HisabBayt - Islamic Financial Tools

A comprehensive suite of tools for Zakat, Fitrana, and Mahr calculations, built with React and Tailwind CSS.

## Features
- **Zakat Calculator:** Calculate Zakat on various assets with live gold/silver prices.
- **Fitrana Calculator:** Get the latest recommended Fitrana rates.
- **Mahr Calculator:** Calculate Mahr values based on current silver prices.
- **Live Market Data:** Powered by Google Search via Gemini AI.
- **Settings:** Manually configure your Gemini API key for easy deployment.

## How to Deploy via GitHub to Netlify (Recommended)

This is the best way to keep your site updated automatically whenever you push changes to GitHub.

### 1. Push to GitHub
1. Create a new repository on [GitHub](https://github.com/new).
2. In your local project folder, run:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
   git push -u origin main
   ```

### 2. Connect to Netlify
1. Log in to [Netlify](https://app.netlify.com/).
2. Click **Add new site** > **Import an existing project**.
3. Select **GitHub** and authorize Netlify.
4. Select your repository.
5. Netlify should automatically detect the build settings:
   - **Build command:** `npm run build`
   - **Publish directory:** `dist`
6. Click **Deploy site**.

### 3. Configure Custom Domain (hisabbayt.com)
1. In Netlify, go to **Site settings** > **Domain management**.
2. Click **Add custom domain** and enter `hisabbayt.com`.
3. Follow the instructions to update your DNS settings (usually adding a CNAME or A record at your domain provider).

### 4. Set Environment Variables
1. In Netlify, go to **Site settings** > **Environment variables**.
2. Click **Add a variable**.
3. Key: `GEMINI_API_KEY`
4. Value: `YOUR_GEMINI_API_KEY`
5. Click **Save**.
6. Trigger a new deploy (Go to **Deploys** > **Trigger deploy** > **Clear cache and deploy site**).

### 🔒 Security Note
We use a **Server-Side Proxy** to keep your API key hidden. 
- **DO NOT** use the `VITE_` prefix for your Gemini API key. 
- Variables starting with `VITE_` are automatically sent to the browser and are **NOT SECURE**.
- Your key is safely stored on the server and accessed via `process.env.GEMINI_API_KEY`.

---

## Alternative: Manual Deploy (Drag & Drop)

To deploy this application manually to Netlify, follow these steps:

### 1. Build the Project Locally
Before uploading, you must generate the static files:
1. Open your terminal in the project folder.
2. Run `npm install` to install dependencies.
3. Run `npm run build` to create the production build.
4. This will create a folder named `dist` in your project directory.

### 2. Upload to Netlify
1. Log in to your [Netlify Dashboard](https://app.netlify.com/).
2. Go to the **Sites** tab.
3. Scroll down to the bottom where it says **"Want to deploy a new site without connecting to Git? Drag and drop your site folder here"**.
4. Drag and drop the **`dist`** folder (not the whole project folder) into that area.

### 3. Configure API Key
Once your site is live:
1. Open your site URL.
2. Click the **Settings** (gear) icon in the header.
3. Paste your Gemini API key (get one for free at [Google AI Studio](https://aistudio.google.com/app/apikey)).
4. Click **Save Configuration**.

Your site is now fully functional and ready to use!

## Environment Variables (Optional)
If you prefer to use Netlify's environment variables instead of the Settings modal:
1. In Netlify, go to **Site settings** > **Environment variables**.
2. Add a variable with the key `GEMINI_API_KEY` and your API key as the value.
3. Trigger a new deploy.
