import { buildStates, resetBuildingUI, enclosureSources } from "./build.js"
import { addAnimal } from "./collisions.js"
import { zoo } from "./main.js"
import { player } from "./player.js"
import { slowDownTime, speedUpTime } from "./canvasUtils.js"

export const UIContainer = document.getElementById('ui-container');

let focusEnclosure = NaN

export let menuStates = {
  hasAnyTrue: function() {
    return Object.values(this)
      .some(value => value === true);
  },
  buildShop: false,
  animalShop: false,
  mainShop: false,
  buildInventory: false,
  enclosureMenu: false
}

let menuElements = { //this stores the HTML elements for different menus. These will be put into HTML when a the menu is opened.
  mainShop: [
    `<h1 id="mainShop-menu-title" class="unhighlightable menu-title">shop</h1>`,
    `<h1 class="unhighlightable text-menu-item" id="mainShop-info">click on an enclosure to add animals</h1>`,
    `<img id="open-buildShop-menu-button" class="unhighlightable open-shop-menu-button" draggable="false" class="unhighlightable" src="images/ui/shop/enclosureShopCard.png" draggable="false"/>`
  ],
  buildShop: [
    `<h1 class="unhighlightable menu-title">Enclosure Shop</h1>`,
    `<img class="menu-item unhighlightable clickable" id="small-enclosure-buildInventory-menu-item" src="images/ui/shop/smallEnclosureShopCard.png" draggable="false"/>`,
    `<img class="menu-item unhighlightable clickable" id="medium-enclosure-buildInventory-menu-item" src="images/ui/shop/mediumEnclosureShopCard.png" draggable="false"/>`,
    `<img class="menu-item unhighlightable clickable" id="large-enclosure-buildInventory-menu-item" src="images/ui/shop/largeEnclosureShopCard.png" draggable="false"/>`
  ],
  animalShop: [
    `<h1 class="unhighlightable menu-title">Animal Info</h1>`,
    `<h1 class="unhighlightable menu-title text-menu-item">click on an animal to see information about it</h1>`,
    `<img class="menu-item unhighlightable clickable" id="giraffe-enclosure-menu-item" src="images/ui/shop/giraffeShopCard.png" draggable="false"/>`,
    `<img class="menu-item unhighlightable clickable" id="tiger-enclosure-menu-item" src="images/ui/shop/tigerShopCard.png" draggable="false"/>`,
    `<img class="menu-item unhighlightable clickable" id="elephant-enclosure-menu-item" src="images/ui/shop/elephantShopCard.png" draggable="false"/>`
  ],
  buildInventory: [
    `<h1 id="buildInventory-menu-title" class="unhighlightable menu-title">Enclosures</h1>`,
    `<img class="menu-item unhighlightable clickable" id="small-enclosure-buildInventory-menu-item" src="images/ui/shop/smallEnclosureShopCard.png" draggable="false"/>`,
    `<img class="menu-item unhighlightable clickable" id="medium-enclosure-buildInventory-menu-item" src="images/ui/shop/mediumEnclosureShopCard.png" draggable="false"/>`,
    `<img class="menu-item unhighlightable clickable" id="large-enclosure-buildInventory-menu-item" src="images/ui/shop/largeEnclosureShopCard.png" draggable="false"/>`
  ],
  animalInventory: [
    `<h1 id="animalInventory-menu-title" class="unhighlightable menu-title">Animals</h1>`,
    `<img class="menu-item unhighlightable" id="small-enclosure-buildInventory-menu-item" src="images/ui/shop/smallEnclosureShopCard.png" draggable="false"/>`
  ],
  enclosureMenu: [
    `<h1 id="enclosure-menu-title" class="unhighlightable menu-title">Enclosure</h1>`
  ],
  chooseAnimal: [
    `<h1 id="enclosure-menu-item" class="unhighlightable menu-title">Choose Animal:</h1>`,
    `<img class="menu-item unhighlightable clickable" id="giraffe-enclosure-pick-menu-item" src="images/ui/shop/giraffeShopCard.png" draggable="false"/>`,
    `<img class="menu-item unhighlightable clickable" id="tiger-enclosure-pick-menu-item" src="images/ui/shop/tigerShopCard.png" draggable="false"/>`,
    `<img class="menu-item unhighlightable clickable" id="elephant-enclosure-pick-menu-item" src="images/ui/shop/elephantShopCard.png" draggable="false"/>`,
    `<img id="open-animalShop-menu-button" class="unhighlightable open-shop-menu-button" draggable="false" class="unhighlightable" src="images/ui/shop/animalShopCard.png" draggable="false"/>`
  ],
  zooStats: [],
  tigerInfo: [
    `<h1 id="animalInfo-menu-title" class="unhighlightable menu-title">Tiger</h1>`,
    `<h1 id="animalInfo-menu-item" class="unhighlightable ">Status: endangered<br>Population: around 5,574 in the wild<br><br>There are two recognized subspecies of tiger*: the continental (Panthera tigris tigris) and the Sunda (Panthera tigris sondaica). The largest of all the Asian big cats, tigers rely primarily on sight and sound rather than smell for hunting. They typically hunt alone and stalk prey. A tiger can consume more than 80 pounds of meat at one time. On average, tigers give birth to two to four cubs every two years. If all the cubs in one litter die, a second litter may be produced within five months.<br><br>Tigers generally gain independence at around two years of age and attain sexual maturity at age three or four for females and four or five years for males. Juvenile mortality is high, however—about half of all cubs do not survive more than two years. Tigers have been known to reach up to 20 years of age in the wild.<br><br>Males of the larger subspecies, the continental tiger, may weigh up to 660 pounds. For males of the smaller subspecies—the Sunda tiger—the upper range is at around 310 pounds. Within both subspecies, males are heavier than females.<br><br>Tigers are mostly solitary, apart from associations between mother and offspring. Individual tigers have a large territory, and the size is determined mostly by the availability of prey. Individuals mark their domain with urine, feces, rakes, scrapes, and vocalizing.<br><br>Across their range, tigers face unrelenting pressures from poaching, retaliatory killings, and habitat loss. They are forced to compete for space with dense and often growing human populations.<br><br>Reference: <a href="https://www.worldwildlife.org/species/tiger">WWF</a></h1>`
  ],
  giraffeInfo: [
    `<h1 id="animalInfo-menu-title" class="unhighlightable menu-title">Giraffe</h1>`,
    `<h1 id="animalInfo-menu-item" class="unhighlightable ">Status: vunerable<br>Population: around 117,000 in the wild<br><br>In the wild, there are about 117,000 total remaining giraffes. However, the populations of some subspecies are dwindling dangerously close to extinction. Like how elephants are targeted for their ivory tusks, poachers target giraffes for their bones. There’s a significant amount of international trade in carvings and trophies made from giraffe bones.<br><br>At least 3,751 individual giraffes were killed to trade the nearly 40,000 items imported by the US. This included 21,402 bone carvings, 3,008 skin pieces, and 3,744 hunting trophies.<br><br>Ongoing drought in the Horn of Africa region—particularly in Kenya—threatens the lives of many giraffes. Over 6,000 animals perished from drought in Kenya from June to November 2022, including 93 endangered Masai giraffe. This drought is the worst the region has experienced in four decades.<br><br>As watering holes and rivers dry up, these giraffes roam into human-populated areas in search of water. This often incites human-wildlife conflict—the result of a lack of resources for both people and animals. Clashes between giraffes and people who perceive them as threats can be deadly for both parties involved.<br><br>Reference: <a href="https://www.ifaw.org/journal/are-giraffes-endangered">IFAW</a></h1>`
  ],
  elephantInfo: [
    `<h1 id="animalInfo-menu-title" class="unhighlightable menu-title">Elephant</h1>`,
    `<h1 id="animalInfo-menu-item" class="unhighlightable ">Status: Many species are endangered<br>Population: 450,000 in the wild<br><br>African elephant habitat has declined by over 50% since 1979, while Asian elephants are now restricted to just 15% of their original range.<br><br>Add in growing human-wildlife conflict and an upsurge in ivory poaching in recent years and it's easy to see why elephants are under threat.<br><br>While some populations of African elephant are secure and expanding, primarily in southern Africa, numbers are continuing to fall in other areas, particularly in central Africa and parts of East Africa. With an estimated 415,000 elephants left on the continent, the species is regarded as vulnerable, although certain populations are being poached towards extinction.<br><br>Asian elephant numbers have dropped by at least 50% over the last three generations, and they’re still in decline today. With only 40,000-50,000 left in the wild, the species is classified as endangered.<br><br>And it is critical to conserve both African and Asian elephants since they play such a vital role in their ecosystems as well as contributing towards tourism and community incomes in many areas.<br><br>Reference: <a href="https://wwf.panda.org/discover/knowledge_hub/endangered_species/elephants/">WWF</a></h1>`
  ]
}

