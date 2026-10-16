import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import path from 'node:path';
import { build, output } from './build.mjs';

await build();
const types = { '.html':'text/html; charset=utf-8', '.js':'text/javascript; charset=utf-8', '.css':'text/css; charset=utf-8', '.json':'application/json; charset=utf-8', '.jpg':'image/jpeg', '.jpeg':'image/jpeg', '.png':'image/png', '.webp':'image/webp', '.svg':'image/svg+xml', '.woff2':'font/woff2', '.pdf':'application/pdf', '.txt':'text/plain; charset=utf-8' };
const port = Number(process.env.PORT || 5173);
if (!Number.isInteger(port) || port < 1 || port > 65535) throw new Error('PORT must be between 1 and 65535.');
createServer(async (request, response) => {
  if (!['GET','HEAD'].includes(request.method)) { response.writeHead(405, { Allow:'GET, HEAD' }).end(); return; }
  try {
    const url = new URL(request.url, 'http://localhost');
    const filename = path.resolve(output, `.${decodeURIComponent(url.pathname)}`);
    const relative = path.relative(output, filename);
    if (relative === '..' || relative.startsWith(`..${path.sep}`) || path.isAbsolute(relative)) { response.writeHead(403).end('Forbidden'); return; }
    const info = await stat(filename);
    if (info.isDirectory() && !url.pathname.endsWith('/')) {
      response.writeHead(301, { Location:`${url.pathname}/${url.search}` }).end(); return;
    }
    const target = info.isDirectory() ? path.join(filename, 'index.html') : filename;
    const body = await readFile(target);
    response.writeHead(200, { 'Content-Type':types[path.extname(target).toLowerCase()] || 'application/octet-stream', 'Cache-Control':'no-store' });
    response.end(request.method === 'HEAD' ? undefined : body);
  } catch (error) {
    if (error.code === 'ENOENT' || error.code === 'ENOTDIR') response.writeHead(404).end('Not found');
    else if (error instanceof URIError) response.writeHead(400).end('Bad request');
    else { console.error(error); response.writeHead(500).end('Server error'); }
  }
}).listen(port, '127.0.0.1', () => console.log(`Local: http://127.0.0.1:${port}/\nAfter editing a source file, restart this command and refresh the browser.`));
