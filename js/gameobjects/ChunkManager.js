// /js/gameobjects/ChunkManager.js
import { GameObject } from "/js/core/GameObject.js";
import { ChunkRegistry } from "./chunks/ChunkRegistry.js";

export class ChunkManager extends GameObject {
  constructor(player, config = {}) {
    super("ChunkManager");
    this.player = player;

    // Distances for spawning/unspawning:
    this.spawnDistance = 800;
    // If the chunk is more than spawnDistance away from the player, we unspawn it.

    this.chunkSize = 400;
    this.spawnedChunks = new Map();
    // Key: "cx,cy"; Value: the chunk GameObject (if currently spawned)

    // Starter chunk coordinates
    this.starterChunkCoords = [
      { x: 0, y: 0 },
      { x: 1, y: 0 },
      { x: 2, y: 0 },
    ];
    this.starterChunkSet = new Set(["0,0", "1,0", "2,0"]);
    this.starterChunkSetToNotUnload = new Set(["2,0"]);

    this.start();
  }

  /**
   * Force-spawn the starter chunks immediately, so they're always loaded at game start.
   */
  start() {
    for (const coord of this.starterChunkCoords) {
      this.spawnStarterChunk(coord.x, coord.y);
    }
  }

  /**
   * Check each frame for spawn/unspawn conditions.
   */
  update(deltaTime) {
    super.update(deltaTime);
    this.checkChunksNearPlayer();
    this.checkForUnspawn();
  }

  /**
   * Checks if any unspawned chunks (within a certain coordinate range) should spawn,
   * because the player is within spawnDistance.
   */
  checkChunksNearPlayer() {
    const px = this.player.transform.position.x;
    const py = this.player.transform.position.y;

    // Current chunk coords based on the player's position
    const currentChunkX = Math.floor(px / this.chunkSize);
    const currentChunkY = Math.floor(py / this.chunkSize);

    // We'll search in a small range around the player
    const chunkRange = 2; // or bigger if you like
    for (let cx = currentChunkX - chunkRange; cx <= currentChunkX + chunkRange; cx++) {
      for (let cy = currentChunkY - chunkRange; cy <= currentChunkY + chunkRange; cy++) {
        const chunkPosX = cx * this.chunkSize;
        const chunkPosY = cy * this.chunkSize;
        const dx = px - chunkPosX;
        const dy = py - chunkPosY;
        const distSq = dx * dx + dy * dy;
        const spawnDistSq = this.spawnDistance * this.spawnDistance;

        const key = `${cx},${cy}`;
        // If not spawned AND within spawnDistance => spawn
        if (!this.spawnedChunks.has(key) && distSq <= spawnDistSq) {
          if (this.starterChunkSet.has(key)) {
            // It's a starter chunk, but might already be spawned in start().
            // If not, spawn it again just to be sure:
            this.spawnStarterChunk(cx, cy);
          } else {
            // Spawn normal chunk
            this.spawnChunk(cx, cy);
          }
        }
      }
    }
  }

  /**
   * Checks each *spawned* chunk to see if the player is now beyond spawnDistance,
   * and if so, unspawn/destroy it. Except for starter chunks if we want them always loaded.
   */
  checkForUnspawn() {
    const px = this.player.transform.position.x;
    const py = this.player.transform.position.y;

    for (const [key, chunkObj] of this.spawnedChunks) {
      // skip unspawn for starter chunks if we want them always loaded
      if (this.starterChunkSetToNotUnload.has(key)) continue;

      // check distance
      const coords = key.split(",").map(n => parseInt(n));
      const cx = coords[0];
      const cy = coords[1];

      const chunkPosX = cx * this.chunkSize;
      const chunkPosY = cy * this.chunkSize;
      const dx = px - chunkPosX;
      const dy = py - chunkPosY;
      const distSq = dx * dx + dy * dy;
      const spawnDistSq = this.spawnDistance * this.spawnDistance;

      // If chunk is beyond spawnDistance => unspawn it
      if (distSq > spawnDistSq) {
        this.unspawnChunk(cx, cy);
      }
    }
  }

  /**
   * Spawns one of the "starter" chunk prefabs at the given coords.
   * Already-coded logic from your snippet.
   */
  spawnStarterChunk(cx, cy) {
    const key = `${cx},${cy}`;
    if (this.spawnedChunks.has(key)) return; // Already spawned

    let chunkClass = null;
    if (cx === 0 && cy === 0) {
      chunkClass = ChunkRegistry.StarterChunkA.class;
    } else if (cx === 1 && cy === 0) {
      chunkClass = ChunkRegistry.StarterChunkB.class;
    } else if (cx === 2 && cy === 0) {
      chunkClass = ChunkRegistry.StarterChunkC.class;
    }

    if (!chunkClass) {
      console.warn(`No starter chunk class found for coords (${cx}, ${cy})`);
      return;
    }

    const chunkObj = new chunkClass(cx, cy);
    this.spawnedChunks.set(key, chunkObj);
    console.log(`Spawned STARTER chunk [${chunkClass.name}] at chunk coords (${cx},${cy}).`);
  }

  /**
   * Spawns a chunk at coords (cx, cy), deciding chunk type by distance from origin
   */
  spawnChunk(cx, cy) {
    const key = `${cx},${cy}`;
    if (this.spawnedChunks.has(key)) return;

    // distance from origin
    const distFromOrigin = Math.sqrt(cx * cx + cy * cy) * this.chunkSize;
    let chosenChunkType = null;
    if (distFromOrigin < 1600) {
      chosenChunkType = ChunkRegistry.ChunkTypeA.class;
    } else if (distFromOrigin < 3200) {
      chosenChunkType = ChunkRegistry.ChunkTypeB.class;
    } else {
      chosenChunkType = ChunkRegistry.ChunkTypeC.class;
    }

    if (!chosenChunkType) {
      console.warn(`No chunk found for dist: ${distFromOrigin} at coords (${cx},${cy})`);
      return;
    }

    const chunkObj = new chosenChunkType(cx, cy);
    this.spawnedChunks.set(key, chunkObj);
    // console.log(`Spawned chunk [${chosenChunkType.name}] at coords (${cx},${cy}).`);
  }

  /**
   * Unspawns/destroys a chunk (and all its child objects).
   */
  unspawnChunk(cx, cy) {
    const key = `${cx},${cy}`;
    const chunkObj = this.spawnedChunks.get(key);
    if (!chunkObj) return;

    chunkObj.destroy(); // This should remove all child objects as well
    this.spawnedChunks.delete(key);

    console.log(`Unspawned chunk at coords (${cx},${cy}).`);
  }
}
