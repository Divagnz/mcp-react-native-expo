# Dependency Resolution

## Overview

Dependency conflicts are common in React Native projects due to the complex web of peer dependencies between packages. This guide shows how to use the React Native MCP Server to identify and resolve dependency conflicts systematically.

## Problem

Dependency conflicts occur when:
- Multiple packages require different versions of the same dependency
- Peer dependency requirements cannot be satisfied
- Direct and transitive dependencies conflict
- Package resolution results in duplicates

## Detection

### Symptom 1: npm install Warnings

```bash
npm WARN ERESOLVE overriding peer dependency
npm WARN While resolving: react-native-paper@5.0.0
npm WARN Found: react-native@0.71.0
npm WARN
npm WARN Could not resolve dependency:
npm WARN peer react-native@">=0.72.0" from react-native-paper@5.0.0
```

### Symptom 2: Runtime Errors

```
Error: Requiring module "node_modules/react-native/index.js", which was listed in
package.json but has not been installed. This might be because you have
multiple versions of react-native installed.
```

### Symptom 3: Type Conflicts

```typescript
error TS2322: Type 'import(".../@types/react/index").ReactNode' is not assignable
to type 'import(".../@types/react/index").ReactNode'. Two different types with
this name exist, but they are unrelated.
```

## Example 1: Peer Dependency Conflict

### Initial State

**package.json**:
```json
{
  "dependencies": {
    "react": "18.2.0",
    "react-native": "0.71.0",
    "react-native-paper": "5.11.0"
  }
}
```

**Error**:
```
npm WARN peer react-native@">=0.72.0" from react-native-paper@5.11.0
```

### Analyze Conflict

**Prompt**:
```
I'm getting a peer dependency warning for react-native-paper.
It requires react-native >=0.72.0 but I have 0.71.0.
What are my options?
```

### Response

```
Peer Dependency Conflict Analysis:

Current State:
- react-native: 0.71.0 (you have)
- react-native-paper: 5.11.0 (requires RN >=0.72.0)

Options:

1. ✅ Downgrade react-native-paper (SAFEST)
   Install: react-native-paper@^4.12.0
   Compatibility: Works with RN 0.71.0
   Risk: Low
   Trade-off: Miss out on Paper 5.x features

2. ⚠️  Upgrade React Native (MEDIUM RISK)
   Install: react-native@^0.72.0
   Compatibility: Supports Paper 5.x
   Risk: Medium (breaking changes)
   Trade-off: Requires migration effort

3. ❌ Use --legacy-peer-deps (NOT RECOMMENDED)
   Install: npm install --legacy-peer-deps
   Risk: High (may work but unsupported)
   Trade-off: Potential runtime issues

Recommendation: Option 1 (downgrade paper) unless you're ready for RN 0.72 upgrade.
```

### Solution 1: Downgrade Package

```bash
# Find compatible version
npm info react-native-paper peerDependencies

# Install compatible version
npm install react-native-paper@^4.12.0

# Verify
npm list react-native-paper
```

### Solution 2: Upgrade React Native

```bash
# Upgrade React Native (see upgrade-workflow.md)
npx react-native upgrade 0.72.0

# Then install paper 5.x
npm install react-native-paper@^5.11.0
```

## Example 2: Multiple React Versions

### Symptom

```bash
$ npm list react
myapp@1.0.0
├── react@18.2.0
├─┬ react-native@0.71.0
│ └── react@18.2.0 deduped
└─┬ some-package@1.0.0
  └── react@17.0.2
```

Two different React versions installed!

### Diagnose

**Prompt**:
```
Analyze my dependency tree for duplicate React installations.
Which package is causing the conflict?
```

### Response

```
Duplicate React Analysis:

Root Cause:
- some-package@1.0.0 has dependency: react@^17.0.0
- Your project uses: react@18.2.0
- NPM installed both versions

Impact:
❌ React Hooks will break (invalid hook call)
❌ Context won't work across versions
❌ Bundle size increased
❌ Potential runtime errors

Dependency Chain:
some-package@1.0.0
  └── react@^17.0.0

Solutions:
1. Update some-package to version that supports React 18
2. Use npm overrides to force React 18
3. Contact package maintainer
```

### Solution: Use NPM Overrides

**package.json**:
```json
{
  "dependencies": {
    "react": "18.2.0",
    "react-native": "0.71.0",
    "some-package": "1.0.0"
  },
  "overrides": {
    "some-package": {
      "react": "18.2.0"
    }
  }
}
```

