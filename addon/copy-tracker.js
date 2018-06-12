document.addEventListener("copy", (event) => {
  let selection = window.getSelection();
  let anchorNode = getElement(selection.anchorNode);
  let focusNode = getElement(selection.focusNode);
  let startPosition = selection.getRangeAt(0).getBoundingClientRect();
  let closestId = findClosestId(startPosition.top);
  let rect = findBlockParent(anchorNode).getBoundingClientRect();
  if (focusNode && focusNode !== anchorNode) {
    rect = rectSum(rect, findBlockParent(focusNode).getBoundingClientRect());
  }
  if (rect.height < 30) {
    rect.top -= 30;
    rect.bottom += 30;
    rect.height += rect.bottom - rect.top;
  }
  let docTitle = document.title;
  let ogTitleEl = document.querySelector("meta[name='og:title'], meta[name='twitter:title']");
  if (ogTitleEl) {
    docTitle = ogTitleEl.getAttribute("content");
  }
  browser.runtime.sendMessage({
    type: "copy",
    text: window.getSelection().toString(),
    closestId,
    screenshot: screenshotBox(rect),
    docTitle,
    url: location.href,
    time: Date.now(),
  });
});

const ELEMENT_NODE = document.ELEMENT_NODE;

function getElement(someNode) {
  while (someNode && someNode.nodeType !== ELEMENT_NODE) {
    someNode = someNode.parentNode;
  }
  return someNode;
}

function findClosestId(y) {
  let elements = document.body.querySelectorAll("*[id]");
  let best;
  let bestPos;
  for (let element of elements) {
    let pos = element.getBoundingClientRect();
    if (pos.top < y) {
      if (bestPos === undefined || y - bestPos > y - pos.top) {
        bestPos = pos.top;
        best = element;
      }
    }
  }
  if (best) {
    return best.id;
  }
  return null;
}

const BLOCK_DISPLAYS = {
  "block": true,
  "table": true,
  "flex": true,
  "grid": true,
  "list-item": true,
};

function isBlockElement(el) {
  return !!BLOCK_DISPLAYS[getComputedStyle(el).display];
}

function findBlockParent(el) {
  while (!isBlockElement(el)) {
    el = el.parentNode;
  }
  return el;
}

function rectSum(rect1, rect2) {
  let box = {
    top: Math.min(rect1.top, rect2.top),
    bottom: Math.max(rect1.bottom, rect2.bottom),
    left: Math.min(rect1.left, rect2.left),
    right: Math.max(rect1.right, rect2.right),
  };
  box.width = box.right - box.left;
  box.height = box.bottom - box.top;
  return box;
}

function screenshotBox(box) {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  canvas.width = box.width * window.devicePixelRatio;
  canvas.height = box.height * window.devicePixelRatio;
  ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
  ctx.drawWindow(window, box.left + window.scrollX, box.top + window.scrollY, box.width, box.height, "#fff");
  return {
    url: canvas.toDataURL(),
    height: box.height,
    width: box.width,
  };
}
