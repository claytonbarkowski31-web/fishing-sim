import * as THREE from 'three';
import { PlayerController, ThirdPersonCameraController } from './rosie/controls/rosieControls.js';
import { CONFIG } from './config.js';

export const PlayerStates = {
    WALKING: 'Walking',
    CASTING: 'Casting',
    WAITING: 'Waiting',
    BITE: 'Bite!',
    HOOKED: 'Hooked',
    REELING: 'Reeling',
    CAUGHT: 'Caught!'
};

export class Player {
    constructor(scene, camera, domElement, audio) {
        this.scene = scene;
        this.camera = camera;
        this.domElement = domElement;
        this.audio = audio;

        this.setupPlayerMesh();
        this.setupControls();
        this.setupFishingRod();

        this.state = PlayerStates.WALKING;
        this.castPower = 0;
        this.biteTimer = 0;
        this.caughtFish = null;
        this.inventory = [];
        this.money = 0;
        this.reelTension = 0;
        this.reelProgress = 0;
        this.upgrades = {
            reelSpeedBonus: 0,
            biteRateBonus: 0
        };

        // Events
        this.onCatch = null;
        this.onStateChange = null;
        this.onMoneyChange = null;

        this.setupInput();
    }

    setupPlayerMesh() {
        this.group = new THREE.Group();
        this.scene.add(this.group);
        this.mesh = this.group; // For controller compatibility

        const loader = new THREE.TextureLoader();
        const clothesTex = loader.load('assets/fisherman-clothes-texture.webp');
        const clothesMat = new THREE.MeshStandardMaterial({ map: clothesTex, roughness: 0.8 });
        const skinMat = new THREE.MeshStandardMaterial({ color: 0xffdbac });

        // Torso
        const torso = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.8, 0.3), clothesMat);
        torso.position.y = 1.1;
        torso.castShadow = true;
        this.group.add(torso);

        // Legs
        const legGeo = new THREE.CylinderGeometry(0.12, 0.1, 0.8);
        const legL = new THREE.Mesh(legGeo, clothesMat);
        legL.position.set(-0.15, 0.4, 0);
        legL.castShadow = true;
        this.group.add(legL);

        const legR = new THREE.Mesh(legGeo, clothesMat);
        legR.position.set(0.15, 0.4, 0);
        legR.castShadow = true;
        this.group.add(legR);

        // Arms
        const armGeo = new THREE.CylinderGeometry(0.08, 0.07, 0.7);
        this.armL = new THREE.Mesh(armGeo, skinMat);
        this.armL.position.set(-0.4, 1.2, 0);
        this.armL.rotation.z = Math.PI / 8;
        this.armL.castShadow = true;
        this.group.add(this.armL);

        this.armR = new THREE.Mesh(armGeo, skinMat);
        this.armR.position.set(0.4, 1.2, 0);
        this.armR.rotation.z = -Math.PI / 8;
        this.armR.castShadow = true;
        this.group.add(this.armR);

        // Head
        const head = new THREE.Mesh(new THREE.SphereGeometry(0.2, 16, 16), skinMat);
        head.position.y = 1.6;
        head.castShadow = true;
        this.group.add(head);

        // Hat
        const hatBase = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.25, 0.05), clothesMat);
        hatBase.position.y = 1.75;
        this.group.add(hatBase);
        const hatTop = new THREE.Mesh(new THREE.SphereGeometry(0.2, 8, 8, 0, Math.PI * 2, 0, Math.PI / 2), clothesMat);
        hatTop.position.y = 1.75;
        this.group.add(hatTop);
    }

    setupControls() {
        this.controller = new PlayerController(this.group, {
            moveSpeed: CONFIG.PLAYER.MOVE_SPEED,
            jumpForce: CONFIG.PLAYER.JUMP_FORCE,
            groundLevel: 0.2 // Boat deck level
        });

        this.cameraController = new ThirdPersonCameraController(this.camera, this.group, this.domElement, {
            distance: 8,
            height: 3
        });
    }

    setupFishingRod() {
        const rodGeo = new THREE.CylinderGeometry(0.01, 0.03, 3);
        const rodMat = new THREE.MeshStandardMaterial({ color: 0x222222 });
        this.rod = new THREE.Mesh(rodGeo, rodMat);
        this.rod.position.set(0.3, 0.4, -0.4);
        this.rod.rotation.x = -Math.PI / 3;
        this.group.add(this.rod); // Attached to group

        // Fishing line
        const lineMat = new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.5 });
        const lineGeo = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(), new THREE.Vector3()]);
        this.line = new THREE.Line(lineGeo, lineMat);
        this.scene.add(this.line); 
        this.line.visible = false;

        // Bobber
        const bobberGeo = new THREE.SphereGeometry(0.08, 8, 8);
        const bobberMat = new THREE.MeshStandardMaterial({ color: 0xff3333 });
        this.bobber = new THREE.Mesh(bobberGeo, bobberMat);
        this.scene.add(this.bobber);
        this.bobber.visible = false;
    }

    setupInput() {
        window.addEventListener('mousedown', (e) => {
            if (e.button !== 0) return; // Only left click
            this.handleAction();
        });

        window.addEventListener('mouseup', (e) => {
            if (e.button !== 0) return;
            if (this.state === PlayerStates.CASTING) {
                this.performCast();
            }
        });
    }

    handleAction() {
        if (window.isShopOpen) return; // Don't fish while shopping

        switch (this.state) {
            case PlayerStates.WALKING:
                this.setState(PlayerStates.CASTING);
                this.castPower = 0;
                break;
            case PlayerStates.WAITING:
                this.cancelFishing();
                break;
            case PlayerStates.BITE:
                this.setState(PlayerStates.REELING);
                this.reelProgress = 0;
                this.reelTension = 0.5;
                if (this.audio) this.audio.playSplash();
                break;
            case PlayerStates.REELING:
                // Increase progress and tension
                this.reelProgress += (CONFIG.FISHING.REEL_SPEED + this.upgrades.reelSpeedBonus);
                this.reelTension += CONFIG.FISHING.TENSION_INCREASE;
                if (this.audio) this.audio.playReel();
                if (this.reelProgress >= 1) {
                    this.completeCatch();
                }
                break;
            case PlayerStates.CAUGHT:
                this.setState(PlayerStates.WALKING);
                break;
        }
    }

    cancelFishing() {
        this.setState(PlayerStates.WALKING);
        this.bobber.visible = false;
        this.line.visible = false;
    }

    setState(newState) {
        if (this.state === newState) return;
        this.state = newState;
        if (this.onStateChange) this.onStateChange(this.state);
        
        // Reset movements if casting
        if (this.state !== PlayerStates.WALKING) {
            this.controller.keys['KeyW'] = false;
            this.controller.keys['KeyS'] = false;
            this.controller.keys['KeyA'] = false;
            this.controller.keys['KeyD'] = false;
        }
    }

    performCast() {
        const distance = this.castPower * CONFIG.FISHING.MAX_CAST_DISTANCE;
        if (distance < 2) {
            this.setState(PlayerStates.WALKING);
            return;
        }

        // Snap camera to face the same way as player
        if (this.cameraController) {
            this.cameraController.setRotation(this.group.rotation.y + Math.PI);
        }

        // Calculate landing point
        const forward = new THREE.Vector3(0, 0, -1).applyQuaternion(this.mesh.quaternion);
        this.castTarget = this.mesh.position.clone().add(forward.multiplyScalar(distance));
        this.castTarget.y = -0.5; // Water level

        // Move bobber to target
        this.bobber.position.copy(this.castTarget);
        this.bobber.visible = true;
        this.line.visible = true;

        if (this.audio) {
            this.audio.playCast();
            setTimeout(() => this.audio.playSplash(), 500); // Slight delay for travel
        }

        this.setState(PlayerStates.WAITING);
        this.biteTimer = CONFIG.FISHING.BITE_TIME_MIN + Math.random() * (CONFIG.FISHING.BITE_TIME_MAX - CONFIG.FISHING.BITE_TIME_MIN);
        
        this.createRipple(this.castTarget);
    }

    createRipple(pos) {
        const rippleGeo = new THREE.RingGeometry(0.1, 0.2, 32);
        const rippleMat = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.5, side: THREE.DoubleSide });
        const ripple = new THREE.Mesh(rippleGeo, rippleMat);
        ripple.rotation.x = -Math.PI / 2;
        ripple.position.copy(pos);
        ripple.position.y = -0.45;
        this.scene.add(ripple);

        const startTime = Date.now();
        const duration = 1000;

        const animateRipple = () => {
            const elapsed = Date.now() - startTime;
            const progress = elapsed / duration;

            if (progress < 1) {
                ripple.scale.set(1 + progress * 5, 1 + progress * 5, 1);
                ripple.material.opacity = 0.5 * (1 - progress);
                requestAnimationFrame(animateRipple);
            } else {
                this.scene.remove(ripple);
                ripple.geometry.dispose();
                ripple.material.dispose();
            }
        };
        animateRipple();
    }

    update(deltaTime) {
        const rotation = this.cameraController.update();
        
        if (this.state === PlayerStates.WALKING) {
            this.controller.update(deltaTime, rotation);
        } else if (this.state === PlayerStates.CASTING) {
            this.castPower = Math.min(1, this.castPower + deltaTime * CONFIG.FISHING.CAST_POWER_SPEED);
        } else if (this.state === PlayerStates.WAITING) {
            this.biteTimer -= deltaTime * 1000 * (1 + this.upgrades.biteRateBonus);
            this.bobber.position.y = -0.5 + Math.sin(Date.now() * 0.005) * 0.05;
            
            if (this.biteTimer <= 0) {
                this.setState(PlayerStates.BITE);
                this.biteTimer = CONFIG.FISHING.HOOK_WINDOW;
            }
        } else if (this.state === PlayerStates.BITE) {
            this.biteTimer -= deltaTime * 1000;
            this.bobber.position.y = -0.6 + Math.sin(Date.now() * 0.05) * 0.2;
            
            if (this.biteTimer <= 0) {
                this.cancelFishing();
            }
        } else if (this.state === PlayerStates.REELING) {
            // Difficulty: Tension decreases over time, but increases when reeling
            // If tension gets too high or too low, the fish might escape
            this.reelTension -= CONFIG.FISHING.TENSION_DECREASE * deltaTime * 10;
            
            // Fish pulling back
            this.reelProgress -= CONFIG.FISHING.REEL_DIFFICULTY_FACTOR * deltaTime * 0.1;
            this.reelProgress = Math.max(0, this.reelProgress);

            if (this.reelTension > CONFIG.FISHING.TENSION_FAIL_LIMIT || this.reelTension < 0) {
                this.cancelFishing();
            }

            this.bobber.position.y = -0.5 + Math.sin(Date.now() * 0.02) * 0.1;
        }

        // Update fishing line positions
        if (this.line.visible) {
            this.rod.updateMatrixWorld();
            const rodTip = new THREE.Vector3(0, 1.5, 0).applyMatrix4(this.rod.matrixWorld);
            const linePoints = [
                rodTip,
                this.bobber.position.clone()
            ];
            this.line.geometry.setFromPoints(linePoints);
        }
    }

    completeCatch() {
        const fishType = CONFIG.FISH_TYPES[Math.random() < CONFIG.FISH_TYPES[0].rarity ? 0 : 1];
        const weight = fishType.weightRange[0] + Math.random() * (fishType.weightRange[1] - fishType.weightRange[0]);
        
        const fish = {
            name: fishType.name,
            weight: weight.toFixed(2),
            texture: fishType.texture,
            value: fishType.value
        };

        this.money += fish.value;
        this.inventory.push(fish);
        this.caughtFish = fish;
        this.setState(PlayerStates.CAUGHT);
        this.bobber.visible = false;
        this.line.visible = false;

        if (this.onCatch) this.onCatch(fish);
        if (this.onMoneyChange) this.onMoneyChange(this.money);
    }
}
