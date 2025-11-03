# VS Code Setup Guide

## Overview

This guide shows how to configure Visual Studio Code to work seamlessly with the React Native MCP Server, enabling AI-powered code analysis, suggestions, and automation directly in your editor.

## Prerequisites

- Visual Studio Code 1.80 or higher
- Node.js 18 or higher
- React Native MCP Server installed globally or in project

## Installation

### Step 1: Install MCP Extension

1. Open VS Code
2. Press `Cmd+Shift+X` (Mac) or `Ctrl+Shift+X` (Windows/Linux)
3. Search for "Model Context Protocol"
4. Click "Install"

Alternatively, install via command line:

```bash
code --install-extension anthropic.mcp-vscode
```

### Step 2: Install React Native MCP Server

```bash
# Global installation
npm install -g @react-native-mcp/server

# Or project-local
npm install --save-dev @react-native-mcp/server
```

### Step 3: Configure VS Code

Create or update `.vscode/settings.json` in your project:

```json
{
  "mcp.servers": {
    "react-native": {
      "command": "npx",
      "args": ["@react-native-mcp/server"],
      "enabled": true,
      "env": {
        "NODE_ENV": "development"
      }
    }
  },
  "mcp.autoStart": true,
  "mcp.logLevel": "info"
}
```

## Configuration

### Basic Configuration

**.vscode/settings.json**:

```json
{
  // MCP Server Configuration
  "mcp.servers": {
    "react-native": {
      "command": "npx",
      "args": [
        "@react-native-mcp/server",
        "--workspace", "${workspaceFolder}",
        "--log-level", "info"
      ],
      "enabled": true
    }
  },

  // Enable automatic analysis
  "mcp.autoAnalyze": {
    "onSave": true,
    "onOpen": true,
    "debounceMs": 500
  },

  // Code Actions
  "mcp.codeActions": {
    "enabled": true,
    "showQuickFixes": true,
    "showRefactorings": true
  },

  // Diagnostics
  "mcp.diagnostics": {
    "enabled": true,
    "severity": {
      "critical": "error",
      "high": "warning",
      "medium": "information",
      "low": "hint"
    }
  }
}
```

### Advanced Configuration

**.vscode/settings.json**:

```json
{
  "mcp.servers": {
    "react-native": {
      "command": "npx",
      "args": ["@react-native-mcp/server"],
      "enabled": true,
      "env": {
        "NODE_ENV": "development",
        "MCP_LOG_LEVEL": "debug"
      }
    }
  },

  // Performance Analysis
  "mcp.performance": {
    "enabled": true,
    "highlightIssues": true,
    "showMetrics": true
  },

  // Security Scanning
  "mcp.security": {
    "enabled": true,
    "scanOnSave": true,
    "highlightSecrets": true
  },

  // Test Generation
  "mcp.testing": {
    "autoGenerateTests": false,
    "testFramework": "jest",
    "testLocation": "tests"
  },

  // TypeScript Integration
  "mcp.typescript": {
    "enabled": true,
    "strictMode": true,
    "generateTypes": true
  },

  // Code Formatting
  "mcp.formatting": {
    "enabled": true,
    "formatOnSave": true,
    "prettier": true
  },

  // File Watching
  "mcp.files": {
    "include": ["**/*.{ts,tsx,js,jsx}"],
    "exclude": [
      "**/node_modules/**",
      "**/build/**",
      "**/dist/**",
      "**/.git/**"
    ]
  }
}
```

## Features

### 1. Real-time Code Analysis

MCP analyzes your code as you type and provides:

- **Syntax errors**: Highlighted in red
- **Type errors**: TypeScript issues
- **Logic errors**: Potential bugs
- **Performance issues**: Inefficient patterns
- **Security vulnerabilities**: Hardcoded secrets, XSS risks

**Example**: Memory leak detection

![VS Code showing memory leak warning](images/vscode-memory-leak.png)

### 2. Code Actions

Right-click on code or press `Cmd+.` (Mac) / `Ctrl+.` (Windows) to access:

#### Quick Fixes

- Fix TypeScript errors
- Add missing imports
- Remove unused variables
- Fix memory leaks
- Remediate security issues

**Example**:
```typescript
// Before: Memory leak
useEffect(() => {
  const timer = setInterval(() => {}, 1000);
}, []);

// Quick Fix: Add cleanup
useEffect(() => {
  const timer = setInterval(() => {}, 1000);
  return () => clearInterval(timer); // ✨ Added by Quick Fix
}, []);
```

#### Refactorings

- Convert class to hooks
- Extract component
- Extract function
- Rename symbol
- Optimize imports

**Example**:
```typescript
// Before: Class component
class MyComponent extends React.Component {
  render() {
    return <View />;
  }
}

// After: Functional component (via Refactor action)
const MyComponent: React.FC = () => {
  return <View />;
};
```

### 3. IntelliSense Integration

