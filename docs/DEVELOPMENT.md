# Development Guide

## Getting Started

This project uses a step-by-step development approach. Each step is documented in the `instructions/` directory.

## Git Workflow

### Branch Naming
- `feature/feature-name` for new features
- `bugfix/issue-description` for bug fixes
- `hotfix/critical-issue` for urgent fixes

### Commit Message Format
```
Type(scope): Brief description

- Detailed explanation if needed
- List specific changes made
- Reference any related issues

Types: feat, fix, docs, style, refactor, test, chore
```

## Development Tools

### ESLint Configuration
Create `.eslintrc.js` in root directory for code quality.

### Prettier Configuration
Create `.prettierrc` for consistent code formatting.

## Testing

Manual testing approach:
1. Test functionality after each step
2. Verify cross-browser compatibility
3. Check performance on different devices
4. Validate user experience flow