function getMenuElements(menuType) {
  let menuHTMLContent = ``
  for (let i = 0; i < menuElements[menuType].length; i++) {
    menuHTMLContent += menuElements[menuType][i]
  }
  return menuHTMLContent
}

export function openMenu(menuType, enclosure) {
  menuExitButton() //closes the menu already open

  if (menuType === "enclosureMenu") {
    updateEnclosureUI(enclosure) //adjusts the enclosure HTML to match the animals in the enclosure
  } //only triggers this when the enclosure menu is opened.

  const menuHTMLContent = getMenuElements(menuType)
  const menuHTML =
    `
    <div class="menu-container unhighlightable" id="${menuType}-menu-container">${menuHTMLContent}</div>
    <img class="menu-outline unhighlightable" id="${menuType}-menu-outline" src="images/ui/menuOutline.png" draggable="false"/>
    <img class="close-menu-button unhighlightable" id="close-menu-button" src="images/ui/buttons/closeMenu.png" draggable="false"/>
    `

  UIContainer.innerHTML += menuHTML
  menuStates[menuType] = true
}

function updateEnclosureUI(enclosure) {
  let animalsPlural = (enclosure.animals.length === 1) ? "animal" : "animals"
  menuElements["enclosureMenu"] = [
    `<h1 id="enclosure-menu-title" class="unhighlightable menu-title">Enclosure</h1>`,
    `<h1 id="enclosure-menu-info" class="unhighlightable menu-title text-menu-item">Best number of animals: ${enclosure.desiredNumAnimals}</h1>`,
    `<h1 id="enclosure-menu-item" class="unhighlightable menu-title">${enclosure.animals.length} ${animalsPlural}</h1>`,
    `<h1 id="enclosure-menu-item" class="unhighlightable menu-title">Happiness: ${enclosure.happiness}%</h1>`
  ] //reset the display for the enclosure menu
  enclosure.animals.forEach((animal) => {
    menuElements["enclosureMenu"].push(`<img class="menu-item unhighlightable clickable" id="${animal.name}-enclosure-menu-item" src="${animal.cardSrc}" draggable="false"/>`)
  }) //add each different animal in the enclosure to the enclosure display

  menuElements["enclosureMenu"].push(`<img class="menu-item unhighlightable clickable" id="addAnimal-enclosure-menu-item" src="images/ui/shop/addAnimalCard.png" draggable="false"/>`) //HTML for a button to add a new animal to the enclosure

  focusEnclosure = enclosure //focusEnclosure is a global variable, so this allows the enclosure to be edited anywhere in this file.
}

