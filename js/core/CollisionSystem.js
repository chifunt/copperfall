import { BoxCollider } from "/js/components/BoxCollider.js";
import { CircleCollider } from "/js/components/CircleCollider.js";
import { Rigidbody } from "/js/components/Rigidbody.js";

export class CollisionSystem {
  constructor(engine) {
    this.engine = engine; // so we can access debugMode, etc.
  }

  update(deltaTime) {
    const colliders = this.gatherColliders();
    // naive all-pairs
    for (let i = 0; i < colliders.length; i++) {
      for (let j = i + 1; j < colliders.length; j++) {
        const cA = colliders[i];
        const cB = colliders[j];

        // check if they're on the same layer, or can do cross-layer collisions
        // if (cA.layer !== cB.layer) continue; // optional layer check

        // detect collision
        const result = this.checkCollision(cA, cB);
        if (result) {
          // Colliding
          this.handleCollision(cA, cB);
        } else {
          // Not colliding
          this.handleSeparation(cA, cB);
        }
      }
    }

    // debug draw after checking collisions
    if (this.engine.debugMode) {
      this.debugDrawColliders(colliders);
    }
  }

  gatherColliders() {
    // Gather all colliders in the scene
    const colliders = [];
    for (const obj of this.engine.gameObjects) {
      for (const comp of obj.components) {
        if (comp instanceof BoxCollider || comp instanceof CircleCollider) {
          colliders.push(comp);
        }
      }
    }
    return colliders;
  }

  checkCollision(cA, cB) {
    // cA, cB => either BoxCollider or CircleCollider
    // We'll do shape-vs-shape checks

    // 1. gather world positions
    const transformA = cA.gameObject.transform;
    const transformB = cB.gameObject.transform;

    // world coords for A
    const ax = transformA.position.x + cA.offset.x;
    const ay = transformA.position.y + cA.offset.y;
    // world coords for B
    const bx = transformB.position.x + cB.offset.x;
    const by = transformB.position.y + cB.offset.y;

    // Depending on type:
    if (cA instanceof BoxCollider && cB instanceof BoxCollider) {
      return this.boxBox(ax, ay, cA.width, cA.height, bx, by, cB.width, cB.height);
    } else if (cA instanceof CircleCollider && cB instanceof CircleCollider) {
      return this.circleCircle(ax, ay, cA.radius, bx, by, cB.radius);
    } else {
      // box-circle check
      if (cA instanceof BoxCollider && cB instanceof CircleCollider) {
        return this.boxCircle(
          ax, ay, cA.width, cA.height,
          bx, by, cB.radius
        );
      } else {
        // cB is box, cA is circle
        return this.boxCircle(
          bx, by, cB.width, cB.height,
          ax, ay, cA.radius
        );
      }
    }
  }

  // Basic AABB check for 2 boxes NOTE THAT WE ARE DOING CENTER-BASED COLLISION CHECKS
  boxBox(ax, ay, aw, ah, bx, by, bw, bh) {
    // ax, ay = center of box A
    // aw, ah = full width, height
    // bx, by = center of box B
    // bw, bh = full width, height

    // Edges of box A:
    const aLeft = ax - aw / 2;
    const aRight = ax + aw / 2;
    const aTop = ay - ah / 2;
    const aBottom = ay + ah / 2;

    // Edges of box B:
    const bLeft = bx - bw / 2;
    const bRight = bx + bw / 2;
    const bTop = by - bh / 2;
    const bBottom = by + bh / 2;

    return (
      aLeft < bRight &&
      aRight > bLeft &&
      aTop < bBottom &&
      aBottom > bTop
    );
  }

  // Basic circle-circle check
  circleCircle(ax, ay, ar, bx, by, br) {
    const dx = bx - ax;
    const dy = by - ay;
    const distSq = dx * dx + dy * dy;
    const radiusSum = ar + br;
    return distSq <= radiusSum * radiusSum;
  }

  // Basic box-circle check
  boxCircle(bx, by, bw, bh, cx, cy, cr) {
    // (bx, by) is the center of the box
    // Convert to left/top by subtracting half width/height
    const boxLeft = bx - bw / 2;
    const boxRight = bx + bw / 2;
    const boxTop = by - bh / 2;
    const boxBottom = by + bh / 2;

    // Find the closest point on that rectangle to circle center
    const closestX = Math.max(boxLeft, Math.min(cx, boxRight));
    const closestY = Math.max(boxTop, Math.min(cy, boxBottom));

    const dx = cx - closestX;
    const dy = cy - closestY;
    return (dx * dx + dy * dy) <= cr * cr;
  }

