// ErrorReporter.js - Ensures errors are properly logged to the console
// This will be imported at the entry point of the application

// Import the virtual terminal module
import { terminal } from 'virtual:terminal';

// Store original console methods
const originalConsole = {
  log: console.log,
  info: console.info,
  warn: console.warn,
  error: console.error,
  debug: console.debug
};

// Format error objects for better visibility
function formatError(error) {
  if (!(error instanceof Error)) {
    return error;
  }

  // Create a formatted error message with stack trace
  return `
ERROR: ${error.name}: ${error.message}
STACK: ${error.stack}
  `;
}

// Format any value for logging
function formatValue(value) {
  if (value instanceof Error) {
    return formatError(value);
  }

  if (typeof value === 'object') {
    try {
      return JSON.stringify(value, null, 2);
    } catch (e) {
      return String(value);
    }
  }

  return value;
}

// Add timestamp to log messages
function addTimestamp(args) {
  const timestamp = new Date().toISOString();
  return [`[${timestamp}]`, ...args];
}

// Override console methods to ensure they're captured by Vite terminal
console.error = function(...args) {
  // Format any Error objects in the arguments
  const formattedArgs = args.map(arg => formatValue(arg));
  // Call original method
  originalConsole.error(...formattedArgs);
  // Send to terminal - wrapped in try/catch to prevent "Failed to fetch" errors
  try {
    terminal.error(...addTimestamp(formattedArgs));
  } catch (e) {
    // Silently ignore terminal errors
  }
};

console.warn = function(...args) {
  const formattedArgs = args.map(arg => formatValue(arg));
  originalConsole.warn(...formattedArgs);
  try {
    terminal.warn(...addTimestamp(formattedArgs));
  } catch (e) {
    // Silently ignore terminal errors
  }
};

console.log = function(...args) {
  const formattedArgs = args.map(arg => formatValue(arg));
  originalConsole.log(...formattedArgs);
  try {
    terminal.log(...addTimestamp(formattedArgs));
  } catch (e) {
    // Silently ignore terminal errors
  }
};

console.info = function(...args) {
  const formattedArgs = args.map(arg => formatValue(arg));
  originalConsole.info(...formattedArgs);
  try {
    terminal.info(...addTimestamp(formattedArgs));
  } catch (e) {
    // Silently ignore terminal errors
  }
};

console.debug = function(...args) {
  const formattedArgs = args.map(arg => formatValue(arg));
  originalConsole.debug(...formattedArgs);
  try {
    terminal.debug(...addTimestamp(formattedArgs));
  } catch (e) {
    // Silently ignore terminal errors
  }
};

// Add a global error handler to catch unhandled errors
window.addEventListener('error', (event) => {
  console.error('UNHANDLED ERROR:', event.error || event.message);
  // Prevent default to ensure our handler is the only one that runs
  event.preventDefault();
});

// Add a global promise rejection handler
window.addEventListener('unhandledrejection', (event) => {
  console.error('UNHANDLED PROMISE REJECTION:', event.reason);
  // Prevent default to ensure our handler is the only one that runs
  event.preventDefault();
});

// Add React error boundary fallback
if (typeof window !== 'undefined') {
  // Patch React's error reporter
  const reactErrorRegex = /Warning: |Error: |React does not recognize/;

  window.__REACT_ERROR_OVERLAY_GLOBAL_HOOK__ = {
    reportBuildError: (error) => {
      console.error('[REACT BUILD ERROR]', error);
      try {
        terminal.error('[REACT BUILD ERROR]', error);
      } catch (e) {
        // Silently ignore terminal errors
      }
    },
    reportRuntimeError: (error) => {
      console.error('[REACT RUNTIME ERROR]', error);
      try {
        terminal.error('[REACT RUNTIME ERROR]', error);
      } catch (e) {
        // Silently ignore terminal errors
      }
    }
  };
}

// Export a function to manually report errors
export function reportError(error, context = {}) {
  const message = `ERROR REPORT [${context.source || 'unknown'}]:`;
  console.error(message, error);
  try {
    terminal.error(message, error);
  } catch (e) {
    // Silently ignore terminal errors
  }
}

// Log that the error logger has been initialized
console.info('Enhanced error logging initialized');
try {
  terminal.info('Terminal logging initialized - messages will appear in Vite terminal');
} catch (e) {
  // Silently ignore terminal errors
}
