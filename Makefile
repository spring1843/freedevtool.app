# Development Makefile for DevTools Suite
# Comprehensive development workflow management

.PHONY: help setup start stop restart dev build lint lint-fix format type-check test clean deps install status health deploy prepare-deploy ci all

# Default target
.DEFAULT_GOAL := help

# Colors for terminal output
RED=\033[0;31m
GREEN=\033[0;32m
YELLOW=\033[1;33m
BLUE=\033[0;34m
NC=\033[0m # No Color

## Setup Commands

setup: ## Complete project setup - install dependencies, browsers, and prepare for development
	make deps
	make e2e-install
	make type-check
	make lint

## Combined Commands

all: clean setup lint type-check test build ## Run full development setup with all dependencies including tests

pre-commit: format type-check lint-fix ## Pre-commit hook (fix, format, check)

ci-without-e2e: pre-commit build test ## CI commands without end-to-end tests, for environments that can't run e2e tests

ci: ci-without-e2e e2e-test ## Commands run in the CI. Good to run before pushing changes

install: deps ## Install dependencies (alias for deps)

deps: ## Install all dependencies
	npm install

deps-update: ## Update all dependencies
	npm update

deps-audit: ## Audit dependencies for security issues
	npm audit

deps-audit-fix: ## Fix dependency security issues
	npm audit fix

## Core Development Commands

help: ## Display this help message
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "$(GREEN)%-20s$(NC) %s\n", $$1, $$2}'

start: ## Start the development server
	npm run dev

stop: ## Stop the development server (if running in background)
	@pkill -f "tsx server/index.ts" || true
	@pkill -f "vite" || true

restart: stop start ## Restart the development server

dev: ## Start development server with verbose logging
	NODE_ENV=development DEBUG=* npm run dev

build: ## Build the application for production
	npm run build

## Code Quality Commands

lint: ## Run ESLint to check for code issues
	npx eslint . --ext ts,tsx --report-unused-disable-directives

lint-fix: ## Run ESLint with automatic fixing
	npx eslint . --ext ts,tsx --fix

format: ## Format code with Prettier
	npx prettier --list-different --write "**/*.{ts,tsx,js,jsx,json,css,md,html,yaml,yml}"

format-check: ## Check if code is properly formatted
	npx prettier --check "**/*.{ts,tsx,js,jsx,json,css,md,html,yaml,yml}"

type-check: ## Run TypeScript type checking
	npx tsc --noEmit

## Testing Commands

test: ## Run unit tests
	npx vitest run

test-watch: ## Run tests in watch mode
	npx vitest

test-ui: ## Run tests with UI interface
	npx vitest --ui

test-coverage: ## Run tests with coverage report
	npx vitest run --coverage

e2e-test: ## Run end-to-end tests with Playwright
	npx playwright test

e2e-test-ui: ## Run end-to-end tests with UI
	npx playwright test --ui

e2e-install: ## Install Playwright browsers
	npx playwright install
	npx playwright install-deps

## Maintenance Commands

clean: ## Clean build artifacts and temporary files
	rm -rf dist/
	rm -rf node_modules/.cache/
	rm -rf .next/

clean-all: clean ## Clean everything including node_modules
	rm -rf node_modules/
	npm install

cache-clear: ## Clear npm and build caches
	npm cache clean --force
	rm -rf node_modules/.cache/

## Status and Health Commands

status: ## Show project status and health check
	@echo "$(GREEN)Node version:$(NC) $$(node --version)"
	@echo "$(GREEN)NPM version:$(NC) $$(npm --version)"
	@npm list --depth=0 2>/dev/null | head -20 || true
	@git status --porcelain 2>/dev/null || echo "Not a git repository"

health: status ## Comprehensive health check
	@echo -n "$(GREEN)TypeScript:$(NC) "
	@npx tsc --noEmit >/dev/null 2>&1 && echo "✓ OK" || echo "✗ Errors found"
	@echo -n "$(GREEN)ESLint:$(NC) "
	@npx eslint . --ext ts,tsx --max-warnings 0 >/dev/null 2>&1 && echo "✓ OK" || echo "✗ Issues found"
	@echo -n "$(GREEN)Prettier:$(NC) "
	@npx prettier --check "**/*.{ts,tsx,js,jsx,json,css,md}" >/dev/null 2>&1 && echo "✓ OK" || echo "✗ Formatting needed"

## Deployment Commands

prepare-deploy: lint type-check build ## Prepare for deployment (lint, type-check, build)

deploy-check: prepare-deploy ## Check if ready for deployment
	@echo "$(GREEN)✓ Linting passed$(NC)"
	@echo "$(GREEN)✓ Type checking passed$(NC)"
	@echo "$(GREEN)✓ Build successful$(NC)"

## Documentation

docs: ## Open project documentation
	@echo "See replit.md for project documentation"

## Environment Commands

env-check: ## Check environment variables and configuration
	@echo "$(GREEN)NODE_ENV:$(NC) $${NODE_ENV:-development}"
	@echo "$(GREEN)Working Directory:$(NC) $$(pwd)"
	@echo "$(GREEN)Package Manager:$(NC) npm"

## Advanced Development Commands

dev-https: ## Start development server with HTTPS (if configured)
	HTTPS=true npm run dev

dev-debug: ## Start development server with debugging enabled
	NODE_ENV=development DEBUG=express:* npm run dev

benchmark: ## Run performance benchmarks (placeholder)
	@echo "$(YELLOW)Benchmarking not yet implemented$(NC)"

profile: ## Profile application performance (placeholder)
	@echo "$(YELLOW)Profiling not yet implemented$(NC)"

## Information Commands

version: ## Show version information
	@echo "$(GREEN)Project:$(NC) DevTools Suite v1.0.0"
	@echo "$(GREEN)Node:$(NC) $$(node --version)"
	@echo "$(GREEN)NPM:$(NC) $$(npm --version)"
	@echo "$(GREEN)TypeScript:$(NC) $$(npx tsc --version | cut -d' ' -f2)"

info: version status ## Show comprehensive project information
