import * as THREE from 'three';
import { Environment } from './Environment.js';
import { Player } from './Player.js';
import { UI } from './UI.js';
import { AudioManager } from './AudioManager.js';

export class Game {
    constructor(scene, camera, renderer) {
        this.scene = scene;
        this.camera = camera;
        this.renderer = renderer;

        this.audio = new AudioManager();
        this.environment = new Environment(this.scene);
        this.player = new Player(this.scene, this.camera, this.renderer.domElement, this.audio);
        this.ui = new UI(this.player);

        // Bind events
        this.player.onCatch = (fish) => {
            this.audio.playCatch();
            this.ui.showCatch(fish);
        };
        this.player.onStateChange = (state) => {
            if (state === 'Bite!') this.audio.playBite();
            this.ui.updateStatus(state);
        };
        this.player.onMoneyChange = (val) => {
            this.ui.updateMoney(val);
        };

        // Start audio on first click
        window.addEventListener('mousedown', () => this.audio.start(), { once: true });
    }

    update(deltaTime) {
        this.environment.update(deltaTime);
        this.player.update(deltaTime);
        this.ui.update(deltaTime, this.player);
    }
}
