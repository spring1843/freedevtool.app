#!/usr/bin/env node

/**
 * Version Update Script for FreeDev Tool App
 * Updates package.json version and creates necessary commits
 */

import fs from 'fs/promises';
import { execSync } from 'child_process';
import path from 'path';

const PACKAGE_JSON_PATH = path.join(process.cwd(), 'package.json');

async function updateVersion(newVersion) {
  try {
    // Read current package.json
    const packageData = JSON.parse(await fs.readFile(PACKAGE_JSON_PATH, 'utf8'));
    const currentVersion = packageData.version;
    
    console.log(`Updating version from ${currentVersion} to ${newVersion}`);
    
    // Remove 'v' prefix if present
    const cleanVersion = newVersion.replace(/^v/, '');
    
    // Update version in package.json
    packageData.version = cleanVersion;
    
    // Write back to package.json
    await fs.writeFile(PACKAGE_JSON_PATH, JSON.stringify(packageData, null, 2) + '\n');
    
    console.log(`✅ Updated package.json version to ${cleanVersion}`);
    
    // Git operations
    try {
      execSync('git add package.json', { stdio: 'inherit' });
      execSync(`git commit -m "chore: bump version to ${cleanVersion}"`, { stdio: 'inherit' });
      console.log(`✅ Created commit for version ${cleanVersion}`);
      
      // Create tag
      execSync(`git tag -a v${cleanVersion} -m "Release v${cleanVersion}"`, { stdio: 'inherit' });
      console.log(`✅ Created tag v${cleanVersion}`);
      
    } catch (gitError) {
      console.warn('⚠️ Git operations failed (this might be expected in CI):', gitError.message);
    }
    
  } catch (error) {
    console.error('❌ Failed to update version:', error.message);
    process.exit(1);
  }
}

// Get version from command line argument
const newVersion = process.argv[2];

if (!newVersion) {
  console.error('❌ Please provide a version number');
  console.log('Usage: node scripts/update-version.js <version>');
  console.log('Example: node scripts/update-version.js 1.2.0');
  process.exit(1);
}

// Validate version format (basic semver check)
const versionPattern = /^v?\d+\.\d+\.\d+(-[\w.-]+)?$/;
if (!versionPattern.test(newVersion)) {
  console.error('❌ Invalid version format. Please use semantic versioning (e.g., 1.2.0 or v1.2.0)');
  process.exit(1);
}

updateVersion(newVersion);