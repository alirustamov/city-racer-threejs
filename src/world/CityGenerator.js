import * as THREE from 'three';
import * as BufferGeometryUtils from 'three/addons/utils/BufferGeometryUtils.js';

export class CityGenerator {
    constructor() {
        this.buildingBoundingBoxes = [];
        this.buildingColors = [
            new THREE.Color(0x8C8C8C), // Light Grey
            new THREE.Color(0x4D4D4D), // Dark Grey
            new THREE.Color(0x2E4A52), // Steel Blue
            new THREE.Color(0x7D6B5F), // Taupe
            new THREE.Color(0x9E9E9E), // Medium Grey
        ];
    }

    createBuildingMaterial() {
        const textureWidth = 32;
        const textureHeight = 64;
        const textureSize = textureWidth * textureHeight;
        const data = new Uint8Array(4 * textureSize);

        for (let i = 0; i < textureSize; i++) {
            const stride = i * 4;
            const isWindow = Math.random() > 0.2;
            if (isWindow) {
                const intensity = Math.random() * 0.5 + 0.5;
                data[stride] = 255 * intensity;
                data[stride + 1] = 220 * intensity;
                data[stride + 2] = 180 * intensity;
                data[stride + 3] = 255;
            } else {
                data[stride] = 0;
                data[stride + 1] = 0;
                data[stride + 2] = 0;
                data[stride + 3] = 255;
            }
        }

        const windowTexture = new THREE.DataTexture(data, textureWidth, textureHeight, THREE.RGBAFormat);
        windowTexture.wrapS = THREE.RepeatWrapping;
        windowTexture.wrapT = THREE.RepeatWrapping;
        windowTexture.repeat.set(4, 8); // How many windows repeating
        windowTexture.needsUpdate = true;

        return new THREE.MeshStandardMaterial({
            vertexColors: true,
            emissive: 0xffffff,
            emissiveMap: windowTexture,
            emissiveIntensity: 1.5,
            roughness: 0.7,
            metalness: 0.2,
        });
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

        const buildingMaterial = this.createBuildingMaterial();
        const buildingGeometries = [];

        // Create buildings
        for (let i = -citySize / 2; i < citySize / 2; i += blockSize) {
            for (let j = -citySize / 2; j < citySize / 2; j += blockSize) {
                if (Math.random() > 0.1) {
                    const buildingWidth = Math.random() * (blockSize - roadWidth - 5) + 5;
                    const buildingDepth = Math.random() * (blockSize - roadWidth - 5) + 5;
                    const buildingHeight = Math.random() * 40 + 10;

                    const buildingGeometry = new THREE.BoxGeometry(buildingWidth, buildingHeight, buildingDepth);

                    const xOffset = (Math.random() - 0.5) * (blockSize - roadWidth - buildingWidth);
                    const zOffset = (Math.random() - 0.5) * (blockSize - roadWidth - buildingDepth);

                    const position = new THREE.Vector3(i + blockSize / 2 + xOffset, buildingHeight / 2 + 0.1, j + blockSize / 2 + zOffset);
                    const color = this.buildingColors[Math.floor(Math.random() * this.buildingColors.length)];

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

            const value = Math.random() * 60 + 10;
            data[stride] = value;
            data[stride + 1] = value;
            data[stride + 2] = value;
            data[stride + 3] = 255;

            const x = (Math.random() - 0.5) * 2;
            const y = (Math.random() - 0.5) * 2;
            const vec = new THREE.Vector3(x, y, 1.0).normalize();

            normalData[stride] = (vec.x * 0.5 + 0.5) * 255;
            normalData[stride + 1] = (vec.y * 0.5 + 0.5) * 255;
            normalData[stride + 2] = vec.z * 255;
            normalData[stride + 3] = 255;
        }

        const texture = new THREE.DataTexture(data, width, height, THREE.RGBAFormat);
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        texture.repeat.set(citySize / 10, citySize / 10);
        texture.needsUpdate = true;

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
