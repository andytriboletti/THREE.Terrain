import React, { forwardRef } from 'react';
import { RigidBody } from '@react-three/rapier';

// This is a wrapper component for RigidBody to fix ref issues
const RigidBodyWrapper = forwardRef(({ children, ...props }, ref) => {
  return (
    <RigidBody ref={ref} {...props}>
      {children}
    </RigidBody>
  );
});

export default RigidBodyWrapper;
