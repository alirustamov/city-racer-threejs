import * as THREE from 'three';

export class CameraController {
    constructor() {
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.camera.position.set(0, 5, 10);
        this.camera.lookAt(0, 0, 0);
    }

    update(playerCar) {
        const cameraOffset = new THREE.Vector3(0, 5, 10).applyQuaternion(playerCar.mesh.quaternion);
        const cameraPosition = playerCar.mesh.position.clone().add(cameraOffset);
        this.camera.position.lerp(cameraPosition, 0.1);
        this.camera.lookAt(playerCar.mesh.position);
    }
}
