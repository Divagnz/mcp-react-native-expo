import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { publishEASUpdate } from '../publish.js';
import { expoExecutor } from '../../core/expo-executor.js';

// Mock the expo executor
jest.mock('../../core/expo-executor.js', () => ({
  expoExecutor: {
    executeEAS: jest.fn(),
  },
}));

describe('publishEASUpdate', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should publish update with minimal config', async () => {
    const mockExecuteEAS = expoExecutor.executeEAS as jest.MockedFunction<
      typeof expoExecutor.executeEAS
    >;
    mockExecuteEAS.mockResolvedValue({
      success: true,
      stdout:
        'Update ID: abc12345-def6-7890-abcd-ef1234567890\nGroup ID: abc78901-def2-3456-789a-bcdef0123456\nRuntime version: 1.0.0',
      stderr: '',
      exitCode: 0,
    });

    const result = await publishEASUpdate({
      branch: 'production',
      message: 'Fix critical bug',
    });

    expect(result.success).toBe(true);
    expect(result.data?.branch).toBe('production');
    expect(result.data?.message).toBe('Fix critical bug');
    expect(result.data?.rollout_percentage).toBe(100);
    expect(result.data?.update_id).toBe('abc12345-def6-7890-abcd-ef1234567890');
    expect(result.data?.group_id).toBe('abc78901-def2-3456-789a-bcdef0123456');
    expect(mockExecuteEAS).toHaveBeenCalledWith(
      ['update', '--branch', 'production', '--message', 'Fix critical bug', '--non-interactive'],
      expect.any(Object)
    );
  });

  it('should include platform when specified', async () => {
    const mockExecuteEAS = expoExecutor.executeEAS as jest.MockedFunction<
      typeof expoExecutor.executeEAS
    >;
    mockExecuteEAS.mockResolvedValue({
      success: true,
      stdout: 'Update ID: test-id',
      stderr: '',
      exitCode: 0,
    });

    await publishEASUpdate({
      branch: 'production',
      message: 'Update',
      platform: 'ios',
    });

    expect(mockExecuteEAS).toHaveBeenCalledWith(
      expect.arrayContaining(['--platform', 'ios']),
      expect.any(Object)
    );
  });

  it('should not include platform flag for "all"', async () => {
    const mockExecuteEAS = expoExecutor.executeEAS as jest.MockedFunction<
      typeof expoExecutor.executeEAS
    >;
    mockExecuteEAS.mockResolvedValue({
      success: true,
      stdout: 'Update ID: test-id',
      stderr: '',
      exitCode: 0,
    });

    await publishEASUpdate({
      branch: 'production',
      message: 'Update',
      platform: 'all',
    });

    const callArgs = mockExecuteEAS.mock.calls[0][0];
    expect(callArgs).not.toContain('--platform');
  });

  it('should include runtime-version when specified', async () => {
    const mockExecuteEAS = expoExecutor.executeEAS as jest.MockedFunction<
      typeof expoExecutor.executeEAS
    >;
    mockExecuteEAS.mockResolvedValue({
      success: true,
      stdout: 'Update ID: test-id',
      stderr: '',
      exitCode: 0,
    });

    await publishEASUpdate({
      branch: 'production',
      message: 'Update',
      runtime_version: '1.0.0',
    });

    expect(mockExecuteEAS).toHaveBeenCalledWith(
      expect.arrayContaining(['--runtime-version', '1.0.0']),
      expect.any(Object)
    );
  });

  it('should handle gradual rollout configuration', async () => {
    const mockExecuteEAS = expoExecutor.executeEAS as jest.MockedFunction<
      typeof expoExecutor.executeEAS
    >;
    mockExecuteEAS.mockResolvedValue({
      success: true,
      stdout: 'Update ID: test-id',
      stderr: '',
      exitCode: 0,
    });

    const result = await publishEASUpdate({
      branch: 'production',
      message: 'Update',
      rollout_percentage: 50,
    });

    expect(result.success).toBe(true);
    expect(result.data?.rollout_percentage).toBe(50);
  });

  it('should extract update ID from output', async () => {
    const mockExecuteEAS = expoExecutor.executeEAS as jest.MockedFunction<
      typeof expoExecutor.executeEAS
    >;
    mockExecuteEAS.mockResolvedValue({
      success: true,
      stdout: 'Published update\nUpdate ID: 12345678-90ab-cdef-1234-567890abcdef',
      stderr: '',
      exitCode: 0,
    });

    const result = await publishEASUpdate({
      branch: 'production',
      message: 'Update',
    });

    expect(result.success).toBe(true);
    expect(result.data?.update_id).toBe('12345678-90ab-cdef-1234-567890abcdef');
  });

  it('should extract group ID from output', async () => {
    const mockExecuteEAS = expoExecutor.executeEAS as jest.MockedFunction<
      typeof expoExecutor.executeEAS
    >;
    mockExecuteEAS.mockResolvedValue({
      success: true,
      stdout: 'Published update\nGroup ID: abcdef12-3456-7890-abcd-ef1234567890',
      stderr: '',
      exitCode: 0,
    });

    const result = await publishEASUpdate({
      branch: 'production',
      message: 'Update',
    });

    expect(result.success).toBe(true);
    expect(result.data?.group_id).toBe('abcdef12-3456-7890-abcd-ef1234567890');
  });

  it('should extract runtime version from output', async () => {
    const mockExecuteEAS = expoExecutor.executeEAS as jest.MockedFunction<
      typeof expoExecutor.executeEAS
    >;
    mockExecuteEAS.mockResolvedValue({
      success: true,
      stdout: 'Update ID: test-id\nRuntime version: 2.5.1',
      stderr: '',
      exitCode: 0,
    });

    const result = await publishEASUpdate({
      branch: 'production',
      message: 'Update',
    });

    expect(result.success).toBe(true);
    expect(result.data?.runtime_version).toBe('2.5.1');
  });

  it('should use runtime_version config when not in output', async () => {
    const mockExecuteEAS = expoExecutor.executeEAS as jest.MockedFunction<
      typeof expoExecutor.executeEAS
    >;
    mockExecuteEAS.mockResolvedValue({
      success: true,
      stdout: 'Update ID: test-id',
      stderr: '',
      exitCode: 0,
    });

    const result = await publishEASUpdate({
      branch: 'production',
      message: 'Update',
      runtime_version: '1.0.0',
    });

    expect(result.success).toBe(true);
    expect(result.data?.runtime_version).toBe('1.0.0');
  });

  it('should default to "auto" runtime version when not specified', async () => {
    const mockExecuteEAS = expoExecutor.executeEAS as jest.MockedFunction<
      typeof expoExecutor.executeEAS
    >;
    mockExecuteEAS.mockResolvedValue({
      success: true,
      stdout: 'Update ID: test-id',
      stderr: '',
      exitCode: 0,
    });

    const result = await publishEASUpdate({
      branch: 'production',
      message: 'Update',
    });

    expect(result.success).toBe(true);
    expect(result.data?.runtime_version).toBe('auto');
  });

  it('should return "unknown" for missing IDs', async () => {
    const mockExecuteEAS = expoExecutor.executeEAS as jest.MockedFunction<
      typeof expoExecutor.executeEAS
    >;
    mockExecuteEAS.mockResolvedValue({
      success: true,
      stdout: 'Update published successfully',
      stderr: '',
      exitCode: 0,
    });

    const result = await publishEASUpdate({
      branch: 'production',
      message: 'Update',
    });

    expect(result.success).toBe(true);
    expect(result.data?.update_id).toBe('unknown');
    expect(result.data?.group_id).toBe('unknown');
  });

  it('should handle publish failure', async () => {
    const mockExecuteEAS = expoExecutor.executeEAS as jest.MockedFunction<
      typeof expoExecutor.executeEAS
    >;
    mockExecuteEAS.mockResolvedValue({
      success: false,
      stdout: '',
      stderr: 'Authentication required',
      exitCode: 1,
    });

    const result = await publishEASUpdate({
      branch: 'production',
      message: 'Update',
    });

    expect(result.success).toBe(false);
    expect(result.error).toContain('Authentication required');
  });

  it('should handle exception during publish', async () => {
    const mockExecuteEAS = expoExecutor.executeEAS as jest.MockedFunction<
      typeof expoExecutor.executeEAS
    >;
    mockExecuteEAS.mockRejectedValue(new Error('Network error'));

    const result = await publishEASUpdate({
      branch: 'production',
      message: 'Update',
    });

    expect(result.success).toBe(false);
    expect(result.error).toContain('Network error');
  });
});
