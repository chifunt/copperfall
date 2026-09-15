import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import test from 'node:test';

const tracked = new Set(execFileSync('git', ['ls-files'], { encoding: 'utf8' }).trim().split('\n'));

test('every local module import resolves under a project URL with exact filename case', () => {
  for (const file of [...tracked].filter(file => file.endsWith('.js'))) {
    const source = readFileSync(file, 'utf8');
    for (const [, specifier] of source.matchAll(/(?:from\s*|import\s*)['"]([^'"]+)['"]/g)) {
      assert.ok(specifier.startsWith('.'), `${file}: domain-root import ${specifier}`);
      const resolved = path.posix.normalize(path.posix.join(path.posix.dirname(file), specifier));
      assert.ok(tracked.has(resolved), `${file}: missing or incorrectly cased ${resolved}`);
    }
    const moduleUrl = new URL(file, 'https://example.test/copperfall/');
    for (const [, , relative] of source.matchAll(/new URL\((["'])([^"']+)\1, import\.meta\.url\)/g)) {
      const resolved = new URL(relative, moduleUrl);
      assert.ok(resolved.pathname.startsWith('/copperfall/'), `${file}: asset escapes the project path`);
      const asset = resolved.pathname.slice('/copperfall/'.length);
      assert.ok(tracked.has(asset) || [...tracked].some(file => file.startsWith(asset)), `${file}: missing asset ${asset}`);
    }
  }
});
