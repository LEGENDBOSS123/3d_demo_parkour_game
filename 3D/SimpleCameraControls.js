import Vector3 from "./Physics/Math3D/Vector3.mjs";

var SimpleCameraControls = class {
    constructor(options) {
        this.speed = options?.speed ?? 1;
        this.movement = { "forward": false, "backward": false, "left": false, "right": false, "up": false, "down": false, "zoom-in": false, "zoom-out": false };
        this.camera = options?.camera;
        this.pullbackRate = options?.pullbackRate ?? 0.5;
    }
    up() {
        this.movement.up = true;
    }
    down() {
        this.movement.down = true;
    }
    left() {
        this.movement.left = true;
    }
    right() {
        this.movement.right = true;
    }
    forward() {
        this.movement.forward = true;
    }
    backward() {
        this.movement.backward = true;
    }

    zoomIn() {
        this.movement["zoom-in"] = true;
    }

    zoomOut() {
        this.movement["zoom-out"] = true;
    }

    reset() {
        this.movement = { "forward": false, "backward": false, "left": false, "right": false, "up": false, "down": false, "zoom-in": false, "zoom-out": false };
    }

    getDelta() {
        top.camera = this.camera;
        var direction = this.camera.camera.getWorldDirection(new this.camera.camera.position.constructor(0, 0, 0));
       
        direction.y = 0;
        direction = direction.normalize()
        var delta = new Vector3(0, 0, 0);
        if (this.movement.forward) {
            delta.addInPlace(direction);
        }
        if (this.movement.backward) {
            delta.addInPlace(direction.clone().multiplyScalar(-1));
        }
        if (this.movement.left) {
            delta.addInPlace(new Vector3(direction.z, 0, -direction.x));
        }
        if (this.movement.right) {
            delta.addInPlace(new Vector3(-direction.z, 0, direction.x));
        }
        if (this.movement.up) {
            delta.addInPlace(new Vector3(0, 1, 0));
        }
        if (this.movement.down) {
            delta.addInPlace(new Vector3(0, -1, 0));
        }

        delta.normalize();
        delta.scale(this.speed);
        this.reset();
        return Vector3.from(delta);
    }

    updateZoom(){
        if (this.movement["zoom-in"]) {
            this.camera.zoom(-this.pullbackRate);
            this.movement["zoom-in"] = false;
        }
        if (this.movement["zoom-out"]) {
            this.camera.zoom(this.pullbackRate);
            this.movement["zoom-out"] = false;
        }
    }
};


export default SimpleCameraControls;