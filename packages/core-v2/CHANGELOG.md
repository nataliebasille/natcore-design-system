# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2.0.0] - 2025-11-04

### Added
- Initial v2 release designed for Tailwind CSS 4.0
- Modern ESM/CJS dual build setup with tsup
- TypeScript support with full type definitions
- Basic plugin structure for Tailwind CSS 4.0
- Utility functions for class name management
- CSS build system for design system styles
- Comprehensive package exports for all entry points

### Changed
- **BREAKING**: Requires Tailwind CSS 4.0+ (peer dependency)
- **BREAKING**: Requires Node.js 18+ for ESM support
- Complete rewrite from v1 to leverage Tailwind CSS 4.0 features

### Technical Details
- Uses tsup for modern bundling with dual ESM/CJS output
- Includes source maps and TypeScript declaration files
- Optimized for tree-shaking and minimal bundle size
- Full TypeScript support with strict type checking