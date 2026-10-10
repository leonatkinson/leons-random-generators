import { spawnSync } from 'child_process';
import path from 'path';
import { describe, expect, it } from 'vitest';

const cli = path.resolve('src/cli.js');

describe('cli', () => {
  it('prints advice and exits 0', () => {
    const result = spawnSync(process.execPath, [cli, 'advice', '--seed', '1'], {
      encoding: 'utf8',
    });
    expect(result.status).toBe(0);
    expect(result.stdout.trim().length).toBeGreaterThan(0);
  });

  it('rejects an unknown generator', () => {
    const result = spawnSync(process.execPath, [cli, 'nope'], { encoding: 'utf8' });
    expect(result.status).not.toBe(0);
  });
});
