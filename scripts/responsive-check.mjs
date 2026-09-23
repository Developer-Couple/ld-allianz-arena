// Sobe um servidor estático local e tira screenshots do .dc.html em vários
// breakpoints, salvando em .screenshots/. Uso: npm run responsive-check
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { extname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const OUT_DIR = join(ROOT, '.screenshots');
const PORT = 8935;
const HTML_FILE = 'index.html';

const MIME = {
  '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css',
  '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg',
  '.mp4': 'video/mp4', '.json': 'application/json', '.svg': 'image/svg+xml',
  '.webp': 'image/webp',
};

const BREAKPOINTS = [
  { name: 'mobile', width: 375, height: 812 },
  { name: 'mobile-landscape', width: 812, height: 375 },
  { name: 'tablet', width: 768, height: 1024 },
  { name: 'desktop', width: 1280, height: 900 },
];

function startServer() {
  const server = createServer(async (req, res) => {
    try {
      const path = decodeURIComponent(req.url.split('?')[0]);
      const filePath = join(ROOT, path === '/' ? HTML_FILE : path);
      const data = await readFile(filePath);
      res.writeHead(200, { 'Content-Type': MIME[extname(filePath)] ?? 'application/octet-stream' });
      res.end(data);
    } catch {
      res.writeHead(404);
      res.end('not found');
    }
  });
  return new Promise((resolve) => server.listen(PORT, () => resolve(server)));
}

async function main() {
  await import('node:fs/promises').then((fs) => fs.mkdir(OUT_DIR, { recursive: true }));
  const server = await startServer();
  const url = `http://localhost:${PORT}/${encodeURIComponent(HTML_FILE)}`;
  const browser = await chromium.launch();

  for (const bp of BREAKPOINTS) {
    const page = await browser.newPage({ viewport: { width: bp.width, height: bp.height } });
    // 'load', não 'networkidle': o vídeo do hero autoplay/loop mantém
    // requisições de range indo, então a rede nunca fica ociosa.
    await page.goto(url, { waitUntil: 'load', timeout: 30000 });
    await page.waitForTimeout(500);

    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth
    );
    console.log(`${bp.name} (${bp.width}x${bp.height}) — overflow horizontal: ${overflow}px`);

    await page.screenshot({ path: join(OUT_DIR, `${bp.name}.png`), fullPage: true });

    // Header: também captura o menu mobile aberto, se o hambúrguer estiver visível.
    const burger = page.locator('.btc-nav-burger');
    if (bp.width <= 860 && (await burger.isVisible())) {
      await page.setViewportSize({ width: bp.width, height: 400 });
      await burger.click();
      await page.waitForTimeout(300);
      await page.screenshot({ path: join(OUT_DIR, `${bp.name}-nav-open.png`) });
    }

    await page.close();
  }

  await browser.close();
  server.close();
  console.log(`\nScreenshots em ${OUT_DIR}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
