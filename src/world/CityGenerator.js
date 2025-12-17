import * as THREE from 'three';
import * as BufferGeometryUtils from 'three/addons/utils/BufferGeometryUtils.js';
import {
    hashCode
} from '../utils/hashCode.js';

const CHUNK_SIZE = 200;

export class CityGenerator {
    constructor(scene) {
        this.scene = scene;
        this.buildingBoundingBoxes = [];
        this.loadedChunks = new Map();
        this.buildingMaterial = new THREE.MeshStandardMaterial({
            vertexColors: true,
            map: this.createWindowTexture(),
            roughness: 0.7,
            metalness: 0.3,
        });
    }

    getChunkKey(x, z) {
        return `${x},${z}`;
    }

    update(playerPosition) {
        const playerChunkX = Math.floor(playerPosition.x / CHUNK_SIZE);
        const playerChunkZ = Math.floor(playerPosition.z / CHUNK_SIZE);

        // Load chunks around the player
        for (let x = playerChunkX - 1; x <= playerChunkX + 1; x++) {
            for (let z = playerChunkZ - 1; z <= playerChunkZ + 1; z++) {
                const chunkKey = this.getChunkKey(x, z);
                if (!this.loadedChunks.has(chunkKey)) {
                    this.generateChunk(x, z);
                }
            }
        }

        // Unload distant chunks
        for (const [chunkKey, chunk] of this.loadedChunks.entries()) {
            const [x, z] = chunkKey.split(',').map(Number);
            if (Math.abs(x - playerChunkX) > 1 || Math.abs(z - playerChunkZ) > 1) {
                this.scene.remove(chunk.mesh);
                this.buildingBoundingBoxes = this.buildingBoundingBoxes.filter(
                    box => !chunk.boundingBoxes.includes(box)
                );
                this.loadedChunks.delete(chunkKey);
            }
        }
    }

    generateChunk(chunkX, chunkZ) {
        const chunkKey = this.getChunkKey(chunkX, chunkZ);
        const seed = hashCode(chunkKey);
        const random = new Math.seedrandom(seed);

        const chunkPosition = new THREE.Vector3(chunkX * CHUNK_SIZE, 0, chunkZ * CHUNK_SIZE);

        // Ground
        const groundGeometry = new THREE.PlaneGeometry(CHUNK_SIZE, CHUNK_SIZE);
        const groundMaterial = this.createAsphaltMaterial(CHUNK_SIZE);
        const ground = new THREE.Mesh(groundGeometry, groundMaterial);
        ground.rotation.x = -Math.PI / 2;
        ground.position.copy(chunkPosition);
        ground.receiveShadow = true;
        this.scene.add(ground);


        const buildingGeometries = [];
        const chunkBoundingBoxes = [];
        const colorPalette = [
            new THREE.Color(0x8e9aaf), // Muted Blue
            new THREE.Color(0x6b7b8c), // Slate Gray
            new THREE.Color(0xc2c8d1), // Light Gray
            new THREE.Color(0x4a5568), // Dark Gray
            new THREE.Color(0x9fa8da), // Soft Indigo
        ];

        // Create buildings
        const blockSize = 20;
        const roadWidth = 10;
        for (let i = -CHUNK_SIZE / 2; i < CHUNK_SIZE / 2; i += blockSize) {
            for (let j = -CHUNK_SIZE / 2; j < CHUNK_SIZE / 2; j += blockSize) {
                if (random() > 0.2) { // 80% chance of a building
                    // Randomize building dimensions
                    const width = random() * (blockSize - roadWidth - 4) + 4;
                    const depth = random() * (blockSize - roadWidth - 4) + 4;
                    const height = random() * 40 + 10;
                    const yOffset = random() * 0.2; // Slight vertical offset

                    const buildingGeometry = new THREE.BoxGeometry(width, height, depth);

                    // Pick a random color from the palette
                    const color = colorPalette[Math.floor(random() * colorPalette.length)];
                    const colors = [];
                    for (let k = 0; k < buildingGeometry.attributes.position.count; k++) {
                        colors.push(color.r, color.g, color.b);
                    }
                    buildingGeometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));

                    // Add slight rotation and offset to break the grid
                    const position = new THREE.Vector3(
                        chunkPosition.x + i + blockSize / 2 + (random() - 0.5) * (blockSize - width),
                        height / 2 + yOffset,
                        chunkPosition.z + j + blockSize / 2 + (random() - 0.5) * (blockSize - depth)
                    );

                    const rotation = new THREE.Euler(0, (random() - 0.5) * 0.1, 0);
                    const quaternion = new THREE.Quaternion().setFromEuler(rotation);
                    buildingGeometry.applyQuaternion(quaternion);

                    buildingGeometry.translate(position.x, position.y, position.z);

                    buildingGeometries.push(buildingGeometry);

                    // Create and store bounding box
                    const tempMesh = new THREE.Mesh(buildingGeometry);
                    const boundingBox = new THREE.Box3().setFromObject(tempMesh);
                    chunkBoundingBoxes.push(boundingBox);
                }
            }
        }

        let mergedMesh = null;
        if (buildingGeometries.length > 0) {
            const mergedGeometries = BufferGeometryUtils.mergeBufferGeometries(buildingGeometries);
            mergedMesh = new THREE.Mesh(mergedGeometries, this.buildingMaterial);
            mergedMesh.castShadow = true;
            mergedMesh.receiveShadow = true;
            this.scene.add(mergedMesh);
        }

        this.loadedChunks.set(chunkKey, {
            mesh: mergedMesh,
            boundingBoxes: chunkBoundingBoxes
        });
        this.buildingBoundingBoxes.push(...chunkBoundingBoxes);
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
