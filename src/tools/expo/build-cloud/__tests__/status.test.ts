import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { getEASBuildStatus } from '../status.js';
import { expoExecutor } from '../../core/expo-executor.js';

// Mock the executor
jest.mock('../../core/expo-executor.js', () => ({
  expoExecutor: {
    executeEAS: jest.fn(),
  },
}));

describe('getEASBuildStatus', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should get build status successfully', async () => {
    const mockExecuteEAS = expoExecutor.executeEAS as jest.MockedFunction<
      typeof expoExecutor.executeEAS
    >;
    const mockBuilds = [
      {
        id: 'build-123',
        status: 'finished',
        platform: 'android',
        createdAt: '2025-01-01T00:00:00Z',
        completedAt: '2025-01-01T00:15:00Z',
        appVersion: '1.0.0',
        sdkVersion: '50.0.0',
      },
    ];

    mockExecuteEAS.mockResolvedValue({
      success: true,
      stdout: JSON.stringify(mockBuilds),
      stderr: '',
      exitCode: 0,
    });

    const result = await getEASBuildStatus();

    expect(result.success).toBe(true);
    expect(result.data).toBeDefined();
    expect(result.data?.builds).toHaveLength(1);
    expect(result.data?.builds[0].id).toBe('build-123');
    expect(result.data?.total).toBe(1);
  });

  it('should get specific build by ID', async () => {
    const mockExecuteEAS = expoExecutor.executeEAS as jest.MockedFunction<
      typeof expoExecutor.executeEAS
    >;
    mockExecuteEAS.mockResolvedValue({
      success: true,
      stdout: JSON.stringify([{ id: 'specific-build', status: 'in-progress', platform: 'ios' }]),
      stderr: '',
      exitCode: 0,
    });

    const result = await getEASBuildStatus('specific-build');

    expect(result.success).toBe(true);
    expect(mockExecuteEAS).toHaveBeenCalledWith(
      expect.arrayContaining(['--buildId=specific-build'])
    );
  });

  it('should handle custom limit', async () => {
    const mockExecuteEAS = expoExecutor.executeEAS as jest.MockedFunction<
      typeof expoExecutor.executeEAS
    >;
    mockExecuteEAS.mockResolvedValue({
      success: true,
      stdout: '[]',
      stderr: '',
      exitCode: 0,
    });

    await getEASBuildStatus(undefined, 10);

    expect(mockExecuteEAS).toHaveBeenCalledWith(expect.arrayContaining(['--limit=10']));
  });

  it('should handle failed build status request', async () => {
    const mockExecuteEAS = expoExecutor.executeEAS as jest.MockedFunction<
      typeof expoExecutor.executeEAS
    >;
    mockExecuteEAS.mockResolvedValue({
      success: false,
      stdout: '',
      stderr: 'Authentication failed',
      exitCode: 1,
    });

    const result = await getEASBuildStatus();

    expect(result.success).toBe(false);
    expect(result.error).toContain('Authentication failed');
  });

  it('should handle invalid JSON response', async () => {
    const mockExecuteEAS = expoExecutor.executeEAS as jest.MockedFunction<
      typeof expoExecutor.executeEAS
    >;
    mockExecuteEAS.mockResolvedValue({
      success: true,
      stdout: 'not valid json',
      stderr: '',
      exitCode: 0,
    });

    const result = await getEASBuildStatus();

    expect(result.success).toBe(true);
    expect(result.data?.builds).toEqual([]);
    expect(result.data?.total).toBe(0);
  });

  it('should handle exception during status check', async () => {
    const mockExecuteEAS = expoExecutor.executeEAS as jest.MockedFunction<
      typeof expoExecutor.executeEAS
    >;
    mockExecuteEAS.mockRejectedValue(new Error('Network timeout'));

    const result = await getEASBuildStatus();

    expect(result.success).toBe(false);
    expect(result.error).toContain('Network timeout');
  });

  it('should parse multiple builds correctly', async () => {
    const mockExecuteEAS = expoExecutor.executeEAS as jest.MockedFunction<
      typeof expoExecutor.executeEAS
    >;
    const mockBuilds = [
      {
        id: 'build-1',
        status: 'finished',
        platform: 'android',
        createdAt: '2025-01-01',
        completedAt: '2025-01-01',
      },
      {
        id: 'build-2',
        status: 'in-progress',
        platform: 'ios',
        createdAt: '2025-01-02',
        completedAt: null,
      },
      {
        id: 'build-3',
        status: 'errored',
        platform: 'android',
        createdAt: '2025-01-03',
        completedAt: '2025-01-03',
      },
    ];

    mockExecuteEAS.mockResolvedValue({
      success: true,
      stdout: JSON.stringify(mockBuilds),
      stderr: '',
      exitCode: 0,
    });

    const result = await getEASBuildStatus();

    expect(result.success).toBe(true);
    expect(result.data?.builds).toHaveLength(3);
    expect(result.data?.total).toBe(3);
    expect(result.data?.builds.map((b) => b.status)).toEqual([
      'finished',
      'in-progress',
      'errored',
    ]);
  });

  it('should include JSON flag in command', async () => {
    const mockExecuteEAS = expoExecutor.executeEAS as jest.MockedFunction<
      typeof expoExecutor.executeEAS
    >;
    mockExecuteEAS.mockResolvedValue({
      success: true,
      stdout: '[]',
      stderr: '',
      exitCode: 0,
    });

    await getEASBuildStatus();

    expect(mockExecuteEAS).toHaveBeenCalledWith(expect.arrayContaining(['--json']));
  });
});
