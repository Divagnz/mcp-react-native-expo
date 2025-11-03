# Security Audit Workflow

## Overview

Regular security audits are essential for React Native applications to protect against vulnerabilities in dependencies. This guide demonstrates how to use the React Native MCP Server to perform comprehensive security audits and remediate vulnerabilities.

## Why Security Audits Matter

Unpatched vulnerabilities can lead to:
- Data breaches and unauthorized access
- Malicious code execution
- Denial of service attacks
- Compliance violations
- Reputational damage

## Audit Process

### Step 1: Run Automated Audit

```bash
npm audit
```

**Example Output**:
```
found 5 vulnerabilities (2 moderate, 2 high, 1 critical) in 1250 scanned packages
  2 vulnerabilities require manual review. See the full report for details.
```

### Step 2: Analyze with MCP

**Prompt**:
```
Analyze my npm audit results and provide:
1. Severity prioritization
2. Exploitability assessment
3. Safe remediation steps
4. Risk vs effort analysis
```

## Example 1: Critical Vulnerability

### Audit Output

```bash
$ npm audit

Critical Severity vulnerability found in json5
Prototype Pollution in JSON5 via Parse Method

Package: json5
Patched in: >=2.2.2
Dependency of: react-scripts
Path: react-scripts > @babel/core > @babel/parser > json5
More info: https://github.com/advisories/GHSA-9c47-m6qq-7p4h
```

### Analysis

**Prompt**:
```
Explain this critical vulnerability:
Package: json5 < 2.2.2
Type: Prototype Pollution
Path: react-scripts > @babel/core > @babel/parser > json5

Is this exploitable in my React Native app?
What's the safest fix?
```

### Response

```
Critical Vulnerability Analysis: json5 Prototype Pollution

What is Prototype Pollution?
Attackers can inject properties into JavaScript object prototypes, potentially:
- Overwriting critical object properties
- Bypassing security checks
- Executing arbitrary code

Exploitability in Your App: LOW
- json5 is a build-time dependency (via babel)
- Not used in production runtime
- Only affects developers during build
- Attack vector requires malicious package.json or config files

However, still important to fix because:
✅ Defense in depth
✅ Compliance requirements
✅ Supply chain security

Safe Remediation:
1. Run: npm audit fix
2. If that fails: npm audit fix --force
3. If still fails: Use overrides

Risk Assessment:
- Severity: CRITICAL (CVSS score)
- Exploitability: LOW (build-time only)
- Fix Difficulty: EASY
- Priority: HIGH (but not urgent)

Recommended Action: Fix within 1 week
```

### Fix Application

**Option 1: Automatic Fix**
```bash
npm audit fix

# If that doesn't work
npm audit fix --force
```

**Option 2: Manual Override**

**package.json**:
```json
{
  "overrides": {
    "json5": ">=2.2.3"
  }
}
```

```bash
rm -rf node_modules package-lock.json
npm install
npm audit
```

### Verification

```bash
# Verify vulnerability fixed
npm audit

# Check json5 version
npm list json5
```

## Example 2: High Severity with Breaking Changes

### Audit Output

```
High Severity vulnerability found in axios
Server-Side Request Forgery in axios

Package: axios
Patched in: >=1.6.0
Dependency of: (root)
Current Version: 0.27.2
```

### Analysis

**Prompt**:
```
I have axios 0.27.2 which has a high severity SSRF vulnerability.
Patched version is 1.6.0, which is a major version bump.
What are the breaking changes and how do I migrate safely?
```

### Response

```
axios 0.27.x → 1.6.x Migration

Vulnerability: Server-Side Request Forgery (SSRF)
Severity: HIGH
Exploitability: MEDIUM (requires specific misuse patterns)
CVSS Score: 7.5

Breaking Changes in axios 1.x:
1. ❌ Removed support for Node.js < 12
   Impact: None (React Native doesn't use Node version)

2. ⚠️  Changed error handling structure
   Before: error.response.data
   After: Still works, but enhanced

3. ⚠️  Changed timeout behavior
   Now cancels request properly on timeout

4. ✅ Better TypeScript types
   May require type updates

Migration Required:
- Update error handling if using custom error interceptors
- Update tests that check timeout behavior
- Review custom axios instances

Estimated Migration Time: 1-2 hours
Risk: Low-Medium
Recommendation: Upgrade ASAP (actively exploited vulnerability)
```

