import * as THREE from 'three';
import * as BufferGeometryUtils from 'three/addons/utils/BufferGeometryUtils.js';

export class RoadSystem {
    generateRoads(scene) {
        const citySize = 200;
        const blockSize = 20;
        const roadWidth = 10;
        const dashSize = 2;
        const dashGap = 2;
        const dashWidth = 0.2;

        const markingMaterial = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.8 });
        const markingGeometries = [];

        for (let i = -citySize / 2 + blockSize; i < citySize / 2; i += blockSize) {
            for (let j = -citySize / 2; j < citySize / 2; j += dashSize + dashGap) {
                // Vertical dashes
                const vPlane = new THREE.PlaneGeometry(dashWidth, dashSize);
                vPlane.rotateX(-Math.PI / 2);
                vPlane.translate(i - roadWidth / 2, 0.01, j + dashSize / 2);
                markingGeometries.push(vPlane);

                // Horizontal dashes
                const hPlane = new THREE.PlaneGeometry(dashSize, dashWidth);
                hPlane.rotateX(-Math.PI / 2);
                hPlane.translate(j + dashSize / 2, 0.01, i - roadWidth / 2);
                markingGeometries.push(hPlane);
            }
        }

        if (markingGeometries.length > 0) {
            const mergedGeometries = BufferGeometryUtils.mergeBufferGeometries(markingGeometries);
            const markings = new THREE.Mesh(mergedGeometries, markingMaterial);
            markings.receiveShadow = true;
            scene.add(markings);
        }
    }
}
