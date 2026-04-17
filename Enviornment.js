import * as THREE from 'three';
import { Water } from 'three/addons/objects/Water.js';
import { CONFIG } from './config.js';

export class Environment {
    constructor(scene) {
        this.scene = scene;

        this.setupLights();
        this.setupSkybox();
        this.setupWater();
        this.setupIsland();
    }

    setupLights() {
        const ambient = new THREE.AmbientLight(0xffffff, 0.4);
        this.scene.add(ambient);

        const sun = new THREE.DirectionalLight(0xfff0dd, 1.5);
        sun.position.set(-100, 50, -100);
        sun.castShadow = true;
        sun.shadow.mapSize.width = 2048;
        sun.shadow.mapSize.height = 2048;
        sun.shadow.camera.near = 0.5;
        sun.shadow.camera.far = 500;
        sun.shadow.camera.left = -100;
        sun.shadow.camera.right = 100;
        sun.shadow.camera.top = 100;
        sun.shadow.camera.bottom = -100;
        this.scene.add(sun);

        // Add fog for atmospheric depth
        this.scene.fog = new THREE.FogExp2(0xaaccff, 0.005);
    }

    setupSkybox() {
        const loader = new THREE.TextureLoader();
        loader.load('assets/skybox-morning-lake.webp', (texture) => {
            texture.mapping = THREE.EquirectangularReflectionMapping;
            this.scene.background = texture;
            this.scene.environment = texture;
        });
    }

    setupWater() {
        const waterGeometry = new THREE.PlaneGeometry(10000, 10000);

        this.water = new Water(
            waterGeometry,
            {
                textureWidth: 512,
                textureHeight: 512,
                waterNormals: new THREE.TextureLoader().load('https://threejs.org/examples/textures/waternormals.jpg', function (texture) {
                    texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
                }),
                sunDirection: new THREE.Vector3(-100, 50, -100).normalize(),
                sunColor: 0xfff0dd,
                waterColor: 0x001e0f,
                distortionScale: 3.7,
                fog: this.scene.fog !== undefined
            }
        );

        this.water.rotation.x = -Math.PI / 2;
        this.water.position.y = -0.5;
        this.scene.add(this.water);
    }

    setupIsland() {
        const loader = new THREE.TextureLoader();
        
        // Boat instead of island
        const woodTex = loader.load('assets/boat-wood-texture.webp');
        woodTex.wrapS = woodTex.wrapT = THREE.RepeatWrapping;
        woodTex.repeat.set(2, 4);
        
        const boatGroup = new THREE.Group();
        this.scene.add(boatGroup);
        this.boat = boatGroup;

        // Main hull
        const hullGeo = new THREE.BoxGeometry(6, 1, 12);
        const hullMat = new THREE.MeshStandardMaterial({ map: woodTex });
        const hull = new THREE.Mesh(hullGeo, hullMat);
        hull.position.y = -0.3;
        hull.castShadow = true;
        hull.receiveShadow = true;
        boatGroup.add(hull);

        // Railing
        const railMat = new THREE.MeshStandardMaterial({ color: 0x332211 });
        const railSide1 = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.8, 12), railMat);
        railSide1.position.set(2.9, 0.6, 0);
        boatGroup.add(railSide1);

        const railSide2 = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.8, 12), railMat);
        railSide2.position.set(-2.9, 0.6, 0);
        boatGroup.add(railSide2);

        const railBack = new THREE.Mesh(new THREE.BoxGeometry(6, 0.8, 0.2), railMat);
        railBack.position.set(0, 0.6, 5.9);
        boatGroup.add(railBack);

        const railFront = new THREE.Mesh(new THREE.BoxGeometry(6, 0.8, 0.2), railMat);
        railFront.position.set(0, 0.6, -5.9);
        boatGroup.add(railFront);

        // Position boat in scene
        boatGroup.position.set(0, 0, 0);

        // Keep a few distant trees/rocks for context
        const treeTex = loader.load('assets/pine-tree-sprite.webp');
        const treeMat = new THREE.SpriteMaterial({ map: treeTex, transparent: true });
        for (let i = 0; i < 10; i++) {
            const tree = new THREE.Sprite(treeMat);
            const scale = 30 + Math.random() * 20;
            tree.scale.set(scale * 0.75, scale, 1);
            const angle = Math.random() * Math.PI * 2;
            const radius = 200 + Math.random() * 50;
            tree.position.set(Math.cos(angle) * radius, scale / 2 - 5, Math.sin(angle) * radius);
            this.scene.add(tree);
        }
    }

    update(deltaTime) {
        if (this.water) {
            this.water.material.uniforms['time'].value += 1.0 / 60.0;
        }
    }
}
