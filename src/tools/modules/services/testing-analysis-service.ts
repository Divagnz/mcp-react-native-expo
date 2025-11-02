/**
 * Testing analysis service for React Native applications
 * Analyzes testing strategies, coverage, and recommendations
 */

import * as fs from 'fs';
import * as path from 'path';
import { FileScanner } from '../utils/file-scanner.js';

export class TestingAnalysisService {
  static async analyzeTestingStrategy(projectPath: string, focusAreas: string[]): Promise<string> {
    let analysis = '# 🧪 React Native Testing Strategy Analysis\n\n';

    try {
      // Check for existing test files
      const testFiles = await FileScanner.findTestFiles(projectPath);
      analysis += '## 📊 Current Test Coverage\n\n';
      analysis += `- **Test Files Found**: ${testFiles.length}\n`;
      analysis += `- **Test Types Detected**: ${TestingAnalysisService.detectTestTypes(testFiles).join(', ')}\n\n`;

      // Check package.json for testing dependencies
      const packageJsonPath = path.join(projectPath, 'package.json');
      if (fs.existsSync(packageJsonPath)) {
        const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
        const testingDeps = TestingAnalysisService.analyzeTestingDependencies(packageJson);

        analysis += '## 🛠️ Testing Dependencies\n\n';
        analysis += '### Installed:\n';
        testingDeps.installed.forEach((dep) => {
          analysis += `- ✅ ${dep}\n`;
        });

        analysis += '\n### Recommended Additions:\n';
        testingDeps.recommended.forEach((dep) => {
          analysis += `- 🎯 ${dep.name}: ${dep.purpose}\n`;
        });
      }

      // Analyze each focus area
      for (const area of focusAreas) {
        analysis += `\n## ${TestingAnalysisService.getAreaEmoji(area)} ${area.charAt(0).toUpperCase() + area.slice(1)} Testing\n\n`;
        analysis += await TestingAnalysisService.analyzeFocusArea(projectPath, area);
      }

      // Provide comprehensive recommendations
      analysis += '\n## 🎯 Strategic Recommendations\n\n';
      analysis += TestingAnalysisService.generateTestingRecommendations(
        testFiles.length,
        focusAreas
      );

      // Add testing setup guide
      analysis += '\n## 🚀 Quick Setup Guide\n\n';
      analysis += TestingAnalysisService.generateTestingSetupGuide();
    } catch (error) {
      analysis += `❌ Error analyzing project: ${error}\n\n`;
      analysis += 'Please ensure the project path is correct and accessible.\n';
    }

    return analysis;
  }

  static async findTestFiles(projectPath: string): Promise<string[]> {
    const testFiles: string[] = [];
    const testPatterns = [
      /\.test\.(js|jsx|ts|tsx)$/,
      /\.spec\.(js|jsx|ts|tsx)$/,
      /__tests__.*\.(js|jsx|ts|tsx)$/,
    ];

    const walkDir = (dir: string) => {
      if (!fs.existsSync(dir)) {
        return;
      }

      const files = fs.readdirSync(dir);
      for (const file of files) {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);

        if (stat.isDirectory() && !file.startsWith('.') && file !== 'node_modules') {
          walkDir(filePath);
        } else if (stat.isFile()) {
          if (testPatterns.some((pattern) => pattern.test(file))) {
            testFiles.push(filePath);
          }
        }
      }
    };

