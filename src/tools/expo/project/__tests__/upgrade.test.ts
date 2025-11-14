import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { upgradeExpoSDK } from '../upgrade.js';
import { expoExecutor } from '../../core/expo-executor.js';

// Mock the expo executor
jest.mock('../../core/expo-executor.js', () => ({
  expoExecutor: {
    executeExpo: jest.fn(),
  },
}));

describe('upgradeExpoSDK', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should upgrade SDK to latest version', async () => {
    const mockExecuteExpo = expoExecutor.executeExpo as jest.MockedFunction<
      typeof expoExecutor.executeExpo
    >;
    mockExecuteExpo.mockResolvedValue({
      success: true,
      stdout: 'Upgrading from 49.0.0 to 50.0.0',
      stderr: '',
      exitCode: 0,
    });

    const result = await upgradeExpoSDK({});

    expect(result.success).toBe(true);
    expect(result.data?.applied).toBe(true);
    expect(mockExecuteExpo).toHaveBeenCalledWith(['upgrade'], expect.any(Object));
  });

  it('should upgrade SDK to specific version', async () => {
    const mockExecuteExpo = expoExecutor.executeExpo as jest.MockedFunction<
      typeof expoExecutor.executeExpo
    >;
    mockExecuteExpo.mockResolvedValue({
      success: true,
      stdout: 'Upgrading to 50.0.0',
      stderr: '',
      exitCode: 0,
    });

    await upgradeExpoSDK({
      target_version: '50.0.0',
    });

    expect(mockExecuteExpo).toHaveBeenCalledWith(['upgrade', '50.0.0'], expect.any(Object));
  });

  it('should include npm flag when specified', async () => {
    const mockExecuteExpo = expoExecutor.executeExpo as jest.MockedFunction<
      typeof expoExecutor.executeExpo
    >;
    mockExecuteExpo.mockResolvedValue({
      success: true,
      stdout: 'Upgrading',
      stderr: '',
      exitCode: 0,
    });

    await upgradeExpoSDK({
      npm: true,
    });

    expect(mockExecuteExpo).toHaveBeenCalledWith(
      expect.arrayContaining(['--npm']),
      expect.any(Object)
    );
  });

  it('should handle dry run', async () => {
    const mockExecuteExpo = expoExecutor.executeExpo as jest.MockedFunction<
      typeof expoExecutor.executeExpo
    >;
    mockExecuteExpo.mockResolvedValue({
      success: true,
      stdout: 'Would upgrade from 49.0.0 to 50.0.0',
      stderr: '',
      exitCode: 0,
    });

    const result = await upgradeExpoSDK({
      dry_run: true,
    });

    expect(result.success).toBe(true);
    expect(result.data?.applied).toBe(false);
  });

  it('should parse package changes from output', async () => {
    const mockExecuteExpo = expoExecutor.executeExpo as jest.MockedFunction<
      typeof expoExecutor.executeExpo
    >;
    mockExecuteExpo.mockResolvedValue({
      success: true,
      stdout: `Upgrade changes:
expo 49.0.0 → 50.0.0
react-native 0.72.0 → 0.73.0`,
      stderr: '',
      exitCode: 0,
    });

    const result = await upgradeExpoSDK({});

    expect(result.success).toBe(true);
    expect(result.data?.changes).toHaveLength(2);
    expect(result.data?.changes?.[0].package).toBe('expo');
    expect(result.data?.changes?.[0].from).toBe('49.0.0');
    expect(result.data?.changes?.[0].to).toBe('50.0.0');
  });

  it('should detect breaking changes', async () => {
    const mockExecuteExpo = expoExecutor.executeExpo as jest.MockedFunction<
      typeof expoExecutor.executeExpo
    >;
    mockExecuteExpo.mockResolvedValue({
      success: true,
      stdout: `expo 49.0.0 → 50.0.0 BREAKING
BREAKING: Camera API changed`,
      stderr: '',
      exitCode: 0,
    });

    const result = await upgradeExpoSDK({});

    expect(result.success).toBe(true);
    expect(result.data?.breaking_changes).toBeDefined();
    expect(result.data?.breaking_changes?.length).toBeGreaterThan(0);
  });

  it('should mark breaking changes in package list', async () => {
    const mockExecuteExpo = expoExecutor.executeExpo as jest.MockedFunction<
      typeof expoExecutor.executeExpo
    >;
    mockExecuteExpo.mockResolvedValue({
      success: true,
      stdout: 'expo 49.0.0 → 50.0.0 BREAKING',
      stderr: '',
      exitCode: 0,
    });

    const result = await upgradeExpoSDK({});

    expect(result.success).toBe(true);
    expect(result.data?.changes?.[0].breaking).toBe(true);
  });

  it('should extract current version from output', async () => {
    const mockExecuteExpo = expoExecutor.executeExpo as jest.MockedFunction<
      typeof expoExecutor.executeExpo
    >;
    mockExecuteExpo.mockResolvedValue({
      success: true,
      stdout: 'Current version: 49.0.0\nTarget version: 50.0.0',
      stderr: '',
      exitCode: 0,
    });

    const result = await upgradeExpoSDK({});

    expect(result.success).toBe(true);
    expect(result.data?.current_version).toBe('49.0.0');
    expect(result.data?.target_version).toBe('50.0.0');
  });

  it('should use target_version config when not in output', async () => {
    const mockExecuteExpo = expoExecutor.executeExpo as jest.MockedFunction<
      typeof expoExecutor.executeExpo
    >;
    mockExecuteExpo.mockResolvedValue({
      success: true,
      stdout: 'Upgrading to target: 50.0.0',
      stderr: '',
      exitCode: 0,
    });

    const result = await upgradeExpoSDK({
      target_version: '50.0.0',
    });

    expect(result.success).toBe(true);
    expect(result.data?.target_version).toBe('50.0.0');
  });

  it('should handle upgrade failure', async () => {
    const mockExecuteExpo = expoExecutor.executeExpo as jest.MockedFunction<
      typeof expoExecutor.executeExpo
    >;
    mockExecuteExpo.mockResolvedValue({
      success: false,
      stdout: '',
      stderr: 'Network error',
      exitCode: 1,
    });

    const result = await upgradeExpoSDK({});

    expect(result.success).toBe(false);
    expect(result.data?.applied).toBe(false);
  });

  it('should handle exception during upgrade', async () => {
    const mockExecuteExpo = expoExecutor.executeExpo as jest.MockedFunction<
      typeof expoExecutor.executeExpo
    >;
    mockExecuteExpo.mockRejectedValue(new Error('Command failed'));

    const result = await upgradeExpoSDK({});

    expect(result.success).toBe(false);
    expect(result.error).toContain('Command failed');
  });

  it('should not include breaking_changes when none found', async () => {
    const mockExecuteExpo = expoExecutor.executeExpo as jest.MockedFunction<
      typeof expoExecutor.executeExpo
    >;
    mockExecuteExpo.mockResolvedValue({
      success: true,
      stdout: 'expo 49.0.0 → 49.1.0',
      stderr: '',
      exitCode: 0,
    });

    const result = await upgradeExpoSDK({});

    expect(result.success).toBe(true);
    expect(result.data?.breaking_changes).toBeUndefined();
  });

  it('should handle empty changes list', async () => {
    const mockExecuteExpo = expoExecutor.executeExpo as jest.MockedFunction<
      typeof expoExecutor.executeExpo
    >;
    mockExecuteExpo.mockResolvedValue({
      success: true,
      stdout: 'Already up to date',
      stderr: '',
      exitCode: 0,
    });

    const result = await upgradeExpoSDK({});

    expect(result.success).toBe(true);
    expect(result.data?.changes).toHaveLength(0);
  });
});
