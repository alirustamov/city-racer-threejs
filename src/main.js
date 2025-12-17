import * as THREE from 'three';
import { SceneManager } from './core/SceneManager.js';
import { CameraController } from './core/CameraController.js';
import { Renderer } from './core/Renderer.js';
import { Car } from './game/Car.js';
import { InputController } from './game/InputController.js';
import { Speedometer } from './game/Speedometer.js';
import { CityGenerator } from './world/CityGenerator.js';
import { RoadSystem } from './world/RoadSystem.js';
import { Minimap } from './game/Minimap.js';

const sceneManager = new SceneManager();
const cameraController = new CameraController();
const renderer = new Renderer(cameraController.camera);
const clock = new THREE.Clock();
const cityGenerator = new CityGenerator();
cityGenerator.generateCity(sceneManager.scene);
const roadSystem = new RoadSystem();
roadSystem.generateRoads(sceneManager.scene);
const playerCar = new Car(sceneManager.scene);
const inputController = new InputController();
const speedometer = new Speedometer();
const minimap = new Minimap();

function animate() {
    requestAnimationFrame(animate);
    const dt = clock.getDelta();

    inputController.update(playerCar);
    playerCar.update(dt);

    const collisionBox = playerCar.checkCollisions(cityGenerator.buildingBoundingBoxes);
    if (collisionBox) {
        // 1. Calculate the overlap (penetration) vector.
        const carBox = new THREE.Box3().setFromObject(playerCar.mesh);
        const overlap = new THREE.Vector3();

        // Find the smallest overlap on each axis.
        const deltaX1 = collisionBox.max.x - carBox.min.x;
        const deltaX2 = carBox.max.x - collisionBox.min.x;
        const deltaZ1 = collisionBox.max.z - carBox.min.z;
        const deltaZ2 = carBox.max.z - collisionBox.min.z;

        let minOverlap = Infinity;
        let normal = new THREE.Vector3();

        if (deltaX1 < minOverlap) {
            minOverlap = deltaX1;
            normal.set(-1, 0, 0);
        }
        if (deltaX2 < minOverlap) {
            minOverlap = deltaX2;
            normal.set(1, 0, 0);
        }
        if (deltaZ1 < minOverlap) {
            minOverlap = deltaZ1;
            normal.set(0, 0, -1);
        }
        if (deltaZ2 < minOverlap) {
            minOverlap = deltaZ2;
            normal.set(0, 0, 1);
        }

        // 2. Project the velocity vector onto the collision normal.
        const projection = playerCar.velocity.clone().projectOnVector(normal);

        // 3. Subtract the projection from the velocity to get the sliding vector.
        playerCar.velocity.sub(projection);

        // 4. Push the car out of the wall by the penetration depth.
        const penetration_vector = normal.multiplyScalar(minOverlap);
        playerCar.mesh.position.sub(penetration_vector)
    }

    cameraController.update(playerCar);
    speedometer.update(playerCar.velocity);
    minimap.update(playerCar, cityGenerator.buildingBoundingBoxes);

    renderer.render(sceneManager.scene, cameraController.camera);
}

animate();
