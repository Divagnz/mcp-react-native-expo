import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import * as fs from 'fs';
import * as path from 'path';
import { exec, spawn } from 'child_process';
import { promisify } from 'util';
import { VersionUtils } from './modules/utils/version-utils.js';
import { FileScanner } from './modules/utils/file-scanner.js';
import { ReportFormatter } from './modules/formatters/report-formatter.js';
import { SecurityAnalyzer } from './modules/analysis/security-analyzer.js';
import { CodeQualityAnalyzer } from './modules/analysis/code-quality-analyzer.js';
import { DeprecatedFeaturesAnalyzer } from './modules/analysis/deprecated-features-analyzer.js';
import { TestingAnalyzer } from './modules/analysis/testing-analyzer.js';
import { PackageUpgradesAnalyzer } from './modules/analysis/package-upgrades-analyzer.js';
import { AdvisoryService } from './modules/advisory/advisory-service.js';
import { ComponentAnalyzer } from './modules/analysis/component-analyzer.js';
import { PackageManagementService } from './modules/services/package-management-service.js';
import { FileAnalysisService } from './modules/services/file-analysis-service.js';
import { CodeRemediationService } from './modules/services/code-remediation-service.js';
import { TestGenerationService } from './modules/services/test-generation-service.js';
import { TestingAnalysisService } from './modules/services/testing-analysis-service.js';

/**
 * React Native Tools
 *
 * Provides tools for React Native development guidance and analysis
 */
export class ReactNativeTools {
  constructor(private server: McpServer) {}

