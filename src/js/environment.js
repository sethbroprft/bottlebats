import * as THREE from "three";
import { scene } from "./setup.js";

// GROUND
const geometry = new THREE.PlaneGeometry(832.5, 832.5);
const planeMaterial = new THREE.MeshStandardMaterial({ color: 0x0a0a0a, side: THREE.DoubleSide });
const ground = new THREE.Mesh(geometry, planeMaterial);
ground.position.set(0, 0, 0);
ground.rotation.x = Math.PI / -2;
scene.add(ground);

// Lights
const ambient = new THREE.AmbientLight(0xffffff, 1);
scene.add(ambient);

const hemiLight = new THREE.HemisphereLight(0xffffff, 0x444444, 1.5);
hemiLight.position.set(0, 50, 0);
scene.add(hemiLight);

const mainLight = new THREE.DirectionalLight(0xffffff, 2);
mainLight.position.set(30, 50, 30);
scene.add(mainLight);

const fillLight1 = new THREE.DirectionalLight(0xffffff, 1);
fillLight1.position.set(-30, 40, -30);
scene.add(fillLight1);

const fillLight2 = new THREE.DirectionalLight(0xffffff, 0.8);
fillLight2.position.set(0, 40, -50);
scene.add(fillLight2);
