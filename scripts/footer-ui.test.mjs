import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const root = new URL('../', import.meta.url);

test('页脚使用沙色到浅森林绿背景和清晰的浅色玻璃按钮', async () => {
  const footer = await readFile(new URL('src/components/Footer.tsx', root), 'utf8');

  assert.match(footer, /bg-gradient-to-b from-sand-100 to-forest-100/);
  assert.match(footer, /liquid-glass-btn-light/);
  assert.match(footer, /text-forest-800 hover:text-forest-900/);
  assert.match(footer, /text-forest-700/);
  assert.match(footer, /bg-forest-300\/60/);
  assert.match(footer, /text-forest-600/);
  assert.match(footer, /border-forest-300\/60/);
  assert.doesNotMatch(footer, /bg-forest-900|liquid-glass-btn inline-flex|text-white/);
});