### Migration Steps

#### Step 1: Backup Current Code

```bash
git checkout -b security/axios-upgrade
```

#### Step 2: Find All axios Usage

**Prompt**:
```
Search my codebase for all axios usage patterns.
Identify areas that might break with v1.x upgrade.
```

**Result**:
```
axios Usage Found (23 instances):

API Service (src/services/api.ts):
- axios.create() with custom config ✅ Compatible
- request interceptors ⚠️  Review needed
- response interceptors ⚠️  Review needed
- error handling ⚠️  Review needed

Auth Service (src/services/auth.ts):
- axios.post() ✅ Compatible
- axios.get() with timeout ⚠️  Test timeout behavior

Data Fetching Hooks (src/hooks/useApi.ts):
- Custom error parsing ⚠️  May need updates
```

#### Step 3: Update Package

```bash
npm install axios@^1.6.0
```

#### Step 4: Update Code

**Before (axios 0.27.x)**:
```typescript
// src/services/api.ts
import axios from 'axios';

const api = axios.create({
  baseURL: 'https://api.example.com',
  timeout: 10000,
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      // Server responded with error
      console.error('Server error:', error.response.data);
    } else if (error.request) {
      // Request made but no response
      console.error('Network error:', error.request);
    } else {
      // Error in request setup
      console.error('Request error:', error.message);
    }
    return Promise.reject(error);
  }
);
```

**After (axios 1.6.x)** - Still works, but enhanced:
```typescript
// src/services/api.ts
import axios, { AxiosError } from 'axios';

const api = axios.create({
  baseURL: 'https://api.example.com',
  timeout: 10000,
  timeoutErrorMessage: 'Request timeout', // New in 1.x
});

api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    // Enhanced error handling
    if (error.response) {
      // Server responded with error status
      console.error('Server error:', {
        status: error.response.status,
        data: error.response.data,
      });
    } else if (error.request) {
      // Request made but no response
      console.error('Network error:', error.code);
    } else {
      // Error in request setup
      console.error('Request error:', error.message);
    }

    // Better error categorization in 1.x
    if (error.code === 'ECONNABORTED') {
      console.error('Request was aborted/timeout');
    }

    return Promise.reject(error);
  }
);

export default api;
```

#### Step 5: Update Tests

**Before**:
```typescript
// api.test.ts
it('should handle timeout', async () => {
  jest.useFakeTimers();

  const promise = api.get('/slow-endpoint');
  jest.advanceTimersByTime(10000);

  await expect(promise).rejects.toThrow();
});
```

**After**:
```typescript
// api.test.ts
it('should handle timeout', async () => {
  jest.useFakeTimers();

  const promise = api.get('/slow-endpoint');
  jest.advanceTimersByTime(10000);

  await expect(promise).rejects.toThrow('Request timeout');

  // Enhanced error checking in 1.x
  await promise.catch((error: AxiosError) => {
    expect(error.code).toBe('ECONNABORTED');
  });
});
```

#### Step 6: Test Thoroughly

```bash
# Run all tests
npm test

# Test in development
npm start

# Test builds
npm run ios
npm run android
```

### Verification

```bash
# Verify vulnerability fixed
npm audit

# Check axios version
npm list axios

# Should show: axios@1.6.0 (or higher)
```

## Example 3: Moderate Severity Evaluation

### Audit Output

```
Moderate Severity vulnerability found in semver
Regular Expression Denial of Service (ReDoS) in semver

Package: semver
Patched in: >=7.5.2
Dependency of: @react-native-community/cli
Current Version: 7.3.8
```

### Analysis

**Prompt**:
```
Evaluate this moderate ReDoS vulnerability in semver.
Is it worth the risk of upgrading, or should I wait for
automatic dependency updates?
```

### Response

