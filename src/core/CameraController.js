import * as THREE from 'three';
import {
    MIN_FOV,
    MAX_FOV,
    MAX_SPEED,
    CAMERA_SHAKE_INTENSITY,
    CAMERA_LAG
} from '../utils/constants.js';

export class CameraController {
    constructor() {
        this.camera = new THREE.PerspectiveCamera(MIN_FOV, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.camera.position.set(0, 5, 10);
        this.camera.lookAt(0, 0, 0);
        this.lookAtTarget = new THREE.Vector3();
    }

    update(playerCar) {
        // Update camera FOV based on speed
        const speed = playerCar.velocity.length();
        const speedRatio = speed / MAX_SPEED;
        const targetFov = MIN_FOV + (MAX_FOV - MIN_FOV) * speedRatio;
        this.camera.fov = THREE.MathUtils.lerp(this.camera.fov, targetFov, 0.1);
        this.camera.updateProjectionMatrix();

        const cameraOffset = new THREE.Vector3(0, 5, 10).applyQuaternion(playerCar.mesh.quaternion);
        const cameraPosition = playerCar.mesh.position.clone().add(cameraOffset);
        this.camera.position.lerp(cameraPosition, 0.1);

        // Add camera shake at high speeds
        if (speedRatio > 0.5) {
            const shake = (speedRatio - 0.5) * 2; // From 0 to 1
            this.camera.position.x += (Math.random() - 0.5) * CAMERA_SHAKE_INTENSITY * shake;
            this.camera.position.y += (Math.random() - 0.5) * CAMERA_SHAKE_INTENSITY * shake;
        }

        this.lookAtTarget.lerp(playerCar.mesh.position, CAMERA_LAG);
        this.camera.lookAt(this.lookAtTarget);
    }
}
