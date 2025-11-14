import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { sendDevCommand } from '../send.js';
import { sessionManager } from '../../core/shell-session-manager.js';

// Mock the session manager
jest.mock('../../core/shell-session-manager.js', () => ({
  sessionManager: {
    sendInput: jest.fn(),
  },
}));

describe('sendDevCommand', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should send reload command successfully', () => {
    const mockSendInput = sessionManager.sendInput as jest.MockedFunction<
      typeof sessionManager.sendInput
    >;
    mockSendInput.mockReturnValue({
      success: true,
    });

    const result = sendDevCommand({
      session_id: 'test-session',
      command: 'reload',
    });

    expect(result.success).toBe(true);
    expect(result.message).toContain('reload');
    expect(mockSendInput).toHaveBeenCalledWith('test-session', 'r');
  });

  it('should send clear_cache command successfully', () => {
    const mockSendInput = sessionManager.sendInput as jest.MockedFunction<
      typeof sessionManager.sendInput
    >;
    mockSendInput.mockReturnValue({
      success: true,
    });

    const result = sendDevCommand({
      session_id: 'test-session',
      command: 'clear_cache',
    });

    expect(result.success).toBe(true);
    expect(mockSendInput).toHaveBeenCalledWith('test-session', 'shift+r');
  });

  it('should send toggle_inspector command successfully', () => {
    const mockSendInput = sessionManager.sendInput as jest.MockedFunction<
      typeof sessionManager.sendInput
    >;
    mockSendInput.mockReturnValue({
      success: true,
    });

    sendDevCommand({
      session_id: 'test-session',
      command: 'toggle_inspector',
    });

    expect(mockSendInput).toHaveBeenCalledWith('test-session', 'i');
  });

  it('should send toggle_performance_monitor command successfully', () => {
    const mockSendInput = sessionManager.sendInput as jest.MockedFunction<
      typeof sessionManager.sendInput
    >;
    mockSendInput.mockReturnValue({
      success: true,
    });

    sendDevCommand({
      session_id: 'test-session',
      command: 'toggle_performance_monitor',
    });

    expect(mockSendInput).toHaveBeenCalledWith('test-session', 'perf');
  });

  it('should send custom command successfully', () => {
    const mockSendInput = sessionManager.sendInput as jest.MockedFunction<
      typeof sessionManager.sendInput
    >;
    mockSendInput.mockReturnValue({
      success: true,
    });

    const result = sendDevCommand({
      session_id: 'test-session',
      command: 'custom',
      custom_input: 'm',
    });

    expect(result.success).toBe(true);
    expect(mockSendInput).toHaveBeenCalledWith('test-session', 'm');
  });

  it('should fail when custom command has no custom_input', () => {
    const result = sendDevCommand({
      session_id: 'test-session',
      command: 'custom',
    });

    expect(result.success).toBe(false);
    expect(result.error).toContain('custom_input required');
  });

  it('should handle unknown command', () => {
    const result = sendDevCommand({
      session_id: 'test-session',
      command: 'unknown_command' as any,
    });

    expect(result.success).toBe(false);
    expect(result.error).toContain('Unknown command');
  });

  it('should handle session send failure', () => {
    const mockSendInput = sessionManager.sendInput as jest.MockedFunction<
      typeof sessionManager.sendInput
    >;
    mockSendInput.mockReturnValue({
      success: false,
      error: 'Session not found',
    });

    const result = sendDevCommand({
      session_id: 'non-existent-session',
      command: 'reload',
    });

    expect(result.success).toBe(false);
    expect(result.error).toContain('Session not found');
  });

  it('should handle exception during command send', () => {
    const mockSendInput = sessionManager.sendInput as jest.MockedFunction<
      typeof sessionManager.sendInput
    >;
    mockSendInput.mockImplementation(() => {
      throw new Error('Send error');
    });

    const result = sendDevCommand({
      session_id: 'test-session',
      command: 'reload',
    });

    expect(result.success).toBe(false);
    expect(result.error).toContain('Send error');
  });
});