```
Moderate Vulnerability Evaluation: semver ReDoS

What is ReDoS?
Regular Expression Denial of Service - malicious input causes
regex to execute for extremely long time, blocking the thread.

Exploitability Assessment:
- Affects: semver.parse() with malicious input
- Attack Vector: Requires attacker to control version strings
- In Your App: Very LOW
  - semver is used by React Native CLI (dev tool)
  - Not exposed to user input
  - Not used in production runtime

Risk vs Effort:
Risk: LOW
- Build-time dependency only
- Requires specific attack pattern
- Limited exposure

Effort: MEDIUM
- Transitive dependency (via react-native CLI)
- May require waiting for CLI update
- Manual override might cause CLI issues

Recommendation: MONITOR
- Wait for automatic update via @react-native-community/cli
- Check monthly if CLI has updated
- Not urgent unless you process untrusted version strings

Schedule: Fix within 3 months or at next RN upgrade
Priority: LOW
```

### Decision: Wait for Upstream

```bash
# Monitor for CLI updates
npm outdated @react-native-community/cli

# Check if update includes semver fix
npm info @react-native-community/cli dependencies.semver
```

## Example 4: Vulnerability in Production Code

### High-Risk Scenario

```
High Severity vulnerability found in react-native-webview
XSS vulnerability in WebView component

Package: react-native-webview
Patched in: >=13.6.0
Dependency of: (root)
Current Version: 11.26.1
```

### Critical Analysis

**Prompt**:
```
URGENT: react-native-webview XSS vulnerability.
We use WebView extensively in our app to display user content.
Guide me through emergency patching.
```

### Response

```
🚨 CRITICAL SECURITY ALERT 🚨

Vulnerability: Cross-Site Scripting (XSS) in WebView
Severity: HIGH
Exploitability: HIGH
Production Impact: CRITICAL

Your Exposure:
✅ You use react-native-webview
✅ You display user-generated content
✅ WebView has JavaScript enabled
❌ HIGH RISK - Actively exploitable

Potential Impact:
- Attackers can execute arbitrary JavaScript
- Access to React Native bridge
- Potential data theft
- Session hijacking

IMMEDIATE ACTIONS REQUIRED:

1. Emergency Mitigation (TODAY):
   - Disable WebView JavaScript if possible
   - Add content security policy
   - Sanitize all URLs before loading

2. Upgrade Path (THIS WEEK):
   - Upgrade react-native-webview to >=13.6.0
   - Test all WebView functionality
   - Deploy hotfix ASAP

3. Communication:
   - Notify security team
   - Consider user notification
   - Document incident
```

### Emergency Mitigation

**Temporary Fix** (while preparing upgrade):

```typescript
// src/components/SafeWebView.tsx
import { WebView } from 'react-native-webview';

interface SafeWebViewProps {
  source: { uri: string };
}

// Temporary safety measures
export const SafeWebView: React.FC<SafeWebViewProps> = ({ source }) => {
  // Whitelist of safe domains
  const SAFE_DOMAINS = ['example.com', 'trusted-site.com'];

  // Validate URL
  const isUrlSafe = (url: string): boolean => {
    try {
      const parsed = new URL(url);
      return SAFE_DOMAINS.some(domain =>
        parsed.hostname.endsWith(domain)
      );
    } catch {
      return false;
    }
  };

  if (!isUrlSafe(source.uri)) {
    return <Text>Content not available</Text>;
  }

  return (
    <WebView
      source={source}
      javaScriptEnabled={false}  // Disable JS temporarily
      mixedContentMode="never"
      allowsInlineMediaPlayback={false}
      // Additional security headers
      injectedJavaScript=""
    />
  );
};
```

### Permanent Fix

```bash
# Create hotfix branch
git checkout -b hotfix/webview-xss

# Upgrade to patched version
npm install react-native-webview@^13.6.0

# iOS
cd ios && pod install && cd ..

# Test immediately
npm test
npm run ios
npm run android
```

**Updated Component**:
```typescript
// src/components/SafeWebView.tsx
import { WebView } from 'react-native-webview';

export const SafeWebView: React.FC<SafeWebViewProps> = ({ source }) => {
  return (
    <WebView
      source={source}
      // Security best practices
      javaScriptEnabled={true}  // Now safe in 13.6.0+
      mixedContentMode="never"
      originWhitelist={['https://*']}
      // Content Security Policy
      injectedJavaScriptBeforeContentLoaded={`
        // Additional CSP if needed
        const meta = document.createElement('meta');
        meta.setAttribute('http-equiv', 'Content-Security-Policy');
        meta.setAttribute('content', "default-src 'self'; script-src 'self'");
        document.head.appendChild(meta);
      `}
      onShouldStartLoadWithRequest={(request) => {
        // Additional URL validation
        return request.url.startsWith('https://');
      }}
    />
  );
};
```

