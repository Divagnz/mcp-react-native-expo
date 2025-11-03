# Package Upgrade Workflow

## Overview

Safely upgrading packages in React Native requires careful planning to avoid breaking changes and compatibility issues. This guide demonstrates how to use the React Native MCP Server to manage package upgrades systematically.

## Problem

Package upgrades can introduce:
- Breaking API changes
- Dependency conflicts
- Performance regressions
- Security vulnerabilities
- Type definition issues

## Strategy

### 1. Assessment Phase

First, analyze your current dependencies:

**Prompt**:
```
Analyze my package.json and identify outdated packages.
Categorize by risk level:
- Major version updates (high risk)
- Minor version updates (medium risk)
- Patch version updates (low risk)
```

The `analyze_package_json` tool will:
- List all outdated dependencies
- Check for breaking changes
- Identify security vulnerabilities
- Recommend upgrade order
- Highlight compatibility issues

### 2. Planning Phase

**Prompt**:
```
Create an upgrade plan for these packages:
- react-native: 0.71.0 → 0.73.0
- react-navigation: 6.0.0 → 6.1.0
- @types/react: 18.0.0 → 18.2.0

Include:
- Migration steps
- Breaking changes
- Testing requirements
- Rollback procedure
```

### 3. Execution Phase

Upgrade packages in order of risk (lowest to highest).

## Example 1: Patch Updates (Low Risk)

### Current State

```json
{
  "dependencies": {
    "axios": "1.4.0",
    "lodash": "4.17.20",
    "date-fns": "2.29.3"
  }
}
```

### Check for Updates

**Prompt**:
```
Check for patch updates for axios, lodash, and date-fns.
Show changelog highlights and any security fixes.
```

### Response from MCP Tool

```
Patch Updates Available:

1. axios: 1.4.0 → 1.4.2
   - Fixed: Memory leak in request interceptors
   - Fixed: TypeScript types for FormData
   - Security: None
   - Risk: Low ✅

2. lodash: 4.17.20 → 4.17.21
   - Fixed: Prototype pollution vulnerability (CVE-2021-23337)
   - Security: High 🔴
   - Risk: Low (patch only) ✅

3. date-fns: 2.29.3 → 2.30.0
   - Added: New locales
   - Fixed: DST handling edge cases
   - Breaking: None
   - Risk: Low ✅

Recommendation: Upgrade all immediately. Lodash has critical security fix.
```

### Upgrade Commands

```bash
# Update specific packages
npm update axios lodash date-fns

# Or update all patch versions
npm update

# Verify versions
npm list axios lodash date-fns
```

### Verification

**Prompt**:
```
Verify my project after upgrading axios, lodash, and date-fns.
Run tests and check for any issues.
```

## Example 2: Minor Updates (Medium Risk)

### Current State

```json
{
  "dependencies": {
    "react-navigation": "6.0.13",
    "@react-navigation/native": "6.0.13",
    "@react-navigation/stack": "6.3.10"
  }
}
```

### Check for Breaking Changes

**Prompt**:
```
I want to upgrade react-navigation from 6.0.x to 6.1.x.
Analyze breaking changes and migration requirements.
```

### Response

```
React Navigation 6.0.x → 6.1.x Migration:

New Features:
- Improved TypeScript types
- Better deep linking support
- Performance improvements

Breaking Changes:
❌ None - Fully backward compatible

Deprecations:
⚠️  `getFocusedRouteNameFromRoute` deprecated
    Use `getFocusedRoute` instead

Migration Steps:
1. Update all @react-navigation packages together
2. Replace deprecated functions
3. Update TypeScript types if using custom navigators
4. Test navigation flows

Compatibility:
✅ React Native 0.68+
✅ React 16.13+
✅ TypeScript 4.1+
```

### Before Upgrading - Find Deprecated Usage

**Prompt**:
```
Search my codebase for usage of getFocusedRouteNameFromRoute
so I can update it before upgrading.
```

