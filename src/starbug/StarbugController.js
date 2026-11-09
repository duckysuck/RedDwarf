import * as THREE from 'three';

/**
 * 6-DOF Starbug flight controller. Wraps a Rapier dynamic rigid body.
 * Implements GDD §4.3 (flight feel) and §4.5 (HUD telemetry).
 */
export class StarbugController {
  constructor(world, RAPIER, rigidBody, options = {}) {
    this.world = world;
    this.RAPIER = RAPIER;
    this.body = rigidBody;

    this.engineThrust = options.engineThrust ?? 60;
    this.strafeThrust = options.strafeThrust ?? 30;
    this.pitchRate = options.pitchRate ?? 2.5;
    this.yawRate = options.yawRate ?? 2.5;
    this.rollRate = options.rollRate ?? 1.8;

    this.maxHullIntegrity = options.maxHullIntegrity ?? 100;
    this.maxFuel = options.maxFuel ?? 100;
    this.hullIntegrity = this.maxHullIntegrity;
    this.fuel = this.maxFuel;
    this.engineFailure = false;

    this.dockingAssist = null; // set by a DockingVolume on overlap
  }

  get position() {
    const t = this.body.translation();
    return new THREE.Vector3(t.x, t.y, t.z);
  }

  get rotation() {
    const r = this.body.rotation();
    return new THREE.Quaternion(r.x, r.y, r.z, r.w);
  }

  get velocity() {
    const v = this.body.linvel();
    return new THREE.Vector3(v.x, v.y, v.z);
  }

  /** forward/strafe/pitch/yaw/roll each in [-1, 1]. */
  applyFlightInput(forward, strafe, pitch, yaw, roll, dt) {
    if (this.engineFailure || this.fuel <= 0) {
      // Atmospheric stall fallback — GDD §4.3 Swamp Re-entry engine-failure state
      this.body.applyImpulse({ x: 0, y: -9.8 * dt, z: 0 }, true);
      return;
    }

    const rot = this.rotation;
    const forwardAxis = new THREE.Vector3(0, 0, -1).applyQuaternion(rot);
    const rightAxis = new THREE.Vector3(1, 0, 0).applyQuaternion(rot);

    const force = forwardAxis
      .multiplyScalar(forward * this.engineThrust)
      .add(rightAxis.multiplyScalar(strafe * this.strafeThrust));

    this.body.applyImpulse({ x: force.x * dt, y: force.y * dt, z: force.z * dt }, true);

    const torque = new THREE.Vector3(
      pitch * this.pitchRate,
      yaw * this.yawRate,
      roll * this.rollRate
    ).applyQuaternion(rot);

    this.body.applyTorqueImpulse({ x: torque.x * dt, y: torque.y * dt, z: torque.z * dt }, true);

    this.fuel = Math.max(0, this.fuel - force.length() * dt * 0.01);
  }

  /** Called every frame by the mission scene; defers to docking assist if active. */
  update(dt) {
    if (this.dockingAssist) {
      this.dockingAssist.apply(this, dt);
    }
  }

  takeDamage(amount) {
    this.hullIntegrity = Math.max(0, this.hullIntegrity - amount);
  }
}
