import { GameObject } from "/js/core/GameObject.js";
import { ChunkRegistry } from "./chunks/ChunkRegistry.js";

export class ChunkManager extends GameObject {
  constructor(player, config = {}) {
    super("ChunkManager");
    this.player = player;
    this.chunkSize = 400; // Each chunk is 400x400
    this.spawnDistance = 1600; // Only spawn if player is within 1600 units
    this.spawnedChunks = new Map();
    // Key: chunkCoord "x,y", Value: the chunk GameObject

    // Starter chunk coords - forcibly spawn these with special “starter” chunk classes
    this.starterChunkCoords = [
      { x: 0, y: 0 },
      { x: 1, y: 0 },
      { x: 2, y: 0 }
    ];

    // Mark them so we don't spawn any random chunk there
    this.starterChunkSet = new Set(["0,0", "1,0", "2,0"]);

    // Additional config if desired

    this.start();
  }

  start() {
    // Force-spawn the starter chunks immediately
    this.starterChunkCoords.forEach(coord => {
      const key = `${coord.x},${coord.y}`;
      this.spawnStarterChunk(coord.x, coord.y);
    });
  }

  update(deltaTime) {
    super.update(deltaTime);

    // Each frame, figure out which chunk coords the player might cause to spawn
    this.checkChunksNearPlayer();
  }

  /**
   * Checks if the player is near any chunk centers that haven't been spawned yet.
   * Then spawns them if needed.
   */
  checkChunksNearPlayer() {
    const px = this.player.transform.position.x;
    const py = this.player.transform.position.y;

    // We'll figure out the chunk coordinate in x and y
    // e.g., chunkCoordX = floor( (posX + halfChunkSize) / chunkSize )
    // But let's keep it simple: We'll check a range around the player in chunk coords
    // Then see if the chunk is within spawnDistance.

    // Convert the player's position to chunk coordinates
    const currentChunkX = Math.floor(px / this.chunkSize);
    const currentChunkY = Math.floor(py / this.chunkSize);

    // We'll define how far in chunk coords we want to check.
    // If the spawnDistance = 1600, that is 4 chunks away (1600/400 = 4).
    const chunkRange = 4;

    for (let cx = currentChunkX - chunkRange; cx <= currentChunkX + chunkRange; cx++) {
      for (let cy = currentChunkY - chunkRange; cy <= currentChunkY + chunkRange; cy++) {
        const chunkCenterX = cx * this.chunkSize + this.chunkSize/2 * 0;
        // or you can define the chunk center as (cx + 0.5)* chunkSize if your chunk(0,0) is truly center
        // but let's keep it simpler: chunk's "center" at (cx*this.chunkSize, cy*this.chunkSize)
        // we'll keep it consistent with how you define your chunk coordinate system
        const chunkPosX = cx * this.chunkSize;
        const chunkPosY = cy * this.chunkSize;
        // distance from player
        const dx = px - chunkPosX;
        const dy = py - chunkPosY;
        const distSq = dx*dx + dy*dy;
        const spawnDistSq = this.spawnDistance * this.spawnDistance;

        // If not spawned, within spawn distance => spawn chunk
        const key = `${cx},${cy}`;
        if (!this.spawnedChunks.has(key) && distSq <= spawnDistSq) {
          // see if it's a starter chunk
          if (this.starterChunkSet.has(key)) {
            // skip, because we forcibly spawned it in start()
          } else {
            // spawn normal chunk
            this.spawnChunk(cx, cy);
          }
        }
      }
    }
  }

  /**
   * Spawns one of the "starter" chunk prefabs at the given coords
   */
  spawnStarterChunk(cx, cy) {
    const key = `${cx},${cy}`;
    if (this.spawnedChunks.has(key)) return;

    // For each starter chunk, let's assume we have a known class
    // or we can do a switch statement or an array of 3 chunk classes
    // We'll do it simply:
    let chunkPrefab;
    if (cx === 0 && cy === 0) {
      chunkPrefab = "StarterChunkA";
    } else if (cx === 1 && cy === 0) {
      chunkPrefab = "StarterChunkB";
    } else if (cx === 2 && cy === 0) {
      chunkPrefab = "StarterChunkC";
    }

    const chunkClass = ChunkRegistry[chunkPrefab];
    if (!chunkClass) {
      console.warn(`Starter chunk prefab ${chunkPrefab} not found in registry! Using fallback.`);
      return;
    }

    const chunkObj = new chunkClass(cx, cy);
    this.spawnedChunks.set(key, chunkObj);
    console.log(`Spawned STARTER chunk [${chunkPrefab}] at chunk coords (${cx},${cy}).`);
  }

  /**
   * Spawns a chunk at coords (cx, cy), deciding the chunk type based on distance from origin or other logic.
   */
  spawnChunk(cx, cy) {
    const key = `${cx},${cy}`;
    if (this.spawnedChunks.has(key)) return;

    // distance from origin
    const distFromOrigin = Math.sqrt(cx*cx + cy*cy) * this.chunkSize;
    // We'll define a simple rule: if distFromOrigin < 1600 => use chunk group A, else chunk group B
    let chosenChunkType = null;
    if (distFromOrigin < 1600) {
      chosenChunkType = "ChunkTypeA"; // near
    } else if (distFromOrigin < 3200) {
      chosenChunkType = "ChunkTypeB"; // medium
    } else {
      chosenChunkType = "ChunkTypeC"; // far
    }

    // get chunk class from ChunkRegistry
    const chunkClass = ChunkRegistry[chosenChunkType];
    if (!chunkClass) {
      console.warn(`No chunk prefab found for type ${chosenChunkType}, skipping spawn.`);
      return;
    }

    const chunkObj = new chunkClass(cx, cy);
    this.spawnedChunks.set(key, chunkObj);
    console.log(`Spawned chunk [${chosenChunkType}] at chunk coords (${cx},${cy}).`);
  }

  /**
   * (Optional) If you want to unspawn chunks that are too far away, you'd do it here.
   */
}
