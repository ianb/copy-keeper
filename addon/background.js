browser.contextMenus.create({
  id: "copy-keeper",
  title: "Save selection to Copy Keeper...",
  contexts: ["selection"],
  documentUrlPatterns: ["<all_urls>"]
});

browser.browserAction.onClicked.addListener(async () => {
  browser.sidebar.open();
});

browser.contextMenus.onClicked.addListener(async (info, tab) => {
  browser.tabs.sendMessage(tab.id, {
    type: "start-copy"
  });
});

browser.runtime.onMessage.addListener((message, source) => {
  if (message.type === "xxx") {
  } else {
    console.error("Unexpected message type:", message.type);
  }
});
