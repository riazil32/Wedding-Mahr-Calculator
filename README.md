# HisabBayt - Islamic Financial Tools

A comprehensive suite of tools for Zakat, Fitrana, and Mahr calculations, built with React and Tailwind CSS.

## Features
- **Zakat Calculator:** Calculate Zakat on various assets with live gold/silver prices.
- **Fitrana Calculator:** Get the latest recommended Fitrana rates.
- **Mahr Calculator:** Calculate Mahr values based on current silver prices.
- **Live Market Data:** Powered by Google Search via Gemini AI.
- **Settings:** Manually configure your Gemini API key for easy deployment.

## How to Deploy to Netlify (Drag & Drop)

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
2. Add a variable with the key `VITE_GEMINI_API_KEY` and your API key as the value.
3. Trigger a new deploy.