  handleCollision(cA, cB) {
    // Are they triggers?
    if (cA.isTrigger || cB.isTrigger) {
      this.processTrigger(cA, cB);
    } else {
      this.processCollision(cA, cB);
      this.resolveOverlap(cA, cB);
    }
  }

  resolveOverlap(cA, cB) {
    // 1) We only do resolution for Box-Box in this naive approach
    //    (You can expand for circle, etc.)
    //    And ignoring rotation => purely AABB
    if (!(cA instanceof BoxCollider && cB instanceof BoxCollider)) {
      return;
    }
    // 2) Identify rigidbodies
    const rbA = cA.gameObject.getComponent(Rigidbody);
    const rbB = cB.gameObject.getComponent(Rigidbody);
    const staticA = !rbA; // no rigidbody => static
    const staticB = !rbB;
    const kinA = rbA?.isKinematic === true;
    const kinB = rbB?.isKinematic === true;
    // If both are static or both are kinematic => no movement
    // => Overlaps remain, but typically you'd want to avoid that in level design
    // If one is dynamic, we push that one out. If both dynamic, push them half each, etc.
    // 3) Compute overlap for AABBs
    const transformA = cA.gameObject.transform;
    const transformB = cB.gameObject.transform;
    // For box colliders anchored at center:
    const halfW_A = cA.width / 2;
    const halfH_A = cA.height / 2;
    const centerAX = transformA.position.x + cA.offset.x;
    const centerAY = transformA.position.y + cA.offset.y;
    const leftA = centerAX - halfW_A;
    const rightA = centerAX + halfW_A;
    const topA = centerAY - halfH_A;
    const bottomA = centerAY + halfH_A;
    const halfW_B = cB.width / 2;
    const halfH_B = cB.height / 2;
    const centerBX = transformB.position.x + cB.offset.x;
    const centerBY = transformB.position.y + cB.offset.y;
    const leftB = centerBX - halfW_B;
    const rightB = centerBX + halfW_B;
    const topB = centerBY - halfH_B;
    const bottomB = centerBY + halfH_B;
    // Overlap extents
    const overlapX = Math.min(rightA, rightB) - Math.max(leftA, leftB);
    const overlapY = Math.min(bottomA, bottomB) - Math.max(topA, topB);
    if (overlapX > 0 && overlapY > 0) {
      // There's an overlap
      // 4) Decide how to push out
      // We'll push along the axis of least overlap for a simple approach
      if (overlapX < overlapY) {
        // push along X
        this.separateAxisX(
          overlapX, transformA, transformB,
          staticA, staticB, kinA, kinB
        );
      } else {
        // push along Y
        this.separateAxisY(
          overlapY, transformA, transformB,
          staticA, staticB, kinA, kinB
        );
      }
    }
  }

  separateAxisX(overlapX, transformA, transformB, staticA, staticB, kinA, kinB) {
    // We figure out which side is left vs right by comparing centers
    const dx = (transformB.position.x - transformA.position.x);
    // if dx > 0 => B is to the right of A => push them apart
    // if dx < 0 => B is to the left => push in opposite direction
    if (dx > 0) {
      // B is to the right => we push B to the right, or A to the left,
      // or both if both dynamic
      this.doPushX(overlapX, transformA, transformB, staticA, staticB, kinA, kinB, +1);
    } else {
      // B is to the left => push them in the other direction
      this.doPushX(overlapX, transformA, transformB, staticA, staticB, kinA, kinB, -1);
    }
  }

  doPushX(
    overlapX, transformA, transformB,
    staticA, staticB, kinA, kinB,
    direction
  ) {
    // direction = +1 => push B to the right
    // direction = -1 => push B to the left
    // naive approach:
    const bothDynamic = (!staticA && !kinA) && (!staticB && !kinB);
    const AisDynamic = (!staticA && !kinA);
    const BisDynamic = (!staticB && !kinB);
    if (bothDynamic) {
      // push each half
      transformA.position.x -= (overlapX / 2) * direction;
      transformB.position.x += (overlapX / 2) * direction;
    } else if (AisDynamic && !BisDynamic) {
      // push only A
      transformA.position.x -= overlapX * direction;
    } else if (!AisDynamic && BisDynamic) {
      // push only B
      transformB.position.x += overlapX * direction;
    }
    // else: both static or kinematic => no push
  }

