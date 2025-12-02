// Explosion Physics Configuration
// Adjust these values to control explosion behavior

export const EXPLOSION_CONFIG = {
  // GRAVITY - How fast pieces fall (Earth is -9.82)
  // Higher = faster fall
  // Current: 60 (6x Earth gravity)
  gravity: -1000,

  // DAMPING - How quickly pieces slow down (0=none, 1=maximum)
  // Lower = pieces maintain speed longer
  linearDamping: 0.5,   // Air resistance
  angularDamping: 0.5,  // Spin resistance

  // GROUND INTERACTION
  friction: 0.9,        // How much pieces grip ground (0=ice, 1=glue)
  restitution: 0.05,    // Bounciness (0=no bounce, 1=super bouncy)

  // STOPPING THRESHOLD - When pieces are considered "stopped"
  // Higher = pieces settle sooner (even while moving slightly)
  velocityThreshold: 50000.0,
  angularVelocityThreshold: 50000.0,

  // EXPLOSION FORCES - Initial velocity when pieces explode
  horizontalForceMin: 0,   // Minimum horizontal X/Z force
  horizontalForceMax: 5,    // Maximum horizontal X/Z force
  verticalForceMin: 0.5,    // Minimum vertical Y force (upward)
  verticalForceMax: 2.5,    // Maximum vertical Y force (upward)

  // TIMEOUT - Force all pieces to settle after this many seconds
  settlementTimeout: 10,  // Increased from 2.5 to 10 seconds

  // QUICK PRESETS - Uncomment one to use

  // REALISTIC (like real physics)
  // gravity: -20, linearDamping: 0.2, angularDamping: 0.3,
  // horizontalForceMax: 4, verticalForceMax: 2, settlementTimeout: 4

  // DRAMATIC (big scatter, takes time)
  // gravity: -30, linearDamping: 0.1, angularDamping: 0.2,
  // horizontalForceMax: 8, verticalForceMax: 4, settlementTimeout: 5

  // FAST (quick scatter and settle)
  // gravity: -100, linearDamping: 0.6, angularDamping: 0.7,
  // horizontalForceMax: 6, verticalForceMax: 2, settlementTimeout: 1.5
};
