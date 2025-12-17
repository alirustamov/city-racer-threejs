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
        const groundMaterial = this.createAsphaltMaterial(citySize);
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

    createAsphaltMaterial(citySize) {
        const width = 512;
        const height = 512;

        const size = width * height;
        const data = new Uint8Array(4 * size);
        const normalData = new Uint8Array(4 * size);

        for (let i = 0; i < size; i++) {
            const stride = i * 4;

            // Simple noise for color map
            const value = Math.random() * 60 + 10; // Dark gray noise
            data[stride] = value;
            data[stride + 1] = value;
            data[stride + 2] = value;
            data[stride + 3] = 255;

            // Generate a random normal vector for the normal map
            const x = (Math.random() - 0.5) * 2;
            const y = (Math.random() - 0.5) * 2;
            const vec = new THREE.Vector3(x, y, 1.0).normalize();

            normalData[stride] = (vec.x * 0.5 + 0.5) * 255;
            normalData[stride + 1] = (vec.y * 0.5 + 0.5) * 255;
            normalData[stride + 2] = vec.z * 255;
            normalData[stride + 3] = 255;
        }

        // Color map
        const texture = new THREE.DataTexture(data, width, height, THREE.RGBAFormat);
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        texture.repeat.set(citySize / 10, citySize / 10);
        texture.needsUpdate = true;

        // Normal map
        const normalMap = new THREE.DataTexture(normalData, width, height, THREE.RGBAFormat);
        normalMap.wrapS = THREE.RepeatWrapping;
        normalMap.wrapT = THREE.RepeatWrapping;
        normalMap.repeat.set(citySize / 10, citySize / 10);
        normalMap.needsUpdate = true;

        return new THREE.MeshStandardMaterial({
            color: 0x404040,
            map: texture,
            normalMap: normalMap,
            normalScale: new THREE.Vector2(0.3, 0.3),
            roughness: 0.8,
            metalness: 0.1
        });
    }
}