  register() {
    // Register all testing tools
    this.register_test_generation();

    // Component Analysis Tool - Enhanced with codebase support
    this.server.tool(
      'analyze_component',
      'Analyze React Native component for best practices',
      {
        code: z
          .string()
          .optional()
          .describe(
            'React Native component code to analyze. If not provided, analyzes entire codebase'
          ),
        type: z.enum(['functional', 'class', 'hook']).optional().describe('Component type'),
        codebase_path: z
          .string()
          .optional()
          .describe('Path to React Native project root for codebase analysis'),
      },
      async ({ code, type, codebase_path }) => {
        let analysis: string;

        if (code) {
          // Analyze single component
          analysis = ComponentAnalyzer.analyzeComponent(code, type);
        } else {
          // Analyze entire codebase
          analysis = await this.analyzeCodebase(codebase_path || process.cwd());
        }

        return {
          content: [
            {
              type: 'text',
              text: analysis,
            },
          ],
        };
      }
    );

    // Codebase Performance Analysis Tool
    this.server.tool(
      'analyze_codebase_performance',
      'Analyze entire React Native codebase for performance issues',
      {
        codebase_path: z.string().optional().describe('Path to React Native project root'),
        focus_areas: z
          .array(
            z.enum([
              'list_rendering',
              'navigation',
              'animations',
              'memory_usage',
              'bundle_size',
              'startup_time',
              'all',
            ])
          )
          .optional()
          .describe('Specific performance areas to focus on'),
      },
      async ({ codebase_path, focus_areas = ['all'] }) => {
        const analysis = await this.analyzeCodebasePerformance(
          codebase_path || process.cwd(),
          focus_areas
        );
        return {
          content: [
            {
              type: 'text',
              text: analysis,
            },
          ],
        };
      }
    );

    // Comprehensive Codebase Analysis Tool
    this.server.tool(
      'analyze_codebase_comprehensive',
      'Comprehensive React Native codebase analysis including performance, security, refactoring, and upgrades',
      {
        codebase_path: z.string().optional().describe('Path to React Native project root'),
        analysis_types: z
          .array(
            z.enum([
              'performance',
              'security',
              'code_quality',
              'refactoring',
              'deprecated_features',
              'upgrades',
              'accessibility',
              'testing',
              'all',
            ])
          )
          .optional()
          .describe('Types of analysis to perform'),
      },
      async ({ codebase_path, analysis_types = ['all'] }) => {
        const analysis = await this.analyzeCodebaseComprehensive(
          codebase_path || process.cwd(),
          analysis_types
        );

        return {
          content: [
            {
              type: 'text',
              text: analysis,
            },
          ],
        };
      }
    );

    // Performance Optimization Tool (existing)
    this.server.tool(
      'optimize_performance',
      'Get performance optimization suggestions for React Native',
      {
        scenario: z
          .enum([
            'list_rendering',
            'navigation',
            'animations',
            'memory_usage',
            'bundle_size',
            'startup_time',
          ])
          .describe('Performance scenario to optimize'),
        platform: z.enum(['ios', 'android', 'both']).optional().describe('Target platform'),
      },
      async ({ scenario, platform = 'both' }) => {
        const suggestions = AdvisoryService.getPerformanceOptimizations(scenario, platform);
        return {
          content: [
            {
              type: 'text',
              text: suggestions,
            },
          ],
        };
      }
    );

    // Architecture Guidance Tool
    this.server.tool(
      'architecture_advice',
      'Get React Native architecture and project structure advice',
      {
        project_type: z
          .enum(['simple_app', 'complex_app', 'enterprise_app', 'library', 'monorepo'])
          .describe('Type of React Native project'),
        features: z.array(z.string()).optional().describe('Key features of the app'),
      },
      async ({ project_type, features = [] }) => {
        const advice = AdvisoryService.getArchitectureAdvice(project_type, features);
        return {
          content: [
            {
              type: 'text',
              text: advice,
            },
          ],
        };
      }
    );

    // Debugging Guide Tool
    this.server.tool(
      'debug_issue',
      'Get debugging guidance for React Native issues',
      {
        issue_type: z
          .enum([
            'crash',
            'performance',
            'ui_layout',
            'navigation',
            'state_management',
            'network',
            'platform_specific',
          ])
          .describe('Type of issue to debug'),
        platform: z
          .enum(['ios', 'android', 'both'])
          .optional()
          .describe('Platform where issue occurs'),
        error_message: z.string().optional().describe('Error message if available'),
      },
      async ({ issue_type, platform = 'both', error_message }) => {
        const guidance = AdvisoryService.getDebuggingGuidance(issue_type, platform, error_message);
        return {
          content: [
            {
              type: 'text',
              text: guidance,
            },
          ],
        };
      }
    );

    // Update Checker Tool
    this.server.tool(
      'check_for_updates',
      'Check for available updates to the React Native MCP server',
      {
        include_changelog: z.boolean().optional().describe('Include changelog in the response'),
      },
      async ({ include_changelog = false }) => {
        const updateInfo = await this.checkForUpdates(include_changelog);
        return {
          content: [
            {
              type: 'text',
              text: updateInfo,
            },
          ],
        };
      }
    );

    // Version Info Tool - Simple utility for getting MCP server version
    this.server.tool(
      'get_version_info',
      'Get React Native MCP Server version and build information',
      {
        include_build_info: z.boolean().optional().describe('Include detailed build information'),
      },
      async ({ include_build_info = false }) => {
        const versionInfo = this.getVersionInfo(include_build_info);
        return {
          content: [
            {
              type: 'text',
              text: versionInfo,
            },
          ],
        };
      }
    );

    // Code Remediation Tool - Expert-level automatic code fixing
    this.server.tool(
      'remediate_code',
      'Automatically fix React Native code issues with expert-level solutions',
      {
        code: z.string().describe('React Native code to remediate'),
        issues: z
          .array(z.string())
          .optional()
          .describe('Specific issues to fix (if not provided, auto-detects all)'),
        remediation_level: z
          .enum(['basic', 'comprehensive', 'expert'])
          .optional()
          .describe('Level of remediation to apply'),
        preserve_formatting: z
          .boolean()
          .optional()
          .describe('Whether to preserve original code formatting'),
        add_comments: z
          .boolean()
          .optional()
          .describe('Whether to add explanatory comments to fixes'),
      },
      async ({
        code,
        issues = [],
        remediation_level = 'expert',
        preserve_formatting = true,
        add_comments = true,
      }) => {
        const remediation = await this.remediateCode(
          code,
          issues,
          remediation_level,
          preserve_formatting,
          add_comments
        );
        return {
          content: [
            {
              type: 'text',
              text: remediation,
            },
          ],
        };
      }
    );

    // Code Refactoring Tool - Advanced refactoring suggestions
    this.server.tool(
      'refactor_component',
      'Provide expert-level refactoring suggestions and implementations',
      {
        code: z.string().describe('React Native component code to refactor'),
        refactor_type: z
          .enum([
            'performance',
            'maintainability',
            'accessibility',
            'type_safety',
            'modern_patterns',
            'comprehensive',
          ])
          .describe('Type of refactoring to apply'),
        target_rn_version: z
          .string()
          .optional()
          .describe('Target React Native version for refactoring'),
        include_tests: z.boolean().optional().describe('Whether to include test updates'),
      },
      async ({ code, refactor_type, target_rn_version = 'latest', include_tests = false }) => {
        const refactoring = await this.refactorComponent(
          code,
          refactor_type,
          target_rn_version,
          include_tests
        );
        return {
          content: [
            {
              type: 'text',
              text: refactoring,
            },
          ],
        };
      }
    );

    // Package Upgrade Tool
    this.server.tool(
      'upgrade_packages',
      'Automatically check for package updates and provide upgrade recommendations',
      {
        project_path: z.string().optional().describe('Path to React Native project root'),
        package_manager: z
          .enum(['npm', 'yarn', 'pnpm'])
          .optional()
          .describe('Package manager to use'),
        update_level: z
          .enum(['patch', 'minor', 'major', 'all'])
          .optional()
          .describe('Level of updates to include'),
        auto_apply: z.boolean().optional().describe('Whether to automatically apply safe updates'),
        check_vulnerabilities: z
          .boolean()
          .optional()
          .describe('Whether to check for security vulnerabilities'),
      },
      async ({
        project_path,
        package_manager = 'npm',
        update_level = 'minor',
        auto_apply = false,
        check_vulnerabilities = true,
      }) => {
        const result = await PackageManagementService.upgradePackages(
          project_path || process.cwd(),
          package_manager,
          update_level,
          auto_apply,
          check_vulnerabilities
        );
        return {
          content: [
            {
              type: 'text',
              text: result,
            },
          ],
        };
      }
    );

    // Dependency Resolution Tool
    this.server.tool(
      'resolve_dependencies',
      'Analyze and resolve dependency conflicts in React Native projects',
      {
        project_path: z.string().optional().describe('Path to React Native project root'),
        package_manager: z
          .enum(['npm', 'yarn', 'pnpm'])
          .optional()
          .describe('Package manager to use'),
        fix_conflicts: z
          .boolean()
          .optional()
          .describe('Whether to automatically attempt to fix conflicts'),
        generate_resolutions: z
          .boolean()
          .optional()
          .describe('Whether to generate resolution suggestions'),
      },
      async ({
        project_path,
        package_manager = 'npm',
        fix_conflicts = false,
        generate_resolutions = true,
      }) => {
        const result = await PackageManagementService.resolveDependencies(
          project_path || process.cwd(),
          package_manager,
          fix_conflicts,
          generate_resolutions
        );
        return {
          content: [
            {
              type: 'text',
              text: result,
            },
          ],
        };
      }
    );

    // Package Security Audit Tool
    this.server.tool(
      'audit_packages',
      'Perform security audit on project dependencies and provide fix recommendations',
      {
        project_path: z.string().optional().describe('Path to React Native project root'),
        package_manager: z
          .enum(['npm', 'yarn', 'pnpm'])
          .optional()
          .describe('Package manager to use'),
        auto_fix: z.boolean().optional().describe('Whether to automatically fix vulnerabilities'),
        severity_threshold: z
          .enum(['low', 'moderate', 'high', 'critical'])
          .optional()
          .describe('Minimum severity level to report'),
      },
      async ({
        project_path,
        package_manager = 'npm',
        auto_fix = false,
        severity_threshold = 'moderate',
      }) => {
        const result = await PackageManagementService.auditPackages(
          project_path || process.cwd(),
          package_manager,
          auto_fix,
          severity_threshold
        );
        return {
          content: [
            {
              type: 'text',
              text: result,
            },
          ],
        };
      }
    );

    // Package Migration Tool
    this.server.tool(
      'migrate_packages',
      'Migrate deprecated packages to their recommended alternatives',
      {
        project_path: z.string().optional().describe('Path to React Native project root'),
        package_manager: z
          .enum(['npm', 'yarn', 'pnpm'])
          .optional()
          .describe('Package manager to use'),
        auto_migrate: z
          .boolean()
          .optional()
          .describe('Whether to automatically perform migrations'),
        target_packages: z
          .array(z.string())
          .optional()
          .describe('Specific packages to migrate (if not provided, checks all)'),
      },
      async ({ project_path, package_manager = 'npm', auto_migrate = false, target_packages }) => {
        const result = await PackageManagementService.migratePackages(
          project_path || process.cwd(),
          package_manager,
          auto_migrate,
          target_packages
        );
        return {
          content: [
            {
              type: 'text',
              text: result,
            },
          ],
        };
      }
    );
  }

