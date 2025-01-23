/**
 * A simple registry of all available chunk-map PNG filenames,
 * stored in the same directory: /assets/images/chunk-maps/
 */
export const ChunkMapImages = {
  startA: "start-a.png",
  startB: "start-b.png",
  startC: "start-c.png",
  coinHaven: "coin-haven.png",
  scatterEnemies: "scatter-enemies.png",
  slashcoin: "slashcoin.png",
  zipzop: "zipzop.png",
};

/**
 * A convenient function to get the full path for a given key in ChunkMapImages.
 */
export function getChunkMapPath(key) {
  // We assume all chunk maps are in /assets/images/chunk-maps/
  const baseDir = "/assets/images/chunk-maps/";
  const filename = ChunkMapImages[key];
  if (!filename) {
    console.warn(`ChunkMapImages: No filename found for key="${key}"`);
    return null;
  }
  return baseDir + filename;
}

/**
 * Utility to choose a random item from an array.
 */
export function randomChoice(array) {
  const idx = Math.floor(Math.random() * array.length);
  return array[idx];
}
