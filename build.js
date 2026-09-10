const fs = require('fs');
const path = require('path');

// The project is a static HTML site. The previous build script tried to
// rewrite an older version of index.html and failed when that markup changed.
// Keep the Cloudflare Pages build deterministic: validate that index.html
// exists and leave the already-complete source untouched.
const file = path.join(__dirname, 'index.html');
if (!fs.existsSync(file)) {
  throw new Error('index.html not found');
}

const html = fs.readFileSync(file, 'utf8');
if (!html.includes('<!doctype html>') && !html.includes('<!DOCTYPE html>')) {
  throw new Error('index.html is not a valid HTML document');
}

console.log('Build completed successfully: static site ready for deployment.');
