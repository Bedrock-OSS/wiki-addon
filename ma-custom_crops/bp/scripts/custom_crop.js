import { EquipmentSlot, GameMode, world } from "@minecraft/server";

/**
 * @param {number} min The minimum integer
 * @param {number} max The maximum integer
 * @returns {number} A random integer between the `min` and `max` parameters (inclusive)
 */
const randomInt = (min, max) =>
    Math.floor(Math.random() * (max - min + 1)) + min;

const maxGrowth = 7;

/** @type {import("@minecraft/server").BlockCustomComponent} */
const CustomCropGrowthBlockComponent = {
    onRandomTick({ block }) {
        const growthChance = 1 / 3;
        if (Math.random() > growthChance) return;

        const growth = block.permutation.getState("wiki:growth");
        block.setPermutation(
            block.permutation.withState("wiki:growth", growth + 1)
        );
    },
    onPlayerInteract({ block, dimension, player }) {
        if (!player) return;

        const equippable = player.getComponent("minecraft:equippable");
        if (!equippable) return;

        const mainhand = equippable.getEquipmentSlot(EquipmentSlot.Mainhand);
        if (!mainhand.hasItem() || mainhand.typeId !== "minecraft:bone_meal")
            return;

        if (player.getGameMode() === GameMode.creative) {
            // Grow crop fully
            block.setPermutation(block.permutation.withState("wiki:growth", 7));
        } else {
            let growth = block.permutation.getState("wiki:growth");

            // Add random amount of growth
            growth += randomInt(1, maxGrowth - growth);
            block.setPermutation(
                block.permutation.withState("wiki:growth", growth)
            );

            // Decrement stack
            if (mainhand.amount > 1) mainhand.amount--;
            else mainhand.setItem(undefined);
        }

        // Play effects
        const effectLocation = block.center();
        dimension.playSound("item.bone_meal.use", effectLocation);
        dimension.spawnParticle(
            "minecraft:crop_growth_emitter",
            effectLocation
        );
    },
};

world.beforeEvents.worldInitialize.subscribe(({ blockComponentRegistry }) => {
    blockComponentRegistry.registerCustomComponent(
        "wiki:custom_crop_growth",
        CustomCropGrowthBlockComponent
    );
});