  private getVersionInfo(includeBuildInfo: boolean): string {
    // Try to read package.json to get version
    let version = 'Unknown';
    let packageInfo = {};

    try {
      const packagePath = path.join(process.cwd(), 'package.json');
      if (fs.existsSync(packagePath)) {
        packageInfo = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
        version = (packageInfo as any).version || 'Unknown';
      }
    } catch (error) {
      // Fallback - version info might not be available in all environments
    }

    let info = '# React Native MCP Server Version Information\n\n';
    info += `**Current Version:** ${version}\n`;
    info += '**Package:** @mrnitro360/react-native-mcp-guide\n';
    info += `**Runtime:** Node.js ${process.version}\n`;
    info += `**Platform:** ${process.platform} ${process.arch}\n\n`;

    if (includeBuildInfo) {
      info += '## Build Information\n\n';
      info += `**Process ID:** ${process.pid}\n`;
      info += `**Working Directory:** ${process.cwd()}\n`;
      info += `**Memory Usage:** ${Math.round(process.memoryUsage().rss / 1024 / 1024)}MB\n`;
      info += `**Uptime:** ${Math.round(process.uptime())}s\n\n`;

      info += '## Capabilities\n\n';
      info += '- ✅ Component Analysis\n';
      info += '- ✅ Performance Optimization\n';
      info += '- ✅ Security Auditing\n';
      info += '- ✅ Test Generation\n';
      info += '- ✅ Package Management\n';
      info += '- ✅ Architecture Guidance\n\n';

      info += '## Updates\n\n';
      info += 'To update to the latest version:\n';
      info += '```bash\n';
      info += 'npm update -g @mrnitro360/react-native-mcp-guide\n';
      info += '```\n';
    }

    return info;
  }

