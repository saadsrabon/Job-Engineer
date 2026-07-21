chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'GET_CAPTURED_JOB' && sender.tab?.id) {
    chrome.tabs.sendMessage(sender.tab.id, { type: 'CAPTURE_JOB' }, (response) => {
      sendResponse(response);
    });
    return true;
  }
  return false;
});
