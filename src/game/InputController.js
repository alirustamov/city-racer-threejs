import {
	ACCELERATION,
	DECELERATION
} from '../utils/constants.js';

export class InputController {
	constructor(settingsManager, debugManager) {
		this.settingsManager = settingsManager;
		this.debugManager = debugManager;
		this.controls = {
			w: false,
			s: false,
			a: false,
			d: false,
			space: false
		};

		window.addEventListener('keydown', (e) => {
			const key = e.key.toLowerCase();
			if (this.controls[key] !== undefined) {
				this.controls[key] = true;
			}
			if (key === 'p') {
				this.settingsManager.toggleVisibility();
			}
			if (key === '`') {
				this.debugManager.toggle();
				if (this.debugManager.isActive) {
					this.debugManager.createPanel();
				}
			}

			if (this.debugManager.isActive) {
				switch (key) {
					case '1':
						this.debugManager.options.wireframe = !this.debugManager.options.wireframe;
						this.debugManager.setWireframe(this.debugManager.options.wireframe);
						console.log(`Wireframe: ${this.debugManager.options.wireframe}`);
						break;
					case '2':
						this.debugManager.options.showBoundingBoxes = !this.debugManager.options.showBoundingBoxes;
						console.log(`Show Bounding Boxes: ${this.debugManager.options.showBoundingBoxes}`);
						break;
					case '3':
						this.debugManager.options.showChunkBorders = !this.debugManager.options.showChunkBorders;
						console.log(`Show Chunk Borders: ${this.debugManager.options.showChunkBorders}`);
						break;
					case '4':
						this.debugManager.options.aiTraffic = !this.debugManager.options.aiTraffic;
						this.debugManager.setAiTraffic(this.debugManager.options.aiTraffic);
						console.log(`AI Traffic: ${this.debugManager.options.aiTraffic}`);
						break;
				}
			}
		});

		window.addEventListener('keyup', (e) => {
			if (this.controls[e.key.toLowerCase()] !== undefined) {
				this.controls[e.key.toLowerCase()] = false;
			}
		});
	}

	update(playerCar) {
		// Acceleration and braking
		playerCar.acceleration = 0;
		if (this.controls.w) playerCar.acceleration = ACCELERATION;
		if (this.controls.s) playerCar.acceleration = DECELERATION;

		// Brake lights
		if (this.controls.s) {
			playerCar.brakeLights.forEach(light => light.intensity = 1);
		} else {
			playerCar.brakeLights.forEach(light => light.intensity = 0);
		}

		// Steering
		playerCar.steering = 0;
		if (this.controls.a) playerCar.steering = 1;
		if (this.controls.d) playerCar.steering = -1;

		// Handbrake
		playerCar.handbrake = this.controls.space;
	}
}
