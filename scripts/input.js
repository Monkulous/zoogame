import { state, canvas, ctx } from "./main.js";
import { menuStates, menuExitButton } from "./ui.js"

export let pressedKeys = []
export const mousePos = { x: 0, y: 0 }
export let leftMousePressed = false
export let rightMousePressed = false

export function mouseHoveringOverObject(objectPosition, objectSize, player) { //only uses object's collision box
  let relativeMousePos = { //mouse position relative to (0, 0)
    x: (((mousePos.x / state.zoom) - canvas.width / (2 * state.zoom) + player.position.x + player.imageSize.x / 2)),
    y: (((mousePos.y / state.zoom) - canvas.height / (2 * state.zoom) + player.position.y + player.imageSize.y * 3 / 4))
  };

  relativeMousePos = { //mouse position relative to player
    x: relativeMousePos.x - player.position.x,
    y: relativeMousePos.y - player.position.y
  }

  let relativeObjectPos = { //object collision position relative to player
    x: objectPosition.x - player.position.x,
    y: objectPosition.y - player.position.y
  }

  if (mousePos.y > 0 && mousePos.y < canvas.height && mousePos.x > 0 && mousePos.x < canvas.width) {
    return (
      relativeMousePos.x < relativeObjectPos.x + objectSize.x &&
      relativeMousePos.x > relativeObjectPos.x &&
      relativeMousePos.y < relativeObjectPos.y + objectSize.y &&
      relativeMousePos.y > relativeObjectPos.y
    )
  } else {
    return false
  }
};

addEventListener("keydown", ({ key, repeat }) => {
  if (repeat) { return }
  if (!pressedKeys.includes(key.toLowerCase())) {
    pressedKeys.unshift(key.toLowerCase())
  }
  if (pressedKeys.includes("escape")) {
    menuExitButton()
  }
});

addEventListener("keyup", ({ key }) => {
  if (pressedKeys.includes(key.toLowerCase())) {
    pressedKeys.splice(pressedKeys.indexOf(key.toLowerCase()), 1)
  }
});

addEventListener("blur", () => {
  pressedKeys = [];
  console.log("blur")
});

addEventListener("mousemove", (event) => {
  const rect = canvas.getBoundingClientRect();
  mousePos.x = event.clientX - rect.left;
  mousePos.y = event.clientY - rect.top;
  mousePos.x *= canvas.width / canvas.clientWidth;
  mousePos.y *= canvas.height / canvas.clientHeight;
});

addEventListener("mousedown", (event) => {
  if (event.button === 0) {
    leftMousePressed = true
  } else if (event.button === 2) {
    rightMousePressed = true
  }
})

addEventListener("mouseup", (event) => {
  if (event.button === 0) {
    leftMousePressed = false;
    console.log(`click at ${mousePos.x}, ${mousePos.y}`);
    state.click = true;
  } else if (event.button === 2) {
    rightMousePressed = false;
  };
});

addEventListener("wheel", (event) => {
  if (!menuStates.hasAnyTrue()) {
    if (event.deltaY < 0) {
      if (state.zoom < 2) {
        state.zoom /= 0.9
      }
    } else {
      if (state.zoom > 0.07) {
        state.zoom *= 0.9
      }
    }
  }
})