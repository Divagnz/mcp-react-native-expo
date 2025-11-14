# Test Coverage TODO - 25% Minimum Function Coverage

**Target:** All files must have at least 25% function coverage (currently 18 files at 0%)

**Status:** 0/18 files completed

---

## Priority 1: Expo Tool Implementations (16 files)

These are the main tool implementations that need integration tests to reach 25%+ function coverage.

### Expo Build Cloud (3 files)
- [ ] `src/tools/expo/build-cloud/build.ts` - 0% functions (21.73% lines)
  - Main functions: `expo_build_cloud_start()`
  - Test approach: Mock ExpoExecutor, test basic flow

- [ ] `src/tools/expo/build-cloud/status.ts` - 0% functions (18.75% lines)
  - Main functions: `expo_build_cloud_status()`
  - Test approach: Mock ExpoExecutor, test status parsing

- [ ] `src/tools/expo/build-cloud/submit.ts` - 0% functions (21.66% lines)
  - Main functions: `expo_build_cloud_submit()`
  - Test approach: Mock ExpoExecutor, test submission flow

**Estimated effort:** 2-3 hours (create test file, mock setup, 3 basic tests)

---

### Expo Build Local (3 files)
- [ ] `src/tools/expo/build-local/read.ts` - 0% functions (16.85% lines)
  - Main functions: `expo_build_local_read()`
  - Test approach: Mock ShellSessionManager

- [ ] `src/tools/expo/build-local/start.ts` - 0% functions (16.3% lines)
  - Main functions: `expo_build_local_start()`
  - Test approach: Mock ShellSessionManager, test start flow

- [ ] `src/tools/expo/build-local/stop.ts` - 0% functions (25.49% lines)
  - Main functions: `expo_build_local_stop()`
  - Test approach: Mock ShellSessionManager

**Estimated effort:** 2-3 hours

---

### Expo Dev (4 files)
- [ ] `src/tools/expo/dev/read.ts` - 0% functions (23.07% lines)
  - Main functions: `expo_dev_read()`
  - Test approach: Mock ShellSessionManager

- [ ] `src/tools/expo/dev/send.ts` - 0% functions (17.85% lines)
  - Main functions: `expo_dev_send()`
  - Test approach: Mock ShellSessionManager

- [ ] `src/tools/expo/dev/start.ts` - 0% functions (17.12% lines)
  - Main functions: `expo_dev_start()`, helper functions
  - Test approach: Mock ShellSessionManager, QRGenerator

- [ ] `src/tools/expo/dev/stop.ts` - 0% functions (25.49% lines)
  - Main functions: `expo_dev_stop()`
  - Test approach: Mock ShellSessionManager

**Estimated effort:** 3-4 hours (most critical user-facing tools)

---

### Expo Project (4 files)
- [ ] `src/tools/expo/project/create.ts` - 0% functions (10.63% lines)
  - Main functions: `expo_project_create()`, helper functions
  - Test approach: Mock ExpoExecutor, fs operations

- [ ] `src/tools/expo/project/doctor.ts` - 0% functions (21.21% lines)
  - Main functions: `expo_project_doctor()`
  - Test approach: Mock ExpoExecutor, parse output

- [ ] `src/tools/expo/project/install.ts` - 0% functions (19.11% lines)
  - Main functions: `expo_project_install()`
  - Test approach: Mock ExpoExecutor

- [ ] `src/tools/expo/project/upgrade.ts` - 0% functions (17.44% lines)
  - Main functions: `expo_project_upgrade()`, helper functions
  - Test approach: Mock ExpoExecutor, package.json parsing

**Estimated effort:** 3-4 hours

---

### Expo Update (2 files)
- [ ] `src/tools/expo/update/publish.ts` - 0% functions (16% lines)
  - Main functions: `expo_update_publish()`, helper functions
  - Test approach: Mock ExpoExecutor

- [ ] `src/tools/expo/update/status.ts` - 0% functions (16.9% lines)
  - Main functions: `expo_update_status()`
  - Test approach: Mock ExpoExecutor, parse status

**Estimated effort:** 1-2 hours

---

## Priority 2: Analysis & Advisory Services (2 files)

### Component Analyzer
- [ ] `src/tools/modules/analysis/component-analyzer.ts` - 0% functions (12.32% lines)
  - Main functions: `analyzeComponentStructure()`, `analyzeComponentPerformance()`
  - Test approach: Test with sample React component code
  - **Note:** This is analysis code, needs real code samples to test

**Estimated effort:** 2-3 hours (complex analysis logic)

---

### Advisory Service
- [ ] `src/tools/modules/advisory/advisory-service.ts` - 0% functions (3.18% lines)
  - Main functions: Multiple advisory functions
  - Test approach: Test advisory generation logic
  - **Note:** Large file (658 lines), may need significant test coverage

**Estimated effort:** 3-4 hours (large complex service)

---

## Test Strategy for Each File

### Basic Test Template (to reach 25% function coverage)

```typescript
describe('ToolName', () => {
  describe('main_function', () => {
    it('should execute successfully with valid input', async () => {
      // Mock dependencies
      // Call function with valid params
      // Assert success response
    });

    it('should handle missing required parameters', async () => {
      // Call function without required params
      // Assert error response
    });

    it('should handle execution errors gracefully', async () => {
      // Mock failure scenario
      // Assert error handling
    });
  });
});
```

### Key Testing Principles

1. **Mock external dependencies:**
   - ExpoExecutor for CLI tools
   - ShellSessionManager for session-based tools
   - File system operations

2. **Test at least 25% of functions:**
   - Prioritize main exported functions
   - Test critical error paths
   - Skip internal helper functions if needed to save time

3. **Focus on behavior, not implementation:**
   - Test inputs/outputs
   - Test error handling
   - Don't test implementation details

---

## Overall Effort Estimate

- **Expo tools (16 files):** 11-16 hours
- **Analysis/Advisory (2 files):** 5-7 hours
- **Total:** 16-23 hours

**Recommendation:** Start with Priority 1 (Expo tools) as they are user-facing and critical. Can be done in phases:
1. Week 1: Expo Dev tools (highest user impact)
2. Week 2: Expo Build tools
3. Week 3: Expo Project/Update tools
4. Week 4: Analysis/Advisory services

---

## Success Criteria

✅ All 18 files have ≥25% function coverage
✅ All tests pass in CI/CD
✅ Coverage thresholds updated in jest.config.js to enforce 25% minimum
✅ No more files with 0% function coverage

---

## Notes

- Current global function coverage: 64.63% (will likely drop to ~60% after these files are included)
- Target after completion: Keep global function coverage ≥50%
- This addresses the critical gap identified in coverage analysis
- Tests should be integration-style (mocking dependencies) not E2E

Last Updated: 2025-11-12
