# Bug Report: Ref Forwarding Issues with RigidBody Component

## Description
When using the `RigidBody` component from `@react-three/rapier`, React throws warnings about refs not being properly forwarded. This occurs even when following React's recommended patterns for ref forwarding.

## Environment
- React version: 18.3.1
- @react-three/fiber version: latest
- @react-three/rapier version: 2.1.0
- @react-three/drei version: latest
- Browser: Chrome (latest)
- OS: Windows

## Steps to Reproduce
1. Create a component that uses the `RigidBody` component from `@react-three/rapier`
2. Try to pass a ref to this component from a parent component
3. Even when using `React.forwardRef` correctly, warnings appear in the console

## Minimal Reproduction Code

```jsx
// CustomRigidBody.jsx
import React, { forwardRef } from 'react';
import { RigidBody } from '@react-three/rapier';

const CustomRigidBody = forwardRef(function CustomRigidBody(props, ref) {
  return (
    <RigidBody ref={ref} {...props}>
      {props.children}
    </RigidBody>
  );
});

export default CustomRigidBody;

// ParentComponent.jsx
import React, { useRef } from 'react';
import CustomRigidBody from './CustomRigidBody';

function ParentComponent() {
  const rigidBodyRef = useRef();
  
  return (
    <CustomRigidBody 
      ref={rigidBodyRef}
      position={[0, 0, 0]}
      type="kinematicPosition"
    >
      <mesh>
        <boxGeometry />
        <meshStandardMaterial />
      </mesh>
    </CustomRigidBody>
  );
}
```

## Error Messages
```
Warning: Function components cannot be given refs. Attempts to access this ref will fail. Did you mean to use React.forwardRef()?

Check the render method of `ForwardRef`.
    at http://localhost:5173/@fs/path/to/node_modules/@react-three/rapier.js:1249:5
    at http://localhost:5173/CustomRigidBody.jsx:4:3
    at ParentComponent (http://localhost:5173/ParentComponent.jsx:10:3)
    at Physics (http://localhost:5173/@fs/path/to/node_modules/@react-three/rapier.js:640:5)
    ...
```

```
Warning: `ref` is not a prop. Trying to access it will result in `undefined` being returned. If you need to access the same value within the child component, you should pass it as a different prop. (https://reactjs.org/link/special-props)

    at http://localhost:5173/@fs/path/to/node_modules/@react-three/rapier.js:1249:5
    at http://localhost:5173/CustomRigidBody.jsx:4:3
    at ParentComponent (http://localhost:5173/ParentComponent.jsx:10:3)
    at Physics (http://localhost:5173/@fs/path/to/node_modules/@react-three/rapier.js:640:5)
    ...
```

## Expected Behavior
When using `forwardRef` correctly as shown in the example, there should be no warnings in the console, and refs should be properly forwarded to the underlying components.

## Actual Behavior
Even when using `forwardRef` correctly, warnings appear in the console about refs not being properly forwarded. The warnings originate from within the `@react-three/rapier` library itself.

## Possible Solution
The issue appears to be in how the `RigidBody` component is implemented in the `@react-three/rapier` library. It seems that the component is not properly using `forwardRef` internally, or there might be an issue with how it handles refs.

A possible solution would be to update the `RigidBody` component to properly use `forwardRef` and ensure that refs are correctly passed down to the underlying Three.js objects.

## Additional Context
This issue is particularly problematic when building complex physics-based applications where refs need to be passed down to physics components. While the application still functions despite these warnings, they clutter the console and make debugging more difficult.

I've attempted various workarounds, including creating custom wrapper components with `forwardRef` and using `useImperativeHandle`, but the warnings persist as they originate from within the library itself.

## Willingness to Help
I'm willing to help test any potential fixes and provide additional information if needed.
