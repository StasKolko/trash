export function renderHtml({
  body,
  hydration,
  entryJs,
  cssFiles,
  preloadJs,
}: {
  body: string;
  hydration: string;
  entryJs: string;
  cssFiles: string[];
  preloadJs: string[];
}): string {
  const cssLinks = cssFiles
    .map((href) => `<link rel="stylesheet" href="/${href}" />`)
    .join("");

  const jsPreloads = preloadJs
    .map((href) => `<link rel="modulepreload" crossorigin href="/${href}" />`)
    .join("");

  const v = "v=1";

  return `<!doctype html>
<html lang="ru">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />

    <link rel="icon" type="image/png" href="/favicon.png?${v}" />
    <link rel="apple-touch-icon" href="/favicon.png?${v}" />

    ${cssLinks}
    ${jsPreloads}
    ${hydration}
  </head>
  <body>
    <div id="app">${body}</div>
    <script type="module" src="/${entryJs}"></script>
  </body>
</html>`;
}
