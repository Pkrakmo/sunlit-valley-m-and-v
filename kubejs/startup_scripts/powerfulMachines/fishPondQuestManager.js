//priority: 100
console.info("[SOCIETY] fishPondQuestManager.js loaded");


global.handleManagerQuestSubmission = (entity, fishPondPos, attachedPlayer, delay) => {
  const { level, block, inventory } = entity;
  const server = level.server;

  server.scheduleInTicks(delay, () => {
    const fishPond = level.getBlock(fishPondPos);
    const { x, y, z } = fishPond;
    const nbt = fishPond.getEntityData();

    if (!nbt || !nbt.data) {
      return;
    }

    const { type: fishType, max_population, quest_id } = nbt.data;
    const { facing, valid, mature, upgraded, quest } =
      global.getPondProperties(fishPond);


    if (quest === "true" && global.fishPondDefinitions.get(`${fishType}`)) {
      const questContent = getRequestedItems(fishType, Number(max_population))[quest_id];

      if (!questContent) {
        return;
      }

      let checkedCount = attachedPlayer.stages.has("pond_house_five") ?
        Math.round(questContent.count / 2) :
        questContent.count;

      if (global.hasInventoryItems(inventory, questContent.item, checkedCount)) {

        successParticles(level, fishPond);
        fishPond.set(fishPond.id, {
          facing: facing,
          valid: valid,
          mature: mature,
          upgraded: upgraded,
          quest: false,
        });

        nbt.merge({
          data: {
            quest_id: 0,
            max_population: increaseStage(max_population, Number(max_population) === 7 ? 3 : 2),
          },
        });
        fishPond.setEntityData(nbt);
        global.inventoryUseItems(inventory, questContent.item, checkedCount);

        level.spawnParticles(
          "species:ascending_dust",
          true,
          x,
          y + 1,
          z,
          0.2 * rnd(1, 1.5),
          0.2 * rnd(1, 1.5),
          0.2 * rnd(1, 1.5),
          3,
          0.01
        );
      }
    }
  });
}

global.getQuestItems = (block, level) => {
  let requestedItems = [];
  const { x, y, z } = block;
  let attachedPlayer;
  const ownerUuid = block.getEntityData().data.owner;

  if (ownerUuid === "-1") return;

  for (const p of level.getServer().players) {
    if (p.getUuid().toString() === ownerUuid) {
      attachedPlayer = p;
      break;
    }
  }

  if (attachedPlayer) {
    let radius = 10;
    let scanBlock;
    for (let pos of BlockPos.betweenClosed(new BlockPos(x - radius, y - radius, z - radius),
      [x + radius, y + radius, z + radius])) {
      scanBlock = level.getBlock(pos);
      if (scanBlock.id === "society:fish_pond") {
        const questContent = global.getFishPondQuestRequest(scanBlock, attachedPlayer);
        if (questContent) requestedItems.push(questContent);
      }
    }
  }

  const groupedMap = new Map();
  for (let i = 0; i < requestedItems.length; i++) {
    let entry = requestedItems[i];
    groupedMap.set(entry.item, (groupedMap.get(entry.item) || 0) + entry.count);
  }

  const entries = [];
  groupedMap.forEach(function (count, item) {
    entries.push(global.getFishPondClipboardEntry(item, count));
  });

  const pageSize = 6;
  let pages = [];
  for (let i = 0; i < entries.length; i += pageSize) {
    pages.push({ Entries: entries.slice(i, i + pageSize) });
  }

  return pages;
}

global.getFishPondQuestRequest = (block, player) => {
  const nbt = block.getEntityData();
  if (!nbt || !nbt.data) return;

  const { type: fishType, max_population, quest_id } = nbt.data;
  const { quest } = global.getPondProperties(block);
  const fishDefinition = global.fishPondDefinitions.get(`${fishType}`);
  if (quest !== "true" || !fishDefinition) return;

  const fishQuest = fishDefinition.quests.find(
    (candidate) => Number(candidate.population) === Number(max_population)
  );
  if (!fishQuest || !fishQuest.requestedItems) return;
  const request = fishQuest.requestedItems[Number(quest_id)];
  if (!request) return;

  return {
    item: request.item,
    count: player.stages.has("pond_house_five") ?
      Math.round(request.count / 2) :
      request.count,
  };
};

global.getFishPondClipboardEntry = (itemId, count) => {
  const item = Item.of(itemId);
  const namespace = item.id.split(":")[0];
  let modName = namespace;
  const mod = Platform.getMods()[namespace];
  if (mod) modName = mod.name;

  return {
    Checked: "0b",
    Count: count,
    Item: item.id,
    Text: JSON.stringify({ text: `${count} x ${item.displayName.string} (${modName})` }),
  };
};