  // New codebase analysis methods
  private async analyzeCodebase(projectPath: string): Promise<string> {
    try {
      // Check for updates periodically
      const shouldCheckUpdates = await this.shouldCheckForUpdates();
      let updateNotification = '';

      if (shouldCheckUpdates) {
        const updateInfo = await this.checkForUpdates(false);
        if (updateInfo.includes('Update Available')) {
          updateNotification =
            '\n\n---\n\n### 🔔 Update Notification\n\n' +
            'A new version of the React Native MCP server is available! ' +
            'Run `check_for_updates` for details or `npm run auto-update` to update.\n\n---\n\n';
        }
      }

      const reactNativeFiles = await FileScanner.findReactNativeFiles(projectPath);
      const analysis = {
        totalFiles: reactNativeFiles.length,
        components: [] as any[],
        issues: [] as string[],
        suggestions: [] as string[],
      };

      // Analyze each file
      for (const filePath of reactNativeFiles) {
        const content = await fs.promises.readFile(filePath, 'utf-8');
        const fileAnalysis = FileAnalysisService.analyzeFileContent(content, filePath);
        analysis.components.push(fileAnalysis);
        analysis.issues.push(...fileAnalysis.issues);
        analysis.suggestions.push(...fileAnalysis.suggestions);
      }

      return updateNotification + ReportFormatter.formatCodebaseAnalysis(analysis, projectPath);
    } catch (error) {
      return `Error analyzing codebase: ${error instanceof Error ? error.message : 'Unknown error'}`;
    }
  }

  private async analyzeCodebaseComprehensive(
    projectPath: string,
    analysisTypes: string[]
  ): Promise<string> {
    try {
      const reactNativeFiles = await FileScanner.findReactNativeFiles(projectPath);
      const packageJsonPath = path.join(projectPath, 'package.json');

      let packageJson: any = {};
      try {
        const packageContent = await fs.promises.readFile(packageJsonPath, 'utf-8');
        packageJson = JSON.parse(packageContent);
      } catch {
        // No package.json found
      }

      const analysis = {
        totalFiles: reactNativeFiles.length,
        packageJson,
        performance: [] as any[],
        security: [] as any[],
        codeQuality: [] as any[],
        refactoring: [] as any[],
        deprecated: [] as any[],
        upgrades: [] as any[],
        accessibility: [] as any[],
        testing: [] as any[],
      };

      // Analyze each file
      for (const filePath of reactNativeFiles) {
        const content = await fs.promises.readFile(filePath, 'utf-8');
        const fileName = path.basename(filePath);

        if (analysisTypes.includes('all') || analysisTypes.includes('performance')) {
          analysis.performance.push(
            ...FileAnalysisService.analyzeFilePerformance(content, filePath, ['all'])
          );
        }

        if (analysisTypes.includes('all') || analysisTypes.includes('security')) {
          analysis.security.push(...SecurityAnalyzer.analyzeFileSecurity(content, fileName));
        }

        if (analysisTypes.includes('all') || analysisTypes.includes('code_quality')) {
          analysis.codeQuality.push(
            ...CodeQualityAnalyzer.analyzeFileCodeQuality(content, fileName)
          );
        }

        if (analysisTypes.includes('all') || analysisTypes.includes('refactoring')) {
          analysis.refactoring.push(
            ...CodeQualityAnalyzer.analyzeFileRefactoring(content, fileName)
          );
        }

        if (analysisTypes.includes('all') || analysisTypes.includes('deprecated_features')) {
          analysis.deprecated.push(
            ...DeprecatedFeaturesAnalyzer.analyzeFileDeprecated(content, fileName)
          );
        }

        if (analysisTypes.includes('all') || analysisTypes.includes('accessibility')) {
          analysis.accessibility.push(
            ...DeprecatedFeaturesAnalyzer.analyzeFileAccessibility(content, fileName)
          );
        }

        if (analysisTypes.includes('all') || analysisTypes.includes('testing')) {
          analysis.testing.push(...TestingAnalyzer.analyzeFileTesting(content, fileName));
        }
      }

      // Analyze package.json for upgrades
      if (analysisTypes.includes('all') || analysisTypes.includes('upgrades')) {
        analysis.upgrades.push(...PackageUpgradesAnalyzer.analyzePackageUpgrades(packageJson));
      }

      return ReportFormatter.formatComprehensiveAnalysis(analysis, projectPath);
    } catch (error) {
      return `Error in comprehensive analysis: ${error instanceof Error ? error.message : 'Unknown error'}`;
    }
  }

