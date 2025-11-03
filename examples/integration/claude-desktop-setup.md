# Claude Desktop Configuration

## Overview

This guide shows how to configure Claude Desktop to use the React Native MCP Server, enabling AI-powered assistance for React Native development directly within Claude's chat interface.

## Prerequisites

- Claude Desktop app installed
- Node.js 18 or higher
- React Native MCP Server package

## Quick Start

### Step 1: Locate Configuration File

The configuration file location depends on your operating system:

**macOS**:
```bash
~/Library/Application Support/Claude/claude_desktop_config.json
```

**Windows**:
```bash
%APPDATA%\Claude\claude_desktop_config.json
```

**Linux**:
```bash
~/.config/Claude/claude_desktop_config.json
```

### Step 2: Basic Configuration

Create or edit `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "react-native": {
      "command": "npx",
      "args": [
        "-y",
        "@react-native-mcp/server"
      ]
    }
  }
}
```

### Step 3: Restart Claude Desktop

Close and reopen Claude Desktop for changes to take effect.

### Step 4: Verify Installation

In a new Claude chat, type:

```
Get version information for the React Native MCP server
```

You should see version details confirming the server is connected.

## Advanced Configuration

### Full Configuration Example

```json
{
  "mcpServers": {
    "react-native": {
      "command": "npx",
      "args": [
        "-y",
        "@react-native-mcp/server",
        "--log-level", "info",
        "--enable-all-tools"
      ],
      "env": {
        "NODE_ENV": "development",
        "MCP_WORKSPACE": "/path/to/your/project"
      },
      "disabled": false,
      "alwaysAllow": []
    }
  },
  "globalShortcut": "CommandOrControl+Shift+Space",
  "alwaysOnTop": false,
  "theme": "system"
}
```

### Configuration Options

#### Server Settings

```json
{
  "mcpServers": {
    "react-native": {
      // Required: Command to run
      "command": "npx",

      // Required: Command arguments
      "args": [
        "-y",  // Auto-install if missing
        "@react-native-mcp/server",
        "--log-level", "info"  // debug | info | warn | error
      ],

      // Optional: Environment variables
      "env": {
        "NODE_ENV": "development",
        "MCP_WORKSPACE": "${workspaceFolder}",
        "MCP_CACHE_DIR": "~/.mcp-cache"
      },

      // Optional: Disable this server
      "disabled": false,

      // Optional: Tools that don't require user approval
      "alwaysAllow": [
        "get_version",
        "analyze_component",
        "get_component_docs"
      ]
    }
  }
}
```

#### Tool Permissions

Configure which tools can run without asking for permission:

```json
{
  "mcpServers": {
    "react-native": {
      "command": "npx",
      "args": ["-y", "@react-native-mcp/server"],

      // Tools that always run without prompting
      "alwaysAllow": [
        // Read-only operations
        "get_version",
        "analyze_component",
        "analyze_codebase_architecture",
        "analyze_test_coverage",

        // Analysis operations
        "analyze_codebase_performance",
        "analyze_codebase_security",

        // Documentation
        "get_component_docs",
        "search_documentation"
      ],

      // Tools that always require permission
      // (modify operations - default behavior)
      "alwaysDeny": [],

      // Default: "prompt" (ask every time)
      "defaultPermission": "prompt"
    }
  }
}
```

## Project-Specific Configuration

### Per-Project Setup

For different React Native projects, you can configure project-specific settings:

```json
{
  "mcpServers": {
    "react-native-project-a": {
      "command": "npx",
      "args": [
        "-y",
        "@react-native-mcp/server",
        "--workspace", "/Users/username/projects/app-a"
      ],
      "disabled": false
    },
    "react-native-project-b": {
      "command": "npx",
      "args": [
        "-y",
        "@react-native-mcp/server",
        "--workspace", "/Users/username/projects/app-b"
      ],
      "disabled": true  // Switch between projects
    }
  }
}
```

Then switch between projects by enabling/disabling servers.

### Using Local Installation

If you have MCP server installed in a specific project:

```json
{
  "mcpServers": {
    "react-native-local": {
      "command": "node",
      "args": [
        "/Users/username/projects/my-app/node_modules/@react-native-mcp/server/bin/mcp-server.js"
      ],
      "env": {
        "NODE_ENV": "development"
      }
    }
  }
}
```

## Features and Usage

### 1. Code Analysis

**Prompt Examples**:

```
Analyze this component for performance issues:
[paste component code]
```

```
Review my codebase for security vulnerabilities
```

```
Check this code for memory leaks:
[paste code]
```

### 2. Code Generation

**Prompt Examples**:

```
Generate a React Native component for a login form with:
- Email and password inputs
- Validation
- Loading states
- Error handling
```

```
Create a custom hook for data fetching with:
- Loading state
- Error handling
- Caching
- Retry logic
```

### 3. Test Generation

**Prompt Examples**:

