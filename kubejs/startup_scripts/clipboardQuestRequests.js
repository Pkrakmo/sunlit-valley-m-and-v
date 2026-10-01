//priority: 100
console.info("[SOCIETY] clipboardQuestRequests.js loaded");

global.getActiveFishPondQuestRequest = (block, player) => {
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
    count: player.stages.has("pond_house_five")
      ? Math.round(request.count / 2)
      : request.count,
  };
};

global.getFishPondManagerQuestRequests = (block, level) => {
  const requestedItems = [];
  const { x, y, z } = block;
  let attachedPlayer;
  const ownerUuid = block.getEntityData().data.owner;

  if (ownerUuid === "-1") return;

  for (const player of level.getServer().players) {
    if (player.getUuid().toString() === ownerUuid) {
      attachedPlayer = player;
      break;
    }
  }

  if (attachedPlayer) {
    const radius = 10;
    for (const pos of BlockPos.betweenClosed(
      new BlockPos(x - radius, y - radius, z - radius),
      [x + radius, y + radius, z + radius]
    )) {
      const pond = level.getBlock(pos);
      if (pond.id !== "society:fish_pond") continue;

      const request = global.getActiveFishPondQuestRequest(pond, attachedPlayer);
      if (request) requestedItems.push(request);
    }
  }

  const groupedRequests = new Map();
  for (const request of requestedItems) {
    groupedRequests.set(
      request.item,
      (groupedRequests.get(request.item) || 0) + request.count
    );
  }

  const requests = [];
  groupedRequests.forEach(function (count, item) {
    requests.push({ item: item, count: count });
  });

  return requests;
};

global.getClipboardQuestEntry = (itemId, count) => {
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

global.appendQuestRequestsToClipboard = (clipboard, requests) => {
  const clipboardNbt = clipboard.nbt || {};
  const pages = [];
  const recordedEntries = new Map();

  if (clipboardNbt.Pages) {
    const storedPages = clipboardNbt.Pages;
    for (let pageIndex = 0; pageIndex < storedPages.size(); pageIndex++) {
      const storedPage = storedPages.get(pageIndex);
      const entries = [];
      if (storedPage.Entries) {
        const storedEntries = storedPage.Entries;
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
    for (let entryIndex = 0; entryIndex < page.Entries.length; entryIndex++) {
      const entry = page.Entries[entryIndex];
      if (entry.Item) {
        recordedEntries.set(String(entry.Item), {
          page: page,
          entryIndex: entryIndex,
          entry: entry,
        });
      }
    }
  }

  for (const request of requests) {
    const itemId = Item.of(request.item).id;
    const recordedEntry = recordedEntries.get(itemId);
    if (recordedEntry) {
      const refreshedEntry = global.getClipboardQuestEntry(itemId, request.count);
      refreshedEntry.Checked = recordedEntry.entry.Checked;
      recordedEntry.page.Entries[recordedEntry.entryIndex] = refreshedEntry;
      recordedEntry.entry = refreshedEntry;
      continue;
    }

    let page = pages[pages.length - 1];
    if (!page || !page.Entries || page.Entries.length >= 6) {
      page = { Entries: [] };
      pages.push(page);
    }

    page.Entries.push(global.getClipboardQuestEntry(itemId, request.count));
    recordedEntries.set(itemId, {
      page: page,
      entryIndex: page.Entries.length - 1,
      entry: page.Entries[page.Entries.length - 1],
    });
  }

  clipboardNbt.Type = 1;
  clipboardNbt.PreviouslyOpenedPage = 0;
  clipboardNbt.Pages = pages;
  clipboard.nbt = clipboardNbt;
};

global.getActivePlushieQuestRequest = (type, affection, questId) => {
  if (questId <= 0) return;

  const questList = Ingredient.of(global.plushieTraits[type].tag).itemIds;
  let questOffset = 3;
  if (questList.length < 12) questOffset = 2;
  if (questList.length > 36) questOffset = 6;

  const item = questList[affection * questOffset + Number(questId) - 1];
  return item ? { item: item, count: 1 } : undefined;
};
