import { world, ItemStack } from "@minecraft/server"
import { system } from "@minecraft/server";
//This prevents world crash
system.beforeEvents.watchdogTerminate.subscribe(data => {
  data.cancel = true;
});

world.afterEvents.itemReleaseUse.subscribe(ev => {
    //This is for multiplayer support
    for (const player of world.getPlayers()){
    //Basic variables to get the player inventory and held item.
      let inv = player.getComponent( 'inventory' ).container
      //Our itemStack to save our item. This also saves item data.
      const itemStack = inv.getItem(player.selectedSlot);
    //If the item we're holding is our spear, we run code.
      if (itemStack?.typeId === 'wiki:iron_spear') {
        var container = player.getComponent('inventory').container
        //The new item to be given.
        var newItem =  new ItemStack("wiki:iron_spear");
        var oldItem = container?.getItem(player.selectedSlot)
        //Here's that tag!
        player.removeTag("iron_spear")
        }
        //We subscribe a tick event to detect when we have the tag and if the item has durability less than the max.
      let e = system.runInterval(() => {
      if(player.hasTag("iron_spear") && itemStack?.typeId === 'wiki:iron_spear' && itemStack?.getComponent("durability").damage <= 125) {
        player.removeTag("iron_spear")
        //This gives our saved item (newItem) +1 durability each time we pick it up.
        newItem.getComponent("durability").damage = oldItem.getComponent("durability").damage + 1;
        container.setItem(player.selectedSlot, newItem);
        //When we don't have the tag, we stop the tick event.
        if(!player.hasTag("iron_spear")){
        system.clearRun(e);
      }}
    })}
    })
