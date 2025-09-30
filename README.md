<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/drive/1bZdSSdDEC4nte1DtgD8RlTNmOsJ-9RQ3

## Environment Setup

This project uses the Gemini API, which requires an API key. To run the project, you need to provide your key.

1.  Create a file named `.env.local` in the root of the project.
2.  Add your API key to this file using the correct variable name, which must start with `VITE_`:
    ```
    VITE_GEMINI_API_KEY="YOUR_API_KEY_HERE"
    ```

**Troubleshooting for Windows:**
*   Ensure your file is named exactly `.env.local`. Sometimes, Windows may save it as `.env.local.txt`. You can enable "File name extensions" in File Explorer's "View" options to check this.

**Important:** If you create or change the `.env.local` file, you must restart the development server (`npm run dev`) or rebuild the application (`npm run build`) for the changes to take effect.

## Run Locally (Development)

**Prerequisites:** Node.js

1.  Install dependencies:
    `npm install`
2.  Run the development server:
    `npm run dev`

This will start a local server, typically at `http://localhost:3000`.

## Build for Production

1.  Ensure your `.env.local` file is set up correctly with your `VITE_GEMINI_API_KEY`.
2.  Run the build command:
    `npm run build`
3.  This creates a `dist` folder with the optimized, static application files. You can deploy this folder to any static hosting service.

To test the production build locally, you can use `npm run preview` or another static server like `serve`:

`npm install -g serve`
`serve -s dist`