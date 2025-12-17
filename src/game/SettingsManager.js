export class SettingsManager {
    constructor(renderer, cameraController, hud) {
        this.renderer = renderer;
        this.cameraController = cameraController;
        this.hud = hud;

        this.settings = {
            graphicsQuality: 'medium',
            cameraSensitivity: 1.0,
            showFps: false,
        };

        this.settingsPanel = document.getElementById('settings-panel');
        this.graphicsQualitySelect = document.getElementById('graphics-quality');
        this.cameraSensitivityInput = document.getElementById('camera-sensitivity');
        this.toggleFpsInput = document.getElementById('toggle-fps');
        this.resetGameButton = document.getElementById('reset-game');
        this.closeSettingsButton = document.getElementById('close-settings');

        this.loadSettings();
        this.bindEvents();
        this.applySettings();
    }

    loadSettings() {
        const savedSettings = localStorage.getItem('gameSettings');
        if (savedSettings) {
            this.settings = JSON.parse(savedSettings);
        }
    }

    saveSettings() {
        localStorage.setItem('gameSettings', JSON.stringify(this.settings));
    }

    bindEvents() {
        this.graphicsQualitySelect.addEventListener('change', (e) => {
            this.settings.graphicsQuality = e.target.value;
            this.applySettings();
            this.saveSettings();
        });

        this.cameraSensitivityInput.addEventListener('input', (e) => {
            this.settings.cameraSensitivity = parseFloat(e.target.value);
            this.applySettings();
            this.saveSettings();
        });

        this.toggleFpsInput.addEventListener('change', (e) => {
            this.settings.showFps = e.target.checked;
            this.applySettings();
            this.saveSettings();
        });

        this.resetGameButton.addEventListener('click', () => {
            if (confirm('Are you sure you want to reset the game? Your car position will be reset.')) {
                window.location.reload();
            }
        });

        this.closeSettingsButton.addEventListener('click', () => {
            this.hide();
        });
    }

    applySettings() {
        // Apply graphics quality
        switch (this.settings.graphicsQuality) {
            case 'low':
                this.renderer.setPixelRatio(0.5);
                this.renderer.shadowMap.enabled = false;
                break;
            case 'medium':
                this.renderer.setPixelRatio(window.devicePixelRatio * 0.75);
                this.renderer.shadowMap.enabled = true;
                this.renderer.shadowMap.type = THREE.PCFShadowMap;
                break;
            case 'high':
                this.renderer.setPixelRatio(window.devicePixelRatio);
                this.renderer.shadowMap.enabled = true;
                this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
                break;
        }

        // Apply camera sensitivity
        if (this.cameraController) {
            this.cameraController.setSensitivity(this.settings.cameraSensitivity);
        }

        // Apply FPS counter visibility
        if (this.hud) {
            this.hud.toggleFps(this.settings.showFps);
        }


        // Update UI elements to reflect current settings
        this.graphicsQualitySelect.value = this.settings.graphicsQuality;
        this.cameraSensitivityInput.value = this.settings.cameraSensitivity;
        this.toggleFpsInput.checked = this.settings.showFps;
    }

    toggleVisibility() {
        this.settingsPanel.classList.toggle('hidden');
    }

    hide() {
        this.settingsPanel.classList.add('hidden');
    }
}
