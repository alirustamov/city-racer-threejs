import * as THREE from 'three';

export class SceneManager {
    constructor() {
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x87ceeb); // Sky blue background
        this.initLighting();
    }

    initLighting() {
        // HemisphereLight for more natural ambient light (sky color, ground color, intensity)
        const hemisphereLight = new THREE.HemisphereLight(0x87ceeb, 0x404040, 1);
        this.scene.add(hemisphereLight);

        // DirectionalLight to simulate the sun
        const directionalLight = new THREE.DirectionalLight(0xffffff, 2.5);
        directionalLight.position.set(100, 100, 50);
        directionalLight.castShadow = true;

        // Configure shadow properties
        directionalLight.shadow.mapSize.width = 4096;
        directionalLight.shadow.mapSize.height = 4096;
        directionalLight.shadow.camera.left = -200;
        directionalLight.shadow.camera.right = 200;
        directionalLight.shadow.camera.top = 200;
        directionalLight.shadow.camera.bottom = -200;
        directionalLight.shadow.camera.near = 0.5;
        directionalLight.shadow.camera.far = 500;

        this.scene.add(directionalLight);
    }
}