```
Generate comprehensive tests for this component:
[paste component]

Include:
- Rendering tests
- Interaction tests
- Edge cases
- Accessibility tests
```

```
Create integration tests for my authentication flow
```

### 4. Refactoring

**Prompt Examples**:

```
Refactor this class component to use hooks:
[paste class component]
```

```
Extract this logic into a custom hook:
[paste component with logic]
```

### 5. Debugging

**Prompt Examples**:

```
Help debug this error:
[paste error message and relevant code]
```

```
Why is my component re-rendering excessively?
[paste component]
```

### 6. Documentation

**Prompt Examples**:

```
Explain how React Navigation works in React Native
```

```
Show me examples of using AsyncStorage
```

```
What are best practices for handling deep linking?
```

## Workflows

### Daily Development Workflow

**Morning Setup**:
```
Review my React Native project at /path/to/project

Provide:
1. Summary of recent changes
2. Any code quality issues
3. Security concerns
4. Test coverage gaps
```

**During Development**:
```
Analyze this component I'm working on:
[paste component]

Check for:
- Performance issues
- Memory leaks
- TypeScript errors
- Best practice violations
```

**Before Committing**:
```
Review my changes before I commit:
[paste git diff]

Check for:
- Breaking changes
- Missing tests
- Security issues
- Documentation updates needed
```

### Code Review Workflow

```
Review this pull request:

Files changed:
- src/components/UserProfile.tsx
- src/hooks/useUserData.ts
- src/services/api.ts

Focus on:
- Code quality
- Performance
- Security
- Test coverage
```

### Debugging Workflow

```
I'm getting this error in React Native:

[paste error stack trace]

Relevant code:
[paste code]

Help me:
1. Understand the error
2. Find the root cause
3. Provide a fix
4. Explain how to prevent this in future
```

### Learning Workflow

```
I want to learn about [React Native topic].

Please:
1. Explain the concept
2. Show practical examples
3. Highlight common pitfalls
4. Provide best practices
5. Suggest exercises to practice
```

## Tips and Best Practices

### 1. Provide Context

Instead of:
```
Fix this code
```

Use:
```
I'm building a React Native e-commerce app.
This component handles product checkout.
Users report it's slow. Help me optimize it:
[paste code]
```

### 2. Be Specific

Instead of:
```
My app crashes
```

Use:
```
My React Native app crashes on iOS 15 when:
1. User navigates to Profile screen
2. App is in background for >5 minutes
3. Then returns to foreground

Error: [paste error]
Code: [paste relevant code]
```

### 3. Iterate

Start broad, then narrow:

**Step 1**:
```
Analyze my authentication flow for issues
```

**Step 2** (after seeing results):
```
Focus on the session timeout handling.
Show me how to implement auto-refresh.
```

**Step 3**:
```
Generate tests for the auto-refresh logic you just created.
```

### 4. Use MCP Tools Directly

Request specific tool usage:

```
Use the analyze_codebase_performance tool on my project
```

```
Use generate_component_test for my LoginForm component
```

### 5. Batch Related Questions

Instead of asking separately, combine:

```
For my UserProfile component:
1. Analyze for performance issues
2. Generate tests
3. Add TypeScript types
4. Create documentation
```

## Troubleshooting

### Issue: Server Not Connecting

**Symptoms**:
- Claude doesn't respond to MCP-related requests
- No MCP tools available

**Solutions**:

1. **Check configuration file syntax**:
   ```bash
   # Validate JSON
   cat ~/Library/Application\ Support/Claude/claude_desktop_config.json | jq .
   ```

2. **Verify MCP server installed**:
   ```bash
   npx @react-native-mcp/server --version
   ```

3. **Check Claude Desktop logs**:

   **macOS**:
   ```bash
   tail -f ~/Library/Logs/Claude/main.log
   ```

   **Windows**:
   ```bash
   type %APPDATA%\Claude\Logs\main.log
   ```

4. **Restart Claude Desktop completely**:
   - Quit Claude (not just close window)
   - Wait 5 seconds
   - Reopen Claude

### Issue: Tools Require Repeated Approval

**Solution**: Add to `alwaysAllow`:

```json
{
  "mcpServers": {
    "react-native": {
      "command": "npx",
      "args": ["-y", "@react-native-mcp/server"],
      "alwaysAllow": [
        "analyze_component",
        "analyze_codebase_performance",
        "get_component_docs"
      ]
    }
  }
}
```

### Issue: Slow Response Times

**Solutions**:

1. **Use local installation**:
   ```bash
   npm install -g @react-native-mcp/server
   ```

   Then update config:
   ```json
   {
     "mcpServers": {
       "react-native": {
         "command": "mcp-server",  // Use global install
         "args": []
       }
     }
   }
   ```

2. **Enable caching**:
   ```json
   {
     "mcpServers": {
       "react-native": {
         "command": "npx",
         "args": ["-y", "@react-native-mcp/server"],
         "env": {
           "MCP_CACHE_ENABLED": "true",
           "MCP_CACHE_DIR": "~/.mcp-cache"
         }
       }
     }
   }
   ```

