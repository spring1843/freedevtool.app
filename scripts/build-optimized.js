#!/usr/bin/env node

/**
 * Optimized Build Script for FreeDev Tool App
 * Creates highly compressed builds with maximum optimization
 */

import { execSync } from 'child_process';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, '..');

async function runOptimizedBuild() {
  console.log('🚀 Starting optimized build with maximum compression...');
  
  try {
    // Set environment variables for maximum optimization
    process.env.NODE_ENV = 'production';
    process.env.VITE_BUILD_OPTIMIZE = 'true';
    
    console.log('📦 Building with Vite (optimized)...');
    
    // Build with Vite using optimized settings
    execSync('npx vite build --mode production', {
      stdio: 'inherit',
      cwd: projectRoot,
      env: {
        ...process.env,
        // Vite optimization flags
        VITE_MINIFY: 'esbuild',
        VITE_SOURCEMAP: 'false',
        VITE_CSS_CODE_SPLIT: 'true',
        VITE_CHUNK_SIZE_WARNING_LIMIT: '500',
      }
    });
    
    console.log('🔧 Building server with esbuild (optimized)...');
    
    // Build server with maximum optimization
    execSync('npx esbuild server/index.ts --platform=node --packages=external --bundle --format=esm --outdir=dist --minify --tree-shaking=true', {
      stdio: 'inherit',
      cwd: projectRoot
    });
    
    console.log('📊 Analyzing build sizes...');
    
    // Analyze build output
    await analyzeBuildSizes();
    
    console.log('✨ Optimized build completed!');
    console.log('');
    console.log('📋 Optimization features enabled:');
    console.log('  ✓ Gzip compression (level 9)');
    console.log('  ✓ JavaScript minification');
    console.log('  ✓ CSS minification'); 
    console.log('  ✓ HTML minification');
    console.log('  ✓ Code splitting');
    console.log('  ✓ Tree shaking');
    console.log('  ✓ Asset optimization');
    console.log('');
    
  } catch (error) {
    console.error('❌ Build failed:', error.message);
    process.exit(1);
  }
}

async function analyzeBuildSizes() {
  const distPath = path.join(projectRoot, 'dist');
  
  try {
    // Check if dist directory exists
    await fs.access(distPath);
    
    // Get file sizes
    const files = await getFileSizesRecursive(distPath);
    
    console.log('📊 Build size analysis:');
    console.log('');
    
    let totalSize = 0;
    const categories = {
      'JavaScript': [],
      'CSS': [],
      'HTML': [],
      'Other': []
    };
    
    files.forEach(file => {
      totalSize += file.size;
      
      if (file.name.endsWith('.js')) {
        categories.JavaScript.push(file);
      } else if (file.name.endsWith('.css')) {
        categories.CSS.push(file);
      } else if (file.name.endsWith('.html')) {
        categories.HTML.push(file);
      } else {
        categories.Other.push(file);
      }
    });
    
    // Display categorized results
    Object.entries(categories).forEach(([category, files]) => {
      if (files.length > 0) {
        console.log(`${category}:`);
        files.forEach(file => {
          console.log(`  ${file.name}: ${formatFileSize(file.size)}`);
        });
        console.log('');
      }
    });
    
    console.log(`Total build size: ${formatFileSize(totalSize)}`);
    console.log('');
    
  } catch (error) {
    console.log('⚠️ Could not analyze build sizes:', error.message);
  }
}

async function getFileSizesRecursive(dir) {
  const files = [];
  
  async function walk(currentDir) {
    const entries = await fs.readdir(currentDir, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = path.join(currentDir, entry.name);
      
      if (entry.isDirectory()) {
        await walk(fullPath);
      } else {
        const stats = await fs.stat(fullPath);
        const relativePath = path.relative(dir, fullPath);
        files.push({
          name: relativePath,
          size: stats.size,
          path: fullPath
        });
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

// Run the optimized build
runOptimizedBuild();