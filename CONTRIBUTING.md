# Contributing to React Native MCP Server

Thank you for your interest in contributing to the React Native MCP Server! This document provides comprehensive guidelines for contributing to this project.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [Development Workflow](#development-workflow)
- [Code Style Guide](#code-style-guide)
- [Testing Requirements](#testing-requirements)
- [Adding New Features](#adding-new-features)
- [Documentation Standards](#documentation-standards)
- [Pull Request Process](#pull-request-process)
- [Commit Message Guidelines](#commit-message-guidelines)
- [Release Process](#release-process)
- [Getting Help](#getting-help)

## Code of Conduct

This project adheres to a Code of Conduct that all contributors are expected to follow. Please be respectful, inclusive, and constructive in all interactions.

## Getting Started

### Prerequisites

Before contributing, ensure you have:

- **Node.js**: Version 18.0.0 or higher
- **npm**: Version 9.0.0 or higher
- **Git**: For version control
- **TypeScript**: Familiarity with TypeScript syntax
- **MCP Knowledge**: Basic understanding of Model Context Protocol

### Quick Start

1. **Fork the repository** on GitHub

2. **Clone your fork** locally:

   ```bash
   git clone https://github.com/YOUR_USERNAME/React-Native-MCP.git
   cd React-Native-MCP
   ```

3. **Add upstream remote** (to sync with main repository):

   ```bash
   git remote add upstream https://github.com/Divagnz/React-Native-MCP.git
   ```

4. **Install dependencies**:

   ```bash
   npm install
   ```

5. **Build the project**:

   ```bash
   npm run build
   ```

6. **Run tests**:

   ```bash
   npm test
   ```

## Development Setup

### Project Structure

```
React-Native-MCP/
├── src/
│   ├── tools/           # MCP tool implementations
│   ├── resources/       # MCP resource providers
│   ├── prompts/         # MCP prompt templates
│   ├── utils/           # Shared utilities
│   ├── types/           # TypeScript type definitions
│   ├── logger/          # Logging infrastructure
│   └── index.ts         # Main entry point
├── examples/            # Usage examples and guides
│   ├── basic-usage/
│   ├── code-remediation/
│   ├── testing/
│   ├── package-management/
│   └── integration/
├── tests/               # Test suites
├── docs/                # Additional documentation
├── .github/             # GitHub workflows and templates
└── package.json
```

### Environment Setup

Create a `.env` file (optional, for development):

```bash
# Logging
LOG_LEVEL=debug
LOG_FILE=./logs/dev.log

# Development
NODE_ENV=development
MCP_DEV_MODE=true

# Testing
TEST_TIMEOUT=30000
```

### Editor Configuration

#### VS Code (Recommended)

Install recommended extensions:

```bash
code --install-extension dbaeumer.vscode-eslint
code --install-extension esbenp.prettier-vscode
code --install-extension ms-vscode.vscode-typescript-next
```

Workspace settings (`.vscode/settings.json`):

```json
{
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true,
    "source.organizeImports": true
  },
  "typescript.tsdk": "node_modules/typescript/lib",
  "typescript.enablePromptUseWorkspaceTsdk": true
}
```

## Development Workflow

### 1. Sync with Upstream

Before starting work, sync your fork:

```bash
git checkout main
git pull upstream main
git push origin main
```

### 2. Create Feature Branch

Use descriptive branch names:

```bash
# Features
git checkout -b feature/add-performance-analyzer

# Bug fixes
git checkout -b fix/memory-leak-in-scanner

# Documentation
git checkout -b docs/update-contributing-guide

# Refactoring
git checkout -b refactor/optimize-tool-loader
```

### 3. Make Changes

Follow our [code style guide](#code-style-guide) and [testing requirements](#testing-requirements).

### 4. Commit Changes

Use our [commit message guidelines](#commit-message-guidelines):

```bash
git add .
git commit -m "feat: add performance analysis tool"
```

### 5. Push and Create PR

```bash
git push origin feature/add-performance-analyzer
```

Then create a Pull Request on GitHub.

## Code Style Guide

### TypeScript Guidelines

#### 1. Use Strict Type Checking

```typescript
// ✅ Good: Explicit types
interface ComponentAnalysisResult {
  issues: Issue[];
  metrics: PerformanceMetrics;
  suggestions: string[];
}

function analyzeComponent(code: string): ComponentAnalysisResult {
  // Implementation
}

// ❌ Bad: Implicit any
function analyzeComponent(code) {
  // Implementation
}
```

#### 2. Prefer Interfaces Over Types

```typescript
// ✅ Good: Use interfaces for object shapes
interface ToolConfig {
  name: string;
  version: string;
  enabled: boolean;
}

// ✅ Good: Use types for unions/intersections
type AnalysisType = 'performance' | 'security' | 'quality';
type ToolResult = SuccessResult | ErrorResult;
```

#### 3. Use Enums for Constants

```typescript
// ✅ Good
enum Severity {
  Critical = 'critical',
  High = 'high',
  Medium = 'medium',
  Low = 'low',
}

// ❌ Bad
const SEVERITY_CRITICAL = 'critical';
const SEVERITY_HIGH = 'high';
```

#### 4. Avoid Any

```typescript
// ✅ Good: Use specific types
function parseJson<T>(json: string): T {
  return JSON.parse(json) as T;
}

// ❌ Bad: Using any
function parseJson(json: string): any {
  return JSON.parse(json);
}
```

### Code Organization

#### File Structure

```typescript
// 1. Imports (grouped and sorted)
import { z } from 'zod';
import { McpError, ErrorCode } from '@modelcontextprotocol/sdk/types.js';

// 2. Types and interfaces
interface AnalyzerOptions {
  path: string;
  depth?: number;
}

// 3. Constants
const DEFAULT_DEPTH = 3;

// 4. Main implementation
export class CodeAnalyzer {
  // Implementation
}

// 5. Helper functions (if needed)
function parseCode(source: string): AST {
  // Implementation
}
```

#### Import Organization

```typescript
// 1. External dependencies
import { z } from 'zod';
import { McpError } from '@modelcontextprotocol/sdk/types.js';

// 2. Internal modules (absolute imports)
import { Logger } from '@/logger';
import { FileSystem } from '@/utils/fs';

// 3. Relative imports
import { ToolConfig } from './types';
import { validateInput } from './validators';

// 4. Type-only imports (at the end)
import type { AnalysisResult } from './types';
```

### Naming Conventions

```typescript
// Classes: PascalCase
class ComponentAnalyzer {}

// Interfaces: PascalCase with descriptive names
interface AnalysisOptions {}
interface AnalysisResult {}

// Functions: camelCase, descriptive verbs
function analyzeComponent() {}
function generateReport() {}

// Constants: UPPER_SNAKE_CASE
const MAX_FILE_SIZE = 1024 * 1024;
const DEFAULT_TIMEOUT = 5000;

// Private members: prefix with underscore
class Analyzer {
  private _cache: Map<string, any>;
  private _config: Config;
}

// Type parameters: Single uppercase letter or descriptive
function parse<T>(input: string): T {}
function map<TInput, TOutput>(fn: (item: TInput) => TOutput) {}
```

### Function Guidelines

```typescript
// ✅ Good: Pure functions when possible
function calculateScore(metrics: Metrics): number {
  return metrics.performance * 0.4 + metrics.quality * 0.6;
}

// ✅ Good: Explicit return types
function analyze(code: string): Promise<AnalysisResult> {
  // Implementation
}

// ✅ Good: Single responsibility
function validateInput(input: unknown): void {
  // Only validation
}

function processInput(input: ValidInput): Result {
  // Only processing
}

// ❌ Bad: Mixed concerns
function validateAndProcess(input: unknown): Result {
  // Validation AND processing
}
```

### Error Handling

```typescript
// ✅ Good: Use custom error types
class ValidationError extends Error {
  constructor(message: string, public details: unknown) {
    super(message);
    this.name = 'ValidationError';
  }
}

throw new ValidationError('Invalid input', { field: 'path', value: '' });

// ✅ Good: Wrap MCP errors
try {
  // Operation
} catch (error) {
  throw new McpError(
    ErrorCode.InternalError,
    `Analysis failed: ${error.message}`
  );
}
```

### Validation with Zod

All tool inputs must use Zod schemas:

```typescript
// ✅ Good: Comprehensive schema
const AnalyzeComponentSchema = z.object({
  path: z.string().min(1, 'Path is required'),
  includeTests: z.boolean().optional().default(false),
  maxDepth: z.number().int().positive().max(10).optional().default(3),
  exclude: z.array(z.string()).optional(),
});

type AnalyzeComponentInput = z.infer<typeof AnalyzeComponentSchema>;

// Use in tool
export const analyzeComponentTool = {
  name: 'analyze_component',
  description: 'Analyze React Native component',
  inputSchema: zodToJsonSchema(AnalyzeComponentSchema),
  handler: async (args: unknown) => {
    const input = AnalyzeComponentSchema.parse(args);
    // Implementation
  },
};
```

### Documentation

Use JSDoc for all public APIs:

```typescript
/**
 * Analyzes a React Native component for issues and best practices.
 *
 * @param path - Absolute path to the component file
 * @param options - Analysis configuration options
 * @returns Analysis results including issues, metrics, and suggestions
 * @throws {McpError} If the file doesn't exist or cannot be parsed
 *
 * @example
 * ```typescript
 * const result = await analyzeComponent('/path/to/Component.tsx', {
 *   includeTests: true,
 *   maxDepth: 5
 * });
 * console.log(`Found ${result.issues.length} issues`);
 * ```
 */
export async function analyzeComponent(
  path: string,
  options?: AnalysisOptions
): Promise<AnalysisResult> {
  // Implementation
}
```

## Testing Requirements

### Test Structure

```typescript
// tests/tools/analyze-component.test.ts
import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import { analyzeComponent } from '../../src/tools/analyze-component';

describe('analyzeComponent', () => {
  beforeEach(() => {
    // Setup
  });

  afterEach(() => {
    // Cleanup
  });

  describe('basic functionality', () => {
    it('should analyze a valid component', async () => {
      // Arrange
      const componentCode = `
        import React from 'react';
        export const Button = () => <Text>Click</Text>;
      `;

      // Act
      const result = await analyzeComponent(componentCode);

      // Assert
      expect(result).toBeDefined();
      expect(result.issues).toBeArray();
    });
  });

  describe('error handling', () => {
    it('should throw on invalid input', async () => {
      await expect(analyzeComponent('')).rejects.toThrow();
    });
  });

  describe('edge cases', () => {
    it('should handle empty components', async () => {
      const result = await analyzeComponent('export const Empty = () => null;');
      expect(result.issues).toHaveLength(0);
    });
  });
});
```

### Coverage Requirements

- **Minimum Coverage**: 80% for all code
- **Critical Paths**: 100% coverage required
- **New Features**: Must include tests achieving 90%+ coverage

Run coverage:

```bash
npm test -- --coverage
```

### Test Types

#### 1. Unit Tests

Test individual functions and classes:

```typescript
describe('parseComponent', () => {
  it('should extract component name', () => {
    const ast = parseComponent('const Button = () => {}');
    expect(ast.name).toBe('Button');
  });
});
```

#### 2. Integration Tests

Test tool workflows:

```typescript
describe('analyze_component tool', () => {
  it('should complete full analysis workflow', async () => {
    const result = await runTool('analyze_component', {
      path: './test-fixtures/Button.tsx',
    });
    expect(result.status).toBe('success');
  });
});
```

#### 3. Snapshot Tests

For consistent outputs:

```typescript
it('should match analysis report snapshot', () => {
  const report = generateReport(analysisResult);
  expect(report).toMatchSnapshot();
});
```

## Adding New Features

### Adding New Tools

1. **Create tool file**: `src/tools/your-tool.ts`

```typescript
import { z } from 'zod';
import { zodToJsonSchema } from 'zod-to-json-schema';
import { McpError, ErrorCode } from '@modelcontextprotocol/sdk/types.js';

// 1. Define input schema
const YourToolInputSchema = z.object({
  path: z.string().min(1),
  option: z.boolean().optional(),
});

type YourToolInput = z.infer<typeof YourToolInputSchema>;

// 2. Implement tool
export const yourTool = {
  name: 'your_tool_name',
  description: 'Clear description of what the tool does',
  inputSchema: zodToJsonSchema(YourToolInputSchema),

  handler: async (args: unknown) => {
    try {
      // Validate input
      const input = YourToolInputSchema.parse(args);

      // Implementation
      const result = await processInput(input);

      // Return result
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(result, null, 2),
          },
        ],
      };
    } catch (error) {
      throw new McpError(
        ErrorCode.InternalError,
        `Tool failed: ${error.message}`
      );
    }
  },
};
```

2. **Register tool**: Add to `src/tools/index.ts`

3. **Add tests**: Create `tests/tools/your-tool.test.ts`

4. **Update documentation**: Add tool description to README.md

5. **Add example**: Create usage example in `examples/` directory

### Adding New Resources

1. **Create resource**: `src/resources/your-resource.ts`

```typescript
import type { Resource } from '@modelcontextprotocol/sdk/types.js';

export const yourResource: Resource = {
  uri: 'resource://your-resource-name',
  name: 'Your Resource Name',
  description: 'Description of what this resource provides',
  mimeType: 'text/plain', // or 'application/json'
};

export async function getYourResource(): Promise<string> {
  // Implement resource generation
  return 'resource content';
}
```

2. **Register resource**: Add to `src/resources/index.ts`

3. **Add tests** and **documentation**

## Documentation Standards

### README Updates

When adding features, update README.md:

1. Add tool to "Available Tools" section
2. Include usage example
3. Document all parameters
4. Show sample output

### Example Documentation

Create comprehensive examples in `examples/` directory:

```markdown
# Feature Name

## Problem

Describe the problem this feature solves.

## Solution

Show how to use the feature.

## Example

### Before

[Show problematic code]

### After

[Show fixed code]

## Best Practices

- Guideline 1
- Guideline 2
```

## Pull Request Process

### Before Creating PR

1. ✅ All tests pass: `npm test`
2. ✅ Code is formatted: `npm run format`
3. ✅ No linting errors: `npm run lint`
4. ✅ Build succeeds: `npm run build`
5. ✅ Documentation updated
6. ✅ Examples added (if applicable)

### PR Template Checklist

- [ ] Description explains changes and motivation
- [ ] Tests added/updated with 80%+ coverage
- [ ] Documentation updated (README, examples, JSDoc)
- [ ] No breaking changes (or clearly documented)
- [ ] Commits follow commit message guidelines
- [ ] CI checks pass

### Review Process

1. **Automated Checks**: CI must pass
2. **Code Review**: At least one maintainer approval required
3. **Testing**: Reviewer will test changes
4. **Feedback**: Address all review comments
5. **Merge**: Maintainer will merge when approved

## Commit Message Guidelines

We follow [Conventional Commits](https://www.conventionalcommits.org/):

### Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `perf`: Performance improvements
- `test`: Adding/updating tests
- `chore`: Maintenance tasks
- `ci`: CI/CD changes

### Examples

```bash
# Feature
feat(tools): add performance analysis tool

Implement new tool for analyzing component performance.
Includes render cost calculation and memory leak detection.

Closes #123

# Bug fix
fix(parser): handle edge case in TypeScript parser

Fixed parser crash when encountering specific JSX pattern.

Fixes #456

# Documentation
docs(examples): add testing workflow guide

Added comprehensive guide for test generation workflow
including examples and best practices.

# Breaking change
feat(api)!: change tool input schema format

BREAKING CHANGE: Tool inputs now require 'path' field
instead of 'file'. Update all tool calls accordingly.

Migration: Change `file: path` to `path: path` in all calls.
```

## Release Process

Releases are managed by maintainers using semantic versioning:

- **Major** (X.0.0): Breaking changes
- **Minor** (0.X.0): New features (backward compatible)
- **Patch** (0.0.X): Bug fixes

### Release Checklist

1. Update CHANGELOG.md
2. Update version in package.json
3. Create git tag: `git tag v1.2.3`
4. Push tag: `git push origin v1.2.3`
5. GitHub Actions will automatically publish to npm

## Getting Help

### Resources

- **Documentation**: Read [README.md](./README.md) and [examples](./examples/)
- **Issues**: Search [existing issues](https://github.com/Divagnz/React-Native-MCP/issues)
- **Discussions**: Ask questions in [GitHub Discussions](https://github.com/Divagnz/React-Native-MCP/discussions)

### Ask Questions

If you need help:

1. Check existing documentation and examples
2. Search closed issues for similar questions
3. Open a new issue with the `question` label

### Report Bugs

Use the [bug report template](.github/ISSUE_TEMPLATE/bug_report.yml) and include:

- Clear description
- Steps to reproduce
- Expected vs actual behavior
- Environment details
- Code samples

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

## Recognition

Contributors will be:

- Listed in CHANGELOG.md for their contributions
- Credited in release notes
- Added to README.md contributors section (for significant contributions)

Thank you for contributing to React Native MCP Server! 🎉