function updateZooStatsUI(zoo) {
  menuElements["zooStats"] = [
    `<h1 id="zooStats-menu-title" class="unhighlightable menu-title">zoo stats</h1>`,
    `<h1 id="zooStats-menu-item" class="unhighlightable text-menu-item">money:  £${Math.floor(zoo.money * 100) / 100}</h1>`,
    `<h1 id="zooStats-menu-item" class="unhighlightable text-menu-item">rating:  ${Math.floor(zoo.rating * 2) / 2}/5 </h1>`,
    `<h1 id="zooStats-menu-item" class="unhighlightable text-menu-item">Total Happiness:  ${zoo.totalHappiness}</h1>`,
    `<h1 id="zooStats-menu-item" class="unhighlightable text-menu-item">Average Happiness:  ${zoo.averageHappiness}%</h1>`,
    `<h1 id="zooStats-menu-item" class="unhighlightable text-menu-item">Number of animals:  ${zoo.numAnimals}</h1>`,
    `<h1 id="zooStats-menu-item" class="unhighlightable text-menu-item">Types of animals:  ${zoo.numAnimalTypes}</h1>`,
    `<h1 id="zooStats-menu-item" class="unhighlightable text-menu-item">Number of enclosures:  ${zoo.numEnclosures}</h1>`]
  openMenu("zooStats")
}

