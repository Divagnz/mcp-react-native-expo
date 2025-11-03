# CI/CD Integration

## Overview

Integrating the React Native MCP Server into your CI/CD pipeline enables automated code analysis, testing, and quality checks on every commit and pull request. This guide shows how to set up MCP tools in popular CI/CD platforms.

## Benefits of CI/CD Integration

- Automated code quality checks
- Early detection of bugs and security issues
- Consistent code standards enforcement
- Automated test generation and execution
- Performance regression detection
- Dependency vulnerability scanning

## GitHub Actions

### Basic Setup

Create `.github/workflows/mcp-analysis.yml`:

```yaml
name: MCP Code Analysis

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  analyze:
    name: React Native MCP Analysis
    runs-on: ubuntu-latest

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Setup MCP Server
        run: |
          npm install -g @react-native-mcp/server
          mcp-server --version

      - name: Run MCP Analysis
        run: |
          mcp-server analyze \
            --path . \
            --format json \
            --output mcp-report.json

      - name: Check for Critical Issues
        run: |
          # Fail if critical issues found
          CRITICAL=$(cat mcp-report.json | jq '.critical_count')
          if [ "$CRITICAL" -gt 0 ]; then
            echo "::error::Found $CRITICAL critical issues"
            exit 1
          fi

      - name: Upload Analysis Report
        uses: actions/upload-artifact@v3
        if: always()
        with:
          name: mcp-analysis-report
          path: mcp-report.json
```

### Advanced Configuration

Create `.github/workflows/mcp-comprehensive.yml`:

