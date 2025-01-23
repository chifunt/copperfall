import { GameObject } from "/js/core/GameObject.js";
import { ChunkRegistry } from "./chunks/ChunkRegistry.js";
import { Engine } from "/js/core/Engine.js";

export class ChunkManager extends GameObject {
  constructor(player, config = {}) {
    super("ChunkManager");
    this.player = player;

    // Distance for spawning/unspawning
    this.spawnDistance = 800; // chunks appear/disappear at 800 units
    this.chunkSize = 400;

    // The chunk from which we calculate "distance from origin"
    // This coordinate is in "chunk space", not in world units.
    this.distanceOrigin = { x: 2, y: 0 };

    // Instead of a single "spawnedChunks" map, we keep
    // chunkState with an object: { chunkObj, isSpawned: bool }
    this.chunkStateMap = new Map(); // Key: "cx,cy", Value: { chunkObj, isSpawned }

    // Starter chunk coords
    this.starterChunkCoords = [
      { x: 0, y: 0 },
      { x: 1, y: 0 },
      { x: 2, y: 0 },
    ];
    this.starterChunkSet = new Set(["0,0", "1,0", "2,0"]);

    // If we want chunk (2,0) to never unload, store that or handle it in logic
    this.starterChunkSetToNotUnload = new Set(["2,0"]);

    this.start();
  }

  start() {
    // Force-spawn the starter chunks
    for (const coord of this.starterChunkCoords) {
      this.spawnStarterChunk(coord.x, coord.y);
    }
  }

  update(deltaTime) {
    super.update(deltaTime);
    this.checkChunksNearPlayer();
    this.checkForUnspawn();
  }

  /**
   * 1) For each chunk coordinate near the player, if not spawned => spawn
   */
  checkChunksNearPlayer() {
    const px = this.player.transform.position.x;
    const py = this.player.transform.position.y;
    const currentChunkX = Math.floor(px / this.chunkSize);
    const currentChunkY = Math.floor(py / this.chunkSize);

    const chunkRange = 2;
    for (let cx = currentChunkX - chunkRange; cx <= currentChunkX + chunkRange; cx++) {
      for (let cy = currentChunkY - chunkRange; cy <= currentChunkY + chunkRange; cy++) {
        const chunkPosX = cx * this.chunkSize;
        const chunkPosY = cy * this.chunkSize;
        const dx = px - chunkPosX;
        const dy = py - chunkPosY;
        const distSq = dx * dx + dy * dy;
        const spawnDistSq = this.spawnDistance * this.spawnDistance;

        const key = `${cx},${cy}`;

        // If within distance, we want to spawn
        if (distSq <= spawnDistSq) {
          const chunkState = this.chunkStateMap.get(key);
          // If it's not spawned, we spawn it
          if (!chunkState || !chunkState.isSpawned) {
            if (this.starterChunkSet.has(key)) {
              this.spawnStarterChunk(cx, cy);
            } else {
              this.spawnChunk(cx, cy);
            }
          }
        }
      }
    }
  }

  /**
   * 2) For each *spawned* chunk, if now out of spawnDistance => unspawn it
   */
  checkForUnspawn() {
    const px = this.player.transform.position.x;
    const py = this.player.transform.position.y;

    for (const [key, chunkState] of this.chunkStateMap) {
      if (!chunkState.isSpawned) continue; // only check spawned chunks
      if (this.starterChunkSetToNotUnload.has(key)) continue; // skip unspawn for certain chunk(s)

      // parse coords from key
      const [cx, cy] = key.split(",").map(n => parseInt(n));
      const chunkPosX = cx * this.chunkSize;
      const chunkPosY = cy * this.chunkSize;
      const dx = px - chunkPosX;
      const dy = py - chunkPosY;
      const distSq = dx * dx + dy * dy;
      const spawnDistSq = this.spawnDistance * this.spawnDistance;

      if (distSq > spawnDistSq) {
        this.unspawnChunk(cx, cy);
      }
    }
  }

