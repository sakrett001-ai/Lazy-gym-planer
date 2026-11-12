import {createHash} from 'node:crypto';

/* Репозиторий переименован из Lazy-gym-planer в Lazy-gym-planner. Пока переезд не завершён, релиз читается
   с нового имени, а при его отсутствии — со старого; описание релиза может называть любое из двух. */
const repositories = ['sakrett001-ai/Lazy-gym-planner', 'sakrett001-ai/Lazy-gym-planer'];
const upstreamOf = (repository:string) => `https://raw.githubusercontent.com/${repository}/gh-pages/`;
const maxBytes = 4_500_000;
type Lang = 'ru' | 'en';
type Release = {schemaVersion:1; repository:string; sourceBranch:'main'; sourceCommit:string;
  version:string; checks:'passed'; builtAt:string; documents:Record<Lang,{path:string; sha256:string; bytes:number}>};

function validate(value:unknown):Release {
  const m = value as Release;
  if (!m || m.schemaVersion !== 1 || !repositories.includes(m.repository) || m.sourceBranch !== 'main' || m.checks !== 'passed'
    || !/^[a-f0-9]{40}$/.test(m.sourceCommit) || !/^\d+\.\d+\.\d+(?:[-+][\w.-]+)?$/.test(m.version)) {
    throw new Error('Не удалось подтвердить проверенный релиз планировщика');
  }
  for (const lang of ['ru','en'] as const) {
    const doc = m.documents?.[lang];
    if (!doc || doc.path !== `floot/releases/${m.sourceCommit}/planner-${lang}.html`
      || !/^[a-f0-9]{64}$/.test(doc.sha256) || !Number.isInteger(doc.bytes) || doc.bytes < 1 || doc.bytes > maxBytes) {
      throw new Error('Некорректное описание сборки планировщика');
    }
  }
  return m;
}

async function download(url:string, fetcher:typeof fetch, limit:number) {
  const response = await fetcher(url, {redirect:'error', signal:AbortSignal.timeout(20000)});
  if (!response.ok) throw new Error('Сервер релизов временно недоступен. Повторите загрузку');
  const declared = Number(response.headers.get('content-length') || 0);
  if (declared > limit) throw new Error('Размер релиза превышает допустимый');
  const bytes = new Uint8Array(await response.arrayBuffer());
  if (bytes.byteLength > limit) throw new Error('Размер релиза превышает допустимый');
  return bytes;
}

async function read(lang:Lang, fetcher:typeof fetch = fetch) {
  if (lang !== 'ru' && lang !== 'en') throw new Error('Неизвестный язык');
  let failure:unknown;
  for (const repository of repositories) {
    try { return await readFrom(upstreamOf(repository), lang, fetcher); } catch (e) { failure = e; }
  }
  throw failure;
}

async function readFrom(upstream:string, lang:Lang, fetcher:typeof fetch) {
  const manifestBytes = await download(`${upstream}floot-release.json?t=${Math.floor(Date.now()/60000)}`, fetcher, 16384);
  const release = validate(JSON.parse(new TextDecoder().decode(manifestBytes)));
  const document = release.documents[lang];
  const bytes = await download(upstream + document.path, fetcher, maxBytes);
  if (bytes.byteLength !== document.bytes || createHash('sha256').update(bytes).digest('hex') !== document.sha256) {
    throw new Error('Сборка не прошла проверку целостности. Повторите загрузку');
  }
  const html = new TextDecoder('utf-8', {fatal:true}).decode(bytes);
  if (!html.includes(`window.PODHOD_VERSION='${release.version}'`)
    || !html.includes(`window.PODHOD_LANG='${lang}'`) || /serviceWorker\s*\.\s*register/.test(html)) {
    throw new Error('Сборка не соответствует описанию релиза');
  }
  return {html, version:release.version, sourceCommit:release.sourceCommit, builtAt:release.builtAt};
}

export const plannerRelease = {read};
