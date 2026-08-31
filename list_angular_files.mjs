import fs from 'fs';
import path from 'path';

function walk(dir) {
  const files = fs.readdirSync(dir);
  for (const f of files) {
    const full = path.join(dir, f);
    const stat = fs.statSync(full);
    if (stat.isDirectory()) {
      walk(full);
    } else {
      console.log(full.replace(process.cwd() + path.sep, ''));
    }
  }
}

walk(path.join(process.cwd(), 'src', 'app'));
