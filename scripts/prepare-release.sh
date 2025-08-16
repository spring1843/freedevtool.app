#!/bin/bash

# Prepare Release Script for FreeDev Tool App
# This script helps prepare a new release by building and packaging the application

set -e

VERSION=${1:-}
if [ -z "$VERSION" ]; then
    echo "❌ Please provide a version number"
    echo "Usage: ./scripts/prepare-release.sh <version>"
    echo "Example: ./scripts/prepare-release.sh 1.2.0"
    exit 1
fi

# Validate version format
if ! [[ $VERSION =~ ^v?[0-9]+\.[0-9]+\.[0-9]+(-[a-zA-Z0-9.-]+)?$ ]]; then
    echo "❌ Invalid version format. Please use semantic versioning (e.g., 1.2.0 or v1.2.0)"
    exit 1
fi

# Clean version (remove 'v' prefix if present)
CLEAN_VERSION=${VERSION#v}

echo "🚀 Preparing release for version $CLEAN_VERSION"

# Create release directory
RELEASE_DIR="release-${CLEAN_VERSION}"
rm -rf "$RELEASE_DIR"
mkdir -p "$RELEASE_DIR"

echo "📦 Building application..."

# Install dependencies and build
make deps
make lint
make type-check
make build

echo "📋 Copying files to release directory..."

# Copy built application
cp -r dist/* "$RELEASE_DIR/"

# Copy client build if it exists
if [ -d "client/dist" ]; then
    mkdir -p "$RELEASE_DIR/public"
    cp -r client/dist/* "$RELEASE_DIR/public/"
fi

# Copy necessary files
cp package.json "$RELEASE_DIR/"
cp README.md "$RELEASE_DIR/"
cp LICENSE "$RELEASE_DIR/"

# Create production package.json
node -e "
const pkg = require('./package.json');
const prodPkg = {
  name: 'freedevtool-app',
  version: '$CLEAN_VERSION',
  type: pkg.type,
  license: pkg.license,
  description: 'Free, Secure, Open Source, and Offline Developer Tools',
  main: 'index.js',
  scripts: { 
    start: 'NODE_ENV=production node index.js',
    'start:dev': 'NODE_ENV=development node index.js'
  },
  dependencies: pkg.dependencies,
  keywords: ['developer-tools', 'offline', 'privacy', 'open-source', 'web-tools'],
  repository: {
    type: 'git',
    url: 'https://github.com/spring1843/freedevtool.app.git'
  },
  bugs: {
    url: 'https://github.com/spring1843/freedevtool.app/issues'
  },
  homepage: 'https://github.com/spring1843/freedevtool.app#readme'
};
require('fs').writeFileSync('$RELEASE_DIR/package.json', JSON.stringify(prodPkg, null, 2));
"

# Create installation script
cat > "$RELEASE_DIR/install.sh" << 'EOF'
#!/bin/bash
echo "🚀 Installing FreeDev Tool App..."
echo "📦 Installing dependencies..."
make deps
echo "✅ Installation complete!"
echo ""
echo "🎉 To start the application:"
echo "   make start"
echo ""
echo "🌐 Then open http://localhost:5000 in your browser"
EOF

chmod +x "$RELEASE_DIR/install.sh"

# Create Windows batch file
cat > "$RELEASE_DIR/install.bat" << 'EOF'
@echo off
echo 🚀 Installing FreeDev Tool App...
echo 📦 Installing dependencies...
make deps
echo ✅ Installation complete!
echo.
echo 🎉 To start the application:
echo    make start
echo.
echo 🌐 Then open http://localhost:5000 in your browser
pause
EOF

# Create README for release
cat > "$RELEASE_DIR/README-RELEASE.md" << EOF
# FreeDev Tool App v$CLEAN_VERSION

Free, Secure, Open Source, and Offline Developer Tools

## Quick Start

### Linux/macOS
\`\`\`bash
./install.sh
make start
\`\`\`

### Windows
1. Double-click \`install.bat\`
2. Run \`make start\`

### Manual Installation
\`\`\`bash
make deps
make start
\`\`\`

Then open http://localhost:5000 in your browser.

## What's Included

- 49+ developer tools
- Complete offline functionality
- Privacy-focused design (no data transmission)
- Open source codebase

## Links

- [GitHub Repository](https://github.com/spring1843/freedevtool.app)
- [Report Issues](https://github.com/spring1843/freedevtool.app/issues)
- [Documentation](https://github.com/spring1843/freedevtool.app#readme)

## System Requirements

- Node.js 18+ 
- 100MB disk space
- Modern web browser

---
Generated on $(date)
EOF

echo "📦 Creating archives..."

# Create tar.gz archive
cd "$RELEASE_DIR"
tar -czf "../freedevtool-app-v${CLEAN_VERSION}.tar.gz" .
cd ..

# Create zip archive
cd "$RELEASE_DIR"
zip -r "../freedevtool-app-v${CLEAN_VERSION}.zip" .
cd ..

echo "✅ Release prepared successfully!"
echo ""
echo "📁 Release directory: $RELEASE_DIR"
echo "📦 Archives created:"
echo "   - freedevtool-app-v${CLEAN_VERSION}.tar.gz"
echo "   - freedevtool-app-v${CLEAN_VERSION}.zip"
echo ""
echo "🚀 Next steps:"
echo "1. Test the release: cd $RELEASE_DIR && make deps && make start"
echo "2. Create git tag: git tag -a v$CLEAN_VERSION -m 'Release v$CLEAN_VERSION'"
echo "3. Push to GitHub: git push origin v$CLEAN_VERSION"
echo "4. Upload archives to GitHub release"