  private async analyzeCodebasePerformance(
    projectPath: string,
    focusAreas: string[]
  ): Promise<string> {
    try {
      const reactNativeFiles = await FileScanner.findReactNativeFiles(projectPath);
      const performanceIssues: any[] = [];

      for (const filePath of reactNativeFiles) {
        const content = await fs.promises.readFile(filePath, 'utf-8');
        const issues = FileAnalysisService.analyzeFilePerformance(content, filePath, focusAreas);
        performanceIssues.push(...issues);
      }

      return ReportFormatter.formatPerformanceAnalysis(performanceIssues, projectPath);
    } catch (error) {
      return `Error analyzing codebase performance: ${error instanceof Error ? error.message : 'Unknown error'}`;
    }
  }

  private async checkForUpdates(includeChangelog: boolean = false): Promise<string> {
    try {
      const currentVersion = await this.getCurrentVersion();
      const latestInfo = await this.getLatestVersionInfo();

      if (!latestInfo) {
        return '❌ Unable to check for updates. Please ensure you have internet connectivity.';
      }

      const isUpdateAvailable =
        VersionUtils.compareVersions(currentVersion, latestInfo.version) < 0;

      let report = '## 🔄 React Native MCP Server Update Status\n\n';
      report += `**Current Version:** ${currentVersion}\n`;
      report += `**Latest Version:** ${latestInfo.version}\n`;
      report += `**Last Checked:** ${new Date().toLocaleString()}\n\n`;

      if (isUpdateAvailable) {
        report += '### 🎉 Update Available!\n\n';
        report += `A new version (${latestInfo.version}) is available with new features and improvements.\n\n`;

        report += '### 📥 How to Update:\n\n';
        report += '**Option 1: Automatic Update**\n';
        report += '```bash\n';
        report += 'cd "C:\\Users\\david\\Desktop\\React-Native MCP"\n';
        report += 'npm run auto-update\n';
        report += '```\n\n';

        report += '**Option 2: Manual Update**\n';
        report += '```bash\n';
        report += 'cd "C:\\Users\\david\\Desktop\\React-Native MCP"\n';
        report += 'git pull origin master\n';
        report += 'npm run deploy\n';
        report += '```\n\n';

        if (includeChangelog && latestInfo.changelog) {
          report += "### 📋 What's New:\n\n";
          report += latestInfo.changelog + '\n\n';
        }

        report += '### ⚡ Benefits of Updating:\n';
        report += '- Latest React Native best practices\n';
        report += '- New analysis capabilities\n';
        report += '- Bug fixes and performance improvements\n';
        report += '- Enhanced security recommendations\n\n';
      } else {
        report += "### ✅ You're Up to Date!\n\n";
        report +=
          'Your React Native MCP server is running the latest version with all the newest features and improvements.\n\n';

        report += '### 🔄 Auto-Update Options:\n';
        report += 'To stay automatically updated, you can:\n';
        report += '- Set up daily auto-updates: `npm run setup-auto-update`\n';
        report += '- Enable continuous monitoring: `npm run watch-updates`\n\n';
      }

      return report;
    } catch (error) {
      return `❌ Error checking for updates: ${error instanceof Error ? error.message : 'Unknown error'}`;
    }
  }

  private async getCurrentVersion(): Promise<string> {
    try {
      const packageJsonPath = path.join(process.cwd(), 'package.json');
      const packageContent = await fs.promises.readFile(packageJsonPath, 'utf-8');
      const packageJson = JSON.parse(packageContent);
      return packageJson.version || '1.0.0';
    } catch {
      return '1.0.0';
    }
  }

  private async getLatestVersionInfo(): Promise<{ version: string; changelog?: string } | null> {
    try {
      // Check GitHub releases API
      const response = await fetch(
        'https://api.github.com/repos/MrNitro360/React-Native-MCP/releases/latest'
      );
      if (response.ok) {
        const data = await response.json();
        return {
          version: data.tag_name.replace(/^v/, ''),
          changelog: data.body,
        };
      }

      // Fallback: Check GitHub commits for version in package.json
      const commitsResponse = await fetch(
        'https://api.github.com/repos/MrNitro360/React-Native-MCP/commits?path=package.json&per_page=1'
      );
      if (commitsResponse.ok) {
        const commits = await commitsResponse.json();
        if (commits.length > 0) {
          // For now, use a simple versioning based on commit date
          const commitDate = new Date(commits[0].commit.author.date);
          const version = `1.${commitDate.getFullYear()}.${commitDate.getMonth() + 1}${commitDate.getDate()}`;
          return {
            version,
            changelog: commits[0].commit.message,
          };
        }
      }

      return null;
    } catch (error) {
      return null;
    }
  }

  private compareVersions(current: string, latest: string): number {
    const currentParts = current.split('.').map(Number);
    const latestParts = latest.split('.').map(Number);

    for (let i = 0; i < Math.max(currentParts.length, latestParts.length); i++) {
      const currentPart = currentParts[i] || 0;
      const latestPart = latestParts[i] || 0;

      if (currentPart < latestPart) {
        return -1;
      }
      if (currentPart > latestPart) {
        return 1;
      }
    }

    return 0;
  }

