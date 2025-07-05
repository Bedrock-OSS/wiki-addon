import { system, EquipmentSlot, GameMode, ItemStack } from "@minecraft/server";
import FaceSelectionPlains from "../utilities/face_selection_plains"; // Import the FaceSelectionPlains class to use it

// Slot bounds
const slots = new FaceSelectionPlains(
    { origin: [0, 0], size: [6, 8] },
    { origin: [6, 0], size: [5, 8] },
    { origin: [11, 0], size: [5, 8] },
    { origin: [0, 8], size: [6, 8] },
    { origin: [6, 8], size: [5, 8] },
    { origin: [11, 8], size: [5, 8] }
);

const isFrontFace = (block, face) =>
    block.permutation.getState("minecraft:cardinal_direction") ===
    face.toLowerCase();

const isSlotOccupied = (block, slot) =>
    block.permutation.getState(`wiki:slot_${slot}_occupied`);

const occupySlot = (block, slot) =>
    block.setPermutation(
        block.permutation.withState(`wiki:slot_${slot}_occupied`, true)
    );

const emptySlot = (block, slot) =>
    block.setPermutation(
        block.permutation.withState(`wiki:slot_${slot}_occupied`, false)
    );

function handleInteract({ block, face, faceLocation, dimension, player }) {
    if (!player || !isFrontFace(block, face)) return;

    const equippable = player.getComponent("minecraft:equippable");
    if (!equippable) return;

    const selectedSlot = slots.getSelected({ face, faceLocation });
    if (selectedSlot === undefined) return;

    const mainhand = equippable.getEquipmentSlot(EquipmentSlot.Mainhand);
    const isHoldingPaper =
        mainhand.hasItem() && mainhand.typeId === "minecraft:paper";

    if (isHoldingPaper && !isSlotOccupied(block, selectedSlot)) {
        if (player.getGameMode() !== GameMode.creative) {
            if (mainhand.amount > 1) mainhand.amount--;
            else mainhand.setItem(undefined);
        }

        occupySlot(block, selectedSlot);
        dimension.playSound("insert.chiseled_bookshelf", block.center());
    } else if (isSlotOccupied(block, selectedSlot)) {
        emptySlot(block, selectedSlot);

        const itemLocation = {
            x: block.location.x + faceLocation.x,
            y: block.location.y + faceLocation.y - 0.5,
            z: block.location.z + faceLocation.z,
        };

        dimension
            .spawnItem(new ItemStack("minecraft:paper"), itemLocation)
            .clearVelocity();

        dimension.playSound("pickup.chiseled_bookshelf", block.center());
    }
}

// ------------------------------
//  Release paper on destruction
// ------------------------------
function releasePaper({ block, brokenBlockPermutation, dimension }) {
    const states = brokenBlockPermutation.getAllStates();

    for (const state in states) {
        const value = states[state];
        const isPaper = value === true;

        if (!isPaper) continue;

        dimension.spawnItem(new ItemStack("minecraft:paper"), block.center());
    }
}

/** @type {import("@minecraft/server").BlockCustomComponent} */
const BlockPigeonholesStorageComponent = {
    onPlayerInteract: handleInteract,
    onPlayerBreak: releasePaper,
};

system.beforeEvents.startup.subscribe(({ blockComponentRegistry }) => {
    blockComponentRegistry.registerCustomComponent(
        "wiki:pigeonholes_storage",
        BlockPigeonholesStorageComponent
    );
});
