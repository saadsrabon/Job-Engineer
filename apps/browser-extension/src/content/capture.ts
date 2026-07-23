import type { AutofillProfile } from '../lib/types';
import { autofillForm, setupAutofillUi } from './autofill';
import { extractJobFromPage } from './parsers';

let cachedProfile: AutofillProfile | null = null;

async function runAutofill(profile = cachedProfile) {
  if (!profile) {
    return { filled: 0, error: 'Sign in to JobOS and open the extension popup first.' };
  }
  const filled = autofillForm(profile);
  return { filled };
}

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message.type === 'CAPTURE_JOB') {
    extractJobFromPage().then((job) => sendResponse({ job }));
    return true;
  }

  if (message.type === 'AUTOFILL_FORM') {
    cachedProfile = message.profile as AutofillProfile;
    runAutofill(cachedProfile).then(sendResponse);
    return true;
  }

  if (message.type === 'SET_AUTOFILL_PROFILE') {
    cachedProfile = message.profile as AutofillProfile;
    sendResponse({ ok: true });
    return false;
  }

  return false;
});

setupAutofillUi(async () => {
  if (!cachedProfile) {
    const response = await chrome.runtime.sendMessage({ type: 'REQUEST_AUTOFILL_PROFILE' });
    if (response?.profile) cachedProfile = response.profile as AutofillProfile;
  }
  return runAutofill(cachedProfile || undefined);
});

export { extractJobFromPage };