global.appendFishPondRequestsToClipboard = (clipboard, requests) => {
  const clipboardNbt = clipboard.nbt || {};
  const pages = [];
  const recordedItemIds = new Set();

  if (clipboardNbt.Pages) {
    let storedPages = clipboardNbt.Pages;
    for (let pageIndex = 0; pageIndex < storedPages.size(); pageIndex++) {
      let storedPage = storedPages.get(pageIndex);
      let entries = [];
      if (storedPage.Entries) {
        let storedEntries = storedPage.Entries;
        for (let entryIndex = 0; entryIndex < storedEntries.size(); entryIndex++) {
          entries.push(storedEntries.get(entryIndex));
        }
      }
      pages.push({ Entries: entries });
    }
  }

  // Only entries created by this feature carry Item. Legacy text-only entries
  // remain untouched, so the first post-upgrade request may duplicate one.
  for (const page of pages) {
    if (!page.Entries) continue;
    for (const entry of page.Entries) {
      if (entry.Item) recordedItemIds.add(String(entry.Item));
    }
  }

  for (const request of requests) {
    const itemId = Item.of(request.item).id;
    if (recordedItemIds.has(itemId)) continue;

    let page = pages[pages.length - 1];
    if (!page || !page.Entries || page.Entries.length >= 6) {
      page = { Entries: [] };
      pages.push(page);
    }

    page.Entries.push(global.getFishPondClipboardEntry(itemId, request.count));
    recordedItemIds.add(itemId);
  }

  clipboardNbt.Type = 1;
  clipboardNbt.PreviouslyOpenedPage = 0;
  clipboardNbt.Pages = pages;
  clipboard.nbt = clipboardNbt;
};

global.runFishPondQuestManager = (entity) => {
  const { block, level } = entity;
  const { x, y, z } = block;
  let attachedPlayer;

  const cDayTime = level.dayTime();
  const currentMorningModulo = cDayTime % 24000;
  const questManagerProgTime = 1000;
  if (currentMorningModulo < questManagerProgTime ||
    currentMorningModulo >= questManagerProgTime + artMachineTickRate) return;

  const ownerUuid = block.getEntityData().data.owner;

  if (ownerUuid === "-1") return;

  for (const p of level.getServer().players) {
    if (p.getUuid().toString() === ownerUuid) {
      attachedPlayer = p;
      break;
    }
  }

  if (attachedPlayer) {
    const radius = 10;
    let scanBlock;
    let scannedBlocks = 0;

    for (let pos of BlockPos.betweenClosed(new BlockPos(x - radius, y - radius, z - radius),
      [x + radius, y + radius, z + radius])) {
      scanBlock = level.getBlock(pos);
      if (scanBlock.id === "society:fish_pond") {
        global.handleManagerQuestSubmission(
          entity,
          pos.immutable(),
          attachedPlayer,
          scannedBlocks * 5);
        scannedBlocks++;
      }
    }

    level.server.runCommandSilent(
      `playsound botania:spreader_fire block @a ${x} ${y} ${z}`
    )
  }
}


StartupEvents.registry("block", (event) => {
  event
    .create("society:fish_pond_manager", "cardinal")
    .tagBlock("minecraft:mineable/axe")
    .tagBlock("minecraft:needs_stone_tool")
    .defaultCutout()
    .item((item) => {
      item.tooltip(Text.translatable("block.society.fish_pond_manager.description").gray());
      item.tooltip(Text.translatable("block.society.fish_pond_manager.clipboard").gray());
      item.tooltip(Text.translatable("society.working_block_entity.apply_player_skill").gray());
      item.tooltip(Text.translatable("tooltip.society.area", `21x21x21`).green());
      item.modelJson({
        parent: "society:block/kubejs/fish_pond_manager",
      });
    })
    .soundType("copper")
    .model("society:block/kubejs/fish_pond_manager")
    .blockEntity((blockInfo) => {
      blockInfo.inventory(9, 2);
      blockInfo.initialData({ owner: "-1" });
      blockInfo.serverTick(artMachineTickRate, 0, (entity) => {
        global.runFishPondQuestManager(entity);
      });
      blockInfo.rightClickOpensInventory();
      blockInfo.attachCapability(
        CapabilityBuilder.ITEM.blockEntity()
          .insertItem((blockEntity, slot, stack, simulate) =>
            blockEntity.inventory.insertItem(slot, stack, simulate)
          )
          .extractItem((blockEntity, slot, stack, simulate) =>
            blockEntity.inventory.extractItem(slot, stack, simulate)
          )
          .getSlotLimit((blockEntity, slot) =>
            blockEntity.inventory.getSlotLimit(slot)
          )
          .getSlots((blockEntity) =>
            blockEntity.inventory.slots
          )
          .getStackInSlot((blockEntity, slot) =>
            blockEntity.inventory.getStackInSlot(slot)
          )
      );
    });
});
