#Auto-add Objectives
scoreboard objectives add joined dummy

#On Join System
scoreboard players add @a joined 0
execute as @a [scores={joined=0}] at @s run function lobby/on_join
scoreboard players reset * joined
scoreboard players set @a joined 1