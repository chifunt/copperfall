import { StarterChunkA } from "./StarterChunkA.js";
import { StarterChunkB } from "./StarterChunkB.js";
import { StarterChunkC } from "./StarterChunkC.js";
import { ChunkTypeA } from "./ChunkTypeA.js";
import { ChunkTypeB } from "./ChunkTypeB.js";
import { ChunkTypeC } from "./ChunkTypeC.js";

/**
 * ChunkRegistry organizes all chunk classes, allowing for structured and direct access.
 * This eliminates the need for magic strings when referencing chunk types.
 */
export const ChunkRegistry = {
  StarterChunkA: {
    class: StarterChunkA,
    // You can add additional metadata here if needed
    // e.g., description: "The first starter chunk",
  },
  StarterChunkB: {
    class: StarterChunkB,
  },
  StarterChunkC: {
    class: StarterChunkC,
  },
  ChunkTypeA: {
    class: ChunkTypeA,
  },
  ChunkTypeB: {
    class: ChunkTypeB,
  },
  ChunkTypeC: {
    class: ChunkTypeC,
  },
};
