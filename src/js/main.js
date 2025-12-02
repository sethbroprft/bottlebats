import { renderer, camera, controls } from "./setup.js";
import "./environment.js";
import { monsoonWeapons, endGameWeapons, monsoonBot, endGameBot, monsoonPieces, endGamePieces } from "./bots.js";
import { updateBotMovement, updateWeapons, updateExplosion, startFight } from "./animation.js";
import { scene } from "./setup.js";

// UI Controls
const fightButton = document.getElementById('fightButton');
fightButton.addEventListener('click', () => {
  startFight();
  fightButton.classList.add('hidden');
});

const resetButton = document.getElementById('resetButton');
resetButton.addEventListener('click', () => {
  location.reload();
});

// Resize handler
const resizeRendererToDisplaySize = (renderer) => {
  const canvas = renderer.domElement;
  const width = canvas.clientWidth;
  const height = canvas.clientHeight;
  const needResize = canvas.width !== width || canvas.height !== height;
  if (needResize) {
    renderer.setSize(width, height, false);
  }
  return needResize;
};

let lastTime = performance.now();

// Main render loop
const render = () => {
  const currentTime = performance.now();
  const deltaTime = (currentTime - lastTime) / 1000; // Convert to seconds
  lastTime = currentTime;

  if (resizeRendererToDisplaySize(renderer)) {
    const canvas = renderer.domElement;
    camera.aspect = canvas.clientWidth / canvas.clientHeight;
    camera.updateProjectionMatrix();
  }

  controls.update();

  updateBotMovement(monsoonBot, endGameBot, monsoonPieces, endGamePieces);
  updateWeapons(monsoonWeapons, endGameWeapons);
  updateExplosion(monsoonPieces, endGamePieces, deltaTime);

  renderer.render(scene, camera);
  requestAnimationFrame(render);
}

requestAnimationFrame(render);
