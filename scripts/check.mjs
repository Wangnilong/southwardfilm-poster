import assert from 'node:assert/strict';
import { readFile, stat } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';
import path from 'node:path';
import { build, root, output, walk } from './build.mjs';

const films = await build();
let checked = 0;
for (const directory of ['site','films','scripts']) {
  for (const file of await walk(path.join(root, directory))) {
    if (!/\.(mjs|js)$/.test(file)) continue;
    const result = spawnSync(process.execPath, ['--check', file], { encoding:'utf8' });
    assert.equal(result.status, 0, result.stderr);
    checked++;
  }
}
for (const file of await walk(output)) {
  if (!/\.(html|css|js)$/.test(file)) continue;
  const text = await readFile(file, 'utf8');
  assert(!/[A-Z]:[\\/](?:Users|OneDrive)/i.test(text), `Local machine path in ${file}`);
  if (!file.endsWith('.html') && !file.endsWith('.css')) continue;
  const refs = file.endsWith('.html') ? [...text.matchAll(/(?:src|href)=["']([^"']+)["']/g)].map(match => match[1]) : [...text.matchAll(/url\(["']?([^\s)'";]+)["']?\)/g)].map(match => match[1]);
  for (const ref of refs) {
    if (/^(?:[a-z]+:|\/\/|#)/i.test(ref)) continue;
    const clean = decodeURIComponent(ref.split(/[?#]/)[0]);
    const target = clean.startsWith('/') ? path.join(output, clean.slice(1)) : path.resolve(path.dirname(file), clean);
    assert(!(path.relative(output,target).startsWith('..')), `Reference leaves dist: ${ref}`);
    await stat(target).catch(() => assert.fail(`Missing asset ${ref} in ${path.relative(output,file)}`));
  }
}
const home = await readFile(path.join(output,'index.html'),'utf8');
for (const film of films) assert(home.includes(`href="/${film.id}/"`), `Missing film entry: ${film.id}`);
assert(home.indexOf('href="/birthday/"') < home.indexOf('href="/langhuaer/"'), 'The two existing films changed order.');
console.log(`Passed: ${checked} JavaScript syntax checks, ${films.length} branches, and all HTML/CSS asset references.`);
