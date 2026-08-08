// Wraps src/app.html (body-only content) into a standalone index.html.
// The source is kept skeleton-free so the same file can be published as a
// hosted artifact, which supplies its own <head> and CSS reset.
//
//   node build.mjs

import { readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const here = dirname(fileURLToPath(import.meta.url));
const src = await readFile(join(here, "src/app.html"), "utf8");

const title = src.match(/<title>([\s\S]*?)<\/title>/i)?.[1] ?? "Jovian Phase Monitor";
const body = src.replace(/<title>[\s\S]*?<\/title>\s*/i, "");

const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${title}</title>
<meta name="description" content="Live phases, eclipses and shadow transits of Jupiter's four Galilean moons, seen from the cloud tops.">
</head>
<body>
${body.trim()}
</body>
</html>
`;

await writeFile(join(here, "index.html"), html);
console.log(`index.html written — ${(html.length / 1024).toFixed(1)} kB`);
