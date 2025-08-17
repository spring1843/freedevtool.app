# Port Configuration Guide

FreeDevTool.App supports flexible port configuration to avoid conflicts when port 5000 is already in use.

## Default Behavior

The application runs on port 5000 by default to maintain backward compatibility.

## Port Configuration Methods

### 1. Command Line Arguments (Highest Priority)

Direct server execution with custom port:
```bash
# Development
NODE_ENV=development tsx server/index.ts --port=3001

# Production (after build)
NODE_ENV=production node dist/index.js --port=8080
```

### 2. Environment Variables

Set the PORT environment variable:
```bash
PORT=3001 npm run dev
```

### 3. Makefile Targets (Recommended)

Use the convenient Makefile commands:

```bash
# Start development server on custom port
make start-port PORT=3001

# Start with verbose debugging on custom port
make dev-port PORT=3001

# Quick start script (auto-detects development/production)
make quick-start PORT=3001
```

### 4. Convenience Script

Use the standalone script:
```bash
# Development or production auto-detection
./scripts/start-server.sh 3001

# Default port (5000)
./scripts/start-server.sh
```

## Priority Order

1. Command line `--port=` argument
2. Environment variable `PORT`
3. Default port 5000

## Examples

```bash
# Different ways to start on port 3001
make start-port PORT=3001
./scripts/start-server.sh 3001
PORT=3001 npm run dev
NODE_ENV=development tsx server/index.ts --port=3001
```

## Troubleshooting

If you encounter "port already in use" errors:

1. Find what's using the port:
   ```bash
   lsof -i :5000
   ```

2. Use a different port:
   ```bash
   make start-port PORT=3001
   ```

3. Kill the conflicting process (if safe):
   ```bash
   pkill -f "port 5000"
   ```