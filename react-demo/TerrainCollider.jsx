import React, { useEffect, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { useRapier } from '@react-three/rapier';
import * as THREE from 'three';
import { terminal } from 'virtual:terminal';

// Custom component to handle terrain collision using raycasting
const TerrainCollider = ({ terrainMesh, characterRef }) => {
  const { world } = useRapier();
  const raycaster = useRef();
  const rayOrigin = useRef(new THREE.Vector3());
  const rayDirection = useRef(new THREE.Vector3(0, -1, 0));
  const lastPosition = useRef(new THREE.Vector3());
  const characterPosition = useRef(new THREE.Vector3());
  const characterVelocity = useRef(new THREE.Vector3());
  const terrainNormal = useRef(new THREE.Vector3(0, 1, 0));
  const upVector = useRef(new THREE.Vector3(0, 1, 0));
  const slopeAngle = useRef(0);

  // Initialize raycaster in useEffect to ensure it's created after component mount
  useEffect(() => {
    raycaster.current = new THREE.Raycaster();
  }, []);

  // Function to get terrain height at a specific position
  const getTerrainHeightAtPosition = (x, z) => {
    if (!terrainMesh || !raycaster.current) return 0;

    try {
      // Set up raycaster
      rayOrigin.current.set(x, 1000, z); // Start from high above
      rayDirection.current.set(0, -1, 0); // Cast ray downward
      raycaster.current.set(rayOrigin.current, rayDirection.current);

      // Cast ray against terrain
      const intersects = raycaster.current.intersectObject(terrainMesh);

      if (intersects && intersects.length > 0) {
        // Get the first intersection point
        const intersection = intersects[0];
        if (intersection.face) {
          terrainNormal.current.copy(intersection.face.normal);

          // Calculate slope angle
          slopeAngle.current = terrainNormal.current.angleTo(upVector.current);
        }

        return intersection.point.y;
      }
    } catch (error) {
      // Log error but don't crash
      if (Math.random() < 0.01) { // Only log occasionally
        terminal.log("Raycasting error:", error.message);
      }
    }

    return 0; // Default height if no intersection or error
  };

  useFrame(() => {
    if (!characterRef.current || !terrainMesh) return;

    // Get character position and velocity
    if (typeof characterRef.current.translation === 'function') {
      characterPosition.current.copy(characterRef.current.translation());
    } else {
      return; // Can't proceed without position
    }

    if (typeof characterRef.current.linvel === 'function') {
      characterVelocity.current.copy(characterRef.current.linvel());
    } else {
      // Default to zero velocity if not available
      characterVelocity.current.set(0, 0, 0);
    }

    // Get terrain height at character position
    const terrainHeight = getTerrainHeightAtPosition(
      characterPosition.current.x,
      characterPosition.current.z
    );

    // Calculate distance to terrain
    const distanceToTerrain = characterPosition.current.y - terrainHeight;

    // Debug info - only log occasionally to avoid console spam
    if (Math.abs(distanceToTerrain) < 20 && Math.random() < 0.05) {
      terminal.log("Character position:", {
        x: characterPosition.current.x.toFixed(2),
        y: characterPosition.current.y.toFixed(2),
        z: characterPosition.current.z.toFixed(2)
      });
      terminal.log("Terrain height:", terrainHeight.toFixed(2));
      terminal.log("Distance to terrain:", distanceToTerrain.toFixed(2));
      terminal.log("Slope angle:", (slopeAngle.current * (180/Math.PI)).toFixed(2) + "°");
      terminal.log("Character velocity:", {
        x: characterVelocity.current.x.toFixed(2),
        y: characterVelocity.current.y.toFixed(2),
        z: characterVelocity.current.z.toFixed(2)
      });
    }

    // If character is below or close to terrain, handle collision
    if (distanceToTerrain < 10) {
      // Apply stronger upward impulse to prevent falling through
      if (typeof characterRef.current.applyImpulse === 'function') {
        // Calculate upward force based on velocity and distance
        let upwardForce = 0;

        if (characterVelocity.current.y < 0) {
          // If falling, apply stronger upward force based on falling speed
          upwardForce = Math.max(20, -characterVelocity.current.y * 5);
        } else if (distanceToTerrain < 2) {
          // If very close to terrain, apply constant upward force
          upwardForce = 10;
        }

        if (upwardForce > 0) {
          characterRef.current.applyImpulse(
            { x: 0, y: upwardForce, z: 0 },
            true
          );

          // Debug info - only log occasionally
          if (Math.random() < 0.05) {
            terminal.log("Applied upward force:", upwardForce.toFixed(2));
          }
        }

        // Apply slope-based impulse if on a slope
        if (slopeAngle.current > 0.1) {
          const slopeForce = Math.sin(slopeAngle.current) * 10;
          const slopeDirection = new THREE.Vector3()
            .copy(terrainNormal.current)
            .cross(new THREE.Vector3(0, 0, 1))
            .normalize();

          characterRef.current.applyImpulse(
            {
              x: slopeDirection.x * slopeForce,
              y: 0,
              z: slopeDirection.z * slopeForce
            },
            true
          );

          // Debug info - only log occasionally
          if (Math.random() < 0.05) {
            terminal.log("Applied slope force:", slopeForce.toFixed(2));
          }
        }
      }

      // If character is below terrain or falling too fast, teleport it above
      if ((distanceToTerrain < 0 || characterVelocity.current.y < -50) &&
          typeof characterRef.current.setTranslation === 'function') {

        // Teleport to a safe height above terrain
        characterRef.current.setTranslation({
          x: characterPosition.current.x,
          y: terrainHeight + 10, // Set 10 units above terrain
          z: characterPosition.current.z
        });

        // Reset velocity to prevent immediate falling
        if (typeof characterRef.current.setLinvel === 'function') {
          characterRef.current.setLinvel({ x: 0, y: 0, z: 0 }, true);
        }

        // Debug info
        terminal.log("Teleported character above terrain");
      }
    }

    // Store last position
    lastPosition.current.copy(characterPosition.current);
  });

  return null; // This component doesn't render anything
};

export default TerrainCollider;
