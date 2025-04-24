import React, { forwardRef, useImperativeHandle, useRef } from 'react';
import { HeightfieldCollider } from '@react-three/rapier';

// A wrapper around HeightfieldCollider that properly handles refs
const ForwardRefHeightfieldCollider = forwardRef((props, ref) => {
  const internalRef = useRef();
  
  // Forward the important methods from the HeightfieldCollider to the ref
  useImperativeHandle(ref, () => ({
    // Expose any methods we might need
    getInternalRef: () => internalRef.current
  }), []);
  
  // Render the HeightfieldCollider with our internal ref
  return <HeightfieldCollider ref={internalRef} {...props} />;
});

// Add display name for debugging
ForwardRefHeightfieldCollider.displayName = 'ForwardRefHeightfieldCollider';

export default ForwardRefHeightfieldCollider;
