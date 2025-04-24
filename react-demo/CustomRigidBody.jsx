import React, { forwardRef } from 'react';
import { RigidBody } from '@react-three/rapier';

// A custom RigidBody component that properly forwards refs
const CustomRigidBody = forwardRef((props, ref) => {
  return <RigidBody ref={ref} {...props} />;
});

export default CustomRigidBody;
