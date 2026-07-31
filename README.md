# Heartforged MVP

A dependency-free web app for creating custom pride-flag heart PNGs with transparent backgrounds.

## Features

- Any number of equal-size vertical or horizontal stripes
- Individual color selection for every stripe
- Native full-spectrum RGB color picker
- Editable six-digit hex values
- Standard pride color palette
- Rainbow, transgender, bisexual, pansexual, nonbinary, and five-stripe sunset lesbian starter presets
- Append multiple flag presets to combine their complete stripe designs
- Switch between left-to-right vertical stripes and top-to-bottom horizontal stripes
- Equal geometric stripe sizing across the visible heart bounds, including the outside bands
- Reorder, duplicate, add, and remove stripes
- Optional gloss
- 1024×1024 transparent PNG export
- Browser-only: no accounts, uploads, analytics, backend, or build step

## Run locally

Open `index.html` in a modern browser, or run a basic local server:

```bash
python3 -m http.server 8000
```

Then visit `http://localhost:8000`.

## Deploy to GitHub Pages

1. Create a public GitHub repository.
2. Upload these files to the repository root.
3. Open **Settings → Pages**.
4. Choose **Deploy from a branch**.
5. Select `main` and `/ (root)`.
6. Save.

## Custom domain

Rename `CNAME.example` to `CNAME`, replace its contents with your domain, and configure the domain's DNS records for GitHub Pages.

## License

MIT