### Issue: Permission Errors

**Symptoms**:
- "Permission denied" errors
- Cannot access files

**Solutions**:

1. **Check file permissions**:
   ```bash
   ls -la ~/Library/Application\ Support/Claude/
   ```

2. **Grant permissions on macOS**:
   - System Settings → Privacy & Security
   - Grant Full Disk Access to Claude

3. **Set workspace explicitly**:
   ```json
   {
     "mcpServers": {
       "react-native": {
         "command": "npx",
         "args": ["-y", "@react-native-mcp/server"],
         "env": {
           "MCP_WORKSPACE": "/Users/username/projects/my-app"
         }
       }
     }
   }
   ```

## Multiple MCP Servers

You can run multiple MCP servers simultaneously:

```json
{
  "mcpServers": {
    "react-native": {
      "command": "npx",
      "args": ["-y", "@react-native-mcp/server"]
    },
    "filesystem": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-filesystem", "/path/to/project"]
    },
    "git": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-git"]
    }
  }
}
```

Claude will have access to tools from all configured servers.

## Environment Variables

Useful environment variables:

```json
{
  "mcpServers": {
    "react-native": {
      "command": "npx",
      "args": ["-y", "@react-native-mcp/server"],
      "env": {
        // Logging
        "MCP_LOG_LEVEL": "info",  // debug | info | warn | error
        "MCP_LOG_FILE": "~/.mcp-logs/react-native.log",

        // Performance
        "MCP_CACHE_ENABLED": "true",
        "MCP_CACHE_DIR": "~/.mcp-cache",
        "MCP_CACHE_TTL": "3600",  // seconds

        // Project
        "MCP_WORKSPACE": "/path/to/project",
        "NODE_ENV": "development",

        // Features
        "MCP_ENABLE_TELEMETRY": "false",
        "MCP_EXPERIMENTAL_FEATURES": "true"
      }
    }
  }
}
```

## Security Considerations

### 1. Tool Permissions

Be cautious with `alwaysAllow` for tools that:
- Modify files
- Execute commands
- Access network
- Read sensitive data

### 2. Workspace Restrictions

Limit workspace to specific directories:

```json
{
  "mcpServers": {
    "react-native": {
      "command": "npx",
      "args": [
        "-y",
        "@react-native-mcp/server",
        "--workspace", "/Users/username/projects/safe-project",
        "--no-access-outside-workspace"
      ]
    }
  }
}
```

### 3. Review Generated Code

Always review code before:
- Committing changes
- Running in production
- Sharing with team

### 4. Sensitive Data

Avoid pasting:
- API keys
- Passwords
- Personal data
- Proprietary code

## Best Practices

### 1. Start Simple

Begin with basic configuration:
```json
{
  "mcpServers": {
    "react-native": {
      "command": "npx",
      "args": ["-y", "@react-native-mcp/server"]
    }
  }
}
```

Add complexity as needed.

### 2. Use Descriptive Names

For multiple projects:
```json
{
  "mcpServers": {
    "rn-ecommerce-app": {
      "command": "npx",
      "args": ["-y", "@react-native-mcp/server"],
      "env": {"MCP_WORKSPACE": "/path/to/ecommerce"}
    },
    "rn-social-app": {
      "command": "npx",
      "args": ["-y", "@react-native-mcp/server"],
      "env": {"MCP_WORKSPACE": "/path/to/social"}
    }
  }
}
```

### 3. Document Your Setup

Add README with your configuration:

**~/Documents/claude-mcp-setup.md**:
```markdown
# My Claude MCP Setup

## React Native Server
Location: `npx @react-native-mcp/server`
Workspace: `/Users/me/projects/my-app`

## Enabled Tools
- analyze_component
- generate_tests
- analyze_performance

## Common Prompts
- "Analyze my latest changes"
- "Generate tests for [component]"
- "Review PR [number]"
```

### 4. Keep Updated

```bash
# Update MCP server monthly
npm update -g @react-native-mcp/server

# Or with npx (always uses latest)
# No action needed if using npx -y
```

### 5. Share Team Configuration

Create team configuration template:

**team-claude-config.json**:
```json
{
  "mcpServers": {
    "react-native": {
      "command": "npx",
      "args": [
        "-y",
        "@react-native-mcp/server@^1.0.0"  // Pin version for team
      ],
      "alwaysAllow": [
        "analyze_component",
        "get_component_docs"
      ]
    }
  }
}
```

Share in team documentation.

## Resources

- [MCP Documentation](https://modelcontextprotocol.io)
- [Claude Desktop Download](https://claude.ai/desktop)
- [React Native MCP Server](../../README.md)

---

**Related Examples**:
- [VS Code Setup](./vscode-setup.md)
- [CI/CD Integration](./ci-cd-setup.md)
- [Getting Started](../basic-usage/getting-started.md)