### Upgrade Process

```bash
# Update all react-navigation packages together
npm install \
  @react-navigation/native@^6.1.0 \
  @react-navigation/stack@^6.3.20 \
  @react-navigation/bottom-tabs@^6.5.11

# Check for peer dependency warnings
npm ls
```

### Code Updates

**Before**:
```tsx
import { getFocusedRouteNameFromRoute } from '@react-navigation/native';

function getHeaderTitle(route: any) {
  const routeName = getFocusedRouteNameFromRoute(route) ?? 'Home';
  return routeName;
}
```

**After**:
```tsx
import { getFocusedRoute } from '@react-navigation/native';

function getHeaderTitle(route: any) {
  const focusedRoute = getFocusedRoute(route);
  return focusedRoute?.name ?? 'Home';
}
```

### Verify Changes

**Prompt**:
```
Analyze my navigation code for compatibility with react-navigation 6.1.
Check for any missed deprecated API usage.
```

## Example 3: Major Updates (High Risk)

### Current State

```json
{
  "dependencies": {
    "react-native": "0.71.14"
  }
}
```

### Target

Upgrade to React Native 0.73.x

### Pre-Upgrade Analysis

**Prompt**:
```
Analyze my React Native project for upgrade from 0.71 to 0.73.
Identify:
- Breaking changes affecting my code
- Native module compatibility
- Third-party package compatibility
- Required migration steps
```

### Response

```
React Native 0.71 → 0.73 Upgrade Analysis:

Breaking Changes Affecting Your Project:

1. ❌ Removed PropTypes (you use them in 12 files)
   Files affected:
   - src/components/Button.tsx
   - src/components/Header.tsx
   - src/screens/HomeScreen.tsx
   [... 9 more files]

   Migration: Replace with TypeScript types

2. ❌ Metro config changes
   Action: Update metro.config.js

3. ⚠️  New Architecture (optional but recommended)
   Action: Enable Fabric and TurboModules

Native Modules Compatibility:
✅ react-native-vector-icons: Compatible (v10.0.0+)
✅ @react-native-community/async-storage: Compatible
❌ react-native-camera: Not compatible - use react-native-vision-camera
⚠️  react-native-firebase: Requires v18.0.0+

Third-Party Packages:
✅ react-navigation: Compatible
✅ redux: Compatible
❌ react-native-screens: Requires upgrade to 3.29.0+

Estimated Upgrade Time: 4-6 hours
Risk Level: High
Recommended: Create feature branch and test thoroughly
```

### Step-by-Step Upgrade

#### Step 1: Create Upgrade Branch

```bash
git checkout -b upgrade/react-native-0.73
git push -u origin upgrade/react-native-0.73
```

#### Step 2: Update React Native

```bash
# Use React Native upgrade helper
npx react-native upgrade 0.73.0

# This will:
# - Update package.json
# - Update native iOS/Android files
# - Show conflicts for manual resolution
```

#### Step 3: Update Dependencies

**Prompt**:
```
Update my package.json to ensure all packages are compatible
with React Native 0.73. Show me which packages need updates.
```

```bash
# Update incompatible packages
npm install react-native-screens@^3.29.0
npm install react-native-firebase@^18.0.0
npm uninstall react-native-camera
npm install react-native-vision-camera@^3.0.0
```

#### Step 4: Remove PropTypes

**Prompt**:
```
Refactor all my PropTypes usage to TypeScript types.
Start with src/components/Button.tsx
```

**Before**:
```tsx
import PropTypes from 'prop-types';
import { TouchableOpacity, Text } from 'react-native';

export const Button = ({ title, onPress, disabled }) => {
  return (
    <TouchableOpacity onPress={onPress} disabled={disabled}>
      <Text>{title}</Text>
    </TouchableOpacity>
  );
};

Button.propTypes = {
  title: PropTypes.string.isRequired,
  onPress: PropTypes.func.isRequired,
  disabled: PropTypes.bool,
};
```

