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

import Keysheld from "./3D/Web/Keysheld.mjs";

import TextureManager from "./3D/Graphics/TextureManager.mjs"

//import * as THREE from "./3D/Graphics/THREE.mjs";

import * as THREE from "three";
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

var stats = new Stats();
stats.showPanel(0);
document.body.appendChild(stats.dom);


var renderer = new THREE.WebGLRenderer();

renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

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
light.position.set(-2, 10, 5);
scene.add(light);




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


var world = new World();
world.setIterations(4);

var player = new Sphere({
    radius: 0.5,
    global: { body: { acceleration: new Vector3(0, -0.1, 0), position: new Vector3(0, 40, 0) } },
    local: { body: { mass: 1 } }
});

player.setMesh({
    material: new THREE.MeshPhongMaterial({ map: textureManager.get("rug"), wireframe: false })
}, THREE);

player.setLocalFlag(Composite.FLAGS.CENTER_OF_MASS, true);

player.addToScene(scene);
world.addComposite(player);

var canJump = false;
player.preCollisionCallback = function(contact){
    if(contact.normal.dot(new Vector3(0,1,0)) < -0.75 && contact.body1.maxParent == this){
        canJump = true;
    }
    else if(contact.normal.dot(new Vector3(0,1,0)) > 0.75){
        canJump = true;
    }
}
player.syncAll();

var gltfLoader = new GLTFLoader();

gltfLoader.load('scene.gltf', function (gltf) {
    scene.add(gltf.scene);
    gltf.scene.traverse(function (child) {
        if(child.isMesh){
            var box = new Box({ local: { body: { mass: Infinity } } }).fromMesh(child);
            box.setRestitution(0);
            box.setFriction(1);
            box.setLocalFlag(Composite.FLAGS.STATIC, true);

            box.mesh = child.clone();
            world.addComposite(box);
            if(child.name == "Box_13"){
                box.preCollisionCallback = function(contact){
                    alert("you win!!!");
                }
                //player.global.body.setPosition(box.global.body.position.copy());
            }
        }
        else{
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
        world.step();
        steps++;

        if(cameraControls.movement.up && canJump){
            var vel = player.global.body.getVelocity();
            player.global.body.setVelocity(new Vector3(vel.x, vel.y + 0.5 * world.deltaTime, vel.z));
            canJump = false;
        }
        var delta2 = cameraControls.getDelta(camera).scale(player.global.body.mass * world.deltaTime);
        player.applyForce(delta2.scale(0.03), player.global.body.position);
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
    renderer.render(scene, camera);
    requestAnimationFrame(render);
}


render();