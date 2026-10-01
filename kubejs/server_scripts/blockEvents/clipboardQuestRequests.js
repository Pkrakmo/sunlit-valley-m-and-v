console.info("[SOCIETY] clipboardQuestRequests.js loaded");

BlockEvents.rightClicked("society:fish_pond_manager", (event) => {
  const { item, hand, player, level, block } = event;
  if (hand !== "MAIN_HAND" || item.id !== "create:clipboard") return;

  global.addItemCooldown(player, item, 10);
  player.swing();
  const requests = global.getFishPondManagerQuestRequests(block, level);
  if (!requests) return;

  global.appendQuestRequestsToClipboard(item, requests);
  event.cancel();
});
