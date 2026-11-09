import * as THREE from 'three';

/**
 * The "needle-thread" docking illusion (GDD §4.4). A Rapier sensor collider
 * that, on overlap, blends the Starbug's velocity/rotation toward a clean
 * dock rather than cutting player input — so it still feels flown, not
 * autopiloted.
 */
export class DockingVolume {
  constructor(options) {
    this.targetPosition = options.targetPosition.clone();
    this.targetRotation = options.targetRotation.clone();
    this.captureRadius = options.captureRadius ?? 150;
    this.autoLevelRadius = options.autoLevelRadius ?? 50;
    this.touchdownRadius = options.touchdownRadius ?? 10;
    this.magnetStrength = options.magnetStrength ?? 2.5;
    this.onDockingComplete = options.onDockingComplete ?? (() => {});
    this._completed = false;
  }

  /** Call from the sensor-collider overlap event. */
  onEnter(starbugController) {
    starbugController.dockingAssist = this;
    this._completed = false;
  }

  onExit(starbugController) {
    if (starbugController.dockingAssist === this) {
      starbugController.dockingAssist = null;
    }
  }

  apply(starbug, dt) {
    if (this._completed) return;

    const toTarget = this.targetPosition.clone().sub(starbug.position);
    const distance = toTarget.length();
    const alpha = THREE.MathUtils.clamp(1 - distance / this.captureRadius, 0, 1);

    // Capture cone: blend velocity toward the dock centerline, proportional to alpha
    const currentVel = starbug.velocity;
    const speed = currentVel.length();
    if (speed > 0.01 && alpha > 0) {
      const desiredVel = toTarget.clone().normalize().multiplyScalar(speed);
      const blended = currentVel
        .clone()
        .lerp(desiredVel, alpha * this.magnetStrength * dt)
        .normalize()
        .multiplyScalar(speed);
      starbug.body.setLinvel({ x: blended.x, y: blended.y, z: blended.z }, true);
    }

    // Auto-level: blend rotation toward bay-floor-parallel once inside the inner zone
    const levelAlpha = THREE.MathUtils.clamp(1 - distance / this.autoLevelRadius, 0, 1);
    if (levelAlpha > 0) {
      const blendedRot = starbug.rotation.clone().slerp(this.targetRotation, levelAlpha * 5 * dt);
      starbug.body.setRotation({ x: blendedRot.x, y: blendedRot.y, z: blendedRot.z, w: blendedRot.w }, true);
    }

    // Touchdown: dampen to a stop and fire completion
    if (distance < this.touchdownRadius) {
      starbug.body.setLinvel({ x: 0, y: 0, z: 0 }, true);
      starbug.body.setAngvel({ x: 0, y: 0, z: 0 }, true);
      this._completed = true;
      starbug.dockingAssist = null;
      this.onDockingComplete(starbug);
    }
  }
}
