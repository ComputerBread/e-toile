import './style.css'


const canvas = document.getElementById('canvass');
const ctx = canvas.getContext('2d');

// Function to resize the canvas to fit the window
function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}

// Clear and redraw the canvas after each scroll or draw
function redrawCanvas() {

  // Shift the canvas based on the virtual scroll offset
  ctx.save();  // Save the current state

  // Clear the canvas before redrawing
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  ctx.translate(0, scrollOffsetY); // Apply the scroll offset to the context

  // so you need to redraw everything here
  // which mean that we need to have access to everything already drawn!
  lines.forEach((line) => {
    ctx.beginPath();
    ctx.strokeStyle = 'red';
    ctx.lineWidth = 2;
    ctx.moveTo(line.startX, line.startY);
    ctx.lineTo(line.endX, line.endY);
    ctx.stroke();
  });

  images.forEach(({img, x, y }) => {
    ctx.drawImage(img, x, y);
  })
  
  ctx.restore();  // Restore the original state
}


// Start drawing when the left mouse button is pressed
canvas.addEventListener('mousedown', (e) => {
  drawing = true;
  // Start at the current mouse position
  [lastX, lastY] = [e.offsetX, e.offsetY];
});

// Stop drawing when the mouse button is released
canvas.addEventListener('mouseup', () => {
  drawing = false;
});

// Stop drawing when the mouse leaves the canvas
canvas.addEventListener('mouseout', () => {
  drawing = false;
});

// Draw a red line that follows the cursor
canvas.addEventListener('mousemove', (e) => {
  if (!drawing) return; // Stop if not holding down the mouse button

  const newLine = {
    startX: lastX,
    startY: lastY - scrollOffsetY,
    endX: e.offsetX,
    endY: e.offsetY - scrollOffsetY,
  }

  lines.push(newLine);
  ctx.save(); 
  ctx.beginPath();      // Start a new path

  if (eraserMode) {
    ctx.globalCompositeOperation = 'destination-out'; // Set to erase
    ctx.lineWidth = 40;   // Set the line width
  } else {
    ctx.globalCompositeOperation = 'source-over'; // Set to draw
    ctx.lineWidth = 2;   // Set the line width
    ctx.strokeStyle = 'red';  // Set the line color to red
  }

  ctx.moveTo(lastX, lastY);  // Move to the last recorded mouse position
  ctx.lineTo(e.offsetX, e.offsetY);  // Draw a line to the current mouse position
  ctx.stroke();        // Actually draw the line
  ctx.closePath();

  ctx.restore();

  // Update lastX and lastY to the current position
  [lastX, lastY] = [e.offsetX, e.offsetY];
});

// Handle scrolling
canvas.addEventListener('wheel', (e) => {
  // Scroll up or down based on the wheel movement
  scrollOffsetY -= (e.deltaY > 0) ? 20 : -20;

  // Limit scrolling to avoid getting lost (optional)
  scrollOffsetY = Math.max(scrollOffsetY, -1000); // Prevent scrolling too far up
  scrollOffsetY = Math.min(scrollOffsetY, 1000);  // Prevent scrolling too far down

  // Redraw the canvas to reflect the new scroll position
  redrawCanvas();
});

const images = [];
canvas.addEventListener("drop", (e) => {
  e.preventDefault();
  console.log("dropped")
  const file = e.dataTransfer.files[0];
  const reader = new FileReader();
  reader.onload = (event) => {
    const img = new Image();
    const x = e.clientX; // exists on this e?
    const y = e.clientY;
    img.src = event.target.result;
    img.onload = () => {
      images.push({ img, x, y: y-scrollOffsetY });
      ctx.drawImage(img, x, y);
    };
  };
  reader.readAsDataURL(file);
});

canvas.addEventListener("dragover", (e) => {
  e.preventDefault();  // Necessary to allow dropping
  console.log("dragging over boss");
});


// Call resizeCanvas on window resize and initially
window.addEventListener('resize', () => {
  resizeCanvas();
  redrawCanvas();
});
resizeCanvas();


let drawing = false;
let lastX = 0;
let lastY = 0;
let scrollOffsetY = 0; // Tracks the virtual scroll offset
const lines = [];

let eraserMode = false;
window.addEventListener('keydown', (e) => {
  if (e.key === 'e' || e.key === 'E') { // Check if the "E" key is pressed
    eraserMode = !eraserMode; // Toggle eraser mode
    console.log(`Eraser mode: ${eraserMode}`); // Optional: for debugging
  }
});