```yaml
name: Comprehensive MCP Checks

on:
  pull_request:
    types: [opened, synchronize, reopened]

jobs:
  security-scan:
    name: Security Analysis
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: '18'

      - name: Install dependencies
        run: npm ci

      - name: MCP Security Scan
        run: |
          npx @react-native-mcp/cli analyze-security \
            --path . \
            --check-secrets \
            --check-dependencies \
            --report security-report.md

      - name: Comment PR with Security Report
        uses: actions/github-script@v7
        if: github.event_name == 'pull_request'
        with:
          script: |
            const fs = require('fs');
            const report = fs.readFileSync('security-report.md', 'utf8');

            github.rest.issues.createComment({
              issue_number: context.issue.number,
              owner: context.repo.owner,
              repo: context.repo.repo,
              body: `## 🔒 Security Analysis Results\n\n${report}`
            });

  performance-check:
    name: Performance Analysis
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0  # Need history for comparison

      - uses: actions/setup-node@v4
        with:
          node-version: '18'

      - name: Install dependencies
        run: npm ci

      - name: MCP Performance Analysis
        run: |
          npx @react-native-mcp/cli analyze-performance \
            --path . \
            --check-memory-leaks \
            --check-render-performance \
            --report performance-report.json

      - name: Compare with Baseline
        run: |
          # Compare current results with main branch
          git checkout main
          npm ci
          npx @react-native-mcp/cli analyze-performance \
            --path . \
            --report baseline-performance.json

          git checkout -

          # Generate comparison
          npx @react-native-mcp/cli compare-performance \
            --baseline baseline-performance.json \
            --current performance-report.json \
            --threshold 10  # Fail if >10% regression

  test-coverage:
    name: Test Coverage Check
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: '18'

      - name: Install dependencies
        run: npm ci

      - name: Analyze Test Coverage
        run: |
          npx @react-native-mcp/cli analyze-test-coverage \
            --path . \
            --min-coverage 80 \
            --report coverage-gaps.md

      - name: Generate Missing Tests
        run: |
          npx @react-native-mcp/cli generate-tests \
            --path src \
            --uncovered-only \
            --output tests/generated

      - name: Commit Generated Tests
        uses: stefanzweifel/git-auto-commit-action@v5
        with:
          commit_message: "test: add generated tests for uncovered code"
          file_pattern: tests/generated/*.test.ts*

  dependency-check:
    name: Dependency Analysis
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: '18'

      - name: Install dependencies
        run: npm ci

      - name: Check Dependencies
        run: |
          npx @react-native-mcp/cli analyze-dependencies \
            --check-outdated \
            --check-vulnerabilities \
            --check-licenses \
            --report dependencies-report.md

      - name: Fail on Critical Vulnerabilities
        run: |
          npm audit --audit-level=critical
```

### Pull Request Comments

Create `.github/workflows/mcp-pr-comment.yml`:

```yaml
name: MCP PR Analysis

on:
  pull_request:
    types: [opened, synchronize]

jobs:
  analyze-pr:
    runs-on: ubuntu-latest
    permissions:
      contents: read
      pull-requests: write

    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: '18'

      - name: Install dependencies
        run: npm ci

      - name: Analyze Changed Files
        id: mcp-analysis
        run: |
          # Get changed files
          CHANGED_FILES=$(gh pr view ${{ github.event.pull_request.number }} \
            --json files --jq '.files[].path' | grep -E '\.(tsx?|jsx?)$')

          # Analyze only changed files
          for file in $CHANGED_FILES; do
            npx @react-native-mcp/cli analyze-file \
              --path "$file" \
              --format markdown >> pr-analysis.md
          done

      - name: Post Analysis as Comment
        uses: actions/github-script@v7
        with:
          github-token: ${{ secrets.GITHUB_TOKEN }}
          script: |
            const fs = require('fs');
            const analysis = fs.readFileSync('pr-analysis.md', 'utf8');

            // Find existing comment
            const comments = await github.rest.issues.listComments({
              issue_number: context.issue.number,
              owner: context.repo.owner,
              repo: context.repo.repo,
            });

            const botComment = comments.data.find(comment =>
              comment.user.type === 'Bot' &&
              comment.body.includes('## MCP Analysis Results')
            );

            const body = `## MCP Analysis Results\n\n${analysis}\n\n---\n*Automated by React Native MCP Server*`;

            if (botComment) {
              // Update existing comment
              await github.rest.issues.updateComment({
                comment_id: botComment.id,
                owner: context.repo.owner,
                repo: context.repo.repo,
                body: body
              });
            } else {
              // Create new comment
              await github.rest.issues.createComment({
                issue_number: context.issue.number,
                owner: context.repo.owner,
                repo: context.repo.repo,
                body: body
              });
            }
```

## GitLab CI

### Basic Configuration

Create `.gitlab-ci.yml`:

```yaml
stages:
  - analyze
  - test
  - report

variables:
  NODE_VERSION: "18"

.mcp-setup: &mcp-setup
  image: node:${NODE_VERSION}
  before_script:
    - npm ci
    - npm install -g @react-native-mcp/server

mcp-analysis:
  <<: *mcp-setup
  stage: analyze
  script:
    - mcp-server analyze --path . --format json --output mcp-report.json
  artifacts:
    paths:
      - mcp-report.json
    reports:
      junit: mcp-report.json
    expire_in: 30 days
  rules:
    - if: '$CI_PIPELINE_SOURCE == "merge_request_event"'

security-scan:
  <<: *mcp-setup
  stage: analyze
  script:
    - npx @react-native-mcp/cli analyze-security --path . --report security.json
    - |
      CRITICAL=$(jq '.critical_count' security.json)
      if [ "$CRITICAL" -gt 0 ]; then
        echo "Found $CRITICAL critical security issues"
        exit 1
      fi
  artifacts:
    paths:
      - security.json
    expire_in: 30 days
  allow_failure: false

performance-analysis:
  <<: *mcp-setup
  stage: analyze
  script:
    - npx @react-native-mcp/cli analyze-performance --path . --report performance.json
  artifacts:
    paths:
      - performance.json
    expire_in: 30 days

generate-report:
  <<: *mcp-setup
  stage: report
  script:
    - npx @react-native-mcp/cli generate-report --input mcp-report.json --format html --output public/index.html
  artifacts:
    paths:
      - public
    expire_in: 30 days
  dependencies:
    - mcp-analysis
  only:
    - merge_requests
```

## CircleCI

### Configuration

Create `.circleci/config.yml`:

```yaml
version: 2.1

orbs:
  node: circleci/node@5.1

jobs:
  mcp-analysis:
    docker:
      - image: cimg/node:18.17
    steps:
      - checkout

      - node/install-packages:
          pkg-manager: npm

      - run:
          name: Install MCP Server
          command: npm install -g @react-native-mcp/server

      - run:
          name: Run MCP Analysis
          command: |
            mcp-server analyze \
              --path . \
              --format json \
              --output /tmp/mcp-report.json

      - run:
          name: Check Analysis Results
          command: |
            CRITICAL=$(cat /tmp/mcp-report.json | jq '.critical_count')
            if [ "$CRITICAL" -gt 0 ]; then
              echo "Found $CRITICAL critical issues"
              exit 1
            fi

      - store_artifacts:
          path: /tmp/mcp-report.json
          destination: mcp-analysis

      - store_test_results:
          path: /tmp/mcp-report.json

  security-analysis:
    docker:
      - image: cimg/node:18.17
    steps:
      - checkout
      - node/install-packages
      - run:
          name: Security Scan
          command: npx @react-native-mcp/cli analyze-security --path . --report /tmp/security.json
      - store_artifacts:
          path: /tmp/security.json

workflows:
  version: 2
  analysis:
    jobs:
      - mcp-analysis:
          filters:
            branches:
              only:
                - main
                - develop
      - security-analysis:
          filters:
            branches:
              only:
                - main
                - develop
```

## Jenkins

### Jenkinsfile

Create `Jenkinsfile`:

```groovy
pipeline {
    agent {
        docker {
            image 'node:18'
        }
    }

    environment {
        MCP_REPORT = 'mcp-analysis-report.json'
    }

    stages {
        stage('Setup') {
            steps {
                sh 'npm ci'
                sh 'npm install -g @react-native-mcp/server'
            }
        }

        stage('MCP Analysis') {
            steps {
                script {
                    sh """
                        mcp-server analyze \
                            --path . \
                            --format json \
                            --output ${MCP_REPORT}
                    """
                }
            }
        }

        stage('Security Check') {
            steps {
                script {
                    sh 'npx @react-native-mcp/cli analyze-security --path . --report security.json'

                    // Parse results
                    def security = readJSON file: 'security.json'
                    if (security.critical_count > 0) {
                        error("Found ${security.critical_count} critical security issues")
                    }
                }
            }
        }

        stage('Performance Analysis') {
            steps {
                sh 'npx @react-native-mcp/cli analyze-performance --path . --report performance.json'
            }
        }

        stage('Generate Report') {
            steps {
                sh """
                    npx @react-native-mcp/cli generate-report \
                        --input ${MCP_REPORT} \
                        --format html \
                        --output report.html
                """

                publishHTML([
                    allowMissing: false,
                    alwaysLinkToLastBuild: true,
                    keepAll: true,
                    reportDir: '.',
                    reportFiles: 'report.html',
                    reportName: 'MCP Analysis Report'
                ])
            }
        }
    }

    post {
        always {
            archiveArtifacts artifacts: '*.json,*.html', fingerprint: true
        }
        failure {
            emailext (
                subject: "MCP Analysis Failed: ${env.JOB_NAME} - ${env.BUILD_NUMBER}",
                body: "Check console output at ${env.BUILD_URL} for details.",
                recipientProviders: [developers(), requestor()]
            )
        }
    }
}
```

## Azure Pipelines

### Configuration

Create `azure-pipelines.yml`:

```yaml
trigger:
  branches:
    include:
      - main
      - develop

pool:
  vmImage: 'ubuntu-latest'

variables:
  node.version: '18.x'

stages:
  - stage: Analysis
    displayName: 'MCP Code Analysis'
    jobs:
      - job: MCPAnalysis
        displayName: 'Run MCP Analysis'
        steps:
          - task: NodeTool@0
            inputs:
              versionSpec: $(node.version)
            displayName: 'Install Node.js'

          - script: |
              npm ci
              npm install -g @react-native-mcp/server
            displayName: 'Install dependencies'

          - script: |
              mcp-server analyze \
                --path . \
                --format json \
                --output $(Build.ArtifactStagingDirectory)/mcp-report.json
            displayName: 'Run MCP Analysis'

          - script: |
              CRITICAL=$(cat $(Build.ArtifactStagingDirectory)/mcp-report.json | jq '.critical_count')
              if [ "$CRITICAL" -gt 0 ]; then
                echo "##vso[task.logissue type=error]Found $CRITICAL critical issues"
                exit 1
              fi
            displayName: 'Check Results'

          - task: PublishBuildArtifacts@1
            inputs:
              PathtoPublish: '$(Build.ArtifactStagingDirectory)'
              ArtifactName: 'mcp-analysis'
            condition: always()

      - job: SecurityScan
        displayName: 'Security Analysis'
        steps:
          - task: NodeTool@0
            inputs:
              versionSpec: $(node.version)

          - script: npm ci
            displayName: 'Install dependencies'

          - script: |
              npx @react-native-mcp/cli analyze-security \
                --path . \
                --report $(Build.ArtifactStagingDirectory)/security.json
            displayName: 'Security Scan'

          - task: PublishBuildArtifacts@1
            inputs:
              PathtoPublish: '$(Build.ArtifactStagingDirectory)'
              ArtifactName: 'security-analysis'
```

## Custom Integrations

### Pre-commit Hooks

Create `.husky/pre-commit`:

```bash
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

# Run MCP analysis on staged files
STAGED_FILES=$(git diff --cached --name-only --diff-filter=ACM | grep -E '\.(tsx?|jsx?)$')

if [ -n "$STAGED_FILES" ]; then
  echo "Running MCP analysis on staged files..."

  for file in $STAGED_FILES; do
    npx @react-native-mcp/cli analyze-file --path "$file" --fail-on-critical
    if [ $? -ne 0 ]; then
      echo "❌ MCP analysis failed for $file"
      echo "Fix issues or use --no-verify to skip (not recommended)"
      exit 1
    fi
  done

  echo "✅ MCP analysis passed"
fi
```

### Pre-push Hooks

Create `.husky/pre-push`:

```bash
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

echo "Running comprehensive MCP checks..."

# Security check
npx @react-native-mcp/cli analyze-security \
  --path . \
  --fail-on-critical

if [ $? -ne 0 ]; then
  echo "❌ Security check failed"
  exit 1
fi

# Performance check
npx @react-native-mcp/cli analyze-performance \
  --path . \
  --check-memory-leaks

if [ $? -ne 0 ]; then
  echo "⚠️  Performance issues detected"
  read -p "Continue with push? (y/n) " -n 1 -r
  echo
  if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    exit 1
  fi
fi

echo "✅ All checks passed"
```

## Best Practices

### 1. Cache Dependencies

```yaml
# GitHub Actions
- uses: actions/cache@v3
  with:
    path: ~/.npm
    key: ${{ runner.os }}-node-${{ hashFiles('**/package-lock.json') }}

