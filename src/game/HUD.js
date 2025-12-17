export class HUD {
    constructor() {
        // Speedometer
        this.speedElement = document.getElementById('speed-value');
        this.gearElement = document.getElementById('gear-value');

        // Minimap
        this.minimapCanvas = document.getElementById('minimap');
        this.minimapCtx = this.minimapCanvas.getContext('2d');

        // FPS Counter
        this.fpsElement = document.getElementById('fps-counter');
        this.fps = 0;
        this.lastFpsUpdate = 0;
        this.frames = 0;

        // Initial state
        this.showFps = false; // Toggled by settings panel
    }

    update(playerCar, cityChunks, roadSystem) {
        // Update Speed and Gear
        const speed = playerCar.velocity.length() * 3.6; // km/h
        this.speedElement.textContent = Math.floor(speed);
        this.gearElement.textContent = playerCar.gear;

        // Update Minimap
        this.drawMinimap(playerCar, cityChunks, roadSystem);

        // Update FPS counter
        this.updateFps();
    }

    drawMinimap(playerCar, cityChunks, roadSystem) {
        const ctx = this.minimapCtx;
        const canvas = this.minimapCanvas;
        const mapSize = 200;
        const viewDistance = 100; // The radius around the player to show

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Background
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.save();
        // Center the map on the player and rotate it
        ctx.translate(canvas.width / 2, canvas.height / 2);
        ctx.rotate(-playerCar.mesh.rotation.y); // Rotate map opposite to car's rotation
        ctx.scale(mapSize / (viewDistance * 2), mapSize / (viewDistance * 2));

        // Draw Roads
        ctx.strokeStyle = '#444';
        ctx.lineWidth = 12; // Main road width
        ctx.beginPath();
        roadSystem.roads.forEach(road => {
             // Basic road drawing logic
            const start = road.start.clone().sub(playerCar.mesh.position);
            const end = road.end.clone().sub(playerCar.mesh.position);
            ctx.moveTo(start.x, start.z);
            ctx.lineTo(end.x, end.z);
        });
        ctx.stroke();

        // Draw Buildings
        ctx.fillStyle = 'rgba(150, 150, 150, 0.7)';
        for (const chunk of Object.values(cityChunks)) {
            chunk.buildingBoundingBoxes.forEach(box => {
                const center = box.getCenter(new THREE.Vector3()).sub(playerCar.mesh.position);
                const size = box.getSize(new THREE.Vector3());

                // Check if building is within view distance
                if (center.length() < viewDistance * 1.5) { // A bit of buffer
                    ctx.fillRect(center.x - size.x / 2, center.z - size.z / 2, size.x, size.z);
                }
            });
        }


        // Draw Player Arrow
        ctx.fillStyle = '#ff0000'; // Red
        ctx.beginPath();
        ctx.moveTo(0, -10); // Tip of the arrow
        ctx.lineTo(5, 5);
        ctx.lineTo(-5, 5);
        ctx.closePath();
        ctx.fill();


        ctx.restore();
    }

    updateFps() {
        if (!this.showFps) {
            this.fpsElement.style.display = 'none';
            return;
        }
        this.fpsElement.style.display = 'block';

        this.frames++;
        const now = performance.now();
        if (now >= this.lastFpsUpdate + 1000) {
            this.fps = (this.frames * 1000) / (now - this.lastFpsUpdate);
            this.lastFpsUpdate = now;
            this.frames = 0;
            this.fpsElement.textContent = `FPS: ${Math.round(this.fps)}`;
        }
    }

    toggleFps(visible) {
        this.showFps = visible;
    }
}
