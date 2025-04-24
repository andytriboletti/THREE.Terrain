import React, { forwardRef, useImperativeHandle, useRef } from 'react';
import { CuboidCollider } from '@react-three/rapier';

// A wrapper around CuboidCollider that properly handles refs
const ForwardRefCuboidCollider = forwardRef((props, ref) => {
  const internalRef = useRef();
  
  // Forward the important methods from the CuboidCollider to the ref
  useImperativeHandle(ref, () => ({
    // Expose any methods we might need
    getInternalRef: () => internalRef.current
  }), []);
  
  // Render the CuboidCollider with our internal ref
  return <CuboidCollider ref={internalRef} {...props} />;
});

// Add display name for debugging
ForwardRefCuboidCollider.displayName = 'ForwardRefCuboidCollider';

export default ForwardRefCuboidCollider;
