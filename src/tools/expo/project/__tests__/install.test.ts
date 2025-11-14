import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { installExpoPackages } from '../install.js';
import { expoExecutor } from '../../core/expo-executor.js';

// Mock the expo executor
jest.mock('../../core/expo-executor.js', () => ({
  expoExecutor: {
    executeExpo: jest.fn(),
    sanitizePackageNames: jest.fn(),
  },
}));

describe('installExpoPackages', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should install packages successfully', async () => {
    const mockSanitizePackageNames = expoExecutor.sanitizePackageNames as jest.MockedFunction<
      typeof expoExecutor.sanitizePackageNames
    >;
    const mockExecuteExpo = expoExecutor.executeExpo as jest.MockedFunction<
      typeof expoExecutor.executeExpo
    >;

    mockSanitizePackageNames.mockReturnValue({
      valid: ['expo-camera', 'expo-location'],
      invalid: [],
    });
    mockExecuteExpo.mockResolvedValue({
      success: true,
      stdout: 'Successfully installed packages',
      stderr: '',
      exitCode: 0,
    });

    const result = await installExpoPackages({
      packages: ['expo-camera', 'expo-location'],
    });

    expect(result.success).toBe(true);
    expect(result.data?.installed).toEqual(['expo-camera', 'expo-location']);
    expect(result.data?.failed).toHaveLength(0);
    expect(result.data?.message).toContain('Successfully installed 2');
    expect(mockExecuteExpo).toHaveBeenCalledWith(
      ['install', 'expo-camera', 'expo-location', '--check'],
      expect.any(Object)
    );
  });

  it('should include check flag by default', async () => {
    const mockSanitizePackageNames = expoExecutor.sanitizePackageNames as jest.MockedFunction<
      typeof expoExecutor.sanitizePackageNames
    >;
    const mockExecuteExpo = expoExecutor.executeExpo as jest.MockedFunction<
      typeof expoExecutor.executeExpo
    >;

    mockSanitizePackageNames.mockReturnValue({
      valid: ['expo-camera'],
      invalid: [],
    });
    mockExecuteExpo.mockResolvedValue({
      success: true,
      stdout: 'Installed',
      stderr: '',
      exitCode: 0,
    });

    await installExpoPackages({
      packages: ['expo-camera'],
    });

    expect(mockExecuteExpo).toHaveBeenCalledWith(
      expect.arrayContaining(['--check']),
      expect.any(Object)
    );
  });

  it('should omit check flag when check_compatibility is false', async () => {
    const mockSanitizePackageNames = expoExecutor.sanitizePackageNames as jest.MockedFunction<
      typeof expoExecutor.sanitizePackageNames
    >;
    const mockExecuteExpo = expoExecutor.executeExpo as jest.MockedFunction<
      typeof expoExecutor.executeExpo
    >;

    mockSanitizePackageNames.mockReturnValue({
      valid: ['expo-camera'],
      invalid: [],
    });
    mockExecuteExpo.mockResolvedValue({
      success: true,
      stdout: 'Installed',
      stderr: '',
      exitCode: 0,
    });

    await installExpoPackages({
      packages: ['expo-camera'],
      check_compatibility: false,
    });

    expect(mockExecuteExpo).toHaveBeenCalledWith(
      expect.not.arrayContaining(['--check']),
      expect.any(Object)
    );
  });

  it('should include fix flag when specified', async () => {
    const mockSanitizePackageNames = expoExecutor.sanitizePackageNames as jest.MockedFunction<
      typeof expoExecutor.sanitizePackageNames
    >;
    const mockExecuteExpo = expoExecutor.executeExpo as jest.MockedFunction<
      typeof expoExecutor.executeExpo
    >;

    mockSanitizePackageNames.mockReturnValue({
      valid: ['expo-camera'],
      invalid: [],
    });
    mockExecuteExpo.mockResolvedValue({
      success: true,
      stdout: 'Installed',
      stderr: '',
      exitCode: 0,
    });

    await installExpoPackages({
      packages: ['expo-camera'],
      fix: true,
    });

    expect(mockExecuteExpo).toHaveBeenCalledWith(
      expect.arrayContaining(['--fix']),
      expect.any(Object)
    );
  });

  it('should handle invalid package names', async () => {
    const mockSanitizePackageNames = expoExecutor.sanitizePackageNames as jest.MockedFunction<
      typeof expoExecutor.sanitizePackageNames
    >;
    const mockExecuteExpo = expoExecutor.executeExpo as jest.MockedFunction<
      typeof expoExecutor.executeExpo
    >;

    mockSanitizePackageNames.mockReturnValue({
      valid: ['expo-camera'],
      invalid: ['../malicious', '../../etc/passwd'],
    });
    mockExecuteExpo.mockResolvedValue({
      success: true,
      stdout: 'Installed',
      stderr: '',
      exitCode: 0,
    });

    const result = await installExpoPackages({
      packages: ['expo-camera', '../malicious', '../../etc/passwd'],
    });

    expect(result.success).toBe(true);
    expect(result.data?.installed).toEqual(['expo-camera']);
    expect(mockExecuteExpo).toHaveBeenCalledWith(
      expect.not.arrayContaining(['../malicious', '../../etc/passwd']),
      expect.any(Object)
    );
  });

  it('should extract warnings from output', async () => {
    const mockSanitizePackageNames = expoExecutor.sanitizePackageNames as jest.MockedFunction<
      typeof expoExecutor.sanitizePackageNames
    >;
    const mockExecuteExpo = expoExecutor.executeExpo as jest.MockedFunction<
      typeof expoExecutor.executeExpo
    >;

    mockSanitizePackageNames.mockReturnValue({
      valid: ['expo-camera'],
      invalid: [],
    });
    mockExecuteExpo.mockResolvedValue({
      success: true,
      stdout: 'Installed\nwarn: peer dependency missing',
      stderr: '\nwarn: deprecated package',
      exitCode: 0,
    });

    const result = await installExpoPackages({
      packages: ['expo-camera'],
    });

    expect(result.success).toBe(true);
    expect(result.data?.warnings).toHaveLength(2);
  });

  it('should handle installation failure', async () => {
    const mockSanitizePackageNames = expoExecutor.sanitizePackageNames as jest.MockedFunction<
      typeof expoExecutor.sanitizePackageNames
    >;
    const mockExecuteExpo = expoExecutor.executeExpo as jest.MockedFunction<
      typeof expoExecutor.executeExpo
    >;

    mockSanitizePackageNames.mockReturnValue({
      valid: ['expo-camera'],
      invalid: [],
    });
    mockExecuteExpo.mockResolvedValue({
      success: false,
      stdout: '',
      stderr: 'Network error',
      exitCode: 1,
    });

    const result = await installExpoPackages({
      packages: ['expo-camera'],
    });

    expect(result.success).toBe(false);
    expect(result.data?.message).toContain('failed');
    expect(result.data?.failed).toEqual(['expo-camera']);
  });

  it('should handle exception during installation', async () => {
    const mockSanitizePackageNames = expoExecutor.sanitizePackageNames as jest.MockedFunction<
      typeof expoExecutor.sanitizePackageNames
    >;
    const mockExecuteExpo = expoExecutor.executeExpo as jest.MockedFunction<
      typeof expoExecutor.executeExpo
    >;

    mockSanitizePackageNames.mockReturnValue({
      valid: ['expo-camera'],
      invalid: [],
    });
    mockExecuteExpo.mockRejectedValue(new Error('Command failed'));

    const result = await installExpoPackages({
      packages: ['expo-camera'],
    });

    expect(result.success).toBe(false);
    expect(result.error).toContain('Command failed');
  });

  it('should handle empty warnings list', async () => {
    const mockSanitizePackageNames = expoExecutor.sanitizePackageNames as jest.MockedFunction<
      typeof expoExecutor.sanitizePackageNames
    >;
    const mockExecuteExpo = expoExecutor.executeExpo as jest.MockedFunction<
      typeof expoExecutor.executeExpo
    >;

    mockSanitizePackageNames.mockReturnValue({
      valid: ['expo-camera'],
      invalid: [],
    });
    mockExecuteExpo.mockResolvedValue({
      success: true,
      stdout: 'Installed successfully',
      stderr: '',
      exitCode: 0,
    });

    const result = await installExpoPackages({
      packages: ['expo-camera'],
    });

    expect(result.success).toBe(true);
    expect(result.data?.warnings).toHaveLength(0);
  });
});
