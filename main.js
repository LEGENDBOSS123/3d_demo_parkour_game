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

import Keysheld from "./3D/Web/Keysheld.js";

import * as THREE from "./3D/THREE.mjs";

noise.seed(12315);

var renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
document.body.appendChild(renderer.domElement);

var stats = new Stats();
stats.showPanel(0);
document.body.appendChild(stats.dom);

var scene = new THREE.Scene();
scene.background = new THREE.Color(0x8CBED6);

var camera = new THREE.PerspectiveCamera(80, window.innerWidth / window.innerHeight, 0.1, 35000);
scene.add(camera);


var raycaster = new THREE.Raycaster();
raycaster.far = 1000;
raycaster.near = 5;
raycaster.precision = 0.01;
var mouse = new THREE.Vector2();


var world = new World();
world.setIterations(4);


top.world = world;


var player = new Composite({radius:1, global: { body: { acceleration: new Vector3(0, -4, 0), position: new Vector3(0, 4000, 0) } }, local: { body: { mass: 0 } } });
// player.setRestitution(0.5);
//player.setFriction(-1);
top.player = player;
player.setMesh({ radius: 5, material: new THREE.MeshPhongMaterial({ color: 0x00ff00, wireframe: false }) }, THREE);


player.addToScene(scene);
world.addComposite(player);


var addToPlayer = function(pos, mass = 10, rad = 80, fr = -Infinity, ee = Sphere, op = {}){
    var playerPart = new ee(op);
    playerPart.setRestitution(1);
    playerPart.setFriction(1);
    playerPart.radius = rad;
    playerPart.setMesh({radius: 30, material: new THREE.MeshPhongMaterial({ color: Math.floor(Math.random()**4 * 0xffffff), wireframe: true }) }, THREE);
    playerPart.addToScene(scene);
    playerPart.local.body.setMass(mass);
    playerPart.local.body.position.x += pos.x;
    playerPart.local.body.position.y += pos.y;
    playerPart.local.body.position.z += pos.z;
    playerPart.local.body.setVelocity(new Vector3(0, 0, 0));
    player.add(playerPart);
    world.addComposite(playerPart);
    return playerPart;
}
// var dd = new Vector3(3,3,3);
// for(var i = 0; i < dd.x; i++){
//     for(var j = 0; j < dd.y; j++){
//         for(var k = 0; k < dd.z; k++){
//             if(!(i == 0 || j == 0 || k == 0 || i == 7 || j == 7 || k == 7)){
//                 continue;
//             }
//             var ezclaps = 100;
//             var v = new Vector3(j * ezclaps, k * ezclaps, i * ezclaps);
//             addToPlayer(v.add(new Vector3(0, 0, 0)), 0.1, 40, -0.5);
//         }
//     }
// }
// addToPlayer(new Vector3(0, 0, 0), 0.1, 4, -1);
// addToPlayer(new Vector3(20, 0, 0), 0.1, 4, -1);

// addToPlayer(new Vector3(20, 0, 35), 0.1, 4, -1);
// var p = addToPlayer(new Vector3(0, 0, 35), 0.1, 4, -1);
// addToPlayer(new Vector3(10, 5, 10), 0.1, 4, -1);
var p = addToPlayer(new Vector3(0, 0, 0), 0.1, 20, -1);
var p = addToPlayer(new Vector3(100, 0, 0), 0.1, 40, -1);

var canJump = false;
p.preCollisionCallback = function(contact){
    if(contact.normal.dot(new Vector3(0,1,0)) < -0.75 && contact.body1.maxParent == this){
        canJump = true;
    }
    else if(contact.normal.dot(new Vector3(0,1,0)) > -0.75){
        canJump = true;
    }
}
player.syncAll();


//addToPlayer(new Vector3(100, 50, 250), 0.01, 75, 10, Composite, {width: 100, height: 100, depth: 100});
//addToPlayer(new Vector3(100, 0, 125), 0, 2.5, 1, Composite);
var playerGuider = player;//player.children[player.children.length - 1];


// var box = new Box({width: 1000, height: 1000, depth: 1000, local: {body:{mass: 1}},global: { body: { acceleration: new Vector3(0, -5, 0), position: new Vector3(-7000, 13000, 0) } }});
// box.setMesh({material: new THREE.MeshPhongMaterial({ color: 0x00ff00, wireframe: false }) }, THREE);
// box.addToScene(scene);
// world.addComposite(box);

