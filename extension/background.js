// Service worker — minimal in MV3.
// Tab capture and recording run in popup.js directly.
// This file is required by the manifest.

chrome.runtime.onInstalled.addListener(() => {
  console.log("NOTTURA installed.");
});
