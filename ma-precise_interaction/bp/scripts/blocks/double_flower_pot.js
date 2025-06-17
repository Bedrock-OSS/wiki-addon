import { system, ItemStack, EquipmentSlot, GameMode } from "@minecraft/server";
import SelectionBoxes from "../utilities/selection_boxes"; // Import the SelectionBoxes class to use it

// Support orientation along both horizontal axes
const pots = {
    x: new SelectionBoxes(
        { origin: [-7, 0, -3], size: [6, 6, 6] },
        { origin: [1, 0, -3], size: [6, 6, 6] }
    ),
    z: new SelectionBoxes(
        { origin: [-3, 0, -7], size: [6, 6, 6] },
        { origin: [-3, 0, 1], size: [6, 6, 6] }
    ),
};

// The state value and sound associated with each plant
const plants = {
    "minecraft:dandelion": {
        value: "dandelion",
        sound: "dig.grass",
    },
    "minecraft:cactus": {
        value: "cactus",
        sound: "dig.cloth",
    },
};

const getAxis = (direction) =>
    direction === "west" || direction === "east" ? "z" : "x";

// Get the selected pot for the appropriate axis
function getSelectedPot(block, faceLocation) {
    const direction = block.permutation.getState(
        "minecraft:cardinal_direction"
    );
    const axis = getAxis(direction);

    return pots[axis].getSelected(faceLocation);
}

const isPotOccupied = (block, pot) =>
    block.permutation.getState(`wiki:pot_${pot}_plant`) !== "none";

const setPotPlant = (block, pot, plant) =>
    block.setPermutation(
        block.permutation.withState(`wiki:pot_${pot}_plant`, plant)
    );

/** @type {import("@minecraft/server").BlockCustomComponent} */
const BlockDoubleFlowerPotComponent = {
    onPlayerInteract({ block, dimension, faceLocation, player }) {
        if (!player) return;

        const equippable = player.getComponent("minecraft:equippable");
        if (!equippable) return;

        const mainhand = equippable.getEquipmentSlot(EquipmentSlot.Mainhand);

        const selectedPot = getSelectedPot(block, faceLocation);
        if (selectedPot === undefined) return;

        if (mainhand.hasItem() && !isPotOccupied(block, selectedPot)) {
            const plant = plants[mainhand.typeId];
            if (!plant) return;

            if (player.getGameMode() !== GameMode.creative) {
                if (mainhand.amount > 1) mainhand.amount--;
                else mainhand.setItem(undefined);
            }

            setPotPlant(block, selectedPot, plant.value);
            dimension.playSound(plant.sound, block.center(), { volume: 0.5 });
        } else if (!mainhand.hasItem() && isPotOccupied(block, selectedPot)) {
            const plantValue = block.permutation.getState(
                `wiki:pot_${selectedPot}_plant`
            );
            const plantId = Object.keys(plants).find(
                (key) => plants[key].value === plantValue
            );

            setPotPlant(block, selectedPot, "none");
            dimension.playSound("random.pop", block.center());

            mainhand.setItem(new ItemStack(plantId));
        }
    },
    onPlayerBreak: releasePlants,
};

system.beforeEvents.startup.subscribe(({ blockComponentRegistry }) => {
    blockComponentRegistry.registerCustomComponent(
        "wiki:double_flower_pot",
        BlockDoubleFlowerPotComponent
    );
});

// -------------------------------
//  Release plants on destruction
// -------------------------------
function releasePlants({ block, brokenBlockPermutation, dimension }) {
    const states = brokenBlockPermutation.getAllStates();

    // Array of plant state values e.g. ["cactus", "dandelion"]
    const storedPlants = Object.entries(states)
        .filter(
            ([state, value]) => state.startsWith("wiki:pot") && value !== "none"
        )
        .map(([state, value]) => value);

    if (storedPlants.length === 0) return;

    // Create an item entity for every potted plant
    for (const plant of storedPlants) {
        const plantId = Object.keys(plants).find(
            (key) => plants[key].value === plant
        );

        dimension.spawnItem(new ItemStack(plantId), block.center());
    }
}
