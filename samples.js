import shell from 'shelljs';
import fs from 'fs';
import path from 'path';

const folder = process.cwd();
let tmpDir;

try {
  tmpDir = fs.mkdtempSync(path.join(folder, 'temp'));
  shell.cd(tmpDir);
  shell.exec('git clone https://github.com/generative-music/samples-alex-bainter.git');
  shell.cp('-R', tmpDir + '/samples-alex-bainter/samples', path.join(folder, 'public/samples'));
} catch (e) {
  console.error(`An error has occurred while cloning the repo at ${tmpDir}. Error: ${e}`);
} finally {
  try {
    if (tmpDir) {
      fs.rmSync(tmpDir, { recursive: true });
    }
  } catch (e) {
    console.error(`An error has occurred while removing the temp folder at ${tmpDir}. Please remove it manually. Error: ${e}`);
  }
}
