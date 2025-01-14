const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

// disable image smoothing when game is scaled up.
ctx.webkitImageSmoothingEnabled = false;
ctx.mozImageSmoothingEnabled = false;
ctx.imageSmoothingEnabled = false;

ctx.fillStyle = "black";
ctx.fillRect(0, 0, 640, 480);
