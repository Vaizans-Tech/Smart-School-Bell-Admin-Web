/**
 * Shim for hosts that run `node src/index.js` from the repo root (e.g. misconfigured Render start command).
 */
await import(new URL('../server.js', import.meta.url).href);
