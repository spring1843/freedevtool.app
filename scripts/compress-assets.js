#!/usr/bin/env node

/**
 * Asset Compression Script
 * Pre-compresses static assets for optimal delivery
 */

import fs from 'fs/promises';
import path from 'path';
import { gzipSync } from 'zlib';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, '..');

async function compressAssets() {
  console.log('🗜️ Compressing static assets...');
  
  const distPath = path.join(projectRoot, 'dist/public');
  
  try {
    await fs.access(distPath);
    
    const files = await getCompressibleFiles(distPath);
    let compressedCount = 0;
    let totalSavings = 0;
    
    for (const file of files) {
      const originalContent = await fs.readFile(file.path);
      const compressed = gzipSync(originalContent, { level: 9 });
      
      // Only save compressed version if it's significantly smaller
      if (compressed.length < originalContent.length * 0.9) {
        await fs.writeFile(file.path + '.gz', compressed);
        
        const savings = originalContent.length - compressed.length;
        totalSavings += savings;
        compressedCount++;
        
        console.log(`  ✓ ${file.name}: ${formatFileSize(originalContent.length)} → ${formatFileSize(compressed.length)} (${Math.round((savings / originalContent.length) * 100)}% smaller)`);
      }
    }
    
    console.log(`\n📊 Compression complete:`);
    console.log(`  Files compressed: ${compressedCount}`);
    console.log(`  Total savings: ${formatFileSize(totalSavings)}`);
    
  } catch (error) {
    console.log('⚠️ Could not compress assets:', error.message);
  }
}

async function getCompressibleFiles(dir) {
  const compressibleExtensions = ['.js', '.css', '.html', '.json', '.xml', '.svg', '.txt'];
  const files = [];
  
  async function walk(currentDir) {
    const entries = await fs.readdir(currentDir, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = path.join(currentDir, entry.name);
      
      if (entry.isDirectory()) {
        await walk(fullPath);
      } else {
        const ext = path.extname(entry.name).toLowerCase();
        if (compressibleExtensions.includes(ext)) {
          files.push({
            name: path.relative(dir, fullPath),
            path: fullPath,
            extension: ext
          });
        }
      }
    }
  }
  
  await walk(dir);
  return files;
}

function formatFileSize(bytes) {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

compressAssets();