// setInterval(function(){
//     var sphere = new Sphere({radius: Math.random() * 40 + 40, local: {body:{mass: 1}},global: { body: { acceleration: new Vector3(0, -2, 0), position: new Vector3(200 + Math.random() * 100, 1000, Math.random() * 500) } }});
//     sphere.setRestitution(0.5);
//     sphere.setFriction(-Infinity);
//     sphere.setMesh({material: new THREE.MeshPhongMaterial({ color: Math.floor(Math.random() * 0xffffff), wireframe: false }) }, THREE);
//     sphere.addToScene(scene);
//     world.addComposite(sphere);
// }, 100);

//var v = new Vector3(Math.random() * 100 - 50, Math.random() * 100 - 50, Math.random() * 100 - 50);
//addToPlayer(v.add(new Vector3(0, -1200, 0)), 3);

player.setLocalFlag(Composite.FLAGS.CENTER_OF_MASS, true);
// playerGuider = box;
// player = box;
// var ball = new Point({global:{body:{acceleration: new Vector3(0, -0.2, 0), position:new Vector3(0,100,0)}}});
// ball.setMesh({ radius: 5, material: new THREE.MeshPhongMaterial({ color: 0x00ff00, wireframe: false }) }, THREE);
// ball.local.body.mass = 1;
// ball.addToScene(scene);
// world.addComposite(ball);


var skybox = new THREE.SphereGeometry(30000, 64, 64);
var skyboxMaterial = new THREE.MeshBasicMaterial({ color: 0x8CBED6, side: THREE.BackSide });
var skyboxMesh = null;

var loader = new THREE.TextureLoader();


var skyboxTexture = loader.load("autumn_field_puresky.jpg");
var grassTexture = loader.load("grass.png");
var rockyGroundTexture = loader.load("rockyGround.jpg");
var rugTexture = loader.load("rug.jpg");

var textureUsed = rugTexture;

// var sphereTexture = loader.load("metal_plate_diff_2k.jpg");
// var sphereTexture2 = loader.load("metal_plate_metal_2k.png");
// var sphereTextureNormal = loader.load("metal_plate_nor_gl_2k.png");
// var sphereTextureDisp = loader.load("metal_plate_disp_2k.png");
// var sphereTextureRough = loader.load("metal_plate_rough_2k.png");
skyboxMaterial = new THREE.MeshBasicMaterial({ map: skyboxTexture, side: THREE.BackSide });
skyboxMesh = new THREE.Mesh(skybox, skyboxMaterial);
scene.add(skyboxMesh);
console.log("loaded");




var gameCamera = new CameraTHREEJS({ camera: camera, pullback: 500, maxPullback: 1000});
var cameraControls = new SimpleCameraControls({ camera: gameCamera, speed: 1, pullbackRate: 20 });
var keyListener = new Keysheld(window);


var generate2dHeightmap = function (xDim, zDim) {
    var map = [];
    for (var x = 0; x < xDim; x++) {
        var row = [];
        for (var z = 0; z < zDim; z++) {
            var x1 = (x-xDim/2)/10;
            var z1 = (z-zDim/2)/10;
            row.push(Math.sin(x1/10000)*1);
        }
        map.push(row);
    }
    //return map;

    var map = [];
    for (var x = 0; x < xDim; x++) {
        var row = [];
        for (var z = 0; z < zDim; z++) {
            //row.push(1*(noise.perlin2(x / 10, z / 10) * 120 + noise.perlin2(x / 10, z / 10) * Math.sin(x/10) * 75 + (noise.perlin2(x / 10, z / 10)+1) * Math.sin((noise.simplex2(x + z, z - x))/100)**4 * 100));
            row.push(0 * x);
        }
        map.push(row);
    }
    return map;
}




var topArray = generate2dHeightmap(200, 200);

var topArray2 = generate2dHeightmap(200,200);
topArray2 = [
    [1000, 1200, 900, 1100, 1300],
    [900, 1500, 1000, 1600, 800],
    [1400, 1100, 1800, 700, 2000],
    [1600, 1300, 1200, 1700, 900],
    [800, 1900, 1000, 1500, 1100]
  ];
  var topArray3 = topArray2;//[[-1000,-1000,-2000],[-1000, -1000,-1000],[-5000,-5000,-3000]];
var ambientLight = new THREE.AmbientLight(0xbbbbbb);
scene.add(ambientLight);

