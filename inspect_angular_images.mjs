import fs from 'fs';
import path from 'path';

function inspectFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const rel = filePath.replace(process.cwd() + path.sep, '');
  
  // Look for image tags
  const imgRegex = /<img[^>]*>/gi;
  let match;
  let hasImg = false;
  while ((match = imgRegex.exec(content)) !== null) {
    if (!hasImg) {
      console.log(`\n=== FILE: ${rel} ===`);
      hasImg = true;
    }
    console.log(`  IMG TAG: ${match[0]}`);
  }

  // Look for ibb.co URLs
  const ibbRegex = /https?:\/\/[^\s"'`<>]*ibb\.co[^\s"'`<>]*/gi;
  let ibbMatch;
  while ((ibbMatch = ibbRegex.exec(content)) !== null) {
    console.log(`  IBB URL IN CODE: ${ibbMatch[0]}`);
  }

  // Look for image helper functions or regexes
  if (content.includes('image') || content.includes('img') || content.includes('photo') || content.includes('banner')) {
    // Check if there are setTimeout calls or complex lifecycle
    if (content.includes('setTimeout')) {
      console.log(`  NOTICE: setTimeout found in ${rel}`);
    }
  }
}

function walk(dir) {
  const files = fs.readdirSync(dir);
  for (const f of files) {
    const full = path.join(dir, f);
    const stat = fs.statSync(full);
    if (stat.isDirectory()) {
      walk(full);
    } else if (f.endsWith('.ts') || f.endsWith('.html') || f.endsWith('.css')) {
      inspectFile(full);
    }
  }
}

walk(path.join(process.cwd(), 'src', 'app'));
