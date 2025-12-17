import * as THREE from 'three';
import { Car } from './Car.js';

export class AICar extends Car {
    constructor(scene, roadSystem) {
        super(scene, roadSystem);
        this.mesh.material.color.set(0x0000ff); // Blue
        this.targetLane = Math.random() > 0.5 ? 1 : -1;
        this.maxSpeed = Math.random() * 10 + 10;
    }

    update(dt, roadSystem, allCars) {
        // Simple AI: Follow the road and avoid other cars
        const forward = new THREE.Vector3(0, 0, -1).applyQuaternion(this.mesh.quaternion);

        // Avoidance
        let slowedDown = false;
        for (const otherCar of allCars) {
            if (otherCar !== this) {
                const distance = this.mesh.position.distanceTo(otherCar.mesh.position);
                if (distance < 10) {
                    const directionToOther = otherCar.mesh.position.clone().sub(this.mesh.position).normalize();
                    if (forward.dot(directionToOther) > 0.8) { // If car is in front
                        this.acceleration = -1; // Brake
                        slowedDown = true;
                    }
                }
            }
        }


        // Follow road
        const nextPos = this.mesh.position.clone().add(forward.multiplyScalar(5));
        const roadInfo = roadSystem.getRoadInfo(nextPos);

        if (roadInfo.onRoad) {
            const targetPosition = roadInfo.lanePosition.clone();
            targetPosition.y = this.mesh.position.y;
            const directionToTarget = targetPosition.sub(this.mesh.position).normalize();
            const angleToTarget = Math.atan2(directionToTarget.x, directionToTarget.z);
            let angleDifference = angleToTarget - this.mesh.rotation.y;
            while (angleDifference > Math.PI) angleDifference -= 2 * Math.PI;
            while (angleDifference < -Math.PI) angleDifference += 2 * Math.PI;

            this.steering = angleDifference * 2;
            if (!slowedDown) {
                if (this.velocity.length() < this.maxSpeed) {
                    this.acceleration = 1;
                } else {
                    this.acceleration = 0;
                }
            }
        } else {
            // Off-road, try to get back
            this.steering = 0.5;
            if (!slowedDown) {
                if (this.velocity.length() < this.maxSpeed) {
                    this.acceleration = 1;
                } else {
                    this.acceleration = 0;
                }
            }
        }


        super.update(dt);
    }
}
