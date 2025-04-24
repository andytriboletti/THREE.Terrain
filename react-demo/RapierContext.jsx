import React, { createContext, useContext } from 'react';

// Create a context for the Rapier mode
export const RapierContext = createContext(false);

// Custom hook to use the Rapier context
export const useRapierMode = () => useContext(RapierContext);
