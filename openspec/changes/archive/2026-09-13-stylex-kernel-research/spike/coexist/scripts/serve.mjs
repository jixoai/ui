// serve.mjs — a minimal static file server for the built dist dirs
// (vite preview insists on its own outDir config; the probe owns
// three dirs). Exports serveDir(dir, port) → { server, close() }.
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { extname, join, normalize } from 'node:path';

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.json': 'application/json',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.ico': 'image/x-icon',
};

export function serveDir(dir, port) {
  const server = createServer(async (req, res) => {
    try {
      const url = new URL(req.url, 'http://x');
      let path = decodeURIComponent(url.pathname);
      if (path.endsWith('/')) path += 'index.html';
      let file = normalize(join(dir, path));
      if (!file.startsWith(normalize(dir))) {
        res.statusCode = 403;
        res.end();
        return;
      }
      // static-host convention (adapter-static without fallback):
      // extensionless paths resolve to <path>.html
      try {
        await readFile(file);
      } catch {
        if (!extname(path)) {
          file = normalize(join(dir, `${path}.html`));
        }
      }
      const body = await readFile(file);
      res.statusCode = 200;
      res.setHeader('Content-Type', MIME[extname(file)] ?? 'application/octet-stream');
      res.end(body);
    } catch {
      res.statusCode = 404;
      res.end('not found');
    }
  });
  return new Promise((resolve) => {
    server.listen(port, '127.0.0.1', () => resolve({
      server,
      port,
      close: () => new Promise((r) => server.close(() => r())),
    }));
  });
}
