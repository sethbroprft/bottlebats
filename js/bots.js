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

// Load Monsoon bot
loader.load("./monsoon/monsoon.gltf", function (gltf) {
  const root1 = gltf.scene;
  root1.position.set(0, 3, -200);
  monsoonBot = root1;

  root1.traverse((child) => {
    if (child.isMesh) {
      child.frustumCulled = true;
      if (child.material) {
        child.material.precision = "mediump";
      }
      if (child.geometry) {
        child.geometry.computeBoundingSphere();
      }
      monsoonPieces.push(child);
    }

    if (monsoonWeapons.length === 0 && child.name && child.name === "blade") {
      monsoonWeapons.push(child);
      console.log("Found monsoon weapon:", child.name);
    }
  });

  scene.add(root1);
}, undefined,
  function (err) { console.log(err); }
);

// Load End Game bot
loader.load("./end-game/endgame.gltf", function (gltf) {
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
      console.log("Found end game weapon:", child.name);
    }
  });

  scene.add(root);
}, undefined,
  function (err) { console.log(err); }
);

export { monsoonWeapons, endGameWeapons, monsoonBot, endGameBot, monsoonPieces, endGamePieces };
