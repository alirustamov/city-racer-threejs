import * as THREE from 'three';

export class SceneManager {
    constructor() {
        this.scene = new THREE.Scene();
        // Set a dark background for a night scene
        this.scene.background = new THREE.Color(0x0c0c1a);
        this.initLighting();
    }

    initLighting() {
        // HemisphereLight for soft, ambient night light
        const hemisphereLight = new THREE.HemisphereLight(0x404060, 0x101020, 0.4);
        this.scene.add(hemisphereLight);

        // DirectionalLight to simulate moonlight
        const directionalLight = new THREE.DirectionalLight(0x8090ff, 0.8);
        directionalLight.position.set(50, 80, 25);
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
