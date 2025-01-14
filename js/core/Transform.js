export class Transform {
  constructor() {
    this.position = { x: 0, y: 0 };
    this.rotation = 0; // in degrees!!
    this.scale = { x: 1, y: 1 };
  }

  // Utility functions for conversion
  get rotationInRadians() {
    return (this.rotation * Math.PI) / 180;
  }
}