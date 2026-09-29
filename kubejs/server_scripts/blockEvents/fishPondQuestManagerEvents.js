BlockEvents.rightClicked("society:fish_pond_manager", (e) => {
  const { item, hand, player, level, block } = e;
  if (hand !== "MAIN_HAND" || item.id !== "create:clipboard") return;
  global.addItemCooldown(player, item, 10);
  player.swing();
  let pages = global.getQuestItems(block, level);
  if (!pages) return;
  let requests = [];
  for (let page of pages) {
    for (let entry of page.Entries) {
      requests.push({ item: entry.Item, count: Number(entry.Count) });
    }
  }
  global.appendFishPondRequestsToClipboard(item, requests);
  e.cancel();
});
