import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const distDir = path.resolve(__dirname, 'dist');
const port = Number(process.env.PORT) || 3000;

const mime = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json',
  '.ico': 'image/x-icon',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.webp': 'image/webp',
  '.woff2': 'font/woff2',
};

function contentType(filePath) {
  return mime[path.extname(filePath).toLowerCase()] || 'application/octet-stream';
}

/** Resolve `urlPath` under `root` or return null if it escapes `root`. */
function fileUnderRoot(root, urlPathname) {
  const rel = path.posix.normalize(urlPathname.replace(/^\//, ''));
  if (rel === '.' || rel.startsWith('..')) return null;
  const full = path.join(root, rel);
  const rootR = path.resolve(root);
  const fullR = path.resolve(full);
  if (fullR !== rootR && !fullR.startsWith(rootR + path.sep)) return null;
  return fullR;
}

const server = http.createServer((req, res) => {
  const pathname = new URL(req.url || '/', 'http://localhost').pathname;

  const tryFile = (absPath) => {
    if (!absPath || !fs.existsSync(absPath) || !fs.statSync(absPath).isFile()) return false;
    res.writeHead(200, { 'Content-Type': contentType(absPath) });
    fs.createReadStream(absPath).pipe(res);
    return true;
  };

  const candidate = fileUnderRoot(distDir, pathname);
  if (tryFile(candidate)) return;

  const indexHtml = path.join(distDir, 'index.html');
  if (!fs.existsSync(indexHtml)) {
    res.writeHead(500, { 'Content-Type': 'text/plain' });
    res.end('dist/index.html missing — run npm run build first');
    return;
  }
  res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
  fs.createReadStream(indexHtml).pipe(res);
});

server.listen(port, '0.0.0.0', () => {
  // eslint-disable-next-line no-console
  console.log(`serving ${distDir} on port ${port}`);
});
