import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { runExpoDoctor } from '../doctor.js';
import { expoExecutor } from '../../core/expo-executor.js';

// Mock the expo executor
jest.mock('../../core/expo-executor.js', () => ({
  expoExecutor: {
    executeExpo: jest.fn(),
  },
}));

describe('runExpoDoctor', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should run doctor and report healthy project', async () => {
    const mockExecuteExpo = expoExecutor.executeExpo as jest.MockedFunction<
      typeof expoExecutor.executeExpo
    >;
    mockExecuteExpo.mockResolvedValue({
      success: true,
      stdout: 'All checks passed!',
      stderr: '',
      exitCode: 0,
    });

    const result = await runExpoDoctor();

    expect(result.success).toBe(true);
    expect(result.data?.healthy).toBe(true);
    expect(result.data?.issues).toHaveLength(0);
    expect(result.data?.summary).toContain('healthy');
    expect(mockExecuteExpo).toHaveBeenCalledWith(['doctor'], expect.any(Object));
  });

  it('should include fix-dependencies flag when fixIssues is true', async () => {
    const mockExecuteExpo = expoExecutor.executeExpo as jest.MockedFunction<
      typeof expoExecutor.executeExpo
    >;
    mockExecuteExpo.mockResolvedValue({
      success: true,
      stdout: 'Fixed dependencies',
      stderr: '',
      exitCode: 0,
    });

    await runExpoDoctor(true);

    expect(mockExecuteExpo).toHaveBeenCalledWith(
      ['doctor', '--fix-dependencies'],
      expect.any(Object)
    );
  });

  it('should parse error issues from output', async () => {
    const mockExecuteExpo = expoExecutor.executeExpo as jest.MockedFunction<
      typeof expoExecutor.executeExpo
    >;
    mockExecuteExpo.mockResolvedValue({
      success: false,
      stdout: '✖ Missing peer dependency react-native\n✖ Outdated Expo SDK',
      stderr: '',
      exitCode: 0,
    });

    const result = await runExpoDoctor();

    expect(result.success).toBe(true);
    expect(result.data?.healthy).toBe(false);
    expect(result.data?.issues).toHaveLength(2);
    expect(result.data?.issues?.[0].severity).toBe('error');
  });

  it('should parse warning issues from output', async () => {
    const mockExecuteExpo = expoExecutor.executeExpo as jest.MockedFunction<
      typeof expoExecutor.executeExpo
    >;
    mockExecuteExpo.mockResolvedValue({
      success: true,
      stdout: '⚠ Package version mismatch\n⚠ Cache might be stale',
      stderr: '',
      exitCode: 0,
    });

    const result = await runExpoDoctor();

    expect(result.success).toBe(true);
    expect(result.data?.issues).toHaveLength(2);
    expect(result.data?.issues?.[0].severity).toBe('warning');
    expect(result.data?.healthy).toBe(false);
  });

  it('should parse info issues from output', async () => {
    const mockExecuteExpo = expoExecutor.executeExpo as jest.MockedFunction<
      typeof expoExecutor.executeExpo
    >;
    mockExecuteExpo.mockResolvedValue({
      success: true,
      stdout: 'ℹ Using Expo SDK 50.0.0',
      stderr: '',
      exitCode: 0,
    });

    const result = await runExpoDoctor();

    expect(result.success).toBe(true);
    expect(result.data?.issues).toHaveLength(1);
    expect(result.data?.issues?.[0].severity).toBe('info');
  });

  it('should parse issues from both stdout and stderr', async () => {
    const mockExecuteExpo = expoExecutor.executeExpo as jest.MockedFunction<
      typeof expoExecutor.executeExpo
    >;
    mockExecuteExpo.mockResolvedValue({
      success: true,
      stdout: '✖ Error in package.json\n',
      stderr: '⚠ Warning: deprecated package',
      exitCode: 0,
    });

    const result = await runExpoDoctor();

    expect(result.success).toBe(true);
    expect(result.data?.issues).toHaveLength(2);
  });

  it('should generate summary with error and warning counts', async () => {
    const mockExecuteExpo = expoExecutor.executeExpo as jest.MockedFunction<
      typeof expoExecutor.executeExpo
    >;
    mockExecuteExpo.mockResolvedValue({
      success: false,
      stdout: '✖ Error 1\n✖ Error 2\n⚠ Warning 1',
      stderr: '',
      exitCode: 0,
    });

    const result = await runExpoDoctor();

    expect(result.success).toBe(true);
    expect(result.data?.summary).toContain('2 error(s)');
    expect(result.data?.summary).toContain('1 warning(s)');
  });

  it('should handle exception during doctor run', async () => {
    const mockExecuteExpo = expoExecutor.executeExpo as jest.MockedFunction<
      typeof expoExecutor.executeExpo
    >;
    mockExecuteExpo.mockRejectedValue(new Error('Command failed'));

    const result = await runExpoDoctor();

    expect(result.success).toBe(false);
    expect(result.error).toContain('Command failed');
  });

  it('should handle empty output', async () => {
    const mockExecuteExpo = expoExecutor.executeExpo as jest.MockedFunction<
      typeof expoExecutor.executeExpo
    >;
    mockExecuteExpo.mockResolvedValue({
      success: true,
      stdout: '',
      stderr: '',
      exitCode: 0,
    });

    const result = await runExpoDoctor();

    expect(result.success).toBe(true);
    expect(result.data?.healthy).toBe(true);
    expect(result.data?.issues).toHaveLength(0);
  });
});
