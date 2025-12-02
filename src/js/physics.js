import * as CANNON from 'cannon-es';
import * as THREE from 'three';
import { EXPLOSION_CONFIG } from './explosionConfig.js';

// Create physics world
const world = new CANNON.World();
world.gravity.set(0, EXPLOSION_CONFIG.gravity, 0);
world.broadphase = new CANNON.NaiveBroadphase();
world.solver.iterations = 10;

// Ground plane
const groundBody = new CANNON.Body({
  mass: 0, // Static body
  shape: new CANNON.Plane(),
  material: new CANNON.Material({ friction: 0.4, restitution: 0.2 })
});
groundBody.quaternion.setFromEuler(-Math.PI / 2, 0, 0);
world.addBody(groundBody);

// Store physics bodies mapped to Three.js meshes
const physicsBodyMap = new Map();

const addPhysicsBody = (mesh) => {
  if (!mesh.geometry || !mesh.geometry.boundingBox) {
    mesh.geometry.computeBoundingBox();
  }

  const box = mesh.geometry.boundingBox;
  const size = box.max.clone().sub(box.min);

  // Create box shape based on mesh dimensions
  const shape = new CANNON.Box(new CANNON.Vec3(
    size.x / 2,
    size.y / 2,
    size.z / 2
  ));

  // Calculate mass based on volume (larger = heavier)
  const volume = size.x * size.y * size.z;
  const mass = Math.max(0.1, volume * 0.01); // Density-based mass

  const body = new CANNON.Body({
    mass: mass,
    shape: shape,
    material: new CANNON.Material({
      friction: EXPLOSION_CONFIG.friction,
      restitution: EXPLOSION_CONFIG.restitution
    }),
    linearDamping: EXPLOSION_CONFIG.linearDamping,
    angularDamping: EXPLOSION_CONFIG.angularDamping
  });

  // Use WORLD position for physics body (pieces are children of bots)
  const worldPos = new THREE.Vector3();
  mesh.getWorldPosition(worldPos);

  body.position.set(worldPos.x, worldPos.y, worldPos.z);
  body.quaternion.set(mesh.quaternion.x, mesh.quaternion.y, mesh.quaternion.z, mesh.quaternion.w);

  world.addBody(body);
  physicsBodyMap.set(mesh, body);

  return body;
};

const removePhysicsBody = (mesh) => {
  const body = physicsBodyMap.get(mesh);
  if (body) {
    world.removeBody(body);
    physicsBodyMap.delete(mesh);
  }
};

const updatePhysics = (deltaTime) => {
  // Step the physics simulation
  world.step(1 / 60, deltaTime, 3);

  // Update Three.js meshes to match physics bodies
  physicsBodyMap.forEach((body, mesh) => {
    mesh.position.copy(body.position);
    mesh.quaternion.copy(body.quaternion);
  });
};

const applyExplosionForce = (mesh, force) => {
  const body = physicsBodyMap.get(mesh);
  if (body) {
    body.velocity.set(force.x, force.y, force.z);
    // Add strong random angular velocity for dramatic spinning
    body.angularVelocity.set(
      (Math.random() - 0.5) * 8,
      (Math.random() - 0.5) * 8,
      (Math.random() - 0.5) * 8
    );
  }
};

const isBodyStopped = (mesh) => {
  const body = physicsBodyMap.get(mesh);
  if (!body) return false;

  const velMag = body.velocity.length();
  const angVelMag = body.angularVelocity.length();

  return velMag < EXPLOSION_CONFIG.velocityThreshold &&
    angVelMag < EXPLOSION_CONFIG.angularVelocityThreshold;
};

const freezeBody = (mesh) => {
  const body = physicsBodyMap.get(mesh);
  if (!body) return;

  body.velocity.set(0, 0, 0);
  body.angularVelocity.set(0, 0, 0);
  body.mass = 0;
  body.updateMassProperties();
};

export {
  world,
  addPhysicsBody,
  removePhysicsBody,
  updatePhysics,
  applyExplosionForce,
  isBodyStopped,
  physicsBodyMap,
  freezeBody
};
