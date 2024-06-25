import { buildStates } from "./build.js"

export const UIContainer = document.getElementById('ui-container');

export let menuStates = {
  all: false,
  buildShop: false,
  animalShop: false,
  mainShop: false,
  buildInventory: false
}

let menuElements = {
  mainShop: [
    `<h1 id="mainShop-menu-title" class="unhighlightable menu-title">shop</h1>`,
    `<img id="open-buildShop-menu-button" class="unhighlightable open-shop-menu-button" draggable="false" class="unhighlightable" src="images/ui/shop/enclosureShopCard.png" draggable="false"/>`,
    `<img id="open-animalShop-menu-button" class="unhighlightable open-shop-menu-button" draggable="false" class="unhighlightable" src="images/ui/shop/animalShopCard.png" draggable="false"/>`
  ],
  buildShop: [
    `<h1 class="unhighlightable menu-title">Enclosure Shop</h1>`,
    `<img class="menu-item unhighlightable" id="buildShop-menu-item"
    src="images/ui/shop/largeEnclosure.png" draggable="false"/>`,
  ],
  animalShop: [
    `<h1 class="unhighlightable menu-title">Animal Shop</h1>`,
    `<img class="menu-item unhighlightable" id="giraffe-animalShop-menu-item" src="images/ui/shop/giraffeShopCard.png" draggable="false"/>`,
    `<img class="menu-item unhighlightable" id="giraffe-animalShop-menu-item" src="images/ui/shop/giraffeShopCard.png" draggable="false"/>`,
    `<img class="menu-item unhighlightable" id="giraffe-animalShop-menu-item" src="images/ui/shop/giraffeShopCard.png" draggable="false"/>`,
    `<img class="menu-item unhighlightable" id="giraffe-animalShop-menu-item" src="images/ui/shop/giraffeShopCard.png" draggable="false"/>`,
    `<img class="menu-item unhighlightable" id="giraffe-animalShop-menu-item" src="images/ui/shop/giraffeShopCard.png" draggable="false"/>`,
    `<img class="menu-item unhighlightable" id="giraffe-animalShop-menu-item" src="images/ui/shop/giraffeShopCard.png" draggable="false"/>`
  ],
  buildInventory: [
    `<h1 id="buildInventory-menu-title" class="unhighlightable menu-title">Enclosures</h1>`,
    `<img class="menu-item unhighlightable" id="small-enclosure-buildInventory-menu-item" src="images/ui/shop/smallEnclosureShopCard.png" draggable="false"/>`,
  ]
}

function updateAnyMenuOpen() {
  let menuArray = Object.entries(menuStates).filter(([key, value]) => key !== 'all')
  menuStates.all = menuArray.some(([key, value]) => value === true);
}

function getMenuElements(menuType) {
  let menuHTMLContent = ``
  for (let i = 0; i < menuElements[menuType].length; i++) {
    menuHTMLContent += menuElements[menuType][i]
  }
  return menuHTMLContent
}

function toggleMenu(menuType) {
  const menuHTMLContent = getMenuElements(menuType)
  const menuHTML =
    `
    <div class="menu-container unhighlightable" id="${menuType}-menu-container">${menuHTMLContent}</div>
    <img class="menu-outline unhighlightable" id="${menuType}-menu-outline" src="images/ui/menuOutline.png" draggable="false"/>
    <img class="close-menu-button unhighlightable" id="close-menu-button" src="images/ui/buttons/closeMenu.png" draggable="false"/>
    `
  if (menuStates.all) {
    closeMenu(menuType)
  } else {
    UIContainer.innerHTML += menuHTML
    menuStates[menuType] = true
  }
  updateAnyMenuOpen()
}

export function menuExitButton() {
  for (let menuType in menuStates) {
    if (menuStates[menuType] === true && menuType != "all") {
      closeMenu(menuType);
    }
  }
}

function closeMenu(menuType) {
  const menuContainer = document.getElementById(menuType + '-menu-container');
  const menuOutline = document.getElementById(menuType + '-menu-outline');
  const closeMenuButton = document.getElementById('close-menu-button');
  UIContainer.removeChild(menuContainer);
  UIContainer.removeChild(menuOutline);
  UIContainer.removeChild(closeMenuButton);
  menuStates[menuType] = false
  updateAnyMenuOpen()
}

export function addButton(buttonID, classes, src, bottomRightPosition, size, container) {
  container.innerHTML +=
    `<img id="${buttonID}" draggable="false" class="${classes}" src="${src}" draggable="false" style="position: absolute; image-rendering: pixelated; cursor: pointer; left: ${bottomRightPosition.x - size.x}%; top: ${bottomRightPosition.y - size.y}%; width: ${size.x}%; height: ${size.y}%; pointer-events: auto;" />`;
}

function openShopMenu(menuType) {
  closeMenu("mainShop")
  toggleMenu(menuType)
}

function allowBuild(buildType) {
  buildStates.all = true
  closeMenu("buildInventory")
  UIContainer.style = "cursor: url('images/buildCursor.png') 0 27, auto;"
}

const buttonControls = {
  'open-mainShop-menu-button': () => toggleMenu("mainShop"),
  'open-buildShop-menu-button': () => openShopMenu("buildShop"),
  'open-animalShop-menu-button': () => openShopMenu("animalShop"),
  'close-menu-button': menuExitButton,
  'open-buildInventory-menu-button': () => toggleMenu("buildInventory"),
  'small-enclosure-buildInventory-menu-item': () => allowBuild('smallEnclosure')
}
UIContainer.addEventListener('click', function(event) {
  if (event.target.id in buttonControls) {
    buttonControls[event.target.id]()
  }
});