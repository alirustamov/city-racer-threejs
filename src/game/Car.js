import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import {
	HANDBRAKE_LATERAL_DRAG,
	LATERAL_DRAG,
	STEERING_SPEED,
	DRAG
} from '../utils/constants.js';

export class Car {
	constructor(scene) {
		this.mesh = new THREE.Group();
		this.mesh.position.y = 0.4; // Initial height of the car's center
		scene.add(this.mesh);

		// Car Body
		const bodyGeometry = new RoundedBoxGeometry(2, 0.8, 4, 3, 0.1);
		const bodyMaterial = new THREE.MeshStandardMaterial({
			color: 0xff0000,
			roughness: 0.2,
			metalness: 0.8,
		});
		const bodyMesh = new THREE.Mesh(bodyGeometry, bodyMaterial);
		bodyMesh.castShadow = true;
		bodyMesh.receiveShadow = true;
		this.mesh.add(bodyMesh);

		// Car Cabin
		const cabinGeometry = new RoundedBoxGeometry(1.6, 0.6, 2, 2, 0.1);
		const cabinMaterial = new THREE.MeshStandardMaterial({
			color: 0x222222,
			roughness: 0,
			metalness: 0,
			transparent: true,
			opacity: 0.5,
		});
		const cabinMesh = new THREE.Mesh(cabinGeometry, cabinMaterial);
		cabinMesh.position.set(0, 0.7, -0.5);
		cabinMesh.castShadow = true;
		cabinMesh.receiveShadow = true;
		this.mesh.add(cabinMesh);

		// Wheels
		this.wheels = [];
		this.frontWheelPivots = [];
		const wheelGeometry = new THREE.CylinderGeometry(0.4, 0.4, 0.2, 32);
		wheelGeometry.rotateZ(Math.PI / 2); // Align wheel axle with X-axis
		const wheelMaterial = new THREE.MeshStandardMaterial({
			color: 0x111111,
			roughness: 0.8,
			metalness: 0.1,
		});

		// Rear wheels
		const rearWheelPos = [new THREE.Vector3(1, -0.1, 1.5), new THREE.Vector3(-1, -0.1, 1.5)];
		rearWheelPos.forEach(pos => {
			const wheel = new THREE.Mesh(wheelGeometry, wheelMaterial);
			wheel.position.copy(pos);
			wheel.castShadow = true;
			wheel.receiveShadow = true;
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
			wheel.receiveShadow = true;
			pivot.add(wheel);
			this.wheels.push(wheel);
		});

		// Headlights
		const headlightGeometry = new THREE.CylinderGeometry(0.15, 0.15, 0.1, 16);
		headlightGeometry.rotateX(Math.PI / 2);
		const headlightMaterial = new THREE.MeshStandardMaterial({
			color: 0xffffff,
			emissive: 0xffffee,
			emissiveIntensity: 2,
		});

		const headlight1 = new THREE.Mesh(headlightGeometry, headlightMaterial);
		headlight1.position.set(0.7, 0, -2.01);
		this.mesh.add(headlight1);

		const headlight2 = new THREE.Mesh(headlightGeometry, headlightMaterial);
		headlight2.position.set(-0.7, 0, -2.01);
		this.mesh.add(headlight2);

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
		// 1. Transform world velocity to local space
		const localVelocity = this.velocity.clone().applyQuaternion(this.mesh.quaternion.clone().invert());

		// 2. Apply lateral friction (tire grip) and drag
		const currentLateralDrag = this.handbrake ? HANDBRAKE_LATERAL_DRAG : LATERAL_DRAG;
		localVelocity.x *= currentLateralDrag;
		localVelocity.z *= DRAG; // Forward drag

		// 3. Apply acceleration (in local space)
		localVelocity.z -= this.acceleration * dt;

		// 4. Transform back to world space
		this.velocity.copy(localVelocity).applyQuaternion(this.mesh.quaternion);

		// 5. Update rotation based on steering
		// The turn factor makes steering less sensitive at low speeds, preventing twitching
		const turnFactor = Math.min(1, this.velocity.length() / 5); // Full steering at 5 m/s
		this.mesh.rotation.y += this.steering * STEERING_SPEED * turnFactor * dt;

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