var light = new THREE.DirectionalLight(0xffffff, 3);
light.position.set(0.5, 1, 1);
scene.add(light);







var extension = Math.random() < 0.5 ? ".png" : ".jpg";
extension = ".jpg";
//extension = ".png";

var terrain1 = new Terrain3();
terrain1.setFriction(1);
terrain1.setRestitution(0);
terrain1.global.body.position.set(new Vector3(0,0,0));
var topArray = generate2dHeightmap(terrain1.heightmaps.with, terrain1.heightmaps.height);


var terrain1Material = new THREE.MeshPhongMaterial({ color: 0xFFFF00, vertexColors: false });
terrain1Material.wireframe = false;
terrain1.setMaps(topArray.flat(), topArray.flat());
terrain1.balance();



var addBox = function(x,y,z, w, h, d, t, s1 = 30, s2 = 30, r = new Vector3(0, 0, 0)) {
    var box = new Box({width: w, height: h, depth: d, local: {body:{mass: Infinity}},global: { body: { acceleration: new Vector3(0, 0, 0), position: new Vector3(x, y, z) } }});
    box.setRestitution(0);
    box.setFriction(0);
    box.global.body.rotation = box.global.body.rotation.rotateByAngularVelocity(r);
    box.setLocalFlag(Composite.FLAGS.STATIC, true);
    t = t.clone();
    t.wrapS = THREE.RepeatWrapping;
    t.wrapT = THREE.RepeatWrapping;
    t.repeat.set(s1, s2);
    var boxMaterial = new THREE.MeshPhongMaterial({ map: t });
    box.setMesh({material: boxMaterial}, THREE);
    box.addToScene(scene);
    world.addComposite(box);
    return box;
}


var box;
var s = [10, 10];
var txt = rugTexture;
box = addBox(0,-500,0, 10000, 1000, 10000, grassTexture);

box = addBox(5000,0,0, 500, 10000, 10000, txt, ...s);


box = addBox(-5000,0,0, 500, 10000, 10000, txt, ...s);


box = addBox(0,0,5000, 10000, 10000, 500, txt, ...s);
box = addBox(0,0,-5000, 10000, 10000, 500, txt, ...s);


for(var i = 0; i < 10; i++){
    box = addBox(0,500-125 + i * 250,0, 8000, 250, 300, rockyGroundTexture, 16,1, new Vector3(0,i*0.1+0.1,0));
    box.global.body.angularVelocity = new Vector3(0,0.001,0);

    box = addBox(0,500-125 + i * 250,0, 8000, 250, 300, rockyGroundTexture, 16,1, new Vector3(0,2.1+i*0.1,0));
    box.global.body.angularVelocity = new Vector3(0,0.001,0);
}
box = addBox(0,0,0, 8000, 500, 300, rockyGroundTexture, 16,1, new Vector3(0,0,0));
box.global.body.angularVelocity = new Vector3(0,0.001,0);

box = addBox(0,0,0, 8000, 500, 300, rockyGroundTexture, 16,1, new Vector3(0,2,0));
box.global.body.angularVelocity = new Vector3(0,0.001,0);


// box = addBox(0,5000,0, 1000, 100, 10000, rugTexture, 3,3);
// box.global.body.rotation = box.global.body.rotation.rotateByAngularVelocity(new Vector3(0,0,1.8));

var img = new Image();
img.src = "./idkwhatthisis.jpg";
terrain1.setTerrainScale(200);
var imgscale = 100;



// for(var i = 0 ; i < 12; i++){
//     var sphere = new Sphere({radius: 500, local: {body:{mass: 10}},global: { body: { acceleration: new Vector3(0, -20, 0), position: new Vector3(Math.random() * 1000 + 200, 4000, Math.random() * 500) } }});
//     sphere.setRestitution(0);
//     sphere.setFriction(0);
//     sphere.setMesh({material: new THREE.MeshStandardMaterial({ map: sphereTexture, metalnessMap: sphereTexture2, normalMap: sphereTextureNormal, metalness: 1.0, roughness: 0.0, displacementMap: sphereTextureDisp, roughnessMap: sphereTextureRough, vertexColors: true }) }, THREE);
//     sphere.addToScene(scene);
//     world.addComposite(sphere);
// }



