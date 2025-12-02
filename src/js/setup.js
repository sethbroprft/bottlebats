import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";

// Canvas and renderer setup
const canvas = document.querySelector("#c");
const renderer = new THREE.WebGLRenderer({
  canvas,
  antialias: true,
  powerPreference: "high-performance"
});
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

// Camera setup
const camera = new THREE.PerspectiveCamera(55, 2, 0.1, 1000);
camera.position.set(155, 222, 222);

// Controls setup
const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.update();

// Scene setup
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x333333);

export { renderer, camera, controls, scene };
