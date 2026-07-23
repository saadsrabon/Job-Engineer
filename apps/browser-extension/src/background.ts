import { fetchAutofillProfile } from './lib/api';

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message.type === 'GET_CAPTURED_JOB' && _sender.tab?.id) {
    chrome.tabs.sendMessage(_sender.tab.id, { type: 'CAPTURE_JOB' }, (response) => {
      sendResponse(response);
    });
    return true;
  }

  if (message.type === 'REQUEST_AUTOFILL_PROFILE') {
    chrome.storage.local.get(['autofillProfile'], (data) => {
      sendResponse({ profile: data.autofillProfile ?? null });
    });
    return true;
  }

  if (message.type === 'REFRESH_AUTOFILL_PROFILE') {
    const { token, apiUrl } = message as { token?: string; apiUrl?: string };
    if (!token) {
      sendResponse({ error: 'Not signed in' });
      return false;
    }

    fetchAutofillProfile(token, apiUrl)
      .then((profile) => {
        chrome.storage.local.set({ autofillProfile: profile }, () => {
          sendResponse({ profile });
        });
      })
      .catch((error: Error) => sendResponse({ error: error.message }));
    return true;
  }

  return false;
});