**After**:
```tsx
import { TouchableOpacity, Text } from 'react-native';

interface ButtonProps {
  title: string;
  onPress: () => void;
  disabled?: boolean;
}

export const Button: React.FC<ButtonProps> = ({ title, onPress, disabled }) => {
  return (
    <TouchableOpacity onPress={onPress} disabled={disabled}>
      <Text>{title}</Text>
    </TouchableOpacity>
  );
};
```

#### Step 5: Update Metro Config

**Prompt**:
```
Update my metro.config.js for React Native 0.73 compatibility
```

**Before**:
```js
module.exports = {
  transformer: {
    getTransformOptions: async () => ({
      transform: {
        experimentalImportSupport: false,
        inlineRequires: true,
      },
    }),
  },
};
```

**After**:
```js
const {getDefaultConfig, mergeConfig} = require('@react-native/metro-config');

const config = {
  transformer: {
    getTransformOptions: async () => ({
      transform: {
        experimentalImportSupport: false,
        inlineRequires: true,
      },
    }),
  },
};

module.exports = mergeConfig(getDefaultConfig(__dirname), config);
```

#### Step 6: Update Native Code

**iOS**:
```bash
cd ios
pod install
cd ..
```

**Android**: Update `android/build.gradle` if needed (React Native CLI will show diffs)

#### Step 7: Test Thoroughly

**Prompt**:
```
Generate a comprehensive test plan for my React Native 0.73 upgrade.
Include:
- Core functionality tests
- Navigation tests
- Native module tests
- Performance regression tests
```

```bash
# Run tests
npm test

# Build for iOS
npm run ios

# Build for Android
npm run android

# Run E2E tests
npm run e2e:ios
npm run e2e:android
```

## Example 4: Security Vulnerability Fix

### npm audit Output

```bash
$ npm audit

found 3 vulnerabilities (2 moderate, 1 high)

# Run npm audit fix to fix them, or npm audit for details
```

### Detailed Audit

**Prompt**:
```
Analyze npm audit output and recommend safe fixes.
Prioritize by severity and provide upgrade commands.
```

### Response

```
Security Vulnerabilities Found:

1. 🔴 HIGH: json5 < 2.2.2 (Prototype Pollution)
   Package: json5@2.2.0
   Dependency chain: react-scripts > @babel/core > json5
   Fix: npm audit fix --force
   Risk: May break babel configuration
   Recommended: Test thoroughly after fix

2. 🟡 MODERATE: loader-utils < 2.0.4 (ReDoS)
   Package: loader-utils@2.0.0
   Dependency chain: react-scripts > webpack > loader-utils
   Fix: npm update loader-utils
   Risk: Low

3. 🟡 MODERATE: nth-check < 2.0.1 (ReDoS)
   Package: nth-check@1.0.2
   Dependency chain: cheerio > css-select > nth-check
   Fix: npm update nth-check
   Risk: Low

Recommended Action Plan:
1. Update moderate severity packages first (low risk)
2. Test application
3. Update high severity package with --force flag
4. Test thoroughly
5. If issues occur, use npm install to restore package-lock.json
```

### Safe Upgrade Process

```bash
# 1. Backup package-lock.json
cp package-lock.json package-lock.json.backup

# 2. Fix moderate severity issues
npm update loader-utils nth-check

# 3. Test
npm test

# 4. Fix high severity with force (may update other packages)
npm audit fix --force

# 5. Check what changed
git diff package.json package-lock.json

# 6. Test thoroughly
npm test
npm run ios
npm run android
```

### If Something Breaks

```bash
# Restore backup
cp package-lock.json.backup package-lock.json
npm ci

# Or create override in package.json
```

**package.json with overrides**:
```json
{
  "overrides": {
    "json5": "2.2.3",
    "loader-utils": "2.0.4",
    "nth-check": "2.1.1"
  }
}
```