```bash
# Reinstall with overrides
rm -rf node_modules package-lock.json
npm install

# Verify single React version
npm list react
```

### Alternative: Use resolutions (Yarn)

**package.json**:
```json
{
  "resolutions": {
    "react": "18.2.0"
  }
}
```

## Example 3: Transitive Dependency Conflict

### Scenario

Installing a new package causes conflicts deep in the dependency tree.

```bash
$ npm install @react-navigation/drawer

npm ERR! Could not resolve dependency:
npm ERR! peer react-native-reanimated@"^2.0.0 || ^3.0.0" from @react-navigation/drawer@6.6.0
npm ERR!
npm ERR! Fix the upstream dependency conflict, or retry
npm ERR! this command with --force, or --legacy-peer-deps
```

### Analyze Dependencies

**Prompt**:
```
I'm trying to install @react-navigation/drawer but getting peer dependency
errors for react-native-reanimated. Help me resolve this.
```

### Response

```
Dependency Conflict Analysis:

Package: @react-navigation/drawer@6.6.0
Requires: react-native-reanimated ^2.0.0 || ^3.0.0

Your current state:
❌ react-native-reanimated: NOT INSTALLED

Solution Path:
1. Install react-native-reanimated first
2. Link native dependencies
3. Update native configuration
4. Then install drawer navigator

Step-by-step commands:
```bash
# 1. Install reanimated
npm install react-native-reanimated

# 2. iOS: Install pods
cd ios && pod install && cd ..

# 3. Update babel.config.js
# Add: plugins: ['react-native-reanimated/plugin']

# 4. Now install drawer
npm install @react-navigation/drawer

# 5. Restart bundler
npm start -- --reset-cache
```

Additional packages needed:
- react-native-gesture-handler (for drawer gestures)
- react-native-safe-area-context (for safe areas)
```

### Complete Installation

```bash
# Install all required dependencies
npm install \
  react-native-reanimated \
  react-native-gesture-handler \
  react-native-safe-area-context \
  @react-navigation/drawer

# iOS setup
cd ios && pod install && cd ..

# Android setup (add to MainActivity.java)
```

**babel.config.js**:
```js
module.exports = {
  presets: ['module:metro-react-native-babel-preset'],
  plugins: [
    // Must be last plugin
    'react-native-reanimated/plugin',
  ],
};
```

## Example 4: TypeScript Types Conflicts

### Symptom

```typescript
// Multiple @types/react versions causing conflicts
error TS2322: Type 'ReactNode' is not assignable to type 'ReactNode'.
  Two different types with this name exist, but they are unrelated.
```

### Diagnose

```bash
$ npm list @types/react
myapp@1.0.0
├── @types/react@18.2.0
└─┬ @react-navigation/native@6.1.0
  └── @types/react@18.0.0
```

### Solution

**Prompt**:
```
Fix TypeScript type conflicts for @types/react.
I have multiple versions installed.
```

**package.json with overrides**:
```json
{
  "devDependencies": {
    "@types/react": "18.2.0",
    "@types/react-native": "0.71.0"
  },
  "overrides": {
    "@types/react": "18.2.0"
  }
}
```

```bash
# Clean install
rm -rf node_modules package-lock.json
npm install

# Verify single version
npm list @types/react
```

## Example 5: Version Range Conflicts

### Scenario

Two packages require incompatible version ranges:

- Package A requires: `lodash@^4.17.0`
- Package B requires: `lodash@^3.10.0`

### Analysis

**Prompt**:
```
Two of my dependencies require incompatible lodash versions.
How can I resolve this?
```

### Response

```
Version Range Conflict:

Package A: requires lodash ^4.17.0 (4.17.0 - 4.x.x)
Package B: requires lodash ^3.10.0 (3.10.0 - 3.x.x)

These ranges don't overlap!

Options:

1. ✅ Update Package B (BEST)
   Check if newer version of Package B supports lodash 4.x
   Command: npm info package-b versions

2. ⚠️  Fork Package B
   Update its package.json to use lodash 4.x
   Test thoroughly
   Risk: Maintenance burden

3. ⚠️  Install both versions (WORKAROUND)
   Use npm aliases:
   npm install lodash@^4.17.0
   npm install lodash3@npm:lodash@^3.10.0

   Risk: Increased bundle size

4. ❌ Downgrade Package A
   Not recommended unless necessary
```

## Diagnostic Tools

### Tool 1: Dependency Tree Visualization

**Prompt**:
```
Visualize my dependency tree focusing on [package-name].
Show all dependencies that require it.
```

