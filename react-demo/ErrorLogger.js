// ErrorLogger.js - Enhanced error logging for Vite terminal

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
  // Add a special prefix that vite-plugin-terminal will recognize
  originalConsole.error('[VITE-TERMINAL-ERROR]', ...addTimestamp(formattedArgs));
};

console.warn = function(...args) {
  const formattedArgs = args.map(arg => formatValue(arg));
  originalConsole.warn('[VITE-TERMINAL-WARN]', ...addTimestamp(formattedArgs));
};

console.log = function(...args) {
  const formattedArgs = args.map(arg => formatValue(arg));
  originalConsole.log('[VITE-TERMINAL-LOG]', ...addTimestamp(formattedArgs));
};

console.info = function(...args) {
  const formattedArgs = args.map(arg => formatValue(arg));
  originalConsole.info('[VITE-TERMINAL-INFO]', ...addTimestamp(formattedArgs));
};

console.debug = function(...args) {
  const formattedArgs = args.map(arg => formatValue(arg));
  originalConsole.debug('[VITE-TERMINAL-DEBUG]', ...addTimestamp(formattedArgs));
};

// Capture unhandled errors
window.addEventListener('error', (event) => {
  console.error('UNHANDLED ERROR:', event.error || event.message);
  // Prevent default to ensure our handler is the only one that runs
  event.preventDefault();
});

// Capture unhandled promise rejections
window.addEventListener('unhandledrejection', (event) => {
  console.error('UNHANDLED PROMISE REJECTION:', event.reason);
  // Prevent default to ensure our handler is the only one that runs
  event.preventDefault();
});

// Export a function to manually report errors
export function reportError(error, context = {}) {
  console.error(`ERROR REPORT [${context.source || 'unknown'}]:`, error);
}

// Log that the error logger has been initialized
console.info('Enhanced error logging initialized');
