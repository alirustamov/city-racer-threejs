import * as THREE from 'three';

export class RoadSystem {
    generateRoads(scene) {
        const citySize = 200;
        const blockSize = 20;
        const roadWidth = 10;

        // Road markings
        const lineMaterial = new THREE.LineBasicMaterial({ color: 0xffffff, linewidth: 2 });
        const linePoints = [];
        for (let i = -citySize / 2; i < citySize / 2; i += blockSize) {
            for (let j = -citySize / 2; j < citySize / 2; j += 4) { // Dashed lines
                linePoints.push(new THREE.Vector3(i - roadWidth / 2, 0.01, j));
                linePoints.push(new THREE.Vector3(i - roadWidth / 2, 0.01, j + 2));
                linePoints.push(new THREE.Vector3(j, 0.01, i - roadWidth / 2));
                linePoints.push(new THREE.Vector3(j + 2, 0.01, i - roadWidth / 2));
            }
        }
        const lineGeometry = new THREE.BufferGeometry().setFromPoints(linePoints);
        const lines = new THREE.LineSegments(lineGeometry, lineMaterial);
        scene.add(lines);
    }
}