### Rapid Deployment

```bash
# Run full test suite
npm test

# Build and test
npm run ios
npm run android

# Commit hotfix
git add .
git commit -m "security: fix XSS vulnerability in react-native-webview

- Upgrade react-native-webview to 13.6.0
- Add additional security measures
- Implement URL whitelist validation

Fixes CVE-XXXX-XXXXX"

# Deploy immediately
git push origin hotfix/webview-xss

# Create emergency PR
gh pr create --title "SECURITY HOTFIX: WebView XSS vulnerability" \
  --body "Critical security fix for react-native-webview XSS" \
  --label "security,hotfix,priority:critical"
```

## Security Audit Schedule

### Daily (Automated)
- CI/CD runs `npm audit` on every PR
- Block merge if critical vulnerabilities found
- Generate audit reports

### Weekly
**Prompt**:
```
Perform weekly security audit:
1. Run npm audit
2. Check for new CVEs affecting my dependencies
3. Prioritize any new vulnerabilities
4. Create remediation tasks
```

### Monthly
**Prompt**:
```
Comprehensive security review:
1. Audit all dependencies
2. Check for unmaintained packages
3. Review transitive dependencies
4. Update security documentation
5. Test security measures
```

### Quarterly
- Full security assessment
- Penetration testing
- Dependency health review
- Security training

## Prevention Best Practices

### 1. Automated Scanning

**CI/CD Integration** (.github/workflows/security.yml):
```yaml
name: Security Audit

on:
  push:
    branches: [main]
  pull_request:
  schedule:
    - cron: '0 0 * * *'  # Daily

jobs:
  audit:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 18

      - name: Run npm audit
        run: npm audit --audit-level=moderate

      - name: Check for high/critical vulns
        run: |
          AUDIT_RESULT=$(npm audit --json --audit-level=high)
          if [ $? -ne 0 ]; then
            echo "::error::High or critical vulnerabilities found"
            exit 1
          fi
```

### 2. Dependency Pinning

**package.json**:
```json
{
  "dependencies": {
    "axios": "1.6.2",  // Exact version for security-critical packages
    "react-native-webview": "13.6.0"
  }
}
```

### 3. Regular Updates

```bash
# Monthly update routine
npm outdated
npm update
npm audit
npm test
```

### 4. Security Policy

Create **SECURITY.md**:
```markdown
# Security Policy

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 2.x     | :white_check_mark: |
| 1.x     | :x:                |

## Reporting Vulnerabilities

Email: security@example.com
Response Time: 48 hours
```

### 5. Monitoring Tools

- **Snyk**: Continuous vulnerability scanning
- **Dependabot**: Automatic PR for security updates
- **npm audit**: Built-in scanning
- **Socket Security**: Supply chain protection

## Emergency Response Checklist

When critical vulnerability discovered:

- [ ] Assess severity and exploitability
- [ ] Determine production impact
- [ ] Implement temporary mitigation if needed
- [ ] Create hotfix branch
- [ ] Upgrade affected package
- [ ] Test thoroughly but quickly
- [ ] Deploy hotfix ASAP
- [ ] Notify stakeholders
- [ ] Document incident
- [ ] Review security processes
- [ ] Plan preventive measures

## Using MCP Throughout

### Regular Audits
```
Perform comprehensive security audit of my React Native project.
Generate report with prioritized action items.
```

### Vulnerability Assessment
```
I have this npm audit output:
[paste output]

Provide detailed risk assessment and remediation plan.
```

### Migration Guidance
```
Guide me through upgrading [package] from [old-version] to [new-version]
to fix security vulnerability [CVE-ID].
```

### Verification
```
After security fixes, verify my project has no remaining
high or critical vulnerabilities.
```

---

**Related Examples**:
- [Upgrade Workflow](./upgrade-workflow.md)
- [Dependency Resolution](./dependency-resolution.md)
- [Security Fixes](../code-remediation/security-fixes/hardcoded-secrets.md)
