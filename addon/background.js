/* globals PouchDB */
const db = new PouchDB("copy-keeper");

browser.contextMenus.create({
  id: "copy-keeper",
  title: "Save selection to Copy Keeper...",
  contexts: ["selection"],
  documentUrlPatterns: ["<all_urls>"]
});

browser.browserAction.onClicked.addListener(async () => {
  browser.sidebarAction.open();
});

browser.contextMenus.onClicked.addListener(async (info, tab) => {
  browser.tabs.sendMessage(tab.id, {
    type: "start-copy"
  });
});

browser.runtime.onMessage.addListener((message, source) => {
  if (message.type === "copy") {
    let doc = {...message};
    delete doc.type;
    doc._id = `copy-${Date.now()}`;
    db.put(doc);
  } else if (message.type === "openInTab") {
    let url = browser.extension.getURL("sidebar.html");
    browser.tabs.create({url, active: true});
  } else {
    console.error("Unexpected message type:", message.type);
  }
});
