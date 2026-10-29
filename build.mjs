import { readFile, mkdir, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { build } from 'esbuild';

const projectDir = dirname(fileURLToPath(import.meta.url));
const source = await readFile(join(projectDir, 'index.html'), 'utf8');
let css = await readFile(join(projectDir, 'style.css'), 'utf8');

for (const weight of ['Regular', 'Bold']) {
  const fontName = `AtkinsonHyperlegible-${weight}.woff2`;
  const font = await readFile(join(projectDir, 'assets', fontName));
  const path = `./assets/${fontName}`;
  if (!css.includes(path)) throw new Error(`Falta la referencia a ${path} en style.css`);
  css = css.replaceAll(path, `data:font/woff2;base64,${font.toString('base64')}`);
}

const result = await build({
  entryPoints: [join(projectDir, 'main.js')],
  bundle: true,
  minify: true,
  format: 'iife',
  platform: 'browser',
  target: ['es2020'],
  write: false,
  logLevel: 'silent',
});
if (result.outputFiles.length !== 1) throw new Error('La escena debe producir un único archivo JavaScript');
const script = result.outputFiles[0].text.replaceAll(/<\/script/gi, '<\\/script');

function replaceOnce(html, pattern, replacement, description) {
  const matches = html.match(new RegExp(pattern.source, pattern.flags.includes('g') ? pattern.flags : `${pattern.flags}g`));
  if (matches?.length !== 1) throw new Error(`Se esperaba una única referencia a ${description}`);
  return html.replace(pattern, () => replacement);
}

let html = replaceOnce(source, /\s*<script type="importmap">[\s\S]*?<\/script>/, '', 'importmap');
html = replaceOnce(html, /<link rel="stylesheet" href="\.\/style\.css">/, `<style>\n${css}\n</style>`, 'style.css');
html = replaceOnce(html, /<script type="module" src="\.\/main\.js"><\/script>/, `<script>\n${script}\n</script>`, 'main.js');
const externalAsset = html.match(/<(?:script|link)[^>]+(?:src|href)=/)
  ?? html.match(/url\(['"]?(?:\.{1,2}\/|https?:)/);
if (externalAsset) throw new Error(`El HTML generado conserva una dependencia externa: ${html.slice(externalAsset.index, externalAsset.index + 95)}`);

const output = join(projectDir, 'dist/index.html');
await mkdir(dirname(output), { recursive: true });
await writeFile(output, html);
console.log(`HTML autónomo generado: ${output}`);
