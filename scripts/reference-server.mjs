// Local-only comparison server for the user's unmodified design export.
import { createServer } from 'node:http';
import { createReadStream, statSync } from 'node:fs';
import { resolve, sep, extname } from 'node:path';
const root = resolve('design-reference');
const types = { '.html':'text/html; charset=utf-8','.css':'text/css','.js':'text/javascript','.jsx':'text/plain','.png':'image/png','.jpg':'image/jpeg','.jpeg':'image/jpeg','.svg':'image/svg+xml','.woff2':'font/woff2','.ttf':'font/ttf','.mp4':'video/mp4','.webm':'video/webm' };
createServer((req,res) => {
  const filename = resolve(root, '.' + decodeURIComponent(new URL(req.url,'http://localhost').pathname));
  if (!filename.startsWith(root + sep)) { res.writeHead(403); res.end(); return; }
  try {
    const stat = statSync(filename);
    if (!stat.isFile()) throw new Error('not a file');
    res.writeHead(200,{'content-type':types[extname(filename)] || 'application/octet-stream','content-length':stat.size});
    createReadStream(filename).pipe(res);
  } catch { res.writeHead(404); res.end(); }
}).listen(3001,'127.0.0.1',() => console.log('Reference: http://127.0.0.1:3001/Tori.html'));
