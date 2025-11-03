# React Native MCP Server

<div align="center">

[![npm version](https://badge.fury.io/js/%40mrnitro360%2Freact-native-mcp-guide.svg)](https://badge.fury.io/js/%40mrnitro360%2Freact-native-mcp-guide)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Model Context Protocol](https://img.shields.io/badge/MCP-1.1.0-blue.svg)](https://modelcontextprotocol.io/)
[![PR Checks](https://github.com/MrNitro360/React-Native-MCP/actions/workflows/pr-checks.yml/badge.svg)](https://github.com/MrNitro360/React-Native-MCP/actions/workflows/pr-checks.yml)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue.svg)](https://www.typescriptlang.org/)
[![React Native](https://img.shields.io/badge/React%20Native-0.72+-blue.svg)](https://reactnative.dev/)



[![Lines](./coverage/badge-lines.svg)]
[![Branches](./coverage/badge-branches.svg)]
[![Functions](./coverage/badge-functions.svg)]
[![Statements](./coverage/badge-statements.svg)]


**Professional AI-powered React Native development companion with expert-level code remediation**

*Expert remediation • Automated fixes • Industry best practices • Enterprise security*

</div>

## Overview

A comprehensive Model Context Protocol (MCP) server designed for professional React Native development teams. This tool provides intelligent code analysis, **expert-level automated code remediation**, security auditing, and performance optimization with production-ready fixes.

**🆕 v2.0.0 - Enterprise Architecture & Performance:**

- 🏗️ **Modular Architecture** - Clean, maintainable service-based design with dependency injection
- ⚡ **Advanced Caching** - LRU cache with intelligent eviction and performance optimization
- 🧪 **Comprehensive Testing** - 478 tests with 91.38% branch coverage
- 📊 **Error Handling** - Structured logging with circuit breaker and retry mechanisms
- 🔧 **Expert Code Remediation** - Automatically fix security, performance, and quality issues
- 🏗️ **Advanced Refactoring** - Comprehensive component modernization and optimization

**Key Benefits:**

- 🚀 **Accelerated Development** - Automated code analysis, fixing, and test generation
- 🔒 **Enterprise Security** - Vulnerability detection with automatic remediation
- 📊 **Quality Assurance** - Industry-standard testing frameworks and coverage analysis
- ⚡ **Performance Optimization** - Advanced profiling with automatic fixes
- 🎯 **Best Practices** - Expert guidance with code implementation
- 🔄 **Automated Updates** - Continuous integration with automatic version management

---

## Quick Start

### Prerequisites

- **Node.js** 18.0 or higher
- **Claude CLI** or **Claude Desktop**
- **React Native** development environment

### Installation

#### Automated Installation (Recommended)

```bash
# Install globally via npm
npm install -g @mrnitro360/react-native-mcp-guide

# Configure with Claude CLI
claude mcp add react-native-guide npx @mrnitro360/react-native-mcp-guide
```

#### Development Installation

```bash
# Clone repository
git clone https://github.com/MrNitro360/React-Native-MCP.git
cd React-Native-MCP

# Install dependencies and build
npm install && npm run build

# Add to Claude CLI
claude mcp add react-native-guide node ./build/index.js
```

### Verification

```bash
claude mcp list
```

Verify that `react-native-guide` appears as **Connected** ✅

---

## 🆕 Expert Remediation Examples

### Before vs. After: Automatic Code Fixing

**❌ Before (Problematic Code):**
```typescript
const MyComponent = () => {
  const apiKey = "sk-1234567890abcdef"; // Hardcoded secret
  const [data, setData] = useState([]);
  
  useEffect(() => {
    console.log("API Key:", apiKey); // Sensitive logging
    fetch('http://api.example.com/data') // HTTP instead of HTTPS
      .then(response => response.json())
      .then(data => setData(data));
      
    const interval = setInterval(() => { // Memory leak
      console.log('Polling...');
    }, 1000);
  }, []);

  return (
    <ScrollView>
      {data.map(item => ( // Performance issue
        <Text key={item.id} style={{color: 'red'}}>{item.name}</Text>
      ))}
    </ScrollView>
  );
};
```

**✅ After (Expert Remediation):**
```typescript
interface Props {
  children?: React.ReactNode;
  onPress?: () => void;
}

const MyComponent: React.FC<Props> = () => {
  // TODO: Add API_KEY to your environment variables
  const apiKey = process.env.API_KEY || Config.API_KEY;
  const [data, setData] = useState([]);
  
  useEffect(() => {
    // Removed sensitive logging for security
    // console.log('[REDACTED - contains sensitive data]');
    
    // Upgraded to HTTPS for security
    fetch('https://api.example.com/data')
      .then(response => response.json())
      .then(data => setData(data));
      
    const interval = setInterval(() => {
      console.log('Polling...');
    }, 1000);
    
    // Cleanup intervals to prevent memory leaks
    return () => {
      clearInterval(interval);
    };
  }, []);

  return (
    <FlatList
      data={data}
      keyExtractor={(item, index) => item.id?.toString() || index.toString()}
      renderItem={({ item }) => (
        <Text style={styles.itemText}>{item.name}</Text>
      )}
    />
  );
};

const styles = StyleSheet.create({
  itemText: {
    color: 'red'
  }
});

export default React.memo(MyComponent);
```

**🎯 What Got Fixed Automatically:**
- ✅ **Security**: Hardcoded API key → Environment variable
- ✅ **Security**: Sensitive logging → Sanitized
- ✅ **Security**: HTTP → HTTPS upgrade
- ✅ **Performance**: ScrollView + map → FlatList with keyExtractor
- ✅ **Memory**: Added interval cleanup to prevent leaks
- ✅ **Best Practices**: Inline styles → StyleSheet.create
- ✅ **Type Safety**: Added TypeScript interface
- ✅ **Performance**: Wrapped with React.memo

---

## Core Features

### 🔧 Expert Code Remediation (NEW in v1.1.0)

| Tool | Capability | Level | Output |
|------|------------|-------|--------|
| **`remediate_code`** | Automatic security, performance, and quality fixes | Expert | Production-ready code |
| **`refactor_component`** | Advanced component modernization and optimization | Senior | Refactored components with tests |
| **Security Remediation** | Hardcoded secrets → environment variables | Enterprise | Secure code patterns |
| **Performance Fixes** | Memory leaks, FlatList optimization, StyleSheet | Expert | Optimized components |
| **Type Safety** | Automatic TypeScript interface generation | Professional | Type-safe code |

### 🧪 Advanced Testing Suite

| Feature | Description | Frameworks |
|---------|-------------|------------|
| **Automated Test Generation** | Industry-standard test suites for components | Jest, Testing Library |
| **Coverage Analysis** | Detailed reports with improvement strategies | Jest Coverage, LCOV |
| **Strategy Evaluation** | Testing approach analysis and recommendations | Unit, Integration, E2E |
| **Framework Integration** | Multi-platform testing support | Detox, Maestro, jest-axe |

### 🔍 Comprehensive Analysis Tools

| Analysis Type | Capabilities | Output |
|---------------|--------------|--------|
| **Security Auditing** | Vulnerability detection with auto-remediation | Risk-prioritized reports + fixes |
| **Performance Profiling** | Memory, rendering, bundle optimization + fixes | Actionable recommendations + code |
| **Code Quality** | Complexity analysis with refactoring implementation | Maintainability metrics + fixes |
| **Accessibility** | WCAG compliance with automatic improvements | Compliance reports + code |

### 📦 Dependency Management

- **Automated Package Auditing** - Security vulnerabilities and outdated dependencies
- **Intelligent Upgrades** - React Native compatibility validation
- **Conflict Resolution** - Dependency tree optimization
- **Migration Assistance** - Deprecated package modernization

### 📚 Expert Knowledge Base

- **React Native Documentation** - Complete API references and guides
- **Architecture Patterns** - Scalable application design principles  
- **Platform Guidelines** - iOS and Android specific best practices
- **Security Standards** - Mobile application security frameworks

---

## Usage Examples

### 🔧 Expert Code Remediation (NEW)

```bash
# Automatically fix all detected issues with expert-level solutions
claude "remediate_code with remediation_level='expert' and add_comments=true"

# Advanced component refactoring with performance optimization
claude "refactor_component with refactor_type='comprehensive' and include_tests=true"

# Security-focused remediation
claude "remediate_code with issues=['hardcoded_secrets', 'sensitive_logging'] and remediation_level='expert'"

# Performance-focused refactoring
claude "refactor_component with refactor_type='performance' and target_rn_version='latest'"
```

### Testing & Quality Assurance

```bash
# Generate comprehensive component tests
claude "generate_component_test with component_name='LoginForm' and test_type='comprehensive'"

# Analyze testing strategy
claude "analyze_testing_strategy with focus_areas=['unit', 'accessibility', 'performance']"

# Generate coverage report
claude "analyze_test_coverage with coverage_threshold=85"
```

### Code Analysis & Optimization

```bash
# Comprehensive codebase analysis with auto-remediation suggestions
claude "analyze_codebase_comprehensive"

# Performance optimization with specific focus areas
claude "analyze_codebase_performance with focus_areas=['memory_usage', 'list_rendering']"

# Security audit with vulnerability detection
claude "analyze_codebase_comprehensive with analysis_types=['security', 'performance']"
```

### Dependency Management

```bash
# Package upgrade recommendations
claude "upgrade_packages with update_level='minor'"

# Resolve dependency conflicts
claude "resolve_dependencies with fix_conflicts=true"

# Security vulnerability audit
claude "audit_packages with auto_fix=true"
```

### Real-World Scenarios

| Scenario | Command | Outcome |
|----------|---------|---------|
| **🔧 Automatic Code Fixing** | `"Fix all security and performance issues in my component with expert solutions"` | Production-ready remediated code |
| **🏗️ Component Modernization** | `"Refactor my legacy component to modern React Native patterns with tests"` | Modernized component + test suite |
| **🛡️ Security Hardening** | `"Automatically fix hardcoded secrets and security vulnerabilities"` | Secure code with environment variables |
| **⚡ Performance Optimization** | `"Fix memory leaks and optimize FlatList performance automatically"` | Optimized code with cleanup |
| **📝 Type Safety Enhancement** | `"Add TypeScript interfaces and improve type safety automatically"` | Type-safe code with interfaces |
| **Pre-deployment Security Check** | `"Scan my React Native project for security vulnerabilities"` | Security report + automatic fixes |
| **Performance Bottleneck Analysis** | `"Analyze my app for performance bottlenecks and memory leaks"` | Optimization roadmap + fixes |
| **Code Quality Review** | `"Review my codebase for refactoring opportunities"` | Quality improvement + implementation |
| **Accessibility Compliance** | `"Check my app for accessibility issues and fix them automatically"` | WCAG compliance + code fixes |
| **Component Test Generation** | `"Generate comprehensive tests for my LoginScreen component"` | Complete test suite |
| **Testing Strategy Optimization** | `"Analyze my current testing strategy and suggest improvements"` | Testing roadmap |

---

## Claude Desktop Integration

### NPM Installation Configuration

Add to your `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "react-native-guide": {
      "command": "npx",
      "args": ["@mrnitro360/react-native-mcp-guide@2.0.0"],
      "env": {}
    }
  }
}
```

### Development Configuration

```json
{
  "mcpServers": {
    "react-native-guide": {
      "command": "node",
      "args": ["/absolute/path/to/React-Native-MCP/build/index.js"],
      "env": {}
    }
  }
}
```

**Configuration Paths:**
- **Windows:** `C:\Users\{Username}\Desktop\React-Native-MCP\build\index.js`
- **macOS/Linux:** `/Users/{Username}/Desktop/React-Native-MCP/build/index.js`

---

## Development & Maintenance

### Local Development

```bash
# Development with hot reload
npm run dev

# Production build
npm run build

# Production server
npm start
```

### Continuous Integration

This project implements enterprise-grade CI/CD:

- ✅ **Automated Version Management** - Semantic versioning with auto-increment
- ✅ **Continuous Deployment** - Automatic npm publishing on merge
- ✅ **Release Automation** - GitHub releases with comprehensive changelogs
- ✅ **Quality Gates** - Build validation and testing before deployment

### Update Management

```bash
# Check current version
npm list -g @mrnitro360/react-native-mcp-guide

# Update to latest version
npm update -g @mrnitro360/react-native-mcp-guide

# Reconfigure Claude CLI
claude mcp remove react-native-guide
claude mcp add react-native-guide npx @mrnitro360/react-native-mcp-guide
```

---

## Technical Specifications

### 🎯 Analysis & Remediation Capabilities

- **Expert Code Remediation** - Automatic fixing of security, performance, and quality issues
- **Advanced Component Refactoring** - Comprehensive modernization with test generation
- **Comprehensive Codebase Analysis** - Multi-dimensional quality assessment with fixes
- **Enterprise Security Auditing** - Vulnerability detection with automatic remediation
- **Performance Intelligence** - Memory, rendering, and bundle optimization with fixes
- **Quality Metrics** - Complexity analysis with refactoring implementation
- **Accessibility Compliance** - WCAG 2.1 AA standard validation with automatic fixes
- **Testing Strategy Optimization** - Coverage analysis and framework recommendations

### 🛠️ Technical Architecture

- **12 Specialized Tools** - Complete React Native development lifecycle coverage + remediation
- **2 Expert Remediation Tools** - `remediate_code` and `refactor_component`
- **6 Expert Prompt Templates** - Structured development workflows
- **5 Resource Libraries** - Comprehensive documentation and best practices
- **Industry-Standard Test Generation** - Automated test suite creation
- **Multi-Framework Integration** - Jest, Detox, Maestro, and accessibility tools
- **Real-time Coverage Analysis** - Detailed reporting with improvement strategies
- **Production-Ready Code Generation** - Expert-level automated fixes and refactoring

### 🏢 Enterprise Features

- **Expert-Level Remediation** - Senior engineer quality automatic code fixes
- **Production-Ready Solutions** - Enterprise-grade security and performance fixes
- **Professional Reporting** - Executive-level summaries with implementation code
- **Security-First Architecture** - Comprehensive vulnerability assessment with fixes
- **Scalability Planning** - Large-scale application design patterns with refactoring
- **Compliance Support** - Industry standards with automatic compliance fixes
- **Multi-Platform Optimization** - iOS and Android specific considerations with fixes

---

## 📋 Changelog

### v2.0.0 - Enterprise Architecture & Performance (Latest)

**🚀 Major Features:**
- 🏗️ **Modular Architecture** - Complete refactor into service-based design with dependency injection
- ⚡ **Advanced Caching** - LRU cache system with intelligent eviction and performance optimization
- 🧪 **Comprehensive Testing** - 478 tests with 91.38% branch coverage and automated badge generation
- 📊 **Error Handling** - Structured logging infrastructure with circuit breaker and retry mechanisms
- 🔧 **Performance Optimization** - Memory management and cache efficiency improvements
- 🎯 **Code Quality** - Enhanced TypeScript types and error handling throughout

**🎯 Architecture Improvements:**
- Service layer extraction and modularization
- Dependency injection for better testability
- Centralized error handling and logging
- Cache performance monitoring and metrics
- Automated test coverage reporting
- Circuit breaker pattern for resilience

### v1.1.0 - Expert Code Remediation

**🚀 Major Features:**
- ✨ **NEW**: `remediate_code` tool - Expert-level automatic code fixing
- ✨ **NEW**: `refactor_component` tool - Advanced component refactoring with tests
- 🔧 **Enhanced**: Component detection accuracy improved
- 🛡️ **Security**: Automatic hardcoded secret remediation
- ⚡ **Performance**: Memory leak prevention and FlatList optimization
- 📝 **Quality**: TypeScript interface generation and StyleSheet extraction
- 🎯 **Accessibility**: WCAG compliance with automatic fixes

**🎯 Remediation Capabilities:**
- Hardcoded secrets → Environment variables
- Sensitive logging → Sanitized code
- HTTP requests → HTTPS enforcement
- Memory leaks → Automatic cleanup
- Inline styles → StyleSheet.create
- Performance issues → Optimized patterns
- Type safety → TypeScript interfaces

### v1.0.5 - Previous Version
- Comprehensive analysis tools
- Testing suite generation
- Dependency management
- Performance optimization guidance

---

## Support & Community

### Resources

- 📦 **[NPM Package](https://www.npmjs.com/package/@mrnitro360/react-native-mcp-guide)** - Official package repository
- 🐙 **[GitHub Repository](https://github.com/MrNitro360/React-Native-MCP)** - Source code and development
- 🐛 **[Issue Tracker](https://github.com/MrNitro360/React-Native-MCP/issues)** - Bug reports and feature requests
- 📖 **[MCP Documentation](https://modelcontextprotocol.io/)** - Model Context Protocol specification
- ⚛️ **[React Native Docs](https://reactnative.dev/)** - Official React Native documentation

### Contributing

We welcome contributions from the React Native community. Please review our [Contributing Guidelines](CONTRIBUTING.md) for development standards and submission processes.

### License

This project is licensed under the [MIT License](LICENSE). See the license file for detailed terms and conditions.

---

<div align="center">

**Professional React Native Development with Expert-Level Remediation**

*Empowering development teams to build secure, performant, and accessible mobile applications with automated expert-level code fixes*

🆕 **v2.0.0 - Enterprise Architecture & Performance!**

[Get Started](https://www.npmjs.com/package/@mrnitro360/react-native-mcp-guide) • [Documentation](https://github.com/MrNitro360/React-Native-MCP) • [Community](https://github.com/MrNitro360/React-Native-MCP/issues)

</div>
