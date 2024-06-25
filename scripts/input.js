import { state, canvas } from "./main.js";
import { menuStates, menuExitButton } from "./ui.js"

export let pressedKeys = []
export const mousePos = { x: 0, y: 0 }
export let leftMousePressed = false
export let rightMousePressed = false

export function mouseHoveringOverObject(object, position) {
  if (mousePos.y > 0 && mousePos.y < canvas.height && mousePos.x > 0 && mousePos.x < canvas.width) {
    return (
      mousePos.x < position.x + object.size.x &&
      mousePos.x > position.x &&
      mousePos.y < position.y + object.size.y &&
      mousePos.y > position.y
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
    leftMousePressed = false
    console.log(`click at ${mousePos.x}, ${mousePos.y}`)
  } else if (event.button === 2) {
    rightMousePressed = false
  }
})

addEventListener("wheel", (event) => {
  if (!menuStates.all) {
    if (event.deltaY < 0) {
      if (state.zoom < 2) {
        state.zoom /= 0.9
      }
    } else {
      if (state.zoom > 0.04) {
        state.zoom *= 0.9
      }
    }
  }
})