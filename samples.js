import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const projectDirectory = path.dirname(fileURLToPath(import.meta.url));
const samplesDirectory = path.join(projectDirectory, 'public', 'samples');
const temporaryDirectory = fs.mkdtempSync(path.join(os.tmpdir(), 'duejs-samples-'));
const repositoryDirectory = path.join(temporaryDirectory, 'repository');

try {
  console.log('Downloading audio samples with a shallow clone...');
  execFileSync('git', [
    'clone',
    '--depth', '1',
    '--progress',
    'https://github.com/generative-music/samples-alex-bainter.git',
    repositoryDirectory
  ], { stdio: 'inherit' });

  console.log('Copying audio samples...');
  fs.cpSync(path.join(repositoryDirectory, 'samples'), samplesDirectory, { recursive: true });
  console.log(`Audio samples installed in ${samplesDirectory}.`);
} catch (error) {
  process.exitCode = 1;
  console.error('Could not install audio samples:', error instanceof Error ? error.message : error);
} finally {
  fs.rmSync(temporaryDirectory, { recursive: true, force: true });
}