  /**
   * Spawns one of the starter chunk prefabs at (cx, cy).
   * If it doesn't exist in chunkStateMap, create it; else re-spawn it.
   */
  spawnStarterChunk(cx, cy) {
    const key = `${cx},${cy}`;
    let chunkState = this.chunkStateMap.get(key);
    if (chunkState && chunkState.isSpawned) return; // already spawned

    // Determine chunk class
    let chunkClass = null;
    if (cx === 0 && cy === 0) chunkClass = ChunkRegistry.StarterChunkA.class;
    if (cx === 1 && cy === 0) chunkClass = ChunkRegistry.StarterChunkB.class;
    if (cx === 2 && cy === 0) chunkClass = ChunkRegistry.StarterChunkC.class;

    if (!chunkClass) {
      console.warn(`No starter chunk for coords (${cx}, ${cy})`);
      return;
    }

    // If chunk doesn't exist in chunkStateMap, create it
    if (!chunkState) {
      const chunkObj = new chunkClass(cx, cy);
      chunkState = { chunkObj, isSpawned: false };
      this.chunkStateMap.set(key, chunkState);
    }

    // Now ensure it's spawned
    if (!chunkState.isSpawned) {
      this.registerChunkToEngine(chunkState.chunkObj);
      chunkState.isSpawned = true;
      // console.log(`Spawned STARTER chunk at (${cx},${cy}).`);
    }
  }

  /**
   * Spawns a normal chunk (non-starter) based on distance from a user-defined “origin chunk”.
   */
  spawnChunk(cx, cy) {
    const key = `${cx},${cy}`;
    let chunkState = this.chunkStateMap.get(key);
    if (chunkState && chunkState.isSpawned) return;

    // These are chunk coordinates, so distance in chunk-space:
    const dx = cx - this.distanceOrigin.x;
    const dy = cy - this.distanceOrigin.y;
    // Convert chunk distance to world distance by multiplying by chunkSize:
    const distFromOrigin = Math.sqrt(dx * dx + dy * dy) * this.chunkSize;

    // Decide chunk type by that distance
    let chosenChunkType = null;
    if (distFromOrigin < 1600) {
      chosenChunkType = ChunkRegistry.ChunkTypeA.class;
    } else if (distFromOrigin < 3200) {
      chosenChunkType = ChunkRegistry.ChunkTypeB.class;
    } else {
      chosenChunkType = ChunkRegistry.ChunkTypeC.class;
    }
    if (!chosenChunkType) {
      console.warn(`No chunk found for dist: ${distFromOrigin} at coords (${cx},${cy}).`);
      return;
    }

    // If chunk doesn't exist, create it
    if (!chunkState) {
      const chunkObj = new chosenChunkType(cx, cy);
      chunkState = { chunkObj, isSpawned: false };
      this.chunkStateMap.set(key, chunkState);
    }

    // Register/spawn it if not already
    if (!chunkState.isSpawned) {
      this.registerChunkToEngine(chunkState.chunkObj);
      chunkState.isSpawned = true;
      // console.log(`Spawned chunk [${chunkState.chunkObj.constructor.name}] at (${cx},${cy})`);
    }
  }

  /**
   * Removes chunk from engine and marks isSpawned=false,
   * but does NOT destroy the chunk object or its children.
   */
  unspawnChunk(cx, cy) {
    const key = `${cx},${cy}`;
    const chunkState = this.chunkStateMap.get(key);
    if (!chunkState || !chunkState.isSpawned) return; // Not currently active

    this.unregisterChunkFromEngine(chunkState.chunkObj);
    chunkState.isSpawned = false;
    // console.log(`Unspawned chunk at coords (${cx},${cy}).`);
  }

  /**
   * Actually adds a chunk's objects to the engine.
   */
  registerChunkToEngine(chunkObj) {
    const engine = Engine.instance;
    if (!engine.gameObjects.includes(chunkObj)) {
      engine.gameObjects.push(chunkObj);
    }
    // If chunk has child objects, re-add them too
    for (const child of chunkObj.childObjects) {
      if (child.isDestroyed) continue; // skip permanently destroyed
      if (!engine.gameObjects.includes(child)) {
        engine.gameObjects.push(child);
      }
    }
  }

  /**
   * Removes chunk object (and all children) from the engine's active gameObjects array
   * so they no longer update/render/collide. But does NOT call .destroy().
   */
  unregisterChunkFromEngine(chunkObj) {
    const engine = Engine.instance;
    const allGOs = engine.gameObjects;

    // remove chunkObj
    const idx = allGOs.indexOf(chunkObj);
    if (idx !== -1) {
      allGOs.splice(idx, 1);
    }

    // remove chunk children
    for (const child of chunkObj.childObjects) {
      if (child.isDestroyed) continue; // skip destroyed
      const i2 = allGOs.indexOf(child);
      if (i2 !== -1) {
        allGOs.splice(i2, 1);
      }
    }
  }
}
