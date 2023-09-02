import { world, ItemStack } from "@minecraft/server";
import FaceSelectionPlains from "../utils/face_selection_plains"; // Import the FaceSelectionPlains class to use it

// Slot bounds
const slots = new FaceSelectionPlains(
  { origin: [0, 0], size: [6, 8] },
  { origin: [6, 0], size: [5, 8] },
  { origin: [11, 0], size: [5, 8] },
  { origin: [0, 8], size: [6, 8] },
  { origin: [6, 8], size: [5, 8] },
  { origin: [11, 8], size: [5, 8] }
);

const isFrontFace = (block, face) => block.permutation.getState("minecraft:cardinal_direction") === face.toLowerCase();

const isSlotOccupied = (block, slot) => block.permutation.getState(`wiki:slot_${slot}_occupied`);

const occupySlot = (block, slot) => block.setPermutation(block.permutation.withState(`wiki:slot_${slot}_occupied`, true));

// Cancel the use if a slot was not selected, is occupied, or if not interacting with paper
world.beforeEvents.itemUseOn.subscribe((e) => {
  if (e.block.typeId !== "wiki:pigeonholes" || !isFrontFace(e.block, e.blockFace) || (e.itemStack.typeId !== "minecraft:paper" && e.source.isSneaking)) return;

  // Get the selected slot index
  const slot = slots.getSelected(e);

  if (slot === undefined || isSlotOccupied(e.block, slot) || e.itemStack.typeId !== "minecraft:paper") e.cancel = true;
});

// ------------------------------
//    Insert paper on interact
// ------------------------------
world.afterEvents.itemUseOn.subscribe((e) => {
  if (e.block.typeId !== "wiki:pigeonholes" || e.itemStack.typeId !== "minecraft:paper") return;

  // Set block state and play an insert sound. The stack is decremented in the block JSON event.
  occupySlot(e.block, slots.getSelected(e));
  e.source.runCommand(`playsound insert.chiseled_bookshelf @a ${Object.values(e.block.location).join(" ")}`);
});

// ------------------------------
//  Release paper on destruction
// ------------------------------
function releasePaper(e) {
  // Get the number of states with the value `true`. This is the amount of paper stored in the block
  const storageAmount = Object.values((e.brokenBlockPermutation ?? e.explodedBlockPermutation).getAllStates()).filter((v) => v === true).length;

  // If no paper is stored, stop here
  if (storageAmount === 0) return;

  // Centre loot in block
  const lootLocation = {
    x: e.block.location.x + 0.5,
    y: e.block.location.y + 0.5,
    z: e.block.location.z + 0.5,
  };

  // Create an item entity for every stored paper
  for (let i = 0; i < storageAmount; i++) {
    e.block.dimension.spawnItem(new ItemStack("minecraft:paper"), lootLocation);
  }
}

// Release paper on block break and explode
world.afterEvents.playerBreakBlock.subscribe((e) => {
  if (e.brokenBlockPermutation.type.id !== "wiki:pigeonholes") return;
  releasePaper(e);
});
world.afterEvents.blockExplode.subscribe((e) => {
  if (e.explodedBlockPermutation.type.id !== "wiki:pigeonholes") return;
  releasePaper(e);
});
