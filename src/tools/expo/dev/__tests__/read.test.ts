import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { readDevLogs } from '../read.js';
import { sessionManager } from '../../core/shell-session-manager.js';

// Mock the session manager
jest.mock('../../core/shell-session-manager.js', () => ({
  sessionManager: {
    readOutput: jest.fn(),
  },
}));

describe('readDevLogs', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should read dev server logs successfully', () => {
    const mockReadOutput = sessionManager.readOutput as jest.MockedFunction<
      typeof sessionManager.readOutput
    >;
    mockReadOutput.mockReturnValue({
      success: true,
      logs: [
        { timestamp: new Date(), level: 'info', message: 'Server started', raw: 'Server started' },
        {
          timestamp: new Date(),
          level: 'info',
          message: 'Listening on port 8081',
          raw: 'Listening on port 8081',
        },
      ],
      status: 'running',
    });

    const result = readDevLogs({
      session_id: 'test-session',
    });

    expect(result.success).toBe(true);
    expect(result.data).toBeDefined();
    expect(result.data?.logs).toHaveLength(2);
    expect(result.data?.total_lines).toBe(2);
    expect(result.data?.status).toBe('running');
  });

  it('should handle custom tail parameter', () => {
    const mockReadOutput = sessionManager.readOutput as jest.MockedFunction<
      typeof sessionManager.readOutput
    >;
    mockReadOutput.mockReturnValue({
      success: true,
      logs: [{ timestamp: new Date(), level: 'info', message: 'Log', raw: 'Log' }],
      status: 'running',
    });

    readDevLogs({
      session_id: 'test-session',
      tail: 100,
    });

    expect(mockReadOutput).toHaveBeenCalledWith('test-session', 100);
  });

  it('should use default tail value of 50', () => {
    const mockReadOutput = sessionManager.readOutput as jest.MockedFunction<
      typeof sessionManager.readOutput
    >;
    mockReadOutput.mockReturnValue({
      success: true,
      logs: [{ timestamp: new Date(), level: 'info', message: 'Log', raw: 'Log' }],
      status: 'running',
    });

    readDevLogs({
      session_id: 'test-session',
    });

    expect(mockReadOutput).toHaveBeenCalledWith('test-session', 50);
  });

  it('should handle session read failure', () => {
    const mockReadOutput = sessionManager.readOutput as jest.MockedFunction<
      typeof sessionManager.readOutput
    >;
    mockReadOutput.mockReturnValue({
      success: false,
      error: 'Session not found',
    });

    const result = readDevLogs({
      session_id: 'non-existent-session',
    });

    expect(result.success).toBe(false);
    expect(result.error).toContain('Session not found');
  });

  it('should handle missing logs in response', () => {
    const mockReadOutput = sessionManager.readOutput as jest.MockedFunction<
      typeof sessionManager.readOutput
    >;
    mockReadOutput.mockReturnValue({
      success: true,
      logs: undefined,
      status: 'running',
    });

    const result = readDevLogs({
      session_id: 'test-session',
    });

    expect(result.success).toBe(false);
    expect(result.error).toBeDefined();
  });

  it('should handle exception during log reading', () => {
    const mockReadOutput = sessionManager.readOutput as jest.MockedFunction<
      typeof sessionManager.readOutput
    >;
    mockReadOutput.mockImplementation(() => {
      throw new Error('Read error');
    });

    const result = readDevLogs({
      session_id: 'test-session',
    });

    expect(result.success).toBe(false);
    expect(result.error).toContain('Read error');
  });

  it('should return correct log count', () => {
    const mockReadOutput = sessionManager.readOutput as jest.MockedFunction<
      typeof sessionManager.readOutput
    >;
    const mockLogs = Array(25)
      .fill(null)
      .map(() => ({
        timestamp: new Date(),
        level: 'info' as const,
        message: 'Test log',
        raw: 'Test log',
      }));

    mockReadOutput.mockReturnValue({
      success: true,
      logs: mockLogs,
      status: 'running',
    });

    const result = readDevLogs({
      session_id: 'test-session',
    });

    expect(result.success).toBe(true);
    expect(result.data?.total_lines).toBe(25);
  });
});
