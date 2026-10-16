import { cp, mkdir, readFile, readdir, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const root = fileURLToPath(new URL('../', import.meta.url));
export const output = path.join(root, 'dist');
const escapeHtml = value => String(value).replace(/[&<>"']/g, char => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[char]));

export async function build() {
  await rm(output, { recursive: true, force: true });
  await mkdir(output, { recursive: true });
  const films = JSON.parse(await readFile(path.join(root, 'films.json'), 'utf8'));
  if (!Array.isArray(films) || !films.length) throw new Error('films.json must contain at least one film.');
  const ids = new Set();
  const cards = [];
  for (const film of films) {
    if (!/^[a-z0-9-]+$/.test(film.id) || ids.has(film.id)) throw new Error(`Invalid or duplicate film ID: ${film.id}`);
    ids.add(film.id);
    if (film.url !== `/${film.id}/`) throw new Error(`Film URL must be /${film.id}/`);
    if (!/^\.\/assets\/[a-zA-Z0-9._-]+$/.test(film.cover)) throw new Error(`Invalid cover path: ${film.cover}`);
    await readFile(path.join(root, 'site', film.cover));
    const { title, description, url, cover } = Object.fromEntries(['title','description','url','cover'].map(key => [key, escapeHtml(film[key])]));
    cards.push(`<a class="film-link" href="${url}" aria-label="制作《${title}》海报">
      <figure class="film-art"><img src="${cover}" alt="《${title}》电影海报">
      <svg class="star" viewBox="0 0 100 100" fill="none" aria-hidden="true"><path d="m50 5 9 32 34-8-27 25 20 31-35-17-24 27 4-39L7 41l33-2 10-34Z" stroke="currentColor" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/></svg></figure>
      <div class="film-label"><h2>${title}</h2><span>制作海报 ↗</span></div><p class="film-description">${description}</p></a>`);
    await cp(path.join(root, 'films', film.id), path.join(output, film.id), { recursive: true });
    const entry = path.join(output, film.id, 'index.html');
    const html = await readFile(entry, 'utf8');
    await writeFile(entry, html.replaceAll('href="https://poster.southwardfilm.cn/"', 'href="/"'));
  }
  const template = await readFile(path.join(root, 'site/index.template.html'), 'utf8');
  if (!template.includes('<!-- FILMS -->')) throw new Error('The homepage template is missing its film marker.');
  await writeFile(path.join(output, 'index.html'), template.replace('<!-- FILMS -->', cards.join('\n')));
  await cp(path.join(root, 'site/assets'), path.join(output, 'assets'), { recursive: true });
  for (const name of ['style.css', 'folders.js']) await cp(path.join(root, 'site', name), path.join(output, name));
  await cp(path.join(root, 'edgeone.json'), path.join(output, 'edgeone.json'));
  console.log(`Built ${films.length} film branches into dist/`);
  return films;
}

export async function walk(directory) {
  const files = [];
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const full = path.join(directory, entry.name);
    if (entry.isDirectory()) files.push(...await walk(full));
    else if (entry.isFile()) files.push(full);
  }
  return files;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) await build();
