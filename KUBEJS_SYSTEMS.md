# KubeJS systems map

Use this map to find the primary owner of a gameplay feature before changing
its adjacent registration, server behavior, or client presentation. Startup
scripts define registries and custom content; server scripts implement reloadable
gameplay behavior; client scripts provide tooltips, JEI integration, and visuals.

## Economy and shipping

Primary ownership lives in `kubejs/startup_scripts/globalRegistry.js`, where
`global.trades` and sell multipliers define prices. Shipping-bin behavior is in
`globalShippingBinHandlers.js`; custom bin and monitor blocks are under
`startup_scripts/powerfulMachines/`, while placement, naming, opening, and loot
handling are in `server_scripts/blockEvents/` and `server_scripts/loot/`.

When changing prices or sellability, review the trade registry, shipping-bin
handlers, multiplier tags, and `client_scripts/tooltips/addPriceTooltips.js`.
Jade data is registered in `startup_scripts/registration/registerJadeData.js`.

## Artisan and powerful machines

Machine recipes and definitions are owned by `globalArtisanMachineDefinitions.js`
and the relevant `startup_scripts/customMachines/` or
`startup_scripts/powerfulMachines/` script. Shared persistence and ticking
helpers are in `globalBlockEntityHandlers.js` and related global helpers.

New or changed machines may also need startup registration, server placement or
break handling, recipe/tag updates, Jade providers in `registerJadeData.js`, and
JEI/client presentation in `kubejs/client_scripts/`.

## Farming, animals, fishing, and fish ponds

Farming and animal state is centered on `globalAnimalHandlers.js`, with entity
and interaction behavior under `server_scripts/entities/` and
`server_scripts/blockEvents/`. Fish data is shared by `globalRegistry.js` and
`globalFish.js`; pond definitions are in `fishPondDefinitions.js`, and the pond
block is implemented in `customMachines/fishPond.js`.

Fish-pond requests and rewards cross into `server_scripts/blockEvents/checkFishPond.js`,
`fishPondQuestManagerEvents.js`, and `itemEvents/validateFishPondQuests.js`.
Review Jade registration and pond tooltips whenever pond state, outputs, or
player-facing wording changes.

## NPCs, recipes, tags, and client presentation

NPC dialogue and data generation are under `server_scripts/datagen/npcs/`, with
runtime NPC mechanics in `server_scripts/npcs/`. Recipes and removals belong in
`server_scripts/recipes/`; item, block, and fluid classification is maintained
under `server_scripts/tags/`. Keep recipe outputs, tags, trade data, quest goals,
and tooltips in sync.

Client-facing changes belong in `client_scripts/`, including `tooltips/`,
`lootJEI.js`, and Ponder content. Common Jade registration remains a startup
concern in `registration/registerJadeData.js`.

## Quests

FTB Quest chapters, data, and reward tables are stored in `config/ftbquests/`.
Treat them as authored pack data, not generated runtime state. Fish-pond quest
mechanics use both this quest data and the fish-pond scripts above, so validate
the in-game request and completion flow after changing either side.
