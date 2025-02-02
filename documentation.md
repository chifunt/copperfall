# Project Documentation Overview

This document provides an overview of the main parts of the codebase. It explains the purpose of the various modules (components, game objects, utilities, scenes, etc.).

---

## Components

Components add behavior or data to GameObjects. They follow the entity–component system pattern. Here is an overview of the main components:

- **BackgroundRenderer**
  Renders a full-screen colored background. Used for setting a base backdrop (Canvas background is transparent by default so this is for when the TextureBG isn't being used like in the Test Scene).

- **BoxCollider & CircleCollider**
  Provide collision detection areas (axis‐aligned rectangle and circle, respectively). They also fire events such as “onTriggerEnter” or “onCollisionEnter” and more.

- **Collider (Base Class)**
  The abstract class for colliders. Manages collision state and provides stubs for collision events.

- **CameraFollow**
  Makes the camera follow a target (the player) with smoothing and look-ahead.

- **CompassIndicator**
  Renders an on-screen arrow indicator that points toward a target when that target is off-screen. Used in game to show where the Spaceship is.

- **DropShadow**
  Draws a shadow under a GameObject to add the look of depth.

- **HUD**
  Manages and updates the Heads-Up Display (health, dash charges, copper counter) based on the player’s state.

- **HorizontalFlip**
  Flips a GameObject’s sprite horizontally. Useful for ensuring that characters face the direction of movement.

- **ParticleSystem**
  Handles the spawning, updating, and rendering of particles for visual effects.

- **Pickupable**
  Intended to encapsulate behavior for collectible objects. Ended up not using this because I implemented all the logic directly into the Pickup gameobject instead.

- **Rigidbody**
  Marks a GameObject as dynamic (or kinematic) for collision resolution purposes.

- **ScreenShake**
  Offsets the camera temporarily to create a screen shake effect on impactful events. Multiple screenshakes at the same time just add up onto each other.

- **SpriteRenderer**
  Draws an image on the canvas with options such as pivot point, z-order, and horizontal flip.

- **SquashAndStretch**
  Animates a GameObject by scaling it in an elastic “squash and stretch” manner. Used primarily for character animations so they look squishy and alive.

- **VerticalBob**
  Applies a sinusoidal vertical oscillation (bobbing) effect to a sprite. Used for the copper pickup.

---

## GameObjects

GameObjects are the primary entities in your game world. They have a **Transform** (position, rotation, scale) and a set of Components (Though you can just implement the logic directly in the GameObject). Here is an overview of the main GameObjects:

- **Background**
  A simple GameObject that renders the background using the BackgroundRenderer component.

- **CameraObject**
  Represents the camera in the game. It includes a CameraFollow component (to track the player) and ScreenShake for dramatic effects.

- **ChunkManager & Chunks**
  *ChunkManager* dynamically loads and unloads parts of the world (chunks) based on the player's position. The chunks (such as **BaseChunk**, **ChunkTypeA/B/C**, and **StarterChunkA/B/C**) load a “map” image and spawn objects based on pixel colors.

- **DashToolTipZone & MovementToolTipZone**
  These are trigger zones that display tooltips (using the ToolTipManager) when the player enters certain areas (for dash or movement guidance or the spaceship zone).

- **DestructibleRock**
  A rock object that can be broken (via a player dash). It triggers particle effects, screen shake, and sound when destroyed.

- **EnemyFast, EnemyPatrol, EnemyTest**
  Different enemy types. They include colliders, animations (squash and stretch), and particle systems for when they are defeated. They also interact with the player (for damage or triggering events). The Test enemy just stands still whilst the others patrol.

- **InputHandler**
  A singleton that listens for keyboard and gamepad events. It maps input to game-wide actions (defined in the Actions module) and is used by many GameObjects (like the Player and the UIs).

- **ParticleSystemObject**
  A wrapper for the ParticleSystem component. It provides an object that can be easily placed in the scene to trigger visual effects.

- **Pickup**
  Represents a collectible item (copper). When the player touches it, it triggers a pickup animation (goes to the player), adds resources to the player, and then destroys itself.

- **Player**
  The main controllable character. Handles movement, dashing, health management, resource collection, and interactions with the environment and UI. It uses multiple components such as SpriteRenderer, colliders, Rigidbody, HUD, HorizontalFlip, SquashAndStretch, etc (This is a big one!).

- **Rock**
  A non-destructible environmental object. Used for layouting the whole game world.

- **ShipMenuManager**
  Manages the spaceship repair and upgrade shop. It builds UI elements (buttons, cost labels, upgrade bars) and handles purchase logic.

- **Spaceship**
  The target for repair actions. Its appearance changes as it is repaired.

- **TestThing & TestThing2**
  Sample GameObjects used for testing and debugging.

- **TextureBG**
  A GameObject that renders the background texture (The tiling image). Added as a child object within chunks (I probably should do this automatically but this was a late decision to add this because I wasn't considering it when I was just using a flat color background).

- **ToolTipManager**
  Manages the display, hiding, and queueing of tooltip messages to the player.

- **UIManager**
  Handles the display and transitions of different UI menus (main menu, pause menu, game over, ship menu, etc.) and focuses elements for keyboard/controller navigation.

---

## Utilities

Utilities contain helper functions and definitions that support the engine’s behavior:

- **Actions**
  A set of constants that define the names of actions (e.g., `UP`, `DOWN`, `DASH`, `INTERACT`, `PAUSE`, etc.) for input handling.

- **EasingFunctions**
  A library of functions (linear, quadratic, cubic, exponential, elastic, bounce, back, etc.) that help with smooth animations and transitions.

- **SoundEffects**
  A list of sound effect definitions, each specifying a file name and a default volume.

- **SoundManager**
  A singleton responsible for preloading and playing audio files. It maps keys from SoundEffects to HTMLAudioElement objects and controls volume.

---

## Scenes

Scenes are containers for a particular game state and arrange which GameObjects are active. The main scenes include:

- **MainMenuScene**
  Sets up the main menu, loads UI elements, and shows the menu tooltip. It also listens for the button click to start the game.

- **MainScene**
  The primary gameplay scene. It instantiates the Player, CameraObject, ChunkManager, and other game entities.

- **TestScene**
  A sandbox-like scene for debugging and testing various objects and behaviors. This is where it all began.

---

This document is intended as a high-level reference.