  private async shouldCheckForUpdates(): Promise<boolean> {
    try {
      const lastCheckFile = path.join(process.cwd(), '.last-update-check');
      let lastCheck = 0;

      try {
        const lastCheckData = await fs.promises.readFile(lastCheckFile, 'utf-8');
        lastCheck = parseInt(lastCheckData);
      } catch {
        // File doesn't exist, first check
      }

      const now = Date.now();
      const twentyFourHours = 24 * 60 * 60 * 1000;

      if (now - lastCheck > twentyFourHours) {
        await fs.promises.writeFile(lastCheckFile, now.toString());
        return true;
      }

      return false;
    } catch {
      return false;
    }
  }

  // React Native Component Test Generation Tool
  register_test_generation() {
    this.server.tool(
      'generate_component_test',
      'Generate comprehensive React Native component tests following industry best practices',
      {
        component_code: z.string().describe('React Native component code to generate tests for'),
        component_name: z.string().describe('Name of the component'),
        test_type: z
          .enum(['unit', 'integration', 'e2e', 'comprehensive'])
          .default('comprehensive')
          .describe('Type of tests to generate'),
        testing_framework: z
          .enum(['jest', 'detox', 'maestro'])
          .default('jest')
          .describe('Testing framework preference'),
        include_accessibility: z.boolean().default(true).describe('Include accessibility tests'),
        include_performance: z.boolean().default(true).describe('Include performance tests'),
        include_snapshot: z.boolean().default(true).describe('Include snapshot tests'),
      },
      async ({
        component_code,
        component_name,
        test_type,
        testing_framework,
        include_accessibility,
        include_performance,
        include_snapshot,
      }) => {
        const testCode = TestGenerationService.generateComponentTests({
          component_code,
          component_name,
          test_type,
          testing_framework,
          include_accessibility,
          include_performance,
          include_snapshot,
        });

        return {
          content: [
            {
              type: 'text',
              text: testCode,
            },
          ],
        };
      }
    );

    // Testing Strategy Analysis Tool
    this.server.tool(
      'analyze_testing_strategy',
      'Analyze current testing strategy and provide recommendations',
      {
        project_path: z.string().optional().describe('Path to React Native project root'),
        focus_areas: z
          .array(z.enum(['unit', 'integration', 'e2e', 'accessibility', 'performance', 'security']))
          .default(['unit', 'integration', 'accessibility'])
          .describe('Areas to focus testing analysis on'),
      },
      async ({ project_path, focus_areas }) => {
        const analysis = await TestingAnalysisService.analyzeTestingStrategy(
          project_path || process.cwd(),
          focus_areas
        );

        return {
          content: [
            {
              type: 'text',
              text: analysis,
            },
          ],
        };
      }
    );

    // Test Coverage Analysis Tool
    this.server.tool(
      'analyze_test_coverage',
      'Analyze test coverage and identify gaps',
      {
        project_path: z.string().optional().describe('Path to React Native project root'),
        coverage_threshold: z
          .number()
          .default(80)
          .describe('Minimum coverage threshold percentage'),
        generate_report: z.boolean().default(true).describe('Generate detailed coverage report'),
      },
      async ({ project_path, coverage_threshold, generate_report }) => {
        const coverageAnalysis = await this.analyzeTestCoverage(
          project_path || process.cwd(),
          coverage_threshold,
          generate_report
        );

        return {
          content: [
            {
              type: 'text',
              text: coverageAnalysis,
            },
          ],
        };
      }
    );
  }

  private async analyzeTestCoverage(
    projectPath: string,
    threshold: number,
    generateReport: boolean
  ): Promise<string> {
    let analysis = '# 📊 Test Coverage Analysis\n\n';

    try {
      // Check if Jest is configured
      const jestConfigExists =
        fs.existsSync(path.join(projectPath, 'jest.config.js')) ||
        fs.existsSync(path.join(projectPath, 'jest.config.json'));

      if (!jestConfigExists) {
        analysis += '❌ **Jest configuration not found**\n';
        analysis += 'Please set up Jest first before analyzing coverage.\n\n';
        return analysis;
      }

      // Run coverage analysis if requested
      if (generateReport) {
        analysis += '## 🔍 Running Coverage Analysis...\n\n';

        try {
          const execAsync = promisify(exec);
          const { stdout, stderr } = await execAsync('npm test -- --coverage --silent', {
            cwd: projectPath,
            timeout: 30000,
          });

          if (stderr && !stderr.includes('warning')) {
            analysis += `⚠️ **Coverage command had issues:**\n\`\`\`\n${stderr}\n\`\`\`\n\n`;
          }

          // Parse coverage output
          analysis += this.parseCoverageOutput(stdout, threshold);
        } catch (error) {
          analysis += '❌ **Failed to run coverage:**\n';
          analysis += `\`\`\`\n${error}\n\`\`\`\n\n`;
          analysis += '**Possible solutions:**\n';
          analysis += '1. Ensure all dependencies are installed: `npm install`\n';
          analysis += '2. Check Jest configuration\n';
          analysis += '3. Verify test files exist\n\n';
        }
      }

      // Provide coverage improvement suggestions
      analysis += this.generateCoverageRecommendations(threshold);
    } catch (error) {
      analysis += `❌ Error analyzing coverage: ${error}\n\n`;
    }

    return analysis;
  }

