import Vector3 from "./3D/Physics/Math3D/Vector3.mjs";
import Matrix3 from "./3D/Physics/Math3D/Matrix3.mjs";
import Hitbox3 from "./3D/Physics/Broadphase/Hitbox3.mjs";
import Quaternion from "./3D/Physics/Math3D/Quaternion.mjs";
import Triangle from "./3D/Physics/Shapes/Triangle.mjs";
import PhysicsBody3 from "./3D/Physics/Core/PhysicsBody3.mjs";
import Material from "./3D/Physics/Collision/Material.mjs";
import Composite from "./3D/Physics/Shapes/Composite.mjs";
import Sphere from "./3D/Physics/Shapes/Sphere.mjs";
import Box from "./3D/Physics/Shapes/Box.mjs";
import Point from "./3D/Physics/Shapes/Point.mjs";
import Terrain3 from "./3D/Physics/Shapes/Terrain3.mjs";
import SpatialHash from "./3D/Physics/Broadphase/SpatialHash.mjs";
import World from "./3D/Physics/Core/World.mjs";
import Contact from "./3D/Physics/Collision/Contact.mjs";
import CollisionDetector from "./3D/Physics/Collision/CollisionDetector.mjs";
import SimpleCameraControls from "./3D/SimpleCameraControls.js";
import CameraTHREEJS from "./3D/CameraTHREEJS.js";
import Player from "./Player.mjs";
import Keysheld from "./3D/Web/Keysheld.mjs";

import TextureManager from "./3D/Graphics/TextureManager.mjs"

//import * as THREE from "./3D/Graphics/THREE.mjs";

import * as THREE from "three";
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

var stats = new Stats();
stats.showPanel(0);
document.body.appendChild(stats.dom);


var renderer = new THREE.WebGLRenderer();
top.renderer = renderer;
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1;
renderer.physicallyCorrectLights = true;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

var scene = new THREE.Scene();
scene.background = new THREE.Color(0x8CBED6);

var camera = new THREE.PerspectiveCamera(80, window.innerWidth / window.innerHeight, 0.1, 15000);
scene.add(camera);


var textureManager = new TextureManager({
    loader: new THREE.TextureLoader()
});

textureManager.loadAll([
    { name: "skybox sky", file: "autumn_field_puresky.jpg" },
    { name: "skybox garden", file: "garden_skybox.jpg" },
    { name: "skybox hill", file: "red_hill_cloudy.jpg" },
    { name: "grass", file: "grass.png" },
    { name: "rocky ground", file: "rockyGround.jpg" },
    { name: "rug", file: "rug.jpg" }
]);




var skybox = new THREE.SphereGeometry(10000, 64, 64);
var skyboxMaterial = new THREE.MeshBasicMaterial({ map: textureManager.get("skybox sky"), side: THREE.BackSide });
var skyboxMesh = new THREE.Mesh(skybox, skyboxMaterial);
scene.add(skyboxMesh);


const axesHelper = new THREE.AxesHelper(100);
scene.add(axesHelper);


var ambientLight = new THREE.AmbientLight(0xbbbbbb);
scene.add(ambientLight);

var light = new THREE.DirectionalLight(0xffffff, 3);
light.direction = new THREE.Vector3(2,-10,5).normalize();
light.castShadow = true;
light.shadow.mapSize.width = 4096;
light.shadow.mapSize.height = 4096;
var range = 512;
light.shadow.camera.near = 0.5;
light.shadow.camera.far = 4096;
light.shadow.camera.left = -range;
light.shadow.camera.right = range;
light.shadow.camera.top = range;
light.shadow.camera.bottom = -range;
top.light = light;
scene.add(light);
scene.add(light.target);






var gameCamera = new CameraTHREEJS({ camera: camera, pullback: 5, maxPullback: 20 });
var cameraControls = new SimpleCameraControls({ camera: gameCamera, speed: 1, pullbackRate: 0.1 });
var keyListener = new Keysheld(window);
window.addEventListener('wheel', function (e) {
    if (!camera) {
        return;
    }
    gameCamera.rotateY(e.deltaY / 100);
    gameCamera.rotateX(-e.deltaX / 100);
});

var isDragging = false;

window.addEventListener('mousedown', function (e) {
    isDragging = true;
});
document.addEventListener('contextmenu', (event) => {
    event.preventDefault();
});

window.addEventListener('keydown', function (e) {
    if(e.key == "r"){
        player.global.body.setPosition(spawnPoint.copy());
        player.global.body.actualPreviousPosition = player.global.body;
        
        player.global.body.setVelocity(new Vector3(0, 0, 0));
        player.global.body.angularVelocity.reset();
        player.global.body.rotation.reset();
        player.global.body.previousRotation.reset();
        player.global.body.netForce.reset();
        player.syncAll();
    }
});

window.addEventListener('mouseup', function (e) {
    isDragging = false;
});

window.addEventListener('mousemove', function (e) {
    if (!camera || !isDragging) {
        return;
    }
    gameCamera.rotateX(e.movementX / 100);
    gameCamera.rotateY(-e.movementY / 100);
});


var world = new World();
world.setIterations(4);


var jumpStrength = 0.75;
var moveStrength = 0.05;
var gravity = -0.2;
var spawnPoint = new Vector3(0, 40, 0);


