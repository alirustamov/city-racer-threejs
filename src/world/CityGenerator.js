import * as THREE from 'three';
import * as BufferGeometryUtils from 'three/addons/utils/BufferGeometryUtils.js';

export class CityGenerator {
    constructor() {
        this.buildingBoundingBoxes = [];
    }

    generateCity(scene) {
        const citySize = 200;
        const blockSize = 20;
        const roadWidth = 10;

        // Ground
        const groundGeometry = new THREE.PlaneGeometry(citySize, citySize);
        const groundMaterial = new THREE.MeshStandardMaterial({ color: 0x404040 }); // Asphalt color
        const ground = new THREE.Mesh(groundGeometry, groundMaterial);
        ground.rotation.x = -Math.PI / 2;
        ground.receiveShadow = true;
        scene.add(ground);

        const buildingMaterial = new THREE.MeshStandardMaterial({ vertexColors: true });
        const buildingGeometries = [];

        // Create buildings and roads
        for (let i = -citySize / 2; i < citySize / 2; i += blockSize) {
            for (let j = -citySize / 2; j < citySize / 2; j += blockSize) {
                if (Math.random() > 0.1) { // 90% chance of a building
                    const buildingHeight = Math.random() * 20 + 5;
                    const buildingGeometry = new THREE.BoxGeometry(blockSize - roadWidth, buildingHeight, blockSize - roadWidth);

                    const position = new THREE.Vector3(i + blockSize / 2, buildingHeight / 2, j + blockSize / 2);
                    const color = new THREE.Color(Math.random() * 0xffffff);

                    const colors = [];
                    for (let k = 0; k < buildingGeometry.attributes.position.count; k++) {
                        colors.push(color.r, color.g, color.b);
                    }
                    buildingGeometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));

                    buildingGeometry.translate(position.x, position.y, position.z);
                    buildingGeometries.push(buildingGeometry);

                    const boundingBox = new THREE.Box3().setFromObject(new THREE.Mesh(buildingGeometry));
                    this.buildingBoundingBoxes.push(boundingBox);
                }
            }
        }

        if (buildingGeometries.length > 0) {
            const mergedGeometries = BufferGeometryUtils.mergeBufferGeometries(buildingGeometries);
            const buildings = new THREE.Mesh(mergedGeometries, buildingMaterial);
            buildings.castShadow = true;
            buildings.receiveShadow = true;
            scene.add(buildings);
        }
    }
}
