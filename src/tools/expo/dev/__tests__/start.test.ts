import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { startDevServer } from '../start.js';
import { sessionManager } from '../../core/shell-session-manager.js';
import { qrGenerator } from '../../core/qr-generator.js';
import { logParser } from '../../core/log-parser.js';

// Mock all dependencies
jest.mock('../../core/shell-session-manager.js', () => ({
  sessionManager: {
    startSession: jest.fn(),
    getStatus: jest.fn(),
    readOutput: jest.fn(),
    stopSession: jest.fn(),
  },
}));

jest.mock('../../core/qr-generator.js', () => ({
  qrGenerator: {
    generate: jest.fn(),
    formatOutput: jest.fn(),
    extractURL: jest.fn(),
  },
}));

jest.mock('../../core/log-parser.js', () => ({
  logParser: {
    isDevServerReady: jest.fn(),
  },
}));

describe('startDevServer', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should start dev server successfully with minimal config', async () => {
    const mockStartSession = sessionManager.startSession as jest.MockedFunction<
      typeof sessionManager.startSession
    >;
    const mockGetStatus = sessionManager.getStatus as jest.MockedFunction<
      typeof sessionManager.getStatus
    >;
    const mockReadOutput = sessionManager.readOutput as jest.MockedFunction<
      typeof sessionManager.readOutput
    >;
    const mockIsDevServerReady = logParser.isDevServerReady as jest.MockedFunction<
      typeof logParser.isDevServerReady
    >;
    const mockExtractURL = qrGenerator.extractURL as jest.MockedFunction<
      typeof qrGenerator.extractURL
    >;
    const mockGenerate = qrGenerator.generate as jest.MockedFunction<typeof qrGenerator.generate>;
    const mockFormatOutput = qrGenerator.formatOutput as jest.MockedFunction<
      typeof qrGenerator.formatOutput
    >;

    mockStartSession.mockReturnValue({ success: true });
    mockGetStatus.mockReturnValue({ success: true, status: 'running' });
    mockReadOutput.mockReturnValue({
      success: true,
      logs: [
        { timestamp: new Date(), level: 'info', message: 'Server ready', raw: 'Server ready' },
      ],
      status: 'running',
    });
    mockIsDevServerReady.mockReturnValue(true);
    mockExtractURL.mockReturnValue('exp://192.168.1.1:8081');
    mockGenerate.mockResolvedValue({
      format: 'terminal',
      data: 'QR_CODE',
      url: 'exp://192.168.1.1:8081',
    });
    mockFormatOutput.mockReturnValue('QR_CODE_FORMATTED');

    const result = await startDevServer({});

    expect(result.success).toBe(true);
    expect(result.data).toBeDefined();
    expect(result.data?.session_id).toMatch(/^expo-dev-\d+$/);
    expect(result.data?.status).toBe('running');
    expect(result.data?.url).toBe('exp://192.168.1.1:8081');
  });

  it('should handle session start failure', async () => {
    const mockStartSession = sessionManager.startSession as jest.MockedFunction<
      typeof sessionManager.startSession
    >;
    mockStartSession.mockReturnValue({
      success: false,
      error: 'Failed to spawn process',
    });

    const result = await startDevServer({});

    expect(result.success).toBe(false);
    expect(result.error).toContain('Failed to spawn process');
  });

  it('should include platform option when specified', async () => {
    const mockStartSession = sessionManager.startSession as jest.MockedFunction<
      typeof sessionManager.startSession
    >;
    const mockGetStatus = sessionManager.getStatus as jest.MockedFunction<
      typeof sessionManager.getStatus
    >;
    const mockReadOutput = sessionManager.readOutput as jest.MockedFunction<
      typeof sessionManager.readOutput
    >;
    const mockIsDevServerReady = logParser.isDevServerReady as jest.MockedFunction<
      typeof logParser.isDevServerReady
    >;
    const mockExtractURL = qrGenerator.extractURL as jest.MockedFunction<
      typeof qrGenerator.extractURL
    >;

    mockStartSession.mockReturnValue({ success: true });
    mockGetStatus.mockReturnValue({ success: true, status: 'running' });
    mockReadOutput.mockReturnValue({
      success: true,
      logs: [{ timestamp: new Date(), level: 'info', message: 'Ready', raw: 'Ready' }],
      status: 'running',
    });
    mockIsDevServerReady.mockReturnValue(true);
    mockExtractURL.mockReturnValue('exp://192.168.1.1:8081');

    await startDevServer({ platform: 'ios' });

    expect(mockStartSession).toHaveBeenCalledWith(
      expect.any(String),
      expect.arrayContaining(['--ios']),
      expect.any(Object)
    );
  });

  it('should include clear_cache option when specified', async () => {
    const mockStartSession = sessionManager.startSession as jest.MockedFunction<
      typeof sessionManager.startSession
    >;
    const mockGetStatus = sessionManager.getStatus as jest.MockedFunction<
      typeof sessionManager.getStatus
    >;
    const mockReadOutput = sessionManager.readOutput as jest.MockedFunction<
      typeof sessionManager.readOutput
    >;
    const mockIsDevServerReady = logParser.isDevServerReady as jest.MockedFunction<
      typeof logParser.isDevServerReady
    >;
    const mockExtractURL = qrGenerator.extractURL as jest.MockedFunction<
      typeof qrGenerator.extractURL
    >;

    mockStartSession.mockReturnValue({ success: true });
    mockGetStatus.mockReturnValue({ success: true, status: 'running' });
    mockReadOutput.mockReturnValue({
      success: true,
      logs: [{ timestamp: new Date(), level: 'info', message: 'Ready', raw: 'Ready' }],
      status: 'running',
    });
    mockIsDevServerReady.mockReturnValue(true);
    mockExtractURL.mockReturnValue('exp://192.168.1.1:8081');

    await startDevServer({ clear_cache: true });

    expect(mockStartSession).toHaveBeenCalledWith(
      expect.any(String),
      expect.arrayContaining(['--clear']),
      expect.any(Object)
    );
  });

  it('should include port option when specified', async () => {
    const mockStartSession = sessionManager.startSession as jest.MockedFunction<
      typeof sessionManager.startSession
    >;
    const mockGetStatus = sessionManager.getStatus as jest.MockedFunction<
      typeof sessionManager.getStatus
    >;
    const mockReadOutput = sessionManager.readOutput as jest.MockedFunction<
      typeof sessionManager.readOutput
    >;
    const mockIsDevServerReady = logParser.isDevServerReady as jest.MockedFunction<
      typeof logParser.isDevServerReady
    >;
    const mockExtractURL = qrGenerator.extractURL as jest.MockedFunction<
      typeof qrGenerator.extractURL
    >;

    mockStartSession.mockReturnValue({ success: true });
    mockGetStatus.mockReturnValue({ success: true, status: 'running' });
    mockReadOutput.mockReturnValue({
      success: true,
      logs: [{ timestamp: new Date(), level: 'info', message: 'Ready', raw: 'Ready' }],
      status: 'running',
    });
    mockIsDevServerReady.mockReturnValue(true);
    mockExtractURL.mockReturnValue('exp://192.168.1.1:9000');

    await startDevServer({ port: 9000 });

    expect(mockStartSession).toHaveBeenCalledWith(
      expect.any(String),
      expect.arrayContaining(['--port', '9000']),
      expect.any(Object)
    );
  });

  it('should handle failed to read logs', async () => {
    const mockStartSession = sessionManager.startSession as jest.MockedFunction<
      typeof sessionManager.startSession
    >;
    const mockGetStatus = sessionManager.getStatus as jest.MockedFunction<
      typeof sessionManager.getStatus
    >;
    const mockReadOutput = sessionManager.readOutput as jest.MockedFunction<
      typeof sessionManager.readOutput
    >;
    const mockStopSession = sessionManager.stopSession as jest.MockedFunction<
      typeof sessionManager.stopSession
    >;

    mockStartSession.mockReturnValue({ success: true });
    mockGetStatus.mockReturnValue({ success: true, status: 'running' });
    mockReadOutput.mockReturnValue({
      success: false,
      error: 'Failed to read logs',
    });

    const result = await startDevServer({});

    expect(result.success).toBe(false);
    expect(result.error).toContain('Failed to read');
    expect(mockStopSession).toHaveBeenCalled();
  });

  it('should handle session error during wait', async () => {
    const mockStartSession = sessionManager.startSession as jest.MockedFunction<
      typeof sessionManager.startSession
    >;
    const mockGetStatus = sessionManager.getStatus as jest.MockedFunction<
      typeof sessionManager.getStatus
    >;
    const mockStopSession = sessionManager.stopSession as jest.MockedFunction<
      typeof sessionManager.stopSession
    >;

    mockStartSession.mockReturnValue({ success: true });
    mockGetStatus.mockReturnValue({ success: true, status: 'error' });

    const result = await startDevServer({});

    expect(result.success).toBe(false);
    expect(result.error).toContain('encountered an error');
    expect(mockStopSession).toHaveBeenCalled();
  });

  it('should handle URL not found in logs', async () => {
    const mockStartSession = sessionManager.startSession as jest.MockedFunction<
      typeof sessionManager.startSession
    >;
    const mockGetStatus = sessionManager.getStatus as jest.MockedFunction<
      typeof sessionManager.getStatus
    >;
    const mockReadOutput = sessionManager.readOutput as jest.MockedFunction<
      typeof sessionManager.readOutput
    >;
    const mockIsDevServerReady = logParser.isDevServerReady as jest.MockedFunction<
      typeof logParser.isDevServerReady
    >;
    const mockExtractURL = qrGenerator.extractURL as jest.MockedFunction<
      typeof qrGenerator.extractURL
    >;
    const mockStopSession = sessionManager.stopSession as jest.MockedFunction<
      typeof sessionManager.stopSession
    >;

    mockStartSession.mockReturnValue({ success: true });
    mockGetStatus.mockReturnValue({ success: true, status: 'running' });
    mockReadOutput.mockReturnValue({
      success: true,
      logs: [{ timestamp: new Date(), level: 'info', message: 'Ready', raw: 'Ready' }],
      status: 'running',
    });
    mockIsDevServerReady.mockReturnValue(true);
    mockExtractURL.mockReturnValue(null);

    const result = await startDevServer({});

    expect(result.success).toBe(false);
    expect(result.error).toContain('URL not found');
    expect(mockStopSession).toHaveBeenCalled();
  });
});
