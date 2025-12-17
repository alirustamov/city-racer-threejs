export class Minimap {
    constructor() {
        this.minimap = document.getElementById('minimap');
        this.minimapCtx = this.minimap.getContext('2d');
    }

    update(playerCar, buildingBoundingBoxes) {
        this.minimapCtx.clearRect(0, 0, this.minimap.width, this.minimap.height);
        this.minimapCtx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        this.minimapCtx.fillRect(0, 0, this.minimap.width, this.minimap.height);

        const mapScale = 1;
        const mapWidth = 200;
        const mapHeight = 200;

        // Draw buildings on the minimap
        buildingBoundingBoxes.forEach(box => {
            const x = (box.min.x + mapWidth / 2) * mapScale;
            const z = (box.min.z + mapHeight / 2) * mapScale;
            const width = (box.max.x - box.min.x) * mapScale;
            const height = (box.max.z - box.min.z) * mapScale;
            this.minimapCtx.fillStyle = 'gray';
            this.minimapCtx.fillRect(x, z, width, height);
        });

        // Draw the player's car on the minimap
        const carX = (playerCar.mesh.position.x + mapWidth / 2) * mapScale;
        const carZ = (playerCar.mesh.position.z + mapHeight / 2) * mapScale;
        this.minimapCtx.fillStyle = 'red';
        this.minimapCtx.fillRect(carX - 2, carZ - 2, 4, 4);
    }
}
