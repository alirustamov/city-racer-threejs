import * as THREE from 'three';
import {
	MAX_SPEED,
	ACCELERATION,
	DRAG,
	LATERAL_DRAG,
	HANDBRAKE_LATERAL_DRAG,
	STEERING_SPEED,
	STEERING_SENSITIVITY_MIN,
	STEERING_SENSITIVITY_MAX,
	DRIFT_THRESHOLD,
	DRIFT_FACTOR,
	COLLISION_IMPULSE_FACTOR,
	SURFACE_FRICTION
} from '../utils/constants.js';

export class Car {
	constructor(scene, roadSystem) {
		this.roadSystem = roadSystem;
		// Car body
		const carBody = new THREE.BoxGeometry(2, 0.8, 4);
		const carMaterial = new THREE.MeshStandardMaterial({
			color: 0xff0000
		});
		this.mesh = new THREE.Mesh(carBody, carMaterial);
		this.mesh.position.y = 0.4;
		this.mesh.castShadow = true;
		scene.add(this.mesh);

		// Wheels
		this.wheels = [];
		this.frontWheelPivots = [];
		const wheelGeometry = new THREE.CylinderGeometry(0.4, 0.4, 0.2, 32);
		wheelGeometry.rotateZ(Math.PI / 2); // Align wheel axle with X-axis
		const wheelMaterial = new THREE.MeshStandardMaterial({
			color: 0x111111
		});

		// Rear wheels
		const rearWheelPos = [new THREE.Vector3(1, -0.1, 1.5), new THREE.Vector3(-1, -0.1, 1.5)];
		rearWheelPos.forEach(pos => {
			const wheel = new THREE.Mesh(wheelGeometry, wheelMaterial);
			wheel.position.copy(pos);
			wheel.castShadow = true;
			this.mesh.add(wheel);
			this.wheels.push(wheel);
		});

		// Front wheels with steering pivots
		const frontWheelPos = [new THREE.Vector3(1, -0.1, -1.5), new THREE.Vector3(-1, -0.1, -1.5)];
		frontWheelPos.forEach(pos => {
			const pivot = new THREE.Group();
			pivot.position.copy(pos);
			this.mesh.add(pivot);
			this.frontWheelPivots.push(pivot);

			const wheel = new THREE.Mesh(wheelGeometry, wheelMaterial);
			wheel.castShadow = true;
			pivot.add(wheel);
			this.wheels.push(wheel);
		});

		// Brake lights
		this.brakeLights = [];
		const brakeLight1 = new THREE.PointLight(0xff0000, 0, 10);
		brakeLight1.position.set(-0.8, 0.5, 2);
		this.mesh.add(brakeLight1);
		this.brakeLights.push(brakeLight1);

		const brakeLight2 = new THREE.PointLight(0xff0000, 0, 10);
		brakeLight2.position.set(0.8, 0.5, 2);
		this.mesh.add(brakeLight2);
		this.brakeLights.push(brakeLight2);

		// Physics properties
		this.velocity = new THREE.Vector3();
		this.steering = 0;
		this.acceleration = 0;
		this.handbrake = false;
	}

	update(dt) {
		const speed = this.velocity.length();

		// 1. Transform world velocity to local space
		const localVelocity = this.velocity.clone().applyQuaternion(this.mesh.quaternion.clone().invert());

		// 2. Apply lateral friction (tire grip) and drag (framerate-independent)
		let currentLateralDrag = this.handbrake ? HANDBRAKE_LATERAL_DRAG : LATERAL_DRAG;

		// Add drift-like lateral slip
		if (speed / MAX_SPEED > DRIFT_THRESHOLD && Math.abs(this.steering) > 0.1) {
			currentLateralDrag -= (Math.abs(this.steering) * DRIFT_FACTOR);
		}

		localVelocity.x *= Math.pow(currentLateralDrag, dt * 60);
		localVelocity.z *= Math.pow(DRAG, dt * 60); // Forward drag

		// 3. Apply acceleration (in local space) with a non-linear curve
		const speedRatio = speed / MAX_SPEED;
		let accelerationFactor = 1 - Math.pow(speedRatio, 2); // Stronger acceleration at low speeds

		// Apply surface friction
		const roadInfo = this.roadSystem.getRoadInfo(this.mesh.position);
		if (roadInfo.onRoad) {
			accelerationFactor *= SURFACE_FRICTION.road;
		} else {
			accelerationFactor *= SURFACE_FRICTION.offroad;
		}

		localVelocity.z -= this.acceleration * ACCELERATION * accelerationFactor * dt;

		// 4. Transform back to world space
		this.velocity.copy(localVelocity).applyQuaternion(this.mesh.quaternion);

		// 5. Update rotation based on steering (speed-sensitive)
		const steeringSensitivity = STEERING_SENSITIVITY_MAX - (speed / MAX_SPEED) * (STEERING_SENSITIVITY_MAX - STEERING_SENSITIVITY_MIN);
		this.mesh.rotation.y += this.steering * STEERING_SPEED * steeringSensitivity * dt;


		// 6. Update position
		this.mesh.position.add(this.velocity.clone().multiplyScalar(dt));

		// 7. Rotate wheels based on forward speed
		const forwardSpeed = -localVelocity.z;
		const wheelCircumference = 2 * Math.PI * 0.4; // wheel radius is 0.4
		const wheelRotation = (forwardSpeed * dt) / wheelCircumference;
		this.wheels.forEach(wheel => {
			wheel.rotation.x += wheelRotation;
		});

		// 8. Visually steer front wheels
		this.frontWheelPivots.forEach(pivot => {
			pivot.rotation.y = this.steering * 0.5;
		});
	}

	checkCollisions(buildingBoundingBoxes) {
		const carBox = new THREE.Box3().setFromObject(this.mesh);
		for (const buildingBox of buildingBoundingBoxes) {
			if (carBox.intersectsBox(buildingBox)) {
				return buildingBox; // Return the colliding box
			}
		}
		return null; // No collision
	}
}
