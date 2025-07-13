import { BlockPermutation, GameMode, system, world } from "@minecraft/server"

world.beforeEvents.playerInteractWithBlock.subscribe(e => {
    if (e.block.typeId == "wiki:custom_log" && e.itemStack?.getTags().includes("minecraft:is_axe")) {
        system.run(() => {
            e.block.setPermutation(
                BlockPermutation.resolve("wiki:stripped_custom_log").withState(
                    "minecraft:block_face",
                    e.block.permutation.getState("minecraft:block_face")
                )
            )

            e.block.dimension.playSound("use.wood", e.block.location)

            if (e.player.getGameMode() != GameMode.Creative) {
                const durability = e.itemStack.getComponent("durability")
                if (durability.damage + 1 >= durability.maxDurability) {
                    e.player.getComponent("inventory").container.setItem(
                        e.player.selectedSlotIndex, null
                    )
                    e.player.playSound("random.break")
                } else {
                    durability.damage = durability.damage += 1
                    e.player.getComponent("inventory").container.setItem(
                        e.player.selectedSlotIndex, e.itemStack
                    )
                }
            }
        })
    }
})