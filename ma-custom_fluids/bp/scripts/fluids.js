import { system, world } from "@minecraft/server";

const fluids = ["wiki:custom_fluid"];

system.runInterval(() => {
  const players = Array.from(world.getPlayers());

  for (const player of players) {
    // Fluid effects
    if (
      fluids.includes(world.getDimension(player.dimension.id).getBlock({ ...player.location, y: player.location.y + 1 }).typeId) ||
      fluids.includes(world.getDimension(player.dimension.id).getBlock(player.location).typeId)
    ) {
      player.addEffect("slowness", 1, { amplifier: 2, showParticles: false });
      player.addEffect("slow_falling", 4, { showParticles: false });
      if (player.isJumping) {
        player.addEffect("levitation", 3, { amplifier: 2, showParticles: false });
      }
    }
    // Fluid fog
    if (fluids.includes(world.getDimension(player.dimension.id).getBlock({ ...player.location, y: player.location.y + 1.63 }).typeId)) {
      player.runCommand("fog @s push wiki:custom_fluid_fog fluid_fog");
    } else {
      player.runCommand("fog @s remove fluid_fog");
    }
  }
});
