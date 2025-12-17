// src/utils/constants.js

// Driving physics
export const MAX_SPEED = 200;
export const ACCELERATION = 40;
export const DECELERATION = -40;
export const DRAG = 0.985;
export const LATERAL_DRAG = 0.9;
export const HANDBRAKE_LATERAL_DRAG = 0.3;
export const STEERING_SPEED = 2.0;
export const STEERING_SENSITIVITY_MIN = 0.3; // At max speed
export const STEERING_SENSITIVITY_MAX = 1.0; // At zero speed
export const DRIFT_THRESHOLD = 0.8; // Speed ratio at which drift starts
export const DRIFT_FACTOR = 0.1; // How much drift is possible

// Camera
export const MIN_FOV = 75;
export const MAX_FOV = 90;
export const CAMERA_SHAKE_INTENSITY = 0.05;
export const CAMERA_LAG = 0.1;

// Surfaces
export const SURFACE_FRICTION = {
  road: 1.0,
  offroad: 0.4,
};

// Collisions
export const COLLISION_IMPULSE_FACTOR = 0.8;