  private parseCoverageOutput(output: string, threshold: number): string {
    let report = '## 📈 Coverage Report\n\n';

    // Look for coverage table in output
    const coverageMatch = output.match(
      /File\s+%\s+Stmts\s+%\s+Branch\s+%\s+Funcs\s+%\s+Lines[\s\S]*?(-+)/
    );

    if (coverageMatch) {
      report += `### Detailed Coverage:\n\`\`\`\n${coverageMatch[0]}\n\`\`\`\n\n`;
    }

    // Extract summary percentages
    const summaryMatch = output.match(
      /All files\s+\|\s+([\d.]+)\s+\|\s+([\d.]+)\s+\|\s+([\d.]+)\s+\|\s+([\d.]+)/
    );

    if (summaryMatch) {
      const [, statements, branches, functions, lines] = summaryMatch;
      const metrics = {
        statements: parseFloat(statements),
        branches: parseFloat(branches),
        functions: parseFloat(functions),
        lines: parseFloat(lines),
      };

      report += '### Coverage Summary:\n';
      Object.entries(metrics).forEach(([metric, value]) => {
        const status = value >= threshold ? '✅' : '❌';
        const emoji = value >= threshold ? '🎯' : '⚠️';
        report += `- ${status} **${metric.charAt(0).toUpperCase() + metric.slice(1)}**: ${value}% ${emoji}\n`;
      });

      const overallPassing = Object.values(metrics).every((value) => value >= threshold);
      report += `\n**Overall Status**: ${overallPassing ? '✅ PASSING' : '❌ BELOW THRESHOLD'} (${threshold}%)\n\n`;

      // Identify areas needing improvement
      const needsImprovement = Object.entries(metrics)
        .filter(([, value]) => value < threshold)
        .map(([metric]) => metric);

      if (needsImprovement.length > 0) {
        report += '### 🎯 Areas Needing Improvement:\n';
        needsImprovement.forEach((metric) => {
          report += `- **${metric.charAt(0).toUpperCase() + metric.slice(1)}** coverage is below ${threshold}%\n`;
        });
        report += '\n';
      }
    } else {
      report += '⚠️ Could not parse coverage summary. Check Jest output manually.\n\n';
    }

    return report;
  }

  private generateCoverageRecommendations(threshold: number): string {
    return `## 🎯 Coverage Improvement Strategies

### 1. Identify Uncovered Code
\`\`\`bash
npm test -- --coverage --coverageReporters=text-lcov | npx lcov-result-merger "coverage/lcov.info" | npx lcov-summary
\`\`\`

### 2. Focus on High-Impact Areas
- **Business Logic**: Core functionality and calculations
- **User Interactions**: Button clicks, form submissions
- **Error Handling**: Try-catch blocks and error boundaries
- **Edge Cases**: Boundary conditions and error states

### 3. Testing Strategies by Coverage Type

#### Statements Coverage (${threshold}%+ target)
- Test all code paths and conditional branches
- Include positive and negative test cases
- Test error handling and edge cases

#### Branch Coverage (${threshold}%+ target)
- Test all if/else conditions
- Test switch statement cases
- Test ternary operators
- Test logical operators (&&, ||)

#### Function Coverage (${threshold}%+ target)
- Call every function at least once
- Test function parameters and return values
- Test async functions with promises/callbacks

#### Line Coverage (${threshold}%+ target)
- Execute every line of code
- Focus on untested utility functions
- Test configuration and setup code

### 4. Quick Wins for Better Coverage

#### Add Missing Test Cases
\`\`\`javascript
// Test error scenarios
test('handles network error gracefully', async () => {
  mockAPI.get.mockRejectedValue(new Error('Network error'));
  const { getByText } = render(<MyComponent />);
  await waitFor(() => {
    expect(getByText('Error occurred')).toBeTruthy();
  });
});

// Test edge cases
test('handles empty data', () => {
  const { getByText } = render(<MyComponent data={[]} />);
  expect(getByText('No data available')).toBeTruthy();
});
\`\`\`

#### Mock External Dependencies
\`\`\`javascript
jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({
    navigate: jest.fn(),
    goBack: jest.fn(),
  }),
}));
\`\`\`

### 5. Coverage Quality vs Quantity
- **Quality**: Test meaningful user scenarios
- **Avoid**: Testing implementation details
- **Focus**: Critical business logic and user paths
- **Balance**: Don't chase 100% coverage at expense of test quality

### 6. Automate Coverage Monitoring
\`\`\`json
// package.json
{
  "jest": {
    "coverageThreshold": {
      "global": {
        "branches": ${threshold},
        "functions": ${threshold},
        "lines": ${threshold},
        "statements": ${threshold}
      }
    }
  }
}
\`\`\`

### 7. Coverage Reports
- **HTML Report**: \`npm test -- --coverage --coverageReporters=html\`
- **Text Report**: \`npm test -- --coverage --coverageReporters=text\`
- **LCOV Report**: For CI/CD integration

**Remember**: Good tests are more valuable than high coverage numbers. Focus on testing critical functionality and user scenarios.
`;
  }

