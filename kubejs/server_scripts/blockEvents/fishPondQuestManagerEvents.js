BlockEvents.rightClicked("society:fish_pond_manager", (e) => {
  const { item, hand, player, level, block } = e;
  if (hand !== "MAIN_HAND" || item !== "create:clipboard") return;
  global.addItemCooldown(player, item, 10);
  player.swing();
  const pages = global.getQuestItems(block, level);
  if (!pages) return;
  const requests = [];
  for (const page of pages) {
    for (const entry of page.Entries) {
      requests.push({ item: entry.Item, count: Number(entry.Count) });
    }
  }
  global.appendFishPondRequestsToClipboard(item, requests);
  e.cancel();
});
