import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { getEASUpdateStatus } from '../status.js';
import { expoExecutor } from '../../core/expo-executor.js';

// Mock the expo executor
jest.mock('../../core/expo-executor.js', () => ({
  expoExecutor: {
    executeEAS: jest.fn(),
  },
}));

describe('getEASUpdateStatus', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should get update status with default limit', async () => {
    const mockExecuteEAS = expoExecutor.executeEAS as jest.MockedFunction<
      typeof expoExecutor.executeEAS
    >;
    const updates = [
      {
        id: 'update-1',
        branch: 'production',
        message: 'Bug fix',
        createdAt: '2024-01-01T00:00:00Z',
        rolloutPercentage: 100,
        runtimeVersion: '1.0.0',
        platform: 'all',
      },
      {
        id: 'update-2',
        branch: 'production',
        message: 'Feature update',
        createdAt: '2024-01-02T00:00:00Z',
        rolloutPercentage: 50,
        runtimeVersion: '1.0.0',
        platform: 'ios',
      },
    ];
    mockExecuteEAS.mockResolvedValue({
      success: true,
      stdout: JSON.stringify(updates),
      stderr: '',
      exitCode: 0,
    });

    const result = await getEASUpdateStatus();

    expect(result.success).toBe(true);
    expect(result.data?.updates).toHaveLength(2);
    expect(result.data?.total).toBe(2);
    expect(result.data?.updates[0].id).toBe('update-1');
    expect(result.data?.updates[0].message).toBe('Bug fix');
    expect(mockExecuteEAS).toHaveBeenCalledWith(['update:list', '--limit=10', '--json']);
  });

  it('should include branch when specified', async () => {
    const mockExecuteEAS = expoExecutor.executeEAS as jest.MockedFunction<
      typeof expoExecutor.executeEAS
    >;
    mockExecuteEAS.mockResolvedValue({
      success: true,
      stdout: '[]',
      stderr: '',
      exitCode: 0,
    });

    await getEASUpdateStatus('staging');

    expect(mockExecuteEAS).toHaveBeenCalledWith([
      'update:list',
      '--limit=10',
      '--json',
      '--branch',
      'staging',
    ]);
  });

  it('should use custom limit', async () => {
    const mockExecuteEAS = expoExecutor.executeEAS as jest.MockedFunction<
      typeof expoExecutor.executeEAS
    >;
    mockExecuteEAS.mockResolvedValue({
      success: true,
      stdout: '[]',
      stderr: '',
      exitCode: 0,
    });

    await getEASUpdateStatus(undefined, 25);

    expect(mockExecuteEAS).toHaveBeenCalledWith(['update:list', '--limit=25', '--json']);
  });

  it('should parse update information correctly', async () => {
    const mockExecuteEAS = expoExecutor.executeEAS as jest.MockedFunction<
      typeof expoExecutor.executeEAS
    >;
    const updates = [
      {
        id: 'abc-123',
        branch: 'main',
        message: 'Test update',
        createdAt: '2024-01-01T12:00:00Z',
        rolloutPercentage: 75,
        runtimeVersion: '2.0.0',
        platform: 'android',
      },
    ];
    mockExecuteEAS.mockResolvedValue({
      success: true,
      stdout: JSON.stringify(updates),
      stderr: '',
      exitCode: 0,
    });

    const result = await getEASUpdateStatus();

    expect(result.success).toBe(true);
    expect(result.data?.updates[0]).toEqual({
      id: 'abc-123',
      branch: 'main',
      message: 'Test update',
      created_at: '2024-01-01T12:00:00Z',
      rollout_percentage: 75,
      runtime_version: '2.0.0',
      platform: 'android',
    });
  });

  it('should handle missing optional fields', async () => {
    const mockExecuteEAS = expoExecutor.executeEAS as jest.MockedFunction<
      typeof expoExecutor.executeEAS
    >;
    const updates = [
      {
        id: 'update-1',
        branch: 'production',
        createdAt: '2024-01-01T00:00:00Z',
      },
    ];
    mockExecuteEAS.mockResolvedValue({
      success: true,
      stdout: JSON.stringify(updates),
      stderr: '',
      exitCode: 0,
    });

    const result = await getEASUpdateStatus();

    expect(result.success).toBe(true);
    expect(result.data?.updates[0].message).toBe('');
    expect(result.data?.updates[0].rollout_percentage).toBe(100);
    expect(result.data?.updates[0].runtime_version).toBe('auto');
    expect(result.data?.updates[0].platform).toBe('all');
  });

  it('should return branch in result', async () => {
    const mockExecuteEAS = expoExecutor.executeEAS as jest.MockedFunction<
      typeof expoExecutor.executeEAS
    >;
    mockExecuteEAS.mockResolvedValue({
      success: true,
      stdout: '[]',
      stderr: '',
      exitCode: 0,
    });

    const result = await getEASUpdateStatus('development');

    expect(result.success).toBe(true);
    expect(result.data?.branch).toBe('development');
  });

  it('should handle empty updates list', async () => {
    const mockExecuteEAS = expoExecutor.executeEAS as jest.MockedFunction<
      typeof expoExecutor.executeEAS
    >;
    mockExecuteEAS.mockResolvedValue({
      success: true,
      stdout: '[]',
      stderr: '',
      exitCode: 0,
    });

    const result = await getEASUpdateStatus();

    expect(result.success).toBe(true);
    expect(result.data?.updates).toHaveLength(0);
    expect(result.data?.total).toBe(0);
  });

  it('should handle invalid JSON gracefully', async () => {
    const mockExecuteEAS = expoExecutor.executeEAS as jest.MockedFunction<
      typeof expoExecutor.executeEAS
    >;
    mockExecuteEAS.mockResolvedValue({
      success: true,
      stdout: 'Not valid JSON',
      stderr: '',
      exitCode: 0,
    });

    const result = await getEASUpdateStatus();

    expect(result.success).toBe(true);
    expect(result.data?.updates).toHaveLength(0);
    expect(result.data?.total).toBe(0);
  });

  it('should handle non-array JSON', async () => {
    const mockExecuteEAS = expoExecutor.executeEAS as jest.MockedFunction<
      typeof expoExecutor.executeEAS
    >;
    mockExecuteEAS.mockResolvedValue({
      success: true,
      stdout: '{"error": "No updates found"}',
      stderr: '',
      exitCode: 0,
    });

    const result = await getEASUpdateStatus();

    expect(result.success).toBe(true);
    expect(result.data?.updates).toHaveLength(0);
  });

  it('should handle command failure', async () => {
    const mockExecuteEAS = expoExecutor.executeEAS as jest.MockedFunction<
      typeof expoExecutor.executeEAS
    >;
    mockExecuteEAS.mockResolvedValue({
      success: false,
      stdout: '',
      stderr: 'Project not configured for EAS Update',
      exitCode: 1,
    });

    const result = await getEASUpdateStatus();

    expect(result.success).toBe(false);
    expect(result.error).toContain('Project not configured');
  });

  it('should handle exception during status check', async () => {
    const mockExecuteEAS = expoExecutor.executeEAS as jest.MockedFunction<
      typeof expoExecutor.executeEAS
    >;
    mockExecuteEAS.mockRejectedValue(new Error('API error'));

    const result = await getEASUpdateStatus();

    expect(result.success).toBe(false);
    expect(result.error).toContain('API error');
  });
});
