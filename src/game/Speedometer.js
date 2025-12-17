export class Speedometer {
    constructor() {
        this.speedometerElement = document.getElementById('speedometer');
    }

    update(velocity) {
        const speed = velocity.length() * 3.6; // Convert to km/h
        this.speedometerElement.textContent = `${Math.floor(speed)} km/h`;
    }
}
