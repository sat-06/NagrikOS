export function renderErrorPage(): string {
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Something went wrong — NagrikOS</title>
    <style>
      :root { color-scheme: light dark; }
      body {
        margin: 0;
        min-height: 100dvh;
        display: grid;
        place-items: center;
        font-family: Inter, system-ui, -apple-system, "Segoe UI", sans-serif;
        background: #0f172a;
        color: #e2e8f0;
        padding: 1.5rem;
      }
      .box { max-width: 28rem; text-align: center; }
      h1 { font-size: 1.375rem; margin: 0 0 0.5rem; }
      p { color: #94a3b8; margin: 0 0 1.5rem; font-size: 0.925rem; }
      a {
        display: inline-block;
        padding: 0.55rem 1.1rem;
        border-radius: 0.5rem;
        background: #6366f1;
        color: #fff;
        text-decoration: none;
        font-weight: 500;
        font-size: 0.9rem;
      }
    </style>
  </head>
  <body>
    <div class="box">
      <h1>This page didn't load</h1>
      <p>Something went wrong on our side. Please try again in a moment.</p>
      <a href="/">Back to NagrikOS</a>
    </div>
  </body>
</html>`;
}
