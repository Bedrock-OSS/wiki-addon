import { world, ItemStack } from "@minecraft/server";
import SelectionBoxes from "../utils/selection_boxes"; // Import the SelectionBoxes class to use it

// Support orientation along both horizontal axes
const pots = {
  x: new SelectionBoxes({ origin: [-7, 0, -3], size: [6, 6, 6] }, { origin: [1, 0, -3], size: [6, 6, 6] }),
  z: new SelectionBoxes({ origin: [-3, 0, -7], size: [6, 6, 6] }, { origin: [-3, 0, 1], size: [6, 6, 6] }),
};

// The state value and sound associated with each plant
const plants = {
  "minecraft:yellow_flower": {
    value: "dandelion",
    sound: "dig.grass",
  },
  "minecraft:cactus": {
    value: "cactus",
    sound: "dig.cloth",
  },
};

// Get the selected pot for the appropriate axis
const getSelectedPot = (e) => pots[e.block.permutation.getState("wiki:axis")].getSelected(e.faceLocation);

const isPotOccupied = (block, pot) => block.permutation.getState(`wiki:pot_${pot}_plant`) !== "none";

const setPotPlant = (block, pot, plant) => block.setPermutation(block.permutation.withState(`wiki:pot_${pot}_plant`, plant));

// Our flower pots even have sound effects!
const playPlantSound = (dimension, location, sound) => dimension.runCommand(`playsound ${sound} @a ${location.x} ${location.y} ${location.z} 0.5`);

// If a pot is not selected (the inbetween area is targeted) or is already filled, the item use is cancelled.
world.beforeEvents.itemUseOn.subscribe((e) => {
  if (e.block.typeId !== "wiki:double_flower_pot" || !plants[e.itemStack.typeId]) return;

  const selectedPot = getSelectedPot(e);

  if (selectedPot === undefined || isPotOccupied(e.block, selectedPot)) e.cancel = true;
});

// -------------------------------
//    Plant in the selected pot
// -------------------------------
world.afterEvents.itemUseOn.subscribe((e) => {
  if (e.block.typeId !== "wiki:double_flower_pot" || !plants[e.itemStack.typeId] || e.source.isSneaking) return;

  const selectedPot = getSelectedPot(e);
  const plant = plants[e.itemStack.typeId];

  setPotPlant(e.block, selectedPot, plant.value);
  playPlantSound(e.block.dimension, e.block.location, plant.sound);
});

// -------------------------------
//  Release plants on destruction
// -------------------------------
function releasePlants(e) {
  const states = (e.brokenBlockPermutation ?? e.explodedBlockPermutation).getAllStates();

  // Array of plant state values e.g. ["cactus", "dandelion"]
  const storedPlants = Object.entries(states)
    .filter(([state, value]) => state.startsWith("wiki:pot") && value !== "none")
    .map(([state, value]) => value);

  if (storedPlants.length === 0) return;

  // Centre loot in block
  const lootLocation = {
    x: e.block.location.x + 0.5,
    y: e.block.location.y + 0.5,
    z: e.block.location.z + 0.5,
  };

  // Create an item entity for every potted plant
  for (const plant of storedPlants) {
    const plantId = Object.keys(plants).find((key) => plants[key].value === plant);

    e.dimension.spawnItem(new ItemStack(plantId), lootLocation);
    playPlantSound(e.dimension, e.block.location, plants[plantId].sound);
  }
}

world.afterEvents.playerBreakBlock.subscribe((e) => {
  if (e.brokenBlockPermutation.type.id === "wiki:double_flower_pot") releasePlants(e);
});
world.afterEvents.blockExplode.subscribe((e) => {
  if (e.explodedBlockPermutation.type.id === "wiki:double_flower_pot") releasePlants(e);
});
