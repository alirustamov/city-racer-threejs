import * as THREE from 'three';
import { SceneManager } from './core/SceneManager.js';
import { CameraController } from './core/CameraController.js';
import { Renderer } from './core/Renderer.js';
import { Car } from './game/Car.js';
import { InputController } from './game/InputController.js';
import { CityGenerator } from './world/CityGenerator.js';
import { RoadSystem } from './world/RoadSystem.js';
import { HUD } from './game/HUD.js';
import { AICar } from './game/AICar.js';
import { SettingsManager } from './game/SettingsManager.js';
import { DebugManager } from './core/DebugManager.js';

const COLLISION_IMPULSE_FACTOR = 1.5; // New constant for collision physics
const sceneManager = new SceneManager();
const cameraController = new CameraController();
const renderer = new Renderer(cameraController.camera);
const clock = new THREE.Clock();
const cityGenerator = new CityGenerator(sceneManager.scene);
const roadSystem = new RoadSystem();
roadSystem.generateRoads(sceneManager.scene);
const playerCar = new Car(sceneManager.scene, roadSystem);
const aiCars = [];
for (let i = 0; i < 10; i++) {
    const aiCar = new AICar(sceneManager.scene, roadSystem);
    aiCar.mesh.position.x = (Math.random() - 0.5) * 50;
    aiCar.mesh.position.z = (Math.random() - 0.5) * 50;
    aiCars.push(aiCar);
}
const allCars = [playerCar, ...aiCars];


const hud = new HUD();
const settingsManager = new SettingsManager(renderer, cameraController, hud);
const debugManager = new DebugManager(sceneManager.scene, cityGenerator, aiCars);
const inputController = new InputController(settingsManager, debugManager);

function animate() {
    requestAnimationFrame(animate);
    const dt = clock.getDelta();

    inputController.update(playerCar);
    playerCar.update(dt);
    aiCars.forEach(car => {
        car.update(dt, roadSystem, allCars);
    });


    cityGenerator.update(playerCar.mesh.position);

    // Collision detection
    for (let i = 0; i < allCars.length; i++) {
        const car = allCars[i];
        if (!car.mesh.visible) continue;
        const collisionBox = car.checkCollisions(cityGenerator.buildingBoundingBoxes);
        if (collisionBox) {
            // 1. Calculate the overlap (penetration) vector.
            const carBox = new THREE.Box3().setFromObject(car.mesh);
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

            // 2. Apply an impulse to simulate a bounce.
            const impulse = normal.clone().multiplyScalar(car.velocity.dot(normal) * -COLLISION_IMPULSE_FACTOR);
            car.velocity.add(impulse);


            // 3. Push the car out of the wall by the penetration depth.
            const penetration_vector = normal.multiplyScalar(minOverlap);
            car.mesh.position.add(penetration_vector)
        }

        // Car-to-car collisions
        for (let j = i + 1; j < allCars.length; j++) {
            const otherCar = allCars[j];
            const carBox = new THREE.Box3().setFromObject(car.mesh);
            const otherCarBox = new THREE.Box3().setFromObject(otherCar.mesh);
            if (carBox.intersectsBox(otherCarBox)) {
                // Simple bounce
                const normal = car.mesh.position.clone().sub(otherCar.mesh.position).normalize();
                const impulse = normal.clone().multiplyScalar(car.velocity.dot(normal) * -1);
                car.velocity.add(impulse);
                otherCar.velocity.sub(impulse);
            }
        }
    }

    cameraController.update(playerCar);
    hud.update(playerCar, cityGenerator.loadedChunks, roadSystem);
    debugManager.update();

    renderer.render(sceneManager.scene, cameraController.camera);
}

animate();