  // Expert-level code remediation methods
  private async remediateCode(
    code: string,
    issues: string[],
    level: string,
    preserveFormatting: boolean,
    addComments: boolean
  ): Promise<string> {
    let remediatedCode = code;
    const appliedFixes: string[] = [];
    const detectedIssues =
      issues.length > 0 ? issues : CodeRemediationService.detectAllIssues(code);

    let report = `## 🔧 Expert Code Remediation Report

**Remediation Level:** ${level}
**Issues Detected:** ${detectedIssues.length}
**Formatting Preserved:** ${preserveFormatting ? 'Yes' : 'No'}

`;

    // Security fixes
    remediatedCode = CodeRemediationService.applySecurityFixes(
      remediatedCode,
      appliedFixes,
      addComments
    );

    // Performance optimizations
    remediatedCode = CodeRemediationService.applyPerformanceFixes(
      remediatedCode,
      appliedFixes,
      addComments
    );

    // Memory leak fixes
    remediatedCode = CodeRemediationService.applyMemoryLeakFixes(
      remediatedCode,
      appliedFixes,
      addComments
    );

    // Best practices enforcement
    if (level === 'expert' || level === 'comprehensive') {
      remediatedCode = CodeRemediationService.applyBestPracticesFixes(
        remediatedCode,
        appliedFixes,
        addComments
      );
    }

    // Type safety improvements
    if (level === 'expert') {
      remediatedCode = CodeRemediationService.applyTypeSafetyFixes(
        remediatedCode,
        appliedFixes,
        addComments
      );
    }

    report += `### ✅ Applied Fixes (${appliedFixes.length})

${appliedFixes.map((fix, index) => `${index + 1}. ${fix}`).join('\n')}

### 📝 Remediated Code

\`\`\`typescript
${remediatedCode}
\`\`\`

### 🎯 Next Steps

1. **Test thoroughly** - Run your test suite to ensure fixes work correctly
2. **Review changes** - Validate that the remediation meets your requirements
3. **Update dependencies** - Consider upgrading packages if recommended
4. **Add monitoring** - Implement error tracking for production stability

`;

    return report;
  }

  private async refactorComponent(
    code: string,
    refactorType: string,
    targetVersion: string,
    includeTests: boolean
  ): Promise<string> {
    let report = `## 🚀 Expert Component Refactoring

**Refactor Type:** ${refactorType}
**Target RN Version:** ${targetVersion}
**Include Tests:** ${includeTests ? 'Yes' : 'No'}

`;

    let refactoredCode = code;
    const improvements: string[] = [];

    switch (refactorType) {
      case 'performance':
        refactoredCode = CodeRemediationService.refactorForPerformance(code, improvements);
        break;
      case 'maintainability':
        refactoredCode = CodeRemediationService.refactorForMaintainability(code, improvements);
        break;
      case 'accessibility':
        refactoredCode = CodeRemediationService.refactorForAccessibility(code, improvements);
        break;
      case 'type_safety':
        refactoredCode = CodeRemediationService.refactorForTypeSafety(code, improvements);
        break;
      case 'modern_patterns':
        refactoredCode = CodeRemediationService.refactorToModernPatterns(code, improvements);
        break;
      case 'comprehensive':
        refactoredCode = CodeRemediationService.refactorComprehensive(code, improvements);
        break;
    }

    report += `### 🔧 Applied Improvements (${improvements.length})

${improvements.map((improvement, index) => `${index + 1}. ${improvement}`).join('\n')}

### 📝 Refactored Code

\`\`\`typescript
${refactoredCode}
\`\`\`

`;

    if (includeTests) {
      const testCode = CodeRemediationService.generateRefactoredTests(refactoredCode);
      report += `### 🧪 Updated Tests

\`\`\`typescript
${testCode}
\`\`\`

`;
    }

    report += `### 📊 Performance Impact

- **Bundle Size**: Likely reduced due to optimizations
- **Runtime Performance**: Improved through modern patterns
- **Memory Usage**: Optimized with proper cleanup
- **Accessibility**: Enhanced user experience

### 🔍 Code Quality Metrics

- **Maintainability**: ⬆️ Improved
- **Readability**: ⬆️ Enhanced
- **Testability**: ⬆️ Better
- **Type Safety**: ⬆️ Stronger

`;

    return report;
  }
}