# GitLab CI
cache:
  key: ${CI_COMMIT_REF_SLUG}
  paths:
    - node_modules/
```

### 2. Fail Fast

Configure your CI to fail immediately on critical issues:

```yaml
- name: Fail on Critical Issues
  run: |
    CRITICAL=$(jq '.critical_count' mcp-report.json)
    if [ "$CRITICAL" -gt 0 ]; then
      echo "::error::Found $CRITICAL critical issues"
      exit 1
    fi
```

### 3. Parallel Jobs

Run analyses in parallel to save time:

```yaml
jobs:
  security:
    # runs in parallel
  performance:
    # runs in parallel
  test-coverage:
    # runs in parallel
```

### 4. Scheduled Scans

Run comprehensive scans nightly:

```yaml
on:
  schedule:
    - cron: '0 2 * * *'  # 2 AM daily
```

### 5. Matrix Testing

Test across multiple Node versions:

```yaml
strategy:
  matrix:
    node-version: [16, 18, 20]
```

## Monitoring and Reporting

### Metrics to Track

- Critical issues count
- Security vulnerabilities
- Test coverage percentage
- Performance regressions
- Code quality trends

### Dashboard Integration

Export results to monitoring dashboards:

```bash
# Export to DataDog
npx @react-native-mcp/cli export-metrics \
  --format datadog \
  --api-key $DATADOG_API_KEY

# Export to Grafana
npx @react-native-mcp/cli export-metrics \
  --format prometheus \
  --output metrics.txt
```

## Troubleshooting

### Issue: CI Timeout

**Solution**: Increase timeout and optimize

```yaml
timeout-minutes: 30  # Increase from default

# Or cache MCP server installation
- uses: actions/cache@v3
  with:
    path: ~/.npm
    key: mcp-server-${{ hashFiles('**/package-lock.json') }}
```

### Issue: False Positives

**Solution**: Configure ignore patterns

Create `.mcpignore`:
```
node_modules/
build/
dist/
*.test.ts
```

---

**Related Examples**:
- [VS Code Setup](./vscode-setup.md)
- [Claude Desktop Configuration](./claude-desktop-setup.md)
- [Getting Started](../basic-usage/getting-started.md)
