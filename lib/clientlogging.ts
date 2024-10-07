const originalConsole = { ...console };
let verboseLogging = false;

type LogLevel = 'info' | 'warn' | 'error' | 'debug' | 'debug-detail';

async function sendLogToServer(level: string, ...args: any[]) {
  const message = args.map(arg => 
    typeof arg === 'object' ? JSON.stringify(arg, null, 2) : arg
  ).join(' ');

  const timestamp = new Date().toISOString();
  const performanceData = window.performance.timing;
  const loadTime = performanceData.loadEventEnd - performanceData.navigationStart;
  const domReadyTime = performanceData.domContentLoadedEventEnd - performanceData.navigationStart;

  const logData = {
    timestamp,
    level,
    message,
    url: window.location.href,
    userAgent: navigator.userAgent,
    loadTime,
    domReadyTime,
    // Add more performance metrics as needed
  };

  try {
    const response = await fetch('/api/serversidelogging', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(logData),
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
  } catch (err) {
    originalConsole.error('[ERROR] Failed to send log to server:', err);
  }
}

export function setVerboseLogging(enabled: boolean) {
  verboseLogging = enabled;
  localStorage.setItem('verboseLogging', JSON.stringify(enabled));
}

export function setupClientLogging() {
  if (typeof window !== 'undefined') {
    console.log = (...args) => {
      originalConsole.log('[INFO]', ...args);
      sendLogToServer('info', ...args).catch(err => 
        originalConsole.error('[ERROR] Failed to send log to server:', err)
      );
    };

    console.error = (...args) => {
      originalConsole.error('[ERROR]', ...args);
      sendLogToServer('error', ...args).catch(err => 
        originalConsole.error('[ERROR] Failed to send log to server:', err)
      );
    };

    console.warn = (...args) => {
      originalConsole.warn('[WARN]', ...args);
      sendLogToServer('warn', ...args).catch(err => 
        originalConsole.error('[ERROR] Failed to send log to server:', err)
      );
    };

    console.info = (...args) => {
      originalConsole.info('[INFO]', ...args);
      sendLogToServer('info', ...args).catch(err => 
        originalConsole.error('[ERROR] Failed to send log to server:', err)
      );
    };

    console.debug = (...args) => {
      if (verboseLogging) {
        originalConsole.debug('[DEBUG]', ...args);
        sendLogToServer('debug-detail', ...args).catch(err => 
          originalConsole.error('[ERROR] Failed to send log to server:', err)
        );
      }
    };
  }
}

export function logVerbose(tag: string, ...args: any[]) {
  if (verboseLogging) {
    const message = `[DEBUG-DETAIL][${tag}] ${args.join(' ')}`;
    originalConsole.debug(message);
    sendLogToServer('debug-detail', message);
  }
}

export function initializeLogging() {
  const storedVerboseLogging = localStorage.getItem('verboseLogging');
  if (storedVerboseLogging !== null) {
    verboseLogging = JSON.parse(storedVerboseLogging);
  }
}

export function log(message: string, level: LogLevel = 'info') {
  const logData = {
    message,
    level,
    timestamp: new Date().toISOString(),
    url: typeof window !== 'undefined' ? window.location.href : '',
    userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : '',
  };

  console.log(`[${level.toUpperCase()}] ${message}`);

  sendLogToServer(level, message).catch(error => {
    originalConsole.error('Failed to send log to server:', error);
  });
}