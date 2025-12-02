import * as THREE from "three";

let collided = false;
let monsoonSpeed = 0.1;
let endGameSpeed = 0.1;
let weaponSpinSpeed = 0.4;
let collisionTime = 0;
let fightStarted = false;

const acceleration = 0.02;

function explodeBots(monsoonPieces, endGamePieces) {
  const allPieces = [...monsoonPieces, ...endGamePieces];

  allPieces.forEach((piece) => {
    // Calculate size based on bounding box
    if (piece.geometry) {
      piece.geometry.computeBoundingBox();
      const box = piece.geometry.boundingBox;
      const size = box.max.distanceTo(box.min);

      // Smaller pieces get higher velocity multiplier (inverse relationship)
      // Small pieces (size < 10): multiplier ~2-3
      // Large pieces (size > 40): multiplier ~0.3
      const velocityMultiplier = Math.max(0.2, Math.min(3, 30 / size));

      piece.userData.velocity = new THREE.Vector3(
        (Math.random() - 0.5) * 0.6 * velocityMultiplier,
        (Math.random() * 1.2 + 0.2) * velocityMultiplier,
        (Math.random() - 0.5) * 0.6 * velocityMultiplier
      );
      piece.userData.rotationSpeed = new THREE.Vector3(
        (Math.random() - 0.5) * 0.1 * velocityMultiplier,
        (Math.random() - 0.5) * 0.1 * velocityMultiplier,
        (Math.random() - 0.5) * 0.1 * velocityMultiplier
      );
    } else {
      // Fallback for pieces without geometry
      piece.userData.velocity = new THREE.Vector3(
        (Math.random() - 0.5) * 1,
        Math.random() * 1.5 + 0.3,
        (Math.random() - 0.5) * 1
      );
      piece.userData.rotationSpeed = new THREE.Vector3(
        (Math.random() - 0.5) * 0.1,
        (Math.random() - 0.5) * 0.1,
        (Math.random() - 0.5) * 0.1
      );
    }
  });
}

function updateBotMovement(monsoonBot, endGameBot, monsoonPieces, endGamePieces) {
  // Move bots towards each other if not collided and fight has started
  if (fightStarted && !collided && monsoonBot && endGameBot) {
    monsoonSpeed += acceleration;
    endGameSpeed += acceleration;

    monsoonBot.position.z += monsoonSpeed;
    endGameBot.position.z -= endGameSpeed;

    const distance = Math.abs(monsoonBot.position.z - endGameBot.position.z);
    if (distance < 50) {
      collided = true;
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
}

function updateWeapons(monsoonWeapons, endGameWeapons) {
  monsoonWeapons.forEach((weapon) => {
    weapon.rotation.x -= weaponSpinSpeed;
  });

  endGameWeapons.forEach((weapon) => {
    weapon.rotation.z += weaponSpinSpeed;
  });
}

function updateExplosion(monsoonPieces, endGamePieces) {
  if (!collided) return;

  const groundSize = 555 / 2; // Ground is 555x555, so half is the boundary

  const allPieces = [...monsoonPieces, ...endGamePieces];

  allPieces.forEach((piece) => {
    if (piece.userData.velocity) {
      // Apply strong air resistance to all pieces
      piece.userData.velocity.x *= 0.95;
      piece.userData.velocity.z *= 0.95;

      piece.position.add(piece.userData.velocity);
      piece.userData.velocity.y -= 0.05;

      const worldPos = new THREE.Vector3();
      piece.getWorldPosition(worldPos);

      // Hide pieces that go off the ground edges
      if (Math.abs(worldPos.x) > groundSize || Math.abs(worldPos.z) > groundSize) {
        piece.visible = false;
        return;
      }

      if (worldPos.y <= 0) {
        piece.position.y += (0 - worldPos.y);
        piece.userData.velocity.y *= -0.3;  // Less bounce
        piece.userData.velocity.x *= 0.3;   // Much stronger friction
        piece.userData.velocity.z *= 0.3;   // Much stronger friction

        // Aggressively stop pieces on the ground that are barely moving
        if (Math.abs(piece.userData.velocity.y) < 0.15 &&
          Math.abs(piece.userData.velocity.x) < 0.15 &&
          Math.abs(piece.userData.velocity.z) < 0.15) {
          piece.userData.velocity.set(0, 0, 0);
          piece.userData.rotationSpeed.set(0, 0, 0); // Stop rotation completely
        }
      }

      // Stop movement if rotation has stopped (piece has settled)
      if (piece.userData.rotationSpeed &&
        Math.abs(piece.userData.rotationSpeed.x) < 0.001 &&
        Math.abs(piece.userData.rotationSpeed.y) < 0.001 &&
        Math.abs(piece.userData.rotationSpeed.z) < 0.001) {
        piece.userData.velocity.set(0, 0, 0);
        piece.userData.rotationSpeed.set(0, 0, 0);
      }

      // Only rotate if there's still rotation speed
      if (piece.userData.rotationSpeed &&
        (Math.abs(piece.userData.rotationSpeed.x) > 0.001 ||
          Math.abs(piece.userData.rotationSpeed.y) > 0.001 ||
          Math.abs(piece.userData.rotationSpeed.z) > 0.001)) {
        piece.rotation.x += piece.userData.rotationSpeed.x;
        piece.rotation.y += piece.userData.rotationSpeed.y;
        piece.rotation.z += piece.userData.rotationSpeed.z;
      }
    }
  });
}

function startFight() {
  fightStarted = true;
}

export { updateBotMovement, updateWeapons, updateExplosion, startFight };
