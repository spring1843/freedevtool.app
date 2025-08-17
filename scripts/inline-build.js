#!/usr/bin/env node

import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const distDir = join(__dirname, '../dist/public');
const htmlFile = join(distDir, 'index.html');

if (!existsSync(htmlFile)) {
  console.error('index.html not found in dist/public');
  process.exit(1);
}

console.log('Creating self-contained HTML file...');

let html = readFileSync(htmlFile, 'utf-8');

// Find and inline CSS files
const cssMatches = [...html.matchAll(/<link[^>]*href="([^"]*\.css)"[^>]*>/g)];
for (const match of cssMatches) {
  const cssPath = join(distDir, match[1]);
  if (existsSync(cssPath)) {
    const cssContent = readFileSync(cssPath, 'utf-8');
    html = html.replace(match[0], `<style>${cssContent}</style>`);
    console.log(`Inlined CSS: ${match[1]}`);
  }
}

// Find and inline JS files
const jsMatches = [...html.matchAll(/<script[^>]*src="([^"]*\.js)"[^>]*><\/script>/g)];
for (const match of jsMatches) {
  const jsPath = join(distDir, match[1]);
  if (existsSync(jsPath)) {
    const jsContent = readFileSync(jsPath, 'utf-8');
    html = html.replace(match[0], `<script>${jsContent}</script>`);
    console.log(`Inlined JS: ${match[1]}`);
  }
}

// Write the self-contained HTML file
const outputFile = join(distDir, 'standalone.html');
writeFileSync(outputFile, html);

console.log(`✓ Created standalone HTML file: ${outputFile}`);
console.log(`File size: ${Math.round(html.length / 1024)} KB`);