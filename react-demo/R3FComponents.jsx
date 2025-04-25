import React from 'react';
import * as THREE from 'three';

// This file provides proper React Three Fiber components to fix the warnings

// BoxGeometry component
export const BoxGeometry = React.forwardRef(function BoxGeometry(props, ref) {
  return <boxGeometry ref={ref} {...props} />;
});

// PlaneGeometry component
export const PlaneGeometry = React.forwardRef(function PlaneGeometry(props, ref) {
  return <planeGeometry ref={ref} {...props} />;
});

// MeshStandardMaterial component
export const MeshStandardMaterial = React.forwardRef(function MeshStandardMaterial(props, ref) {
  return <meshStandardMaterial ref={ref} {...props} />;
});

// MeshBasicMaterial component
export const MeshBasicMaterial = React.forwardRef(function MeshBasicMaterial(props, ref) {
  return <meshBasicMaterial ref={ref} {...props} />;
});

// Mesh component
export const Mesh = React.forwardRef(function Mesh(props, ref) {
  return <mesh ref={ref} {...props} />;
});

// Group component
export const Group = React.forwardRef(function Group(props, ref) {
  return <group ref={ref} {...props} />;
});