## Best Practices

### 1. Always Check Changelogs

**Prompt**:
```
Get changelog for react-native from 0.71.0 to 0.73.0.
Highlight breaking changes and new features.
```

### 2. Test in Isolation

Create a test branch for each major upgrade:

```bash
git checkout -b test/upgrade-package-name
# Make changes
# Test thoroughly
# Merge only if successful
```

### 3. Update Related Packages Together

**Prompt**:
```
I'm upgrading @react-navigation/native.
What other @react-navigation packages should I upgrade at the same time?
```

### 4. Monitor Bundle Size

**Before Upgrade**:
```bash
npm run build
# Note bundle size
```

**After Upgrade**:
```bash
npm run build
# Compare bundle sizes
```

**Prompt**:
```
Analyze bundle size impact of my recent package upgrades.
Identify any unexpected size increases.
```

### 5. Use Version Ranges Wisely

```json
{
  "dependencies": {
    "exact-version": "1.2.3",           // No automatic updates
    "patch-updates": "~1.2.3",          // Allow 1.2.x
    "minor-updates": "^1.2.3",          // Allow 1.x.x
    "any-version": "*"                  // ❌ Never use
  }
}
```

### 6. Document the Upgrade

Create upgrade notes:

**upgrade-notes.md**:
```markdown
# React Native 0.71 → 0.73 Upgrade

## Date
2024-01-15

## Packages Updated
- react-native: 0.71.14 → 0.73.0
- react-native-screens: 3.20.0 → 3.29.0
- react-native-firebase: 17.5.0 → 18.0.0

## Breaking Changes
1. Removed PropTypes - migrated to TypeScript
2. Updated Metro config format
3. Replaced react-native-camera with vision-camera

## Issues Encountered
- Build failed initially due to missing pod install
- Had to update Xcode to 14.3+

## Testing Results
✅ All unit tests pass
✅ iOS build successful
✅ Android build successful
✅ No performance regressions

## Rollback Procedure
```bash
git checkout main
npm ci
cd ios && pod install
```
```

## Upgrade Checklist

Before upgrading:
- [ ] Read changelog and migration guide
- [ ] Check package compatibility
- [ ] Create backup branch
- [ ] Run full test suite
- [ ] Document current versions

During upgrade:
- [ ] Update packages in correct order
- [ ] Resolve dependency conflicts
- [ ] Update configuration files
- [ ] Fix breaking changes in code
- [ ] Update native dependencies (iOS/Android)

After upgrade:
- [ ] Run full test suite
- [ ] Test on iOS device
- [ ] Test on Android device
- [ ] Check bundle size
- [ ] Monitor performance
- [ ] Update documentation
- [ ] Create rollback plan

## Common Issues

### Issue 1: Peer Dependency Conflicts

```
npm ERR! peer dep missing: react@^18.0.0, required by react-dom@18.2.0
```

**Solution**:
```bash
npm install --legacy-peer-deps
# Or resolve by updating react
npm install react@^18.0.0
```

### Issue 2: Native Module Compilation Errors

**iOS**:
```bash
cd ios
pod deintegrate
pod install
```

**Android**:
```bash
cd android
./gradlew clean
cd ..
```

### Issue 3: Metro Bundler Cache Issues

```bash
npm start -- --reset-cache
# Or
rm -rf node_modules
npm install
```

## Using MCP Tools Throughout

### Initial Assessment
```
Analyze my package.json and create an upgrade roadmap
for the next 6 months.
```

### During Upgrade
```
I'm seeing this error after upgrading [package]:
[paste error]

Help me diagnose and fix it.
```

### Post-Upgrade
```
Analyze my codebase for any deprecated API usage
after upgrading to [package]@[version].
```

---

**Related Examples**:
- [Dependency Resolution](./dependency-resolution.md)
- [Security Audit](./security-audit.md)
- [Getting Started](../basic-usage/getting-started.md)
