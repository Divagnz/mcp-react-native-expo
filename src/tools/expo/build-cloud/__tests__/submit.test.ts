import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { submitToStore } from '../submit.js';
import { expoExecutor } from '../../core/expo-executor.js';

// Mock the executor
jest.mock('../../core/expo-executor.js', () => ({
  expoExecutor: {
    executeEAS: jest.fn(),
  },
}));

describe('submitToStore', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should submit build successfully with build_id', async () => {
    const mockExecuteEAS = expoExecutor.executeEAS as jest.MockedFunction<
      typeof expoExecutor.executeEAS
    >;
    mockExecuteEAS.mockResolvedValue({
      success: true,
      stdout: 'Submission ID: abc-123-def\nSubmission complete',
      stderr: '',
      exitCode: 0,
    });

    const result = await submitToStore({
      platform: 'android',
      build_id: 'build-xyz',
    });

    expect(result.success).toBe(true);
    expect(result.data).toBeDefined();
    expect(result.data?.submission_id).toBe('abc-123-def');
    expect(result.data?.platform).toBe('android');
    expect(result.data?.status).toBe('submitted');
    expect(mockExecuteEAS).toHaveBeenCalledWith(
      [
        'submit',
        '--platform',
        'android',
        '--profile',
        'production',
        '--non-interactive',
        '--id',
        'build-xyz',
      ],
      expect.any(Object)
    );
  });

  it('should submit latest build when latest flag is true', async () => {
    const mockExecuteEAS = expoExecutor.executeEAS as jest.MockedFunction<
      typeof expoExecutor.executeEAS
    >;
    mockExecuteEAS.mockResolvedValue({
      success: true,
      stdout: 'Submission ID: 12345678-1234-1234-1234-123456789abc',
      stderr: '',
      exitCode: 0,
    });

    const result = await submitToStore({
      platform: 'ios',
      latest: true,
    });

    expect(result.success).toBe(true);
    expect(result.data?.submission_id).toBe('12345678-1234-1234-1234-123456789abc');
    expect(mockExecuteEAS).toHaveBeenCalledWith(
      expect.arrayContaining(['--latest']),
      expect.any(Object)
    );
  });

  it('should fail when neither build_id nor latest is specified', async () => {
    const result = await submitToStore({
      platform: 'android',
    });

    expect(result.success).toBe(false);
    expect(result.error).toContain('Either build_id or latest must be specified');
  });

  it('should handle submission failure', async () => {
    const mockExecuteEAS = expoExecutor.executeEAS as jest.MockedFunction<
      typeof expoExecutor.executeEAS
    >;
    mockExecuteEAS.mockResolvedValue({
      success: false,
      stdout: '',
      stderr: 'Invalid credentials',
      exitCode: 1,
    });

    const result = await submitToStore({
      platform: 'ios',
      build_id: 'build-fail',
    });

    expect(result.success).toBe(false);
    expect(result.error).toContain('Invalid credentials');
  });

  it('should handle custom profile', async () => {
    const mockExecuteEAS = expoExecutor.executeEAS as jest.MockedFunction<
      typeof expoExecutor.executeEAS
    >;
    mockExecuteEAS.mockResolvedValue({
      success: true,
      stdout: 'Submission ID: custom-789',
      stderr: '',
      exitCode: 0,
    });

    await submitToStore({
      platform: 'android',
      build_id: 'build-123',
      profile: 'staging',
    });

    expect(mockExecuteEAS).toHaveBeenCalledWith(
      expect.arrayContaining(['--profile', 'staging']),
      expect.any(Object)
    );
  });

  it('should handle exception during submission', async () => {
    const mockExecuteEAS = expoExecutor.executeEAS as jest.MockedFunction<
      typeof expoExecutor.executeEAS
    >;
    mockExecuteEAS.mockRejectedValue(new Error('Network timeout'));

    const result = await submitToStore({
      platform: 'ios',
      build_id: 'build-error',
    });

    expect(result.success).toBe(false);
    expect(result.error).toContain('Network timeout');
  });

  it('should extract submission ID from output', async () => {
    const mockExecuteEAS = expoExecutor.executeEAS as jest.MockedFunction<
      typeof expoExecutor.executeEAS
    >;
    const submissionId = '12345678-1234-1234-1234-123456789abc';
    mockExecuteEAS.mockResolvedValue({
      success: true,
      stdout: `Starting submission...\nSubmission ID: ${submissionId}\nSubmission in progress`,
      stderr: '',
      exitCode: 0,
    });

    const result = await submitToStore({
      platform: 'android',
      build_id: 'build-456',
    });

    expect(result.success).toBe(true);
    expect(result.data?.submission_id).toBe(submissionId);
  });

  it('should use default submission_id when ID not found', async () => {
    const mockExecuteEAS = expoExecutor.executeEAS as jest.MockedFunction<
      typeof expoExecutor.executeEAS
    >;
    mockExecuteEAS.mockResolvedValue({
      success: true,
      stdout: 'Submission started successfully',
      stderr: '',
      exitCode: 0,
    });

    const result = await submitToStore({
      platform: 'ios',
      build_id: 'build-789',
    });

    expect(result.success).toBe(true);
    expect(result.data?.submission_id).toBe('unknown');
  });
});