### Tool 2: Why is Package Installed?

```bash
# NPM 7+
npm explain package-name

# Shows all reasons a package is in node_modules
```

**Prompt**:
```
Why is lodash@3.10.0 installed in my project?
Show me the complete dependency chain.
```

### Tool 3: Find Duplicate Packages

```bash
# List all duplicates
npm dedupe --dry-run

# Fix duplicates
npm dedupe
```

## Resolution Strategies

### Strategy 1: Overrides (NPM 8.3+)

**package.json**:
```json
{
  "overrides": {
    "package-name": "version",
    "nested-package": {
      "deep-dependency": "version"
    }
  }
}
```

### Strategy 2: Resolutions (Yarn)

**package.json**:
```json
{
  "resolutions": {
    "package-name": "version",
    "**/deep-dependency": "version"
  }
}
```

### Strategy 3: Package Aliases

```bash
# Install package under different name
npm install react17@npm:react@^17.0.0
npm install react18@npm:react@^18.0.0
```

### Strategy 4: Pinning Versions

```json
{
  "dependencies": {
    "problematic-package": "1.2.3"  // Exact version, no ^ or ~
  }
}
```

### Strategy 5: Dedupe

```bash
# Remove duplicate packages
npm dedupe

# Clean install
rm -rf node_modules package-lock.json
npm install
```

## Prevention Best Practices

### 1. Use Consistent Version Ranges

```json
{
  "dependencies": {
    "react": "18.2.0",           // ❌ Exact (too strict)
    "react-native": "~0.71.0",   // ✅ Patch updates only
    "lodash": "^4.17.21"         // ✅ Minor updates (most common)
  }
}
```

### 2. Regular Dependency Audits

**Monthly Task**:
```bash
# Check for duplicates
npm ls

# Check for conflicts
npm ls --all 2>&1 | grep -i "UNMET"

# Update outdated
npm outdated
```

**Prompt**:
```
Perform a monthly dependency health check on my project.
Identify duplicates, conflicts, and outdated packages.
```

### 3. Lock File Discipline

```bash
# Always commit package-lock.json
git add package-lock.json

# Don't mix lock files
# Choose one: package-lock.json (npm) or yarn.lock (yarn)

# Fresh install uses lock file
npm ci  # Better than npm install for CI
```

### 4. Peer Dependency Awareness

Before installing new packages:

**Prompt**:
```
I want to install [package-name].
Check if it's compatible with my current React Native version
and other dependencies.
```

### 5. Semantic Versioning Understanding

- `1.2.3` - Exact version
- `~1.2.3` - Patch releases (1.2.x)
- `^1.2.3` - Minor releases (1.x.x)
- `*` or `latest` - ❌ NEVER USE

## Troubleshooting Checklist

When encountering dependency issues:

- [ ] Clear cache: `npm cache clean --force`
- [ ] Remove node_modules: `rm -rf node_modules`
- [ ] Remove lock file: `rm package-lock.json`
- [ ] Fresh install: `npm install`
- [ ] Check for duplicates: `npm ls package-name`
- [ ] Verify peer deps: `npm ls --all 2>&1 | grep "UNMET"`
- [ ] Run dedupe: `npm dedupe`
- [ ] Check npm version: `npm --version` (use 8.3+ for overrides)
- [ ] Review package.json for typos
- [ ] Check for circular dependencies

## Advanced: Handling Circular Dependencies

### Detection

```bash
$ npm install
npm ERR! circ Circular dependency detected
```

**Prompt**:
```
I'm getting circular dependency errors.
Help me identify and break the circular reference.
```

### Solution

Circular dependencies usually indicate design issues. Refactor to break the cycle:

**Before (Circular)**:
```
A imports B
B imports C
C imports A  ← Circular!
```

**After (Fixed)**:
```
A imports B
B imports C
C imports D (shared utilities)
A imports D
```

## Using MCP Throughout

### Initial Setup
```
Analyze my package.json for potential dependency conflicts
before I start development.
```

### Before Installing New Package
```
Check if [package-name]@[version] is compatible with my project.
Will it cause any dependency conflicts?
```

### When Conflict Occurs
```
I'm getting this dependency error:
[paste error]

Help me resolve it with the safest approach.
```

### After Resolution
```
Verify my dependency tree is healthy after resolving conflicts.
Check for any remaining issues.
```

---

**Related Examples**:
- [Upgrade Workflow](./upgrade-workflow.md)
- [Security Audit](./security-audit.md)
- [Getting Started](../basic-usage/getting-started.md)
