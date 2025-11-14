import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { triggerEASBuild } from '../build.js';
import { expoExecutor } from '../../core/expo-executor.js';

// Mock the executor
jest.mock('../../core/expo-executor.js', () => ({
  expoExecutor: {
    executeEAS: jest.fn(),
  },
}));

describe('triggerEASBuild', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should trigger build successfully with minimal config', async () => {
    const mockExecuteEAS = expoExecutor.executeEAS as jest.MockedFunction<
      typeof expoExecutor.executeEAS
    >;
    mockExecuteEAS.mockResolvedValue({
      success: true,
      stdout: 'Build ID: abc-123-def\nhttps://expo.dev/accounts/test/projects/myapp/builds/xyz',
      stderr: '',
      exitCode: 0,
    });

    const result = await triggerEASBuild({
      platform: 'android',
    });

    expect(result.success).toBe(true);
    expect(result.data).toBeDefined();
    expect(result.data?.platform).toBe('android');
    expect(result.data?.build_id).toBe('abc-123-def');
    expect(mockExecuteEAS).toHaveBeenCalledWith(
      ['build', '--platform', 'android', '--profile', 'production', '--non-interactive'],
      expect.any(Object)
    );
  });

  it('should handle build failure', async () => {
    const mockExecuteEAS = expoExecutor.executeEAS as jest.MockedFunction<
      typeof expoExecutor.executeEAS
    >;
    mockExecuteEAS.mockResolvedValue({
      success: false,
      stdout: '',
      stderr: 'Build failed: Invalid credentials',
      exitCode: 1,
    });

    const result = await triggerEASBuild({
      platform: 'ios',
    });

    expect(result.success).toBe(false);
    expect(result.error).toContain('Invalid credentials');
  });

  it('should include wait flag when specified', async () => {
    const mockExecuteEAS = expoExecutor.executeEAS as jest.MockedFunction<
      typeof expoExecutor.executeEAS
    >;
    mockExecuteEAS.mockResolvedValue({
      success: true,
      stdout: 'Build ID: test-123\nBuild complete',
      stderr: '',
      exitCode: 0,
    });

    const result = await triggerEASBuild({
      platform: 'android',
      wait: true,
    });

    expect(result.success).toBe(true);
    expect(result.data?.status).toBe('finished');
    expect(mockExecuteEAS).toHaveBeenCalledWith(
      expect.arrayContaining(['--wait']),
      expect.any(Object)
    );
  });

  it('should handle clear_cache option', async () => {
    const mockExecuteEAS = expoExecutor.executeEAS as jest.MockedFunction<
      typeof expoExecutor.executeEAS
    >;
    mockExecuteEAS.mockResolvedValue({
      success: true,
      stdout: 'Build ID: test-456',
      stderr: '',
      exitCode: 0,
    });

    await triggerEASBuild({
      platform: 'ios',
      clear_cache: true,
    });

    expect(mockExecuteEAS).toHaveBeenCalledWith(
      expect.arrayContaining(['--clear-cache']),
      expect.any(Object)
    );
  });

  it('should handle custom profile', async () => {
    const mockExecuteEAS = expoExecutor.executeEAS as jest.MockedFunction<
      typeof expoExecutor.executeEAS
    >;
    mockExecuteEAS.mockResolvedValue({
      success: true,
      stdout: 'Build ID: custom-789',
      stderr: '',
      exitCode: 0,
    });

    await triggerEASBuild({
      platform: 'android',
      profile: 'development',
    });

    expect(mockExecuteEAS).toHaveBeenCalledWith(
      expect.arrayContaining(['--profile', 'development']),
      expect.any(Object)
    );
  });

  it('should handle exception during build', async () => {
    const mockExecuteEAS = expoExecutor.executeEAS as jest.MockedFunction<
      typeof expoExecutor.executeEAS
    >;
    mockExecuteEAS.mockRejectedValue(new Error('Network error'));

    const result = await triggerEASBuild({
      platform: 'ios',
    });

    expect(result.success).toBe(false);
    expect(result.error).toContain('Network error');
  });

  it('should extract build URL when present', async () => {
    const mockExecuteEAS = expoExecutor.executeEAS as jest.MockedFunction<
      typeof expoExecutor.executeEAS
    >;
    const buildUrl = 'https://expo.dev/accounts/myteam/projects/myapp/builds/abc123';
    mockExecuteEAS.mockResolvedValue({
      success: true,
      stdout: `Build started\n${buildUrl}\nBuild in progress`,
      stderr: '',
      exitCode: 0,
    });

    const result = await triggerEASBuild({
      platform: 'android',
    });

    expect(result.success).toBe(true);
    expect(result.data?.url).toBe(buildUrl);
    expect(result.data?.logs_url).toBe(buildUrl);
  });

  it('should use default URL when build URL not found', async () => {
    const mockExecuteEAS = expoExecutor.executeEAS as jest.MockedFunction<
      typeof expoExecutor.executeEAS
    >;
    mockExecuteEAS.mockResolvedValue({
      success: true,
      stdout: 'Build started successfully',
      stderr: '',
      exitCode: 0,
    });

    const result = await triggerEASBuild({
      platform: 'ios',
    });

    expect(result.success).toBe(true);
    expect(result.data?.url).toBe('https://expo.dev/accounts');
  });
});
