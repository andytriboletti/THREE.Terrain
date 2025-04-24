import React, { forwardRef } from 'react';
import { RigidBody } from '@react-three/rapier';

// A wrapper around RigidBody that uses forwardRef
const ForwardRefRigidBody = forwardRef((props, ref) => {
  return <RigidBody ref={ref} {...props} />;
});

export default ForwardRefRigidBody;