  separateAxisY(overlapY, transformA, transformB, staticA, staticB, kinA, kinB) {
    const dy = (transformB.position.y - transformA.position.y);
    if (dy > 0) {
      // B is above => push B up
      this.doPushY(overlapY, transformA, transformB, staticA, staticB, kinA, kinB, +1);
    } else {
      // B below => push B down
      this.doPushY(overlapY, transformA, transformB, staticA, staticB, kinA, kinB, -1);
    }
  }

  doPushY(
    overlapY, transformA, transformB,
    staticA, staticB, kinA, kinB,
    direction
  ) {
    const bothDynamic = (!staticA && !kinA) && (!staticB && !kinB);
    const AisDynamic = (!staticA && !kinA);
    const BisDynamic = (!staticB && !kinB);
    if (bothDynamic) {
      transformA.position.y -= (overlapY / 2) * direction;
      transformB.position.y += (overlapY / 2) * direction;
    } else if (AisDynamic && !BisDynamic) {
      transformA.position.y -= overlapY * direction;
    } else if (!AisDynamic && BisDynamic) {
      transformB.position.y += overlapY * direction;
    }
  }

  handleSeparation(cA, cB) {
    // If they were colliding last frame, call onCollisionExit/onTriggerExit
    // Otherwise do nothing
    if (cA.currentCollisions.has(cB)) {
      // They were colliding, now separated
      cA.currentCollisions.delete(cB);
      cB.currentCollisions.delete(cA);

      if (cA.isTrigger || cB.isTrigger) {
        // Trigger exit
        if (cA.isTrigger) cA.onTriggerExit(cB);
        if (cB.isTrigger) cB.onTriggerExit(cA);
      } else {
        // Physical exit
        cA.onCollisionExit(cB);
        cB.onCollisionExit(cA);
      }
    }
  }

  processCollision(cA, cB) {
    // If not in set => Enter
    if (!cA.currentCollisions.has(cB)) {
      cA.currentCollisions.add(cB);
      cB.currentCollisions.add(cA);

      cA.onCollisionEnter(cB);
      cB.onCollisionEnter(cA);
    } else {
      // Stay
      cA.onCollisionStay(cB);
      cB.onCollisionStay(cA);
    }
  }

  processTrigger(cA, cB) {
    // If not in set => Enter
    if (!cA.currentCollisions.has(cB)) {
      cA.currentCollisions.add(cB);
      cB.currentCollisions.add(cA);

      if (cA.isTrigger) cA.onTriggerEnter(cB);
      if (cB.isTrigger) cB.onTriggerEnter(cA);
    } else {
      // Stay
      if (cA.isTrigger) cA.onTriggerStay(cB);
      if (cB.isTrigger) cB.onTriggerStay(cA);
    }
  }

  debugDrawColliders(colliders) {
    const ctx = this.engine.ctx;
    ctx.save();
    ctx.strokeStyle = "rgba(0,255,0,0.6)";
    ctx.lineWidth = 10;

    const camera = this.engine.camera;
    const canvas = this.engine.canvas;

    for (const c of colliders) {
      const transform = c.gameObject.transform;
      const posX = transform.position.x + c.offset.x;
      const posY = transform.position.y + c.offset.y;

      const canvasX = (posX - camera.position.x) * camera.scale + canvas.width / 2;
      const canvasY = (-posY + camera.position.y) * camera.scale + canvas.height / 2;

      // Box
      if (c instanceof BoxCollider) {
        ctx.save();
        ctx.translate(canvasX, canvasY);
        // We can rotate if needed but ignoring rotation for naive AABB
        // ctx.rotate(transform.rotationInRadians);

        const w = c.width * camera.scale;
        const h = c.height * camera.scale;

        ctx.strokeRect(-w / 2, -h / 2, w, h);
        ctx.restore();
      } else if (c instanceof CircleCollider) {
        ctx.beginPath();
        const r = c.radius * camera.scale;
        ctx.arc(canvasX, canvasY, r, 0, 2 * Math.PI);
        ctx.stroke();
      }
    }
    ctx.restore();
  }
}