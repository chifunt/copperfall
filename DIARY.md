# Copperfall - A Creative Code Lab Diary

## 2025-01-13
The first day was the day that I started planning and experiment with how to approach making this game. I already had a way in mind, but unfortunately the method I had in mind has a very similiar process on how I would make a game in a game engine. I tried to make use of the sample code provided by the 2D Browser Game Coding course but it just seems like I couldn't get it to work the way I wanted to.

## 2025-01-14
Today I scrapped my experiments from yesterday and devised my own system, a custom game engine of sorts. One that would work exactly the way I need it to work, one that has only the things I need for this game, and nothing more. I then was able to create a nice structured codebase and implemented a player controller, as well as a component for squashing and stretching, complete with a custom pivoting option. Combining the player controller with the squashing and stretching, having acceleration and deceleration, as well as having a null-cancelling movement system made a character that would feel good to run around with. I also initially thought that I would have to stick to a 4:3 aspect ratio with the resolution of 640x480, with pixel art and no smoothing. This was due to the fact that I was inexperienced with using canvas in html and thought of how much of a hassle it would be to scale the canvas with the screen in a way that is non-destructive and makes sense. But I managed to create a virtualized coordinate and width system that is separate from the canvas'. This resulted in me being able to instead use the full resolution of the window that the browser is running at, at the intended aspect ratio, with the canvas scaling as big as it can with that constraint in mind. The virtualized transforms would also be a stepping stone for the way that I can implement a moving camera, which I intend to do later on.

## 2025-01-15
The day began with me adding more easings for future use (possibly), in particular bounce easings which can make a really good feel, but not sure what to use it on at the moment. Created a modular system where I can essentially flip the any gameobject's sprite on their spriterenderer component. Implemented a debugging mode for the engine where I can see the world grid. Implemented a camera gameobject that follows the player, complete with lerping and lookahead, as well as easing support. I am currently working on the collision system. It's quite a bit tougher than I thought it would be.

## 2025-01-16
This is the day when collision had been discovered, at long last do things collide, just as the universe was created. It started with a box collider, then circle, then we have triggers, rigidbodies, kinematics, statics, dynamics, all of them! I initially thought I would try using MTV style collision resolution but I figured since I won't need physics and the likelihood that I would even need this is very low in this game I decided not to and do a simple approach of going back to the previous position. A scene system has been implemented (like unity's) where I can load and unload scenes as I will. Controls? Yeah we got controls, we got all of them! Controller support has been introduced! whilst we can now only move around, this can be done with joy! (sticks). UI, a nicely designed HUD, inspired by Hollow Knight's hud. We got a main menu, pause menu, and soon a ship menu, so off shall we set sail!

## 2025-01-17
We now have pickups. We can pick stuff up. But not any stuff. It's copper, and just copper. For copper is all we need in this life. Control maps? Yeah we now have all the possible actions in the game in terms of input and how they are registered. Tweakin with the css as well makin stuff look nicer. Player can now dash around the world, with a special super squash! Controller vibrations included? yes. screen shake as well? yes. We now have a spaceship, it don't do anything yet but it's big and has a trigger. The HUD is now mapped to the player, who now has health, charges, and copper.

## 2025-01-18
Today I implemented the copper pickup UI flash effect when the method gets called. Destructible rocks were also implemented, including screen shake and rumble effects when that happens. But can't test some of that stuff cause I'm away from home rn and didn't bring along my controller. Experimented with code to colorize a gameobject's spriterenderer but so far no success, backtracked on that for a bit to maybe implement in the future.

## 2025-01-19
Main menu scene has been created but non functional at the moment being. Implemented vertical bobbing for the pickup objects. Player can now interact with the sapceship, controller rumbles added, adjusted main scene to be more suitable for testing. Added drop shadows to destructible rocks. Added more test pixels for the shits and gigs (actually for more diversity in colors).


## 2025-01-20
Implemented the UI management system to figure out which UI to be opened and when. Added a test enemy to test out damage system. Added the damage vignette to happen during damaged state. Added more easing functions, made the copper pickups follow the player for a bit before actually getting picked up.

## 2025-01-21
Implement UI Functionality (Start screen and game over screen). Added controller support for those screens. Styled the Shipwreck UI. Implemented persistent gameobjects.

## 2025-01-22
Finished the UIs completely with full support for controller and keyboard input methods. Charging now has a blue vignette. Simple circle based particle system was implemented, made a big difference in how the game feels. Tooltips are now added to guide player on which buttons to press and where. Chunk generation system was implemented and fully working, it took a while. You can also load images 8x8 pixel images in.

## 2025-01-23
The game is currently experiencing a bug where the game lags really heavily the more the game is beaten and restarted. I am not going to bother to find the issue, I know for sure that not everything is destroyed and reinitialized when loading and deloading scenes. This was more of an architectural mistake that I made early on, since I didn't plan on having scenes and restarting the game. Compass was implemented but hella scuff implementation. Screenshake was adjusted from queueing to adding up. I found out that due to the physics calculations being done with delta time, low frame rates would cause the game to be quite unplayable and the collisions cease to work. Even a small dip in fps would be able to result in the player being able to dash through a rock. All the art was done and finished today, along with a whole bunch of finishing touches.