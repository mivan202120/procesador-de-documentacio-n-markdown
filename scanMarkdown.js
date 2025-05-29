import { promises as fs } from 'fs';
import path from 'path';

async function scanDir(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const markdownFiles = [];

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      const subFiles = await scanDir(fullPath);
      markdownFiles.push(...subFiles);
    } else if (entry.isFile() && entry.name.toLowerCase().endsWith('.md')) {
      markdownFiles.push(fullPath);
    }
  }
  return markdownFiles;
}

async function main() {
  const startDir = process.argv[2] || '.';
  try {
    const files = await scanDir(startDir);
    console.log(`Found ${files.length} Markdown file(s):`);
    for (const file of files) {
      console.log(file);
    }
  } catch (err) {
    console.error('Error scanning directory:', err);
    process.exit(1);
  }
}

main();
