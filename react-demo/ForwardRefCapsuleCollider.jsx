import React, { forwardRef, useImperativeHandle, useRef } from 'react';
import { CapsuleCollider } from '@react-three/rapier';

// A wrapper around CapsuleCollider that properly handles refs
const ForwardRefCapsuleCollider = forwardRef((props, ref) => {
  const internalRef = useRef();
  
  // Forward the important methods from the CapsuleCollider to the ref
  useImperativeHandle(ref, () => ({
    // Expose any methods we might need
    getInternalRef: () => internalRef.current
  }), []);
  
  // Render the CapsuleCollider with our internal ref
  return <CapsuleCollider ref={internalRef} {...props} />;
});

// Add display name for debugging
ForwardRefCapsuleCollider.displayName = 'ForwardRefCapsuleCollider';

export default ForwardRefCapsuleCollider;