MCP enhances VS Code's IntelliSense with:

- React Native API suggestions
- Component prop suggestions
- Hook usage recommendations
- Best practice suggestions

**Example**: When typing `useEffect`, you get:

```typescript
useEffect(() => {
  // Setup code

  return () => {
    // 💡 Cleanup code (suggested by MCP)
  };
}, [/* dependencies */]);
```

### 4. Hover Information

Hover over code to see:

- Component documentation
- Performance metrics
- Security recommendations
- Usage examples

![VS Code hover showing performance metrics](images/vscode-hover.png)

### 5. Inline Hints

Configure inline hints for:

- Parameter names
- Type information
- Performance costs
- Security warnings

**.vscode/settings.json**:
```json
{
  "mcp.inlineHints": {
    "enabled": true,
    "showParameterNames": true,
    "showTypes": true,
    "showPerformanceCosts": true
  }
}
```

## Commands

Access MCP commands via Command Palette (`Cmd+Shift+P` / `Ctrl+Shift+P`):

### Analysis Commands

- **MCP: Analyze Current File** - Analyze open file
- **MCP: Analyze Workspace** - Analyze entire project
- **MCP: Analyze Performance** - Performance analysis
- **MCP: Analyze Security** - Security scan

### Refactoring Commands

- **MCP: Convert Class to Hooks** - Refactor class component
- **MCP: Extract Component** - Extract JSX to component
- **MCP: Optimize Imports** - Clean up imports
- **MCP: Format Code** - Format with Prettier

### Testing Commands

- **MCP: Generate Tests** - Generate test file for current component
- **MCP: Run Tests** - Execute tests
- **MCP: Show Coverage** - Display test coverage

### Utility Commands

- **MCP: Show Diagnostics** - Open problems panel
- **MCP: Clear Cache** - Clear MCP cache
- **MCP: Restart Server** - Restart MCP server

## Keyboard Shortcuts

Add custom shortcuts in `.vscode/keybindings.json`:

```json
[
  {
    "key": "cmd+shift+a",
    "command": "mcp.analyzeCurrentFile",
    "when": "editorTextFocus"
  },
  {
    "key": "cmd+shift+t",
    "command": "mcp.generateTests",
    "when": "editorTextFocus"
  },
  {
    "key": "cmd+shift+r",
    "command": "mcp.refactor.classToHooks",
    "when": "editorTextFocus && editorLangId == 'typescriptreact'"
  },
  {
    "key": "cmd+shift+f",
    "command": "mcp.fixAllIssues",
    "when": "editorTextFocus"
  }
]
```

## Workspace Configuration

### Project-specific Settings

Create `.vscode/settings.json` per project:

```json
{
  "mcp.servers": {
    "react-native": {
      "command": "npx",
      "args": [
        "@react-native-mcp/server",
        "--workspace", "${workspaceFolder}",
        "--config", ".mcp.config.json"
      ],
      "enabled": true
    }
  },

  "mcp.rules": {
    // Project-specific rule overrides
    "no-hardcoded-secrets": "error",
    "require-cleanup-in-useeffect": "warning",
    "max-component-lines": 300
  }
}
```

### MCP Configuration File

Create `.mcp.config.json` in project root:

```json
{
  "extends": "@react-native-mcp/config-recommended",

  "rules": {
    "security/no-hardcoded-secrets": "error",
    "performance/no-memory-leaks": "error",
    "react/no-direct-mutation-state": "error",
    "react-native/no-inline-styles": "warning"
  },

  "ignore": [
    "**/node_modules/**",
    "**/build/**",
    "**/__tests__/**",
    "**/*.test.{ts,tsx}"
  ],

  "performance": {
    "analyzeRenderCosts": true,
    "detectMemoryLeaks": true,
    "checkBundleSize": true
  },

  "security": {
    "scanSecrets": true,
    "scanDependencies": true,
    "checkPermissions": true
  },

  "testing": {
    "framework": "jest",
    "coverageThreshold": 80,
    "autoGenerateTests": false
  }
}
```

## Debugging

### Enable Debug Logging

**.vscode/settings.json**:
```json
{
  "mcp.logLevel": "debug",
  "mcp.traceServer": "verbose"
}
```

View logs:
1. Open Output panel: `View → Output`
2. Select "MCP Server" from dropdown

### Common Issues

#### Issue: Server Not Starting

**Check**:
1. MCP server installed: `npx @react-native-mcp/server --version`
2. Correct path in settings
3. Check Output panel for errors

**Solution**:
```json
{
  "mcp.servers": {
    "react-native": {
      "command": "/absolute/path/to/npx",  // Use absolute path
      "args": ["@react-native-mcp/server"],
      "enabled": true
    }
  }
}
```

#### Issue: Analysis Not Working

**Check**:
1. File is included in `mcp.files.include`
2. File is not in `mcp.files.exclude`
3. Server is running (check status bar)