    walkDir(projectPath);
    return testFiles;
  }

  static detectTestTypes(testFiles: string[]): string[] {
    const types = new Set<string>();

    testFiles.forEach((file) => {
      const content = fs.readFileSync(file, 'utf8');

      if (content.includes('@testing-library/react-native')) {
        types.add('Unit');
      }
      if (content.includes('detox')) {
        types.add('E2E');
      }
      if (content.includes('toMatchSnapshot')) {
        types.add('Snapshot');
      }
      if (content.includes('accessibility')) {
        types.add('Accessibility');
      }
      if (content.includes('performance')) {
        types.add('Performance');
      }
      if (content.includes('integration')) {
        types.add('Integration');
      }
    });

    return Array.from(types);
  }

  static analyzeTestingDependencies(packageJson: any): {
    installed: string[];
    recommended: Array<{ name: string; purpose: string }>;
  } {
    const allDeps = { ...packageJson.dependencies, ...packageJson.devDependencies };
    const testingPackages = [
      'jest',
      '@testing-library/react-native',
      '@testing-library/jest-native',
      'react-test-renderer',
      'detox',
      'maestro-cli',
      'jest-axe',
      '@shopify/react-native-performance',
    ];

    const installed = testingPackages.filter((pkg) => allDeps[pkg]);
    const recommended = [
      { name: '@testing-library/react-native', purpose: 'Component testing with best practices' },
      { name: '@testing-library/jest-native', purpose: 'Additional React Native matchers' },
      { name: 'react-test-renderer', purpose: 'Snapshot testing' },
      { name: 'jest-axe', purpose: 'Accessibility testing' },
      { name: 'detox', purpose: 'End-to-end testing' },
      { name: '@shopify/react-native-performance', purpose: 'Performance testing' },
      { name: 'flipper-plugin-react-native-performance', purpose: 'Performance monitoring' },
    ].filter((pkg) => !installed.includes(pkg.name));

    return { installed, recommended };
  }

  static getAreaEmoji(area: string): string {
    const emojiMap: { [key: string]: string } = {
      unit: '🔧',
      integration: '🔗',
      e2e: '🎭',
      accessibility: '♿',
      performance: '⚡',
      security: '🔒',
    };
    return emojiMap[area] || '📋';
  }

  static async analyzeFocusArea(projectPath: string, area: string): Promise<string> {
    switch (area) {
      case 'unit':
        return TestingAnalysisService.analyzeUnitTesting(projectPath);
      case 'integration':
        return TestingAnalysisService.analyzeIntegrationTesting(projectPath);
      case 'e2e':
        return TestingAnalysisService.analyzeE2ETesting(projectPath);
      case 'accessibility':
        return TestingAnalysisService.analyzeAccessibilityTesting(projectPath);
      case 'performance':
        return TestingAnalysisService.analyzePerformanceTesting(projectPath);
      case 'security':
        return TestingAnalysisService.analyzeSecurityTesting(projectPath);
      default:
        return `Analysis for ${area} is not yet implemented.\n`;
    }
  }

  static analyzeUnitTesting(projectPath: string): string {
    return `### Current State:
- **Framework**: Jest (recommended for React Native)
- **Library**: @testing-library/react-native
- **Coverage**: Run \`npm test -- --coverage\` to check

### Best Practices:
1. **Test Structure**: Arrange, Act, Assert
2. **Mock External Dependencies**: APIs, navigation, storage
3. **Test User Interactions**: Not implementation details
4. **Snapshot Testing**: For UI regression detection

### Example Test:
\`\`\`javascript
import { render, fireEvent } from '@testing-library/react-native';
import MyButton from '../MyButton';

test('calls onPress when pressed', () => {
  const mockOnPress = jest.fn();
  const { getByText } = render(<MyButton onPress={mockOnPress} title="Test" />);
  
  fireEvent.press(getByText('Test'));
  expect(mockOnPress).toHaveBeenCalled();
});
\`\`\`
`;
  }

  static analyzeIntegrationTesting(projectPath: string): string {
    return `### Focus Areas:
- **Navigation Flow**: Screen-to-screen transitions
- **State Management**: Redux/Context integration
- **API Integration**: HTTP requests and responses
- **Form Validation**: Multi-step forms

### Recommended Approach:
1. **Mock External Services**: Use MSW or similar
2. **Test User Journeys**: Complete workflows
3. **Test Error Scenarios**: Network failures, validation errors

### Example:
\`\`\`javascript
test('user can complete login flow', async () => {
  const { getByText, getByPlaceholderText } = render(<LoginScreen />);
  
  fireEvent.changeText(getByPlaceholderText('Email'), 'test@example.com');
  fireEvent.changeText(getByPlaceholderText('Password'), 'password123');
  fireEvent.press(getByText('Login'));
  
  await waitFor(() => {
    expect(getByText('Welcome')).toBeTruthy();
  });
});
\`\`\`
`;
  }

  static analyzeE2ETesting(projectPath: string): string {
    return `### Recommended Tools:
- **Detox**: Popular React Native E2E framework
- **Maestro**: Simple, declarative mobile UI testing
- **Appium**: Cross-platform automation

### Key Test Scenarios:
1. **Critical User Paths**: Registration, login, checkout
2. **Platform-Specific Features**: Push notifications, deep links
3. **Performance**: App startup, navigation speed
4. **Offline Scenarios**: Network connectivity issues

### Detox Setup:
\`\`\`bash
npm install --save-dev detox
npx detox init
\`\`\`

### Example Test:
\`\`\`javascript
describe('Login Flow', () => {
  it('should login successfully', async () => {
    await element(by.id('email-input')).typeText('test@example.com');
    await element(by.id('password-input')).typeText('password123');
    await element(by.id('login-button')).tap();
    await expect(element(by.text('Welcome'))).toBeVisible();
  });
});
\`\`\`
`;
  }

  static analyzeAccessibilityTesting(projectPath: string): string {
    return `### Testing Areas:
- **Screen Reader Support**: VoiceOver, TalkBack
- **Focus Management**: Keyboard navigation
- **Color Contrast**: WCAG compliance
- **Semantic Elements**: Proper roles and labels

### Tools:
- **jest-axe**: Automated accessibility testing
- **@testing-library/react-native**: Built-in accessibility queries
- **Manual Testing**: Real device testing with screen readers

### Example Tests:
\`\`\`javascript
import { axe, toHaveNoViolations } from 'jest-axe';

test('has no accessibility violations', async () => {
  const { container } = render(<MyComponent />);
  const results = await axe(container);
  expect(results).toHaveNoViolations();
});

test('supports screen reader', () => {
  const { getByLabelText } = render(<MyButton />);
  expect(getByLabelText('Submit form')).toBeTruthy();
});
\`\`\`

### Manual Testing Checklist:
- [ ] Enable VoiceOver/TalkBack and navigate the app
- [ ] Test with high contrast mode
- [ ] Verify focus indicators are visible
- [ ] Check minimum touch target sizes (44x44 points)
`;
  }

  static analyzePerformanceTesting(projectPath: string): string {
    return `### Performance Metrics:
- **Render Time**: Component mount duration
- **Memory Usage**: Heap size monitoring
- **Bundle Size**: JavaScript bundle analysis
- **Frame Rate**: 60fps maintenance

### Tools:
- **@shopify/react-native-performance**: Performance monitoring
- **Flipper**: Real-time performance insights
- **Metro Bundle Analyzer**: Bundle size analysis
- **React DevTools Profiler**: Component performance

### Example Tests:
\`\`\`javascript
test('renders within performance budget', () => {
  const startTime = performance.now();
  render(<MyComponent />);
  const endTime = performance.now();
  
  expect(endTime - startTime).toBeLessThan(16); // 60fps
});

test('handles large lists efficiently', () => {
  const largeData = Array.from({ length: 1000 }, (_, i) => ({ id: i }));
  const { getByTestId } = render(<MyList data={largeData} />);
  
  // Should render virtualized list efficiently
  expect(getByTestId('list')).toBeTruthy();
});
\`\`\`

### Performance Budget:
- **First Paint**: < 1000ms
- **Interactive**: < 3000ms
- **Frame Rate**: 60fps (16ms per frame)
- **Memory**: < 100MB baseline
`;
  }

  static analyzeSecurityTesting(projectPath: string): string {
    return `### Security Test Areas:
- **Data Validation**: Input sanitization
- **Authentication**: Token handling, biometrics
- **Storage Security**: Keychain, encrypted storage
- **Network Security**: Certificate pinning, HTTPS

### Common Vulnerabilities:
1. **Insecure Data Storage**: Sensitive data in plain text
2. **Weak Authentication**: Poor session management
3. **Code Injection**: Dynamic code execution
4. **Man-in-the-Middle**: Unvalidated certificates

### Example Tests:
\`\`\`javascript
test('sanitizes user input', () => {
  const maliciousInput = '<script>alert("xss")</script>';
  const { getByDisplayValue } = render(<TextInput value={maliciousInput} />);
  
  // Should escape or sanitize malicious input
  expect(getByDisplayValue()).not.toContain('<script>');
});

test('uses secure storage', async () => {
  const sensitiveData = 'user-token-123';
  await SecureStorage.setItem('token', sensitiveData);
  
  // Should not be stored in plain text
  const stored = await AsyncStorage.getItem('token');
  expect(stored).toBeNull(); // Should use secure storage instead
});
\`\`\`

### Security Checklist:
- [ ] Use Keychain/Keystore for sensitive data
- [ ] Implement certificate pinning
- [ ] Validate all user inputs
- [ ] Use HTTPS for all network requests
- [ ] Implement proper session management
`;
  }

  static generateTestingRecommendations(testFileCount: number, focusAreas: string[]): string {
    let recommendations = '';

    if (testFileCount === 0) {
      recommendations += `### 🚨 Critical: No tests found
1. **Start with unit tests** for core components
2. **Set up Jest and Testing Library** immediately
3. **Establish testing standards** and practices
4. **Add pre-commit hooks** to ensure tests run

`;
    } else if (testFileCount < 10) {
      recommendations += `### ⚠️ Low test coverage detected
1. **Expand unit test coverage** to critical components
2. **Add integration tests** for key user flows
3. **Implement snapshot testing** for UI regression protection
4. **Set coverage thresholds** in Jest config

`;
    } else {
      recommendations += `### ✅ Good test foundation
1. **Optimize existing tests** for better coverage
2. **Add performance benchmarks** for critical paths
3. **Enhance accessibility testing** coverage
4. **Consider E2E testing** for complete user journeys

`;
    }

    recommendations += `### 📋 Priority Action Items:
1. **Install core testing dependencies**
2. **Create component test templates**
3. **Set up CI/CD test automation**
4. **Establish coverage targets** (aim for 80%+)
5. **Document testing patterns** for the team

### 🎯 Focus Area Priorities:
${focusAreas.map((area, index) => `${index + 1}. **${area.charAt(0).toUpperCase() + area.slice(1)} Testing** - ${TestingAnalysisService.getAreaPriority(area)}`).join('\n')}
`;

    return recommendations;
  }

  static getAreaPriority(area: string): string {
    const priorities: { [key: string]: string } = {
      unit: 'Foundation for all other testing',
      integration: 'Critical for complex app flows',
      e2e: 'Essential for production confidence',
      accessibility: 'Required for inclusive design',
      performance: 'Key for user experience',
      security: 'Critical for data protection',
    };
    return priorities[area] || 'Important for overall quality';
  }

  static generateTestingSetupGuide(): string {
    return `### 1. Install Dependencies
\`\`\`bash
npm install --save-dev jest @testing-library/react-native @testing-library/jest-native react-test-renderer
\`\`\`

### 2. Configure Jest (jest.config.js)
\`\`\`javascript
module.exports = {
  preset: 'react-native',
  setupFilesAfterEnv: ['@testing-library/jest-native/extend-expect'],
  testPathIgnorePatterns: ['/node_modules/', '/android/', '/ios/'],
  collectCoverageFrom: [
    'src/**/*.{js,jsx,ts,tsx}',
    '!src/**/*.d.ts',
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
};
\`\`\`

### 3. Add Test Scripts (package.json)
\`\`\`json
{
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "test:ci": "jest --ci --coverage --watchAll=false"
  }
}
\`\`\`

### 4. Create Test Template
\`\`\`javascript
// __tests__/ComponentName.test.tsx
import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import ComponentName from '../ComponentName';

describe('ComponentName', () => {
  test('renders correctly', () => {
    const { getByTestId } = render(<ComponentName />);
    expect(getByTestId('component-name')).toBeTruthy();
  });
});
\`\`\`
`;
  }
}
