import http from 'http';
import { readFile } from 'fs/promises';

const port = 4173;
const rootUrl = new URL('../typedocs/', import.meta.url);

const mimeTypes = new Map([
  ['.html', 'text/html; charset=utf-8'],
  ['.css', 'text/css; charset=utf-8'],
  ['.js', 'text/javascript; charset=utf-8'],
  ['.json', 'application/json; charset=utf-8'],
  ['.svg', 'image/svg+xml'],
  ['.png', 'image/png'],
  ['.ico', 'image/x-icon'],
  ['.map', 'application/json; charset=utf-8'],
]);

function getContentType(fileUrl) {
  const pathname = fileUrl.pathname;
  const lastDot = pathname.lastIndexOf('.');
  if (lastDot === -1 || lastDot < pathname.lastIndexOf('/')) {
    return 'application/octet-stream';
  }
  const ext = pathname.slice(lastDot);
  return mimeTypes.get(ext) || 'application/octet-stream';
}

function resolvePath(urlPath) {
  const decoded = decodeURIComponent(urlPath);
  const cleanPath = decoded.split('?')[0] || '/';
  const relative = cleanPath === '/' ? 'index.html' : cleanPath.slice(1);
  if (relative.includes('..')) {
    return null;
  }
  return new URL(relative, rootUrl);
}

const server = http.createServer(async (req, res) => {
  try {
    const fileUrl = resolvePath(req.url || '/');
    if (!fileUrl) {
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('Not found');
      return;
    }

    const data = await readFile(fileUrl);
    res.writeHead(200, { 'Content-Type': getContentType(fileUrl) });
    res.end(data);
  } catch {
    res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('Not found');
  }
});

server.listen(port, () => {
  console.warn(`TypeDoc server running at http://localhost:${port}/`);
});
