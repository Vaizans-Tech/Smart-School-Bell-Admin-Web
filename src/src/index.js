/**
 * Shim for hosts whose cwd is `src/` while the start command is `node src/index.js`
 * (resolves to .../src/src/index.js — common when Root Directory is wrong on Render).
 */
await import(new URL('../../server.js', import.meta.url).href);
