import {
	ACCELERATION,
	DECELERATION
} from '../utils/constants.js';

export class InputController {
	constructor() {
		this.controls = {
			w: false,
			s: false,
			a: false,
			d: false,
			space: false
		};

		window.addEventListener('keydown', (e) => {
			if (this.controls[e.key.toLowerCase()] !== undefined) {
				this.controls[e.key.toLowerCase()] = true;
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
