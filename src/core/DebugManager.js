import * as THREE from 'three';

export class DebugManager {
    constructor(scene, cityGenerator, aiCars) {
        this.scene = scene;
        this.cityGenerator = cityGenerator;
        this.aiCars = aiCars;
        this.isActive = false;

        this.debugVisuals = new THREE.Group();
        this.scene.add(this.debugVisuals);

        this.options = {
            wireframe: false,
            showBoundingBoxes: false,
            showChunkBorders: false,
            aiTraffic: true,
        };
    }

    toggle() {
        this.isActive = !this.isActive;
        console.log(`Debug mode ${this.isActive ? 'activated' : 'deactivated'}.`);
        if (!this.isActive) {
            this.clearDebugVisuals();
            this.setWireframe(false);
            this.setAiTraffic(true);
        }
    }

    update() {
        if (!this.isActive) return;

        this.clearDebugVisuals();

        if (this.options.showBoundingBoxes) {
            this.cityGenerator.buildingBoundingBoxes.forEach(box => {
                const helper = new THREE.Box3Helper(box, 0xffff00);
                this.debugVisuals.add(helper);
            });
        }

        if (this.options.showChunkBorders) {
            this.cityGenerator.loadedChunks.forEach((chunk, key) => {
                const [x, z] = key.split(',').map(Number);
                const chunkSize = 200;
                const center = new THREE.Vector3(x * chunkSize + chunkSize / 2, 0, z * chunkSize + chunkSize / 2);

                const box = new THREE.Box3(
                    new THREE.Vector3(x * chunkSize, -1, z * chunkSize),
                    new THREE.Vector3((x + 1) * chunkSize, 1, (z + 1) * chunkSize)
                );
                const helper = new THREE.Box3Helper(box, 0x00ff00);
                this.debugVisuals.add(helper);
            });
        }
    }

    setWireframe(enabled) {
        this.options.wireframe = enabled;
        this.scene.traverse((child) => {
            if (child.material) {
                if (Array.isArray(child.material)) {
                    child.material.forEach(m => m.wireframe = enabled);
                } else {
                    child.material.wireframe = enabled;
                }
            }
        });
    }

    setAiTraffic(enabled) {
        this.options.aiTraffic = enabled;
        this.aiCars.forEach(car => {
            car.mesh.visible = enabled;
        });
    }

    clearDebugVisuals() {
        while (this.debugVisuals.children.length > 0) {
            this.debugVisuals.remove(this.debugVisuals.children[0]);
        }
    }

    createPanel() {
        // In a real scenario, you'd use a library like dat.GUI
        // For this, we'll just use a simple console interface.
        console.log('--- Debug Panel ---');
        console.log('1: Toggle Wireframe');
        console.log('2: Toggle Bounding Boxes');
        console.log('3: Toggle Chunk Borders');
        console.log('4: Toggle AI Traffic');
    }
}