img.onload = function () {
    var arr = Terrain3.getArrayFromImage(img, imgscale);
    var terr = Terrain3.from2dArrays(arr, arr);

    for(var i = 0; i < terr.heightmaps.bottom.map.length; i++){
        terr.heightmaps.bottom.map[i] = -5000-terr.heightmaps.bottom.map[i];
        if(isNaN(terr.heightmaps.bottom.map[i])){
            console.log(i);
        }
    }
    terrain1.setDimensions(img.width, img.height);
    terrain1.setMaps(terr.heightmaps.top.map, terr.heightmaps.bottom.map);
    terrain1.balance();

    textureUsed.wrapS = THREE.RepeatWrapping;
    textureUsed.wrapT = THREE.RepeatWrapping;
    textureUsed.repeat.set(10,10);
    terrain1Material = new THREE.MeshPhongMaterial({ map: textureUsed, vertexColors: true });
    terrain1.setMesh({material: terrain1Material}, THREE);
    //terrain1.addToScene(scene);
}


terrain1.setLocalFlag(Terrain3.FLAGS.STATIC, true);
terrain1.local.body.setPosition(new Vector3(-290, 0, 0));



var terrain2 = Terrain3.from2dArrays(topArray2, topArray3);
top.terrain2 = terrain2;
terrain2.setFriction(0);
terrain2.setRestitution(0);
terrain1.local.body.setMass(Infinity);
terrain2.setTerrainScale(8000);
terrain2.local.body.setMass(Infinity);

var terrain2Material = new THREE.MeshPhongMaterial({ color: 0x00FFFF });
terrain2Material.wireframe = false;
terrain2.setMesh({material: terrain2Material}, THREE);
terrain2.setLocalFlag(Terrain3.FLAGS.STATIC, true);

//terrain2.addToScene(scene);
terrain2.global.body.setPosition(new Vector3(0, 8300, 0));
terrain2.global.body.setVelocity(new Vector3(0, 0, 0));
// world.addComposite(terrain1);

// world.addComposite(terrain2);


player.global.body.setVelocity(new Vector3());


const axesHelper = new THREE.AxesHelper(100);
scene.add(axesHelper);

// terrain2.mesh.receiveShadow = true;
// terrain2.mesh.castShadow = true;


window.addEventListener('wheel', function (e) {
    if (!camera) {
        return;
    }
    gameCamera.rotateY(e.deltaY / 100);
    gameCamera.rotateX(-e.deltaX / 100);
});



window.addEventListener('mousemove', function (e) {
    if (!camera) {
        return;
    }
    mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
    //gameCamera.rotateX(e.movementX / 100);
    //gameCamera.rotateY(e.movementY / 100);
});



top.grounded = false;
top.groundedIter = 0;
var start = performance.now();
var fps = 20;
var steps = 0;
function render() {
    
    // raycaster.setFromCamera(mouse, camera);
    // var intersects = raycaster.intersectObjects(scene.children);
    // if (intersects.length > 0) {
    //     var object = intersects[0];
    //     if (terrain1.mesh && object.object == terrain1.mesh.children[0]) {
    //         top.attrib = terrain1.mesh.children[0].geometry.attributes;

    //     }
    // }

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
    grounded = false;
    var now = performance.now();
    var delta = (now - start) / 1000;
    var steps2 = delta * fps;
    for (var i = 0; i < Math.floor(steps2 - steps); i++) {
        stats.begin();
        for(var child of world.composites){
            if(!child.previousPosition){
                child.previousPosition = child.global.body.position.copy();
                child.previousRotation = child.global.body.rotation.copy();
            }
            
            child.previousPosition = child.global.body.position.copy();
            child.previousRotation = child.global.body.rotation.copy();
        }
        canJump = false;
        world.step();
        steps++;

        if(cameraControls.movement.up && canJump){
            var vel = player.global.body.getVelocity();
            player.global.body.setVelocity(new Vector3(vel.x, vel.y + 24 * world.deltaTime, vel.z));
            canJump = false;
        }
        var delta2 = cameraControls.getDelta(camera).scale(player.global.body.mass * world.deltaTime);
        playerGuider.applyForce(delta2, playerGuider.global.body.position);
        stats.end();
    }
    var lerpAmount = (delta*fps - steps);
    for(var child of world.composites){
        if(!child.previousPosition){
            child.previousPosition = child.global.body.position.copy();
            child.previousRotation = child.global.body.rotation.copy();
        }
        if(child.mesh){
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

setTimeout(function () {
    render();
    start = performance.now();

},3000);