**Solution**: Restart server with `MCP: Restart Server` command

#### Issue: Performance Slow

**Optimize**:
```json
{
  "mcp.autoAnalyze": {
    "debounceMs": 1000  // Increase debounce
  },
  "mcp.files": {
    "exclude": [
      "**/node_modules/**",
      "**/build/**"  // Ensure large dirs excluded
    ]
  }
}
```

## Tips and Best Practices

### 1. Use Workspace Recommendations

Create `.vscode/extensions.json`:

```json
{
  "recommendations": [
    "anthropic.mcp-vscode",
    "dbaeumer.vscode-eslint",
    "esbenp.prettier-vscode",
    "ms-vscode.vscode-typescript-next"
  ],
  "unwantedRecommendations": []
}
```

### 2. Configure Tasks

Create `.vscode/tasks.json`:

```json
{
  "version": "2.0.0",
  "tasks": [
    {
      "label": "MCP: Analyze Project",
      "type": "shell",
      "command": "npx @react-native-mcp/cli analyze --path .",
      "group": {
        "kind": "build",
        "isDefault": false
      },
      "presentation": {
        "reveal": "always",
        "panel": "new"
      }
    },
    {
      "label": "MCP: Security Scan",
      "type": "shell",
      "command": "npx @react-native-mcp/cli analyze-security --path .",
      "problemMatcher": []
    }
  ]
}
```

### 3. Use Launch Configurations

Create `.vscode/launch.json`:

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Debug MCP Server",
      "type": "node",
      "request": "launch",
      "program": "${workspaceFolder}/node_modules/@react-native-mcp/server/bin/mcp-server",
      "args": ["--debug"],
      "console": "integratedTerminal"
    }
  ]
}
```

### 4. Status Bar Integration

MCP shows status in bottom-right:

- 🟢 **Green**: Server running, no issues
- 🟡 **Yellow**: Server running, warnings found
- 🔴 **Red**: Server running, errors found
- ⚪ **Gray**: Server not running

Click status to show:
- Issue count by severity
- Quick actions
- Server controls

### 5. Problems Panel

View all issues in Problems panel (`Cmd+Shift+M` / `Ctrl+Shift+M`):

- Filter by severity
- Filter by file
- Jump to issue
- Apply quick fixes

## Integration with Other Tools

### ESLint

MCP works alongside ESLint:

```json
{
  "eslint.enable": true,
  "mcp.integrateWithESLint": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true,
    "source.fixAll.mcp": true
  }
}
```

### Prettier

Auto-format on save:

```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "mcp.formatting.enabled": true
}
```

### TypeScript

Enhanced TypeScript support:

```json
{
  "typescript.tsdk": "node_modules/typescript/lib",
  "mcp.typescript.enabled": true,
  "mcp.typescript.strictMode": true
}
```

## Snippets

Create custom MCP-powered snippets in `.vscode/snippets/react-native.json`:

```json
{
  "React Native Component with Hooks": {
    "prefix": "rnc",
    "body": [
      "import React, { useState, useEffect } from 'react';",
      "import { View, Text, StyleSheet } from 'react-native';",
      "",
      "interface ${1:ComponentName}Props {",
      "  $2",
      "}",
      "",
      "export const ${1:ComponentName}: React.FC<${1:ComponentName}Props> = ({ $3 }) => {",
      "  $4",
      "",
      "  useEffect(() => {",
      "    // Setup",
      "    $5",
      "",
      "    // Cleanup",
      "    return () => {",
      "      $6",
      "    };",
      "  }, [$7]);",
      "",
      "  return (",
      "    <View style={styles.container}>",
      "      <Text>$8</Text>",
      "    </View>",
      "  );",
      "};",
      "",
      "const styles = StyleSheet.create({",
      "  container: {",
      "    $9",
      "  },",
      "});"
    ],
    "description": "React Native component with proper cleanup"
  }
}
```

## Multi-root Workspaces

For monorepos, configure per folder:

```json
{
  "folders": [
    {
      "path": "packages/mobile-app",
      "name": "Mobile App"
    },
    {
      "path": "packages/shared-components",
      "name": "Shared Components"
    }
  ],
  "settings": {
    "mcp.servers": {
      "react-native": {
        "command": "npx",
        "args": ["@react-native-mcp/server"],
        "enabled": true
      }
    }
  }
}
```

## Resources

- [MCP VS Code Extension Documentation](https://code.visualstudio.com/docs/mcp)
- [React Native MCP CLI Reference](../../README.md#cli-reference)
- [VS Code Keyboard Shortcuts](https://code.visualstudio.com/docs/getstarted/keybindings)

---

**Related Examples**:
- [Claude Desktop Setup](./claude-desktop-setup.md)
- [CI/CD Integration](./ci-cd-setup.md)
- [Getting Started](../basic-usage/getting-started.md)
