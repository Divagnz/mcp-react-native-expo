import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { createExpoApp } from '../create.js';
import { expoExecutor } from '../../core/expo-executor.js';

// Mock the expo executor
jest.mock('../../core/expo-executor.js', () => ({
  expoExecutor: {
    execute: jest.fn(),
  },
}));

describe('createExpoApp', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should create Expo app with minimal config', async () => {
    const mockExecute = expoExecutor.execute as jest.MockedFunction<typeof expoExecutor.execute>;
    mockExecute.mockResolvedValue({
      success: true,
      stdout: 'Created a new Expo app at: ./MyApp\nExpo SDK: v50.0.0',
      stderr: '',
      exitCode: 0,
    });

    const result = await createExpoApp({
      project_name: 'MyApp',
    });

    expect(result.success).toBe(true);
    expect(result.data?.project_name).toBe('MyApp');
    expect(result.data?.template).toBe('blank');
    expect(result.data?.installed).toBe(true);
    expect(mockExecute).toHaveBeenCalledWith(
      ['npx', 'create-expo-app', 'MyApp'],
      expect.any(Object)
    );
  });

  it('should include template when specified', async () => {
    const mockExecute = expoExecutor.execute as jest.MockedFunction<typeof expoExecutor.execute>;
    mockExecute.mockResolvedValue({
      success: true,
      stdout: 'Created a new Expo app at: ./MyApp',
      stderr: '',
      exitCode: 0,
    });

    await createExpoApp({
      project_name: 'MyApp',
      template: 'tabs',
    });

    expect(mockExecute).toHaveBeenCalledWith(
      ['npx', 'create-expo-app', 'MyApp', '--template', 'tabs'],
      expect.any(Object)
    );
  });

  it('should include npm flag when specified', async () => {
    const mockExecute = expoExecutor.execute as jest.MockedFunction<typeof expoExecutor.execute>;
    mockExecute.mockResolvedValue({
      success: true,
      stdout: 'Created a new Expo app at: ./MyApp',
      stderr: '',
      exitCode: 0,
    });

    await createExpoApp({
      project_name: 'MyApp',
      npm: true,
    });

    expect(mockExecute).toHaveBeenCalledWith(expect.arrayContaining(['--npm']), expect.any(Object));
  });

  it('should include no-install flag when install is false', async () => {
    const mockExecute = expoExecutor.execute as jest.MockedFunction<typeof expoExecutor.execute>;
    mockExecute.mockResolvedValue({
      success: true,
      stdout: 'Created a new Expo app at: ./MyApp',
      stderr: '',
      exitCode: 0,
    });

    const result = await createExpoApp({
      project_name: 'MyApp',
      install: false,
    });

    expect(mockExecute).toHaveBeenCalledWith(
      expect.arrayContaining(['--no-install']),
      expect.any(Object)
    );
    expect(result.data?.installed).toBe(false);
  });

  it('should include yes flag when specified', async () => {
    const mockExecute = expoExecutor.execute as jest.MockedFunction<typeof expoExecutor.execute>;
    mockExecute.mockResolvedValue({
      success: true,
      stdout: 'Created a new Expo app at: ./MyApp',
      stderr: '',
      exitCode: 0,
    });

    await createExpoApp({
      project_name: 'MyApp',
      yes: true,
    });

    expect(mockExecute).toHaveBeenCalledWith(expect.arrayContaining(['--yes']), expect.any(Object));
  });

  it('should extract SDK version from output', async () => {
    const mockExecute = expoExecutor.execute as jest.MockedFunction<typeof expoExecutor.execute>;
    mockExecute.mockResolvedValue({
      success: true,
      stdout: 'Created app\nExpo SDK: v50.0.0',
      stderr: '',
      exitCode: 0,
    });

    const result = await createExpoApp({
      project_name: 'MyApp',
    });

    expect(result.success).toBe(true);
    expect(result.data?.sdk_version).toBe('50.0.0');
  });

  it('should extract project path from output', async () => {
    const mockExecute = expoExecutor.execute as jest.MockedFunction<typeof expoExecutor.execute>;
    mockExecute.mockResolvedValue({
      success: true,
      stdout: 'Created a new Expo app at: /home/user/MyApp',
      stderr: '',
      exitCode: 0,
    });

    const result = await createExpoApp({
      project_name: 'MyApp',
    });

    expect(result.success).toBe(true);
    expect(result.data?.project_path).toBe('/home/user/MyApp');
  });

  it('should extract next steps from output', async () => {
    const mockExecute = expoExecutor.execute as jest.MockedFunction<typeof expoExecutor.execute>;
    mockExecute.mockResolvedValue({
      success: true,
      stdout: `Created app
Next steps:
  > cd MyApp
  > npx expo start`,
      stderr: '',
      exitCode: 0,
    });

    const result = await createExpoApp({
      project_name: 'MyApp',
    });

    expect(result.success).toBe(true);
    expect(result.data?.next_steps).toBeDefined();
    expect(result.data?.next_steps?.length).toBeGreaterThan(0);
  });

  it('should handle execution failure', async () => {
    const mockExecute = expoExecutor.execute as jest.MockedFunction<typeof expoExecutor.execute>;
    mockExecute.mockResolvedValue({
      success: false,
      stdout: '',
      stderr: 'Failed to create project',
      exitCode: 1,
      error: 'Command failed',
    });

    const result = await createExpoApp({
      project_name: 'MyApp',
    });

    expect(result.success).toBe(false);
    expect(result.error).toBeDefined();
  });

  it('should handle exception during creation', async () => {
    const mockExecute = expoExecutor.execute as jest.MockedFunction<typeof expoExecutor.execute>;
    mockExecute.mockRejectedValue(new Error('Network error'));

    const result = await createExpoApp({
      project_name: 'MyApp',
    });

    expect(result.success).toBe(false);
    expect(result.error).toContain('Network error');
  });
});