var player = new Player({
    radius: 0.5,
    global: { body: { acceleration: new Vector3(0, gravity, 0), position: spawnPoint.copy() } },
    local: { body: { mass: 1 } }
});

player.setMesh({
    material: new THREE.MeshPhongMaterial({ map: textureManager.get("rug"), wireframe: false })
}, THREE);


player.addToScene(scene);
world.addComposite(player);
var canJump = false;

player.spheres[0].preCollisionCallback = function (contact) {
    if (contact.normal.dot(new Vector3(0, 1, 0)) < -0.75 && contact.body1.maxParent == this) {
        canJump = true;
    }
    else if (contact.normal.dot(new Vector3(0, 1, 0)) > 0.75) {
        canJump = true;
    }
}


var gltfLoader = new GLTFLoader();

gltfLoader.load('untitled.glb', function (gltf) {
    gltf.scene.castShadow = true;
    gltf.scene.receiveShadow = true;
    gltf.scene.traverse(function (child) {
        child.castShadow = true;
        child.receiveShadow = true;
        
        
        
        if (child.isMesh) {
            var box = new Box({ local: { body: { mass: Infinity } } }).fromMesh(child);
            box.setRestitution(0);
            box.setFriction(10);
            box.setLocalFlag(Composite.FLAGS.STATIC, true);

            box.mesh = child;
            world.addComposite(box);
            if (child.name.toLowerCase().includes("checkpoint")) {
                if(child.name == "checkpoint_2001"){
                    //spawnPoint = box.global.body.position;
                }
                box.preCollisionCallback = function (contact) {
                    if(contact.body1.maxParent == player){
                        spawnPoint = contact.body2.global.body.position;
                    }
                    else if(contact.body2.maxParent == player){
                        spawnPoint = contact.body1.global.body.position;
                    }
                }                
            }
            scene.add(child.clone());
        }
        else {
        }
    })
});







var start = performance.now();
var fps = 20;
var steps = 0;

function render() {


    if (keyListener.isHeld("ArrowUp") || keyListener.isHeld("KeyW")) {
        cameraControls.forward();
    }
    if (keyListener.isHeld("ArrowDown") || keyListener.isHeld("KeyS")) {
        cameraControls.backward();
    }
    if (keyListener.isHeld("ArrowLeft") || keyListener.isHeld("KeyA")) {
        cameraControls.left();
    }
    if (keyListener.isHeld("ArrowRight") || keyListener.isHeld("KeyD")) {
        cameraControls.right();
    }
    if (keyListener.isHeld("Space")) {
        cameraControls.up();
    }
    if (keyListener.isHeld("ShiftLeft") || keyListener.isHeld("ShiftRight")) {
        cameraControls.down();
    }
    if (keyListener.isHeld("KeyO")) {
        cameraControls.zoomOut();
    }
    if (keyListener.isHeld("KeyI")) {
        cameraControls.zoomIn();
    }
    cameraControls.updateZoom();
    var now = performance.now();
    var delta = (now - start) / 1000;
    var steps2 = delta * fps;
    for (var i = 0; i < Math.floor(steps2 - steps); i++) {
        stats.begin();
        for (var child of world.composites) {
            if (!child.previousPosition) {
                child.previousPosition = child.global.body.position.copy();
                child.previousRotation = child.global.body.rotation.copy();
            }

            child.previousPosition = child.global.body.position.copy();
            child.previousRotation = child.global.body.rotation.copy();
        }
        if(player.global.body.position.y < -30){
            player.global.body.setPosition(spawnPoint.copy());
            player.global.body.actualPreviousPosition = player.global.body;
            
            player.global.body.setVelocity(new Vector3(0, 0, 0));
            player.global.body.angularVelocity.reset();
            player.global.body.rotation.reset();
            player.global.body.previousRotation.reset();
            player.global.body.netForce.reset();
            player.syncAll();
        }
        world.step();
        
        steps++;

        if (cameraControls.movement.up && canJump) {
            var vel = player.global.body.getVelocity();
            player.global.body.setVelocity(new Vector3(vel.x, vel.y + jumpStrength * world.deltaTime, vel.z));
            canJump = false;
        }
        var delta2 = cameraControls.getDelta(camera).scale(player.global.body.mass * world.deltaTime).scale(moveStrength);
        player.applyForce(delta2, player.global.body.position);
        
        stats.end();
    }
    var lerpAmount = (delta * fps - steps);
    for (var child of world.composites) {
        if (!child.previousPosition) {
            child.previousPosition = child.global.body.position.copy();
            child.previousRotation = child.global.body.rotation.copy();
        }
        if (child.mesh) {
            child.mesh.position.set(...child.previousPosition.lerp(child.global.body.position, lerpAmount));
            child.mesh.quaternion.slerpQuaternions(child.previousRotation, new THREE.Quaternion().copy(child.global.body.rotation), lerpAmount);
        }

    }

   


    gameCamera.update(player.previousPosition.lerp(player.global.body.position, lerpAmount));
    if (skyboxMesh) {
        skyboxMesh.position.copy(camera.position);
    }
    light.position.copy(camera.position);
    light.position.sub(light.direction.clone().multiplyScalar(light.shadow.camera.far * 0.5));
    light.target.position.addVectors(light.position, light.direction);
    renderer.render(scene, camera);
    requestAnimationFrame(render);
}


render();