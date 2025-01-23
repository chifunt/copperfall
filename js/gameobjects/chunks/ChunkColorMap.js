import { Rock } from "/js/gameobjects/Rock.js";
import { EnemyTest } from "/js/gameobjects/EnemyTest.js";
import { Pickup } from "/js/gameobjects/Pickup.js";
import { DestructibleRock } from "/js/gameobjects/DestructibleRock.js";
import { EnemyPatrol } from "/js/gameobjects/EnemyPatrol.js";
import { EnemyFast } from "/js/gameobjects/EnemyFast.js";

/**
 * ChunkColorMap maps each game object to its corresponding color.
 * This allows accessing classes like ChunkColorMap.Rock and also facilitates color-to-class mapping.
 */
export const ChunkColorMap = {
  Rock: {
    color: "#ffffff",          // White
    class: Rock
  },
  EnemyTest: {
    color: "#ff0000",          // Red
    class: EnemyTest
  },
  Pickup: {
    color: "#00ff00",          // Green
    class: Pickup
  },
  DestructibleRock: {
    color: "#0000ff",          // Blue
    class: DestructibleRock
  },
  EnemyPatrol: {
    color: "#ff00ff",           // Magenta
    class: EnemyPatrol
  },
  EnemyFast: {
    color: "#ffff00",           // yella
    class: EnemyFast
  }
};
