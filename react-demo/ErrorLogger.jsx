import { useEffect } from 'react';

// This component captures console errors and displays them in a visible overlay
export default function ErrorLogger() {
  useEffect(() => {
    // Store original console methods
    const originalConsoleError = console.error;
    const originalConsoleWarn = console.warn;
    
    // Create a container for error messages
    const errorContainer = document.createElement('div');
    errorContainer.id = 'error-logger-container';
    errorContainer.style.position = 'fixed';
    errorContainer.style.bottom = '10px';
    errorContainer.style.left = '10px';
    errorContainer.style.maxWidth = '80%';
    errorContainer.style.maxHeight = '30%';
    errorContainer.style.overflow = 'auto';
    errorContainer.style.zIndex = '9999';
    errorContainer.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
    errorContainer.style.color = 'white';
    errorContainer.style.padding = '10px';
    errorContainer.style.borderRadius = '5px';
    errorContainer.style.fontFamily = 'monospace';
    errorContainer.style.fontSize = '12px';
    document.body.appendChild(errorContainer);

    // Create a clear button
    const clearButton = document.createElement('button');
    clearButton.textContent = 'Clear Errors';
    clearButton.style.position = 'absolute';
    clearButton.style.top = '5px';
    clearButton.style.right = '5px';
    clearButton.style.padding = '3px 8px';
    clearButton.style.backgroundColor = '#555';
    clearButton.style.color = 'white';
    clearButton.style.border = 'none';
    clearButton.style.borderRadius = '3px';
    clearButton.style.cursor = 'pointer';
    clearButton.onclick = () => {
      const messagesContainer = document.getElementById('error-messages');
      if (messagesContainer) {
        messagesContainer.innerHTML = '';
      }
    };
    errorContainer.appendChild(clearButton);

    // Create a container for messages
    const messagesContainer = document.createElement('div');
    messagesContainer.id = 'error-messages';
    messagesContainer.style.marginTop = '25px';
    errorContainer.appendChild(messagesContainer);

    // Function to add a message to the container
    const addMessage = (type, args) => {
      const messageElement = document.createElement('div');
      messageElement.style.borderBottom = '1px solid #444';
      messageElement.style.padding = '5px 0';
      messageElement.style.marginBottom = '5px';
      
      // Add timestamp
      const timestamp = new Date().toLocaleTimeString();
      const timeElement = document.createElement('span');
      timeElement.textContent = `[${timestamp}] `;
      timeElement.style.color = '#aaa';
      messageElement.appendChild(timeElement);
      
      // Add type indicator
      const typeElement = document.createElement('span');
      typeElement.textContent = type === 'error' ? 'ERROR: ' : 'WARNING: ';
      typeElement.style.color = type === 'error' ? '#ff5555' : '#ffaa00';
      typeElement.style.fontWeight = 'bold';
      messageElement.appendChild(typeElement);
      
      // Add message content
      const contentElement = document.createElement('span');
      contentElement.textContent = args.map(arg => 
        typeof arg === 'object' ? JSON.stringify(arg) : String(arg)
      ).join(' ');
      messageElement.appendChild(contentElement);
      
      messagesContainer.appendChild(messageElement);
      
      // Auto-scroll to bottom
      messagesContainer.scrollTop = messagesContainer.scrollHeight;
    };

    // Override console.error
    console.error = function(...args) {
      // Call original method
      originalConsoleError.apply(console, args);
      // Add to our UI
      addMessage('error', args);
    };

    // Override console.warn
    console.warn = function(...args) {
      // Call original method
      originalConsoleWarn.apply(console, args);
      // Add to our UI
      addMessage('warning', args);
    };

    // Cleanup function
    return () => {
      // Restore original console methods
      console.error = originalConsoleError;
      console.warn = originalConsoleWarn;
      
      // Remove the error container
      if (document.body.contains(errorContainer)) {
        document.body.removeChild(errorContainer);
      }
    };
  }, []);

  return null; // This component doesn't render anything
}
