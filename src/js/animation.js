import * as THREE from "three";
import * as BufferGeometryUtils from 'three/addons/utils/BufferGeometryUtils.js';
import { scene } from "./setup.js";
import { EXPLOSION_CONFIG } from './explosionConfig.js';
import {
  addPhysicsBody,
  updatePhysics,
  applyExplosionForce,
  isBodyStopped,
  removePhysicsBody,
  freezeBody
} from "./physics.js";

let collided = false;
let monsoonSpeed = 0.1;
let endGameSpeed = 0.1;
let weaponSpinSpeed = 0.4;
let collisionTime = 0;
let fightStarted = false;
let mergedMesh = null;
let stoppedPieces = [];
let physicsEnabled = false;
let explosionStartTime = 0;
let totalPieces = 0;
let settledPieces = 0;

const acceleration = 0.02;

const explodeBots = (monsoonPieces, endGamePieces) => {
  const allPieces = [...monsoonPieces, ...endGamePieces];

  explosionStartTime = performance.now();
  totalPieces = allPieces.length;
  settledPieces = 0;

  allPieces.forEach((piece) => {
    if (piece.geometry && piece.isMesh) {
      piece.geometry.computeBoundingBox();

      // Add physics body
      addPhysicsBody(piece);

      // Explosion forces from config
      const explosionForce = new THREE.Vector3(
        (Math.random() - 0.5) * (EXPLOSION_CONFIG.horizontalForceMax - EXPLOSION_CONFIG.horizontalForceMin) * 2,
        Math.random() * (EXPLOSION_CONFIG.verticalForceMax - EXPLOSION_CONFIG.verticalForceMin) + EXPLOSION_CONFIG.verticalForceMin,
        (Math.random() - 0.5) * (EXPLOSION_CONFIG.horizontalForceMax - EXPLOSION_CONFIG.horizontalForceMin) * 2
      );

      // Apply force to physics body
      applyExplosionForce(piece, explosionForce);
    }
  });

  physicsEnabled = true;
};

const updateBotMovement = (monsoonBot, endGameBot, monsoonPieces, endGamePieces) => {
  // Move bots towards each other if not collided and fight has started
  if (fightStarted && !collided && monsoonBot && endGameBot) {
    monsoonSpeed += acceleration;
    endGameSpeed += acceleration;

    monsoonBot.position.z += monsoonSpeed;
    endGameBot.position.z -= endGameSpeed;

    const distance = Math.abs(monsoonBot.position.z - endGameBot.position.z);
    if (distance < 50) {
      collided = true;

      // Add randomness to collision point
      const randomX = (Math.random() - 0.5) * 20;
      const randomZ = (Math.random() - 0.5) * 20;

      // STOP the bots completely before explosion
      monsoonSpeed = 0;
      endGameSpeed = 0;
      monsoonBot.position.set(randomX, 0, randomZ);
      endGameBot.position.set(randomX, 0, randomZ);

      explodeBots(monsoonPieces, endGamePieces);
    }
  }

  // Spin down weapons over 3 seconds after collision
  if (collided) {
    collisionTime += 1 / 60;
    const spinDownDuration = 3;
    if (collisionTime < spinDownDuration) {
      weaponSpinSpeed = 0.4 * (1 - collisionTime / spinDownDuration);
    } else {
      weaponSpinSpeed = 0;
    }
  }

  return { collided, weaponSpinSpeed };
};

const updateWeapons = (monsoonWeapons, endGameWeapons) => {
  monsoonWeapons.forEach((weapon) => {
    weapon.rotation.x -= weaponSpinSpeed;
  });

  endGameWeapons.forEach((weapon) => {
    weapon.rotation.z += weaponSpinSpeed;
  });
};

const updateExplosion = (monsoonPieces, endGamePieces, deltaTime) => {
  if (!collided) return;

  if (!physicsEnabled) return;

  const allPieces = [...monsoonPieces, ...endGamePieces];

  // Force all pieces to settle after configured timeout
  const elapsedTime = (performance.now() - explosionStartTime) / 1000;
  if (elapsedTime > EXPLOSION_CONFIG.settlementTimeout && settledPieces < totalPieces) {
    allPieces.forEach(piece => {
      if (!piece.userData.settled) {
        piece.userData.settled = true;
        settledPieces++;
        freezeBody(piece); // Freeze physics to stop twitching
      }
    });
    // Don't return - let physics continue running for visual smoothness
  }

  // Update physics simulation
  updatePhysics(deltaTime);

  const groundSize = 832.5 / 2; // Ground is 832.5x832.5, so half is the boundary

  allPieces.forEach((piece) => {
    const worldPos = new THREE.Vector3();
    piece.getWorldPosition(worldPos);

    // Hide pieces that go off the ground edges
    if (Math.abs(worldPos.x) > groundSize || Math.abs(worldPos.z) > groundSize) {
      piece.visible = false;
      removePhysicsBody(piece);

      // Count as settled (off-screen)
      if (!piece.userData.settled) {
        piece.userData.settled = true;
        settledPieces++;
      }
      return;
    }

    // Check if piece has stopped moving (physics handles the actual movement)
    if (isBodyStopped(piece) && !stoppedPieces.includes(piece)) {
      stoppedPieces.push(piece);

      // Count as settled
      if (!piece.userData.settled) {
        piece.userData.settled = true;
        settledPieces++;
      }
    }
  });

  // Disable merging for now due to geometry attribute incompatibilities
  // Re-enable after standardizing meshes in Blender
  // if (stoppedPieces.length > 20 && !mergedMesh) {
  //   mergePieces();
  // }
};

const mergePieces = () => {
  const geometries = [];

  stoppedPieces.forEach((piece) => {
    if (piece.isMesh && piece.geometry && piece.visible) {
      // Clone and apply world transform
      const geo = piece.geometry.clone();

      // Remove any morph attributes that might cause merge issues
      geo.morphAttributes = {};

      geo.applyMatrix4(piece.matrixWorld);
      geometries.push(geo);

      // Hide original piece
      piece.visible = false;
    }
  });

  if (geometries.length > 0) {
    try {
      // Merge with mergeBufferGeometries which is more forgiving
      const mergedGeometry = BufferGeometryUtils.mergeGeometries(geometries, false);

      if (!mergedGeometry) {
        console.warn('Merge returned null, skipping merge');
        return;
      }

      const material = new THREE.MeshStandardMaterial({
        color: 0xcccccc,
        metalness: 0.5,
        roughness: 0.5
      });

      mergedMesh = new THREE.Mesh(mergedGeometry, material);
      scene.add(mergedMesh);

      // Clear the stopped pieces array
      stoppedPieces = [];
    } catch (error) {
      console.error('Failed to merge geometries:', error);
      // Re-show pieces if merge fails
      stoppedPieces.forEach(piece => piece.visible = true);
    }
  }
};

const startFight = () => {
  fightStarted = true;
};

export { updateBotMovement, updateWeapons, updateExplosion, startFight };

