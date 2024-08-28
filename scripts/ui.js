import { buildStates, resetUIContainer } from "./build.js"
import { addAnimal } from "./collisions.js"

export const UIContainer = document.getElementById('ui-container');

let focusEnclosure = NaN

export let menuStates = {
  all: false,
  buildShop: false,
  animalShop: false,
  mainShop: false,
  buildInventory: false,
  enclosureMenu: false
}

let menuElements = { //this stores the HTML elements for different menus. These will be put into HTML when a the menu is opened.
  mainShop: [
    `<h1 id="mainShop-menu-title" class="unhighlightable menu-title">shop</h1>`,
    `<img id="open-buildShop-menu-button" class="unhighlightable open-shop-menu-button" draggable="false" class="unhighlightable" src="images/ui/shop/enclosureShopCard.png" draggable="false"/>`,
    `<img id="open-animalShop-menu-button" class="unhighlightable open-shop-menu-button" draggable="false" class="unhighlightable" src="images/ui/shop/animalShopCard.png" draggable="false"/>`
  ],
  buildShop: [
    `<h1 class="unhighlightable menu-title">Enclosure Shop</h1>`,
    `<img class="menu-item unhighlightable" id="buildShop-menu-item"
    src="images/ui/shop/largeEnclosure.png" draggable="false"/>`
  ],
  animalShop: [
    `<h1 class="unhighlightable menu-title">Animal Shop</h1>`
  ],
  buildInventory: [
    `<h1 id="buildInventory-menu-title" class="unhighlightable menu-title">Enclosures</h1>`,
    `<img class="menu-item unhighlightable" id="small-enclosure-buildInventory-menu-item" src="images/ui/shop/smallEnclosureShopCard.png" draggable="false"/>`
  ],
  enclosureMenu: [
    `<h1 id="enclosure-menu-title" class="unhighlightable menu-title">Enclosure</h1>`
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

export function toggleMenu(menuType, enclosure) {
  menuExitButton() //closes the menu already open

  if (enclosure != undefined) {
    updateEnclosureUI(enclosure) //adjusts the enclosure HTML to match the animals in the enclosure
  } //only triggers this when an enclosure is entered (this means that the menuType will equal "enclosureMenu")

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

function updateEnclosureUI(enclosure) {
  menuElements["enclosureMenu"] = [
    `<h1 id="enclosure-menu-title" class="unhighlightable menu-title">Enclosure</h1>`,
    `<h1 id="enclosure-menu-title" class="unhighlightable menu-title">${enclosure.animals.length} animals</h1>`] //reset the display for the enclosure menu
  enclosure.animals.forEach((animal) => {
    menuElements["enclosureMenu"].push(`<img class="menu-item unhighlightable" id="${animal.name}-enclosure-menu-item" src="${animal.cardSrc}" draggable="false"/>`)
  }) //add each different animal in the enclosure to the enclosure display

  menuElements["enclosureMenu"].push(`<img class="menu-item unhighlightable" id="addAnimal-enclosure-menu-item" src="images/ui/shop/addAnimalCard.png" draggable="false"/>`) //HTML for a button to add a new animal to the enclosure

  focusEnclosure = enclosure //focusEnclosure is a global variable, so this allows the enclosure to be edited anywhere in this file.
}

function addAnimalToEnclosure(enclosure) {
  addAnimal(enclosure, "giraffe")
  updateEnclosureUI(enclosure)
  let enclosureMenuUI = document.getElementById('enclosureMenu-menu-container');
  console.log(enclosureMenuUI.innerHTML)
  enclosureMenuUI.innerHTML = getMenuElements("enclosureMenu")
}

export function menuExitButton() {
  for (let menuType in menuStates) { //loop through each property in menuStates
    if (menuStates[menuType] === true && menuType != "all") { //checks if a specific menu is open 
      closeMenu(menuType); //closes that menu
    }
  }
  resetUIContainer()
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
    `<img id="${buttonID}" draggable="false" class="${classes}" src="${src}" draggable="false" style="position: absolute; image-rendering: pixelated; cursor: pointer; left: ${bottomRightPosition.x - size.x}%; top: ${bottomRightPosition.y - size.y}%; width: ${size.x}%; height: ${size.y}%;" />`;
}

function openShopMenu(menuType) {
  closeMenu("mainShop")
  toggleMenu(menuType)
}

function allowBuild(buildType) {
  UIContainer.classList.add("disabledButton")
  buildStates.all = true
  buildStates[buildType] = true
  closeMenu("buildInventory")
  UIContainer.style.cursor = "url('images/buildCursor.png') 0 27, auto;"
}

const buttonControls = {
  'open-mainShop-menu-button': () => toggleMenu("mainShop"),
  'open-buildShop-menu-button': () => openShopMenu("buildShop"),
  'open-animalShop-menu-button': () => openShopMenu("animalShop"),
  'close-menu-button': menuExitButton,
  'open-buildInventory-menu-button': () => toggleMenu("buildInventory"),
  'small-enclosure-buildInventory-menu-item': () => allowBuild('smallEnclosure'),
  'addAnimal-enclosure-menu-item': () => addAnimalToEnclosure(focusEnclosure) //focusEnclosure is the enclosure whose menu is currently open
}
UIContainer.addEventListener('click', function(event) {
  if (event.target.id in buttonControls) {
    buttonControls[event.target.id]()
  }
});