import * as THREE from 'three';

export class SceneManager {
    constructor() {
        this.scene = new THREE.Scene();
        // A bright sky blue for a daytime scene
        this.scene.background = new THREE.Color(0x87ceeb);
        this.initLighting();
    }

    initLighting() {
        // HemisphereLight for a soft, ambient, sunlit feel
        const hemisphereLight = new THREE.HemisphereLight(0xffffff, 0x444444, 1.0);
        this.scene.add(hemisphereLight);

        // DirectionalLight to simulate the sun
        const directionalLight = new THREE.DirectionalLight(0xffffff, 1.5);
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
