# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

## Run Locally

**Prerequisites:**  Node.js

1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`

## Scan a folder for Markdown files

Use the provided script to recursively list all `.md` files in a directory:

```bash
npm run scan-md ./path/to/folder
```

This will print every Markdown file found inside the folder and its subdirectories.
