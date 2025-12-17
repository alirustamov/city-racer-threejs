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

        // More realistic material with a window texture
        const buildingMaterial = new THREE.MeshStandardMaterial({
            vertexColors: true,
            map: this.createWindowTexture(),
            roughness: 0.7,
            metalness: 0.3,
        });

        const buildingGeometries = [];
        const colorPalette = [
            new THREE.Color(0x8e9aaf), // Muted Blue
            new THREE.Color(0x6b7b8c), // Slate Gray
            new THREE.Color(0xc2c8d1), // Light Gray
            new THREE.Color(0x4a5568), // Dark Gray
            new THREE.Color(0x9fa8da), // Soft Indigo
        ];

        // Create buildings
        for (let i = -citySize / 2; i < citySize / 2; i += blockSize) {
            for (let j = -citySize / 2; j < citySize / 2; j += blockSize) {
                if (Math.random() > 0.2) { // 80% chance of a building
                    // Randomize building dimensions
                    const width = Math.random() * (blockSize - roadWidth - 4) + 4;
                    const depth = Math.random() * (blockSize - roadWidth - 4) + 4;
                    const height = Math.random() * 40 + 10;
                    const yOffset = Math.random() * 0.2; // Slight vertical offset

                    const buildingGeometry = new THREE.BoxGeometry(width, height, depth);

                    // Pick a random color from the palette
                    const color = colorPalette[Math.floor(Math.random() * colorPalette.length)];
                    const colors = [];
                    for (let k = 0; k < buildingGeometry.attributes.position.count; k++) {
                        colors.push(color.r, color.g, color.b);
                    }
                    buildingGeometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));

                    // Add slight rotation and offset to break the grid
                    const position = new THREE.Vector3(
                        i + blockSize / 2 + (Math.random() - 0.5) * (blockSize - width),
                        height / 2 + yOffset,
                        j + blockSize / 2 + (Math.random() - 0.5) * (blockSize - depth)
                    );

                    const rotation = new THREE.Euler(0, (Math.random() - 0.5) * 0.1, 0);
                    const quaternion = new THREE.Quaternion().setFromEuler(rotation);
                    buildingGeometry.applyQuaternion(quaternion);

                    buildingGeometry.translate(position.x, position.y, position.z);

                    buildingGeometries.push(buildingGeometry);

                    // Create and store bounding box
                    const tempMesh = new THREE.Mesh(buildingGeometry);
                    const boundingBox = new THREE.Box3().setFromObject(tempMesh);
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

    createWindowTexture() {
        const width = 256;
        const height = 512;
        const size = width * height;
        const data = new Uint8Array(4 * size);

        const litColor = new THREE.Color(0xfff5e1); // Warm yellow light
        const darkColor = new THREE.Color(0x1a1a2a); // Deep blue/purple
        const frameColor = new THREE.Color(0x333333); // Dark gray

        const columnWidth = 16;
        const rowHeight = 24;

        // Create patterns - some columns might be solid walls
        const columnPatterns = [];
        for (let u = 0; u < width / columnWidth; u++) {
            columnPatterns.push(Math.random() > 0.2); // 80% chance of being a window column
        }

        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                const stride = (y * width + x) * 4;
                const col = Math.floor(x / columnWidth);
                const row = Math.floor(y / rowHeight);

                const isWindowColumn = columnPatterns[col];

                // Check if we are in the "frame" area
                const isFrameX = x % columnWidth < 2 || x % columnWidth > columnWidth - 3;
                const isFrameY = y % rowHeight < 3 || y % rowHeight > rowHeight - 4;

                if (!isWindowColumn || isFrameX || isFrameY) {
                    data[stride] = frameColor.r * 255;
                    data[stride + 1] = frameColor.g * 255;
                    data[stride + 2] = frameColor.b * 255;
                    data[stride + 3] = 255;
                } else {
                    // Window pane
                    const isLit = (Math.sin(col * 1.5 + row * 2.5) + Math.random() * 0.8) > 0.8;

                    if (isLit) {
                        // Add a subtle "blinds" effect
                        const blind = Math.sin(y * Math.PI * 1.5) > 0.5 ? 0.9 : 1.0;
                        data[stride] = litColor.r * 255 * blind;
                        data[stride + 1] = litColor.g * 255 * blind;
                        data[stride + 2] = litColor.b * 255 * blind;
                        data[stride + 3] = 255;
                    } else {
                        data[stride] = darkColor.r * 255;
                        data[stride + 1] = darkColor.g * 255;
                        data[stride + 2] = darkColor.b * 255;
                        data[stride + 3] = 255;
                    }
                }
            }
        }

        const texture = new THREE.DataTexture(data, width, height, THREE.RGBAFormat);
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        texture.repeat.set(8, 8); // Adjusted repeat
        texture.minFilter = THREE.LinearFilter;
        texture.magFilter = THREE.LinearFilter;
        texture.anisotropy = 4;
        texture.needsUpdate = true;
        return texture;
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
