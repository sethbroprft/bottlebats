// import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { scene } from "./setup.js";

const monsoonWeapons = [];
const endGameWeapons = [];
let monsoonBot = null;
let endGameBot = null;
const monsoonPieces = [];
const endGamePieces = [];

const loader = new GLTFLoader();

// Load Monsoon bot - Use relative path for Vite base to work
loader.load("./monsoon/monsoon.gltf", (gltf) => {
  const root1 = gltf.scene;
  root1.position.set(0, 3, -200);
  monsoonBot = root1;

  root1.traverse((child) => {
    // Find weapon first - could be a group or mesh
    if (child.name && child.name === "weapon") {
      // Always add the weapon itself (whether it's a Group or Mesh)
      monsoonWeapons.push(child);
      // Also add weapon to pieces so it explodes
      monsoonPieces.push(child);
    }

    if (child.isMesh) {
      child.frustumCulled = true;
      if (child.material) {
        child.material.precision = "mediump";
      }
      if (child.geometry) {
        child.geometry.computeBoundingSphere();
      }
      // Only add individual meshes if they're not part of the weapon
      if (!child.name?.includes("weapon")) {
        monsoonPieces.push(child);
      }
    }
  });

  scene.add(root1);
}, undefined,
  (err) => { console.log(err); }
);

// Load End Game bot - Use relative path for Vite base to work
loader.load("./endgame/endgame.gltf", (gltf) => {
  const root = gltf.scene;
  root.position.set(0, 1, 200);
  root.rotation.set(0, Math.PI, 0);
  endGameBot = root;

  root.traverse((child) => {
    if (child.isMesh) {
      child.frustumCulled = true;
      if (child.material) {
        child.material.precision = "mediump";
      }
      if (child.geometry) {
        child.geometry.computeBoundingSphere();
      }
      endGamePieces.push(child);
    }

    if (endGameWeapons.length === 0
      && child.name
      && child.name.toLowerCase().includes("weapon")) {
      endGameWeapons.push(child);
    }
  });

  scene.add(root);
}, undefined,
  (err) => { console.log(err); }
);

export { monsoonWeapons, endGameWeapons, monsoonBot, endGameBot, monsoonPieces, endGamePieces };