export function menuExitButton() {
  for (let menuType in menuStates) { //loop through each property in menuStates
    if (menuStates[menuType] === true && menuType != "hasAnyTrue") { //checks if a specific menu is open 
      closeMenu(menuType); //closes that menu
    }
  }
  returnEnclosureMoney()
  resetBuildingUI()
}

function returnEnclosureMoney() {
  for (let buildType in buildStates) { //loop through each property in menuStates
    if (buildStates[buildType] === true && buildType != "hasAnyTrue") { //checks if a specific menu is open 
      zoo.money += enclosureSources[buildType].price
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
}

function startBuilding(buildType, money) {
  menuExitButton()
  if (zoo.money >= money) {
    zoo.money -= money
    UIContainer.classList.add("disabledButton")
    buildStates[buildType] = true
    document.body.style.cursor = "url('images/buildCursor.png') 0 27, auto"
  } else {
    player.say("I can't afford this", 100)
  }
}

const buttonControls = {
  'open-mainShop-menu-button': () => openMenu("mainShop"),
  'open-buildShop-menu-button': () => openMenu("buildShop"),
  'open-animalShop-menu-button': () => openMenu("animalShop"),
  'close-menu-button': menuExitButton,
  'open-buildInventory-menu-button': () => openMenu("buildInventory"),
  'open-animalInventory-menu-button': () => openMenu("animalInventory"),
  'small-enclosure-buildInventory-menu-item': () => startBuilding('smallEnclosure', 10000),
  'medium-enclosure-buildInventory-menu-item': () => startBuilding('mediumEnclosure', 20000),
  'large-enclosure-buildInventory-menu-item': () => startBuilding('largeEnclosure', 40000),
  'addAnimal-enclosure-menu-item': () => openMenu("chooseAnimal"),
  'giraffe-enclosure-pick-menu-item': () => addAnimal(focusEnclosure, "giraffe", 50000),
  'tiger-enclosure-pick-menu-item': () => addAnimal(focusEnclosure, "tiger", 40000),//focusEnclosure is the enclosure whose menu is currently open
  'elephant-enclosure-pick-menu-item': () => addAnimal(focusEnclosure, "elephant", 50000),
  'open-stats-menu-button': () => updateZooStatsUI(zoo),
  'slow-down-time-button': slowDownTime,
  'speed-up-time-button': speedUpTime,
  'tiger-enclosure-menu-item': () => openMenu("tigerInfo"),
  'giraffe-enclosure-menu-item': () => openMenu("giraffeInfo"),
  'elephant-enclosure-menu-item': () => openMenu("elephantInfo")
}
UIContainer.addEventListener('click', function(event) {
  if (event.target.id in buttonControls) {
    buttonControls[event.target.id]()
  }
});