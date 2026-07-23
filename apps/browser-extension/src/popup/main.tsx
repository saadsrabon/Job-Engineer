import {
  ClerkProvider,
  SignInButton,
  UserButton,
  useAuth,
} from '@clerk/chrome-extension';
import { StrictMode, useCallback, useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { fetchAutofillProfile, fetchAiProvider, runJobAssistant, saveJob } from '../lib/api';
import { assertConfig, CONFIG } from '../lib/config';
import type { AiProviderInfo, CapturedJob, JobAssistantResult } from '../lib/types';
import { AssistantResults } from './assistant-results';
import './popup.css';

function PopupContent() {
  const { getToken, isSignedIn } = useAuth();
  const [apiUrl, setApiUrl] = useState(CONFIG.apiUrl);
  const [job, setJob] = useState<CapturedJob | null>(null);
  const [assistant, setAssistant] = useState<JobAssistantResult | null>(null);
  const [providerInfo, setProviderInfo] = useState<AiProviderInfo | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const refreshProfile = useCallback(async () => {
    const token = await getToken();
    if (!token) return;

    await chrome.runtime.sendMessage({
      type: 'REFRESH_AUTOFILL_PROFILE',
      token,
      apiUrl,
    });
  }, [apiUrl, getToken]);

  useEffect(() => {
    chrome.storage.sync.get(['apiUrl'], (data) => {
      if (data.apiUrl) setApiUrl(data.apiUrl);
    });
  }, []);

  useEffect(() => {
    if (!isSignedIn) return;
    refreshProfile().catch(() => undefined);
    getToken()
      .then((token) => (token ? fetchAiProvider(token, apiUrl) : null))
      .then((info) => info && setProviderInfo(info))
      .catch(() => undefined);
  }, [isSignedIn, refreshProfile, getToken, apiUrl]);

  const saveSettings = () => {
    chrome.storage.sync.set({ apiUrl });
    setStatus('Settings saved');
  };

  const withActiveTab = (handler: (tabId: number) => void) => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const tabId = tabs[0]?.id;
      if (!tabId) {
        setStatus('No active tab');
        setLoading(false);
        return;
      }
      handler(tabId);
    });
  };

  const captureJob = () => {
    setLoading(true);
    setStatus(null);
    setAssistant(null);
    withActiveTab((tabId) => {
      chrome.tabs.sendMessage(tabId, { type: 'CAPTURE_JOB' }, (response) => {
        setLoading(false);
        if (chrome.runtime.lastError) {
          setStatus('Reload the page after installing or updating the extension.');
          return;
        }
        setJob(response?.job ?? null);
        if (!response?.job) setStatus('Could not detect job details on this page.');
        else setStatus(`Captured from ${response.job.source || 'page'}`);
      });
    });
  };

  const saveOnly = async () => {
    if (!job) return;
    setLoading(true);
    setStatus(null);
    try {
      const token = await getToken();
      if (!token) throw new Error('Sign in to JobOS first.');
      await saveJob(job, token, apiUrl);
      setStatus('Saved to JobOS pipeline');
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'Failed to save job');
    } finally {
      setLoading(false);
    }
  };

  const analyzeAndAssist = async () => {
    if (!job) return;
    setLoading(true);
    setStatus('Saving job and generating AI assist…');
    setAssistant(null);
    try {
      const token = await getToken();
      if (!token) throw new Error('Sign in to JobOS first.');
      const result = await runJobAssistant(job, token, apiUrl);
      setAssistant(result);
      setStatus(
        result.errors?.length
          ? `Partial AI assist — ${result.errors.length} step(s) failed`
          : 'AI assist ready — review suggestions below',
      );
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'AI assist failed');
    } finally {
      setLoading(false);
    }
  };

  const autofillPage = async () => {
    setLoading(true);
    setStatus(null);
    try {
      const token = await getToken();
      if (!token) throw new Error('Sign in to JobOS first.');

      const profile = await fetchAutofillProfile(token, apiUrl);
      await chrome.storage.local.set({ autofillProfile: profile });

      withActiveTab((tabId) => {
        chrome.tabs.sendMessage(
          tabId,
          { type: 'AUTOFILL_FORM', profile },
          (response) => {
            setLoading(false);
            if (chrome.runtime.lastError) {
              setStatus('Reload the application page and try again.');
              return;
            }
            setStatus(
              response?.filled
                ? `Auto-filled ${response.filled} field${response.filled === 1 ? '' : 's'} (many ATS forms block extensions)`
                : 'Auto-fill found no matching fields — use AI assist instead',
            );
          },
        );
      });
    } catch (error) {
      setLoading(false);
      setStatus(error instanceof Error ? error.message : 'Auto-fill failed');
    }
  };

  const copyText = async (label: string) => {
    if (!assistant) return;
    const blocks: Record<string, string> = {
      'Cover letter': assistant.coverLetter,
      'Networking email': `Subject: ${assistant.email.subject}\n\n${assistant.email.body}`,
    };
    const text = blocks[label];
    if (!text) return;
    await navigator.clipboard.writeText(text);
    setStatus(`Copied ${label.toLowerCase()}`);
  };

  return (
    <div className="popup">
      <header className="popup__header">
        <div>
          <h1 className="popup__title">JobOS</h1>
          <p className="popup__subtitle">Capture jobs and get AI application assist.</p>
        </div>
        {isSignedIn ? <UserButton /> : null}
      </header>

      {!isSignedIn ? (
        <div className="popup__card">
          <p className="popup__hint">
            Sign in with your JobOS account. If you already signed in on the web app, reopen this
            popup to sync your session.
          </p>
          <SignInButton mode="modal">
            <button type="button" className="popup__button popup__button--primary">
              Sign in to JobOS
            </button>
          </SignInButton>
          <button
            type="button"
            className="popup__link"
            onClick={() => chrome.tabs.create({ url: `${CONFIG.syncHost}/sign-in` })}
          >
            Open web sign-in
          </button>
        </div>
      ) : (
        <>
          <label className="popup__label">API URL</label>
          <input
            className="popup__input"
            value={apiUrl}
            onChange={(event) => setApiUrl(event.target.value)}
          />
          <button type="button" className="popup__link" onClick={saveSettings}>
            Save settings
          </button>

          {providerInfo ? (
            <p className="popup__provider">
              AI: {providerInfo.provider}
              {providerInfo.baseUrlHost ? ` · ${providerInfo.baseUrlHost}` : ''}
              {providerInfo.defaultModel ? ` · ${providerInfo.defaultModel}` : ''}
              {!providerInfo.configured ? ' · not configured' : ''}
            </p>
          ) : null}

          <div className="popup__actions">
            <button
              type="button"
              className="popup__button"
              onClick={captureJob}
              disabled={loading}
            >
              Capture page
            </button>
            <button
              type="button"
              className="popup__button"
              onClick={saveOnly}
              disabled={loading || !job}
            >
              Save only
            </button>
          </div>

          <button
            type="button"
            className="popup__button popup__button--wide popup__button--primary"
            onClick={analyzeAndAssist}
            disabled={loading || !job}
          >
            Save & get AI assist
          </button>

          <button
            type="button"
            className="popup__button popup__button--wide popup__button--ghost"
            onClick={autofillPage}
            disabled={loading}
          >
            Try auto-fill (experimental)
          </button>

          {job && (
            <div className="popup__preview">
              <p className="popup__preview-title">{job.title}</p>
              <p className="popup__preview-meta">
                {job.company}
                {job.location ? ` · ${job.location}` : ''}
                {job.source ? ` · ${job.source}` : ''}
              </p>
            </div>
          )}

          {assistant ? <AssistantResults result={assistant} onCopy={copyText} /> : null}
        </>
      )}

      {status && (
        <p
          className={`popup__status ${
            status.includes('Saved') ||
            status.includes('ready') ||
            status.includes('Captured') ||
            status.includes('Copied')
              ? 'popup__status--ok'
              : ''
          }`}
        >
          {status}
        </p>
      )}
    </div>
  );
}

function App() {
  try {
    assertConfig();
  } catch (error) {
    return (
      <div className="popup">
        <p className="popup__status">{error instanceof Error ? error.message : 'Missing config'}</p>
      </div>
    );
  }

  return (
    <ClerkProvider
      publishableKey={CONFIG.clerkPublishableKey}
      syncHost={CONFIG.syncHost}
      afterSignOutUrl="/"
    >
      <PopupContent />
    </ClerkProvider>
  );
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
