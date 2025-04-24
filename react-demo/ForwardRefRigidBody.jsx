import React, { forwardRef, useImperativeHandle, useRef } from 'react';
import { RigidBody } from '@react-three/rapier';

// A wrapper around RigidBody that properly handles refs
const ForwardRefRigidBody = forwardRef((props, ref) => {
  const internalRef = useRef();

  // Forward the important methods from the RigidBody to the ref
  useImperativeHandle(ref, () => ({
    // Expose only the methods we need
    applyImpulse: (impulse, wake) => {
      if (internalRef.current) {
        internalRef.current.applyImpulse(impulse, wake);
      }
    },
    translation: () => {
      if (internalRef.current) {
        return internalRef.current.translation();
      }
      return { x: 0, y: 0, z: 0 };
    },
    linvel: () => {
      if (internalRef.current) {
        return internalRef.current.linvel();
      }
      return { x: 0, y: 0, z: 0 };
    }
  }), []);

  // Render the RigidBody with our internal ref
  return <RigidBody ref={internalRef} {...props} />;
});

// Add display name for debugging
ForwardRefRigidBody.displayName = 'ForwardRefRigidBody';

export default ForwardRefRigidBody;
