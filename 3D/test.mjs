import World from "./Physics/Core/World.mjs";
import Hitbox3 from "./Physics/Broadphase/Hitbox3.mjs";
import Vector3 from "./Physics/Math3D/Vector3.mjs";
import SpatialHash from "./Physics/Broadphase/SpatialHash.mjs";
var world = new World({ iterations: 10 });


var sh = world.spatialHash;

sh.addHitbox(Hitbox3.fromVectors([new Vector3(0, 0, 0), new Vector3(10, 10, 10)]), 1);

console.log(SpatialHash.fromJSON(world.spatialHash.toJSON(), world));



setTimeout(() => {
    console.log("done");
}, 100000);