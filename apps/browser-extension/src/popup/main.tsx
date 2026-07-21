import { StrictMode, useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';

interface CapturedJob {
  title: string;
  company: string;
  location?: string;
  url: string;
  description?: string;
}

const DEFAULT_API = 'http://localhost:3001';

function Popup() {
  const [apiUrl, setApiUrl] = useState(DEFAULT_API);
  const [token, setToken] = useState('');
  const [job, setJob] = useState<CapturedJob | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    chrome.storage.sync.get(['apiUrl', 'token'], (data) => {
      if (data.apiUrl) setApiUrl(data.apiUrl);
      if (data.token) setToken(data.token);
    });
  }, []);

  const saveSettings = () => {
    chrome.storage.sync.set({ apiUrl, token });
    setStatus('Settings saved');
  };

  const captureJob = () => {
    setLoading(true);
    setStatus(null);
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const tabId = tabs[0]?.id;
      if (!tabId) {
        setStatus('No active tab');
        setLoading(false);
        return;
      }
      chrome.tabs.sendMessage(tabId, { type: 'CAPTURE_JOB' }, (response) => {
        setLoading(false);
        if (chrome.runtime.lastError) {
          setStatus('Reload the page after installing the extension.');
          return;
        }
        setJob(response?.job ?? null);
        if (!response?.job) setStatus('Could not detect job details on this page.');
      });
    });
  };

  const saveJob = async () => {
    if (!job || !token.trim()) {
      setStatus('Add your API token in settings first.');
      return;
    }
    setLoading(true);
    setStatus(null);
    try {
      const res = await fetch(`${apiUrl.replace(/\/$/, '')}/api/v1/jobs`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token.trim()}`,
        },
        body: JSON.stringify({
          title: job.title,
          company: job.company,
          location: job.location,
          url: job.url,
          description: job.description,
          source: 'browser-extension',
        }),
      });
      if (!res.ok) throw new Error(await res.text());
      setStatus('Saved to JobOS pipeline');
    } catch (err) {
      setStatus(err instanceof Error ? err.message : 'Failed to save job');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ width: 340, padding: 16, fontFamily: 'system-ui', color: '#fafafa' }}>
      <h1 style={{ fontSize: 18, fontWeight: 600, margin: 0 }}>JobOS</h1>
      <p style={{ fontSize: 13, color: '#a1a1aa', marginTop: 6 }}>
        Capture job postings into your pipeline.
      </p>

      <label style={{ display: 'block', marginTop: 12, fontSize: 12 }}>API URL</label>
      <input
        value={apiUrl}
        onChange={(e) => setApiUrl(e.target.value)}
        style={{ width: '100%', marginTop: 4, padding: 8, borderRadius: 8, border: '1px solid #3f3f46' }}
      />

      <label style={{ display: 'block', marginTop: 10, fontSize: 12 }}>Bearer token</label>
      <input
        type="password"
        value={token}
        onChange={(e) => setToken(e.target.value)}
        placeholder="Clerk session token"
        style={{ width: '100%', marginTop: 4, padding: 8, borderRadius: 8, border: '1px solid #3f3f46' }}
      />

      <button
        type="button"
        onClick={saveSettings}
        style={{ marginTop: 8, fontSize: 12, color: '#34d399', background: 'none', border: 'none', cursor: 'pointer' }}
      >
        Save settings
      </button>

      <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
        <button
          type="button"
          onClick={captureJob}
          disabled={loading}
          style={{
            flex: 1,
            padding: '10px 12px',
            borderRadius: 10,
            border: '1px solid #3f3f46',
            background: '#18181b',
            color: '#fafafa',
            cursor: 'pointer',
          }}
        >
          Capture page
        </button>
        <button
          type="button"
          onClick={saveJob}
          disabled={loading || !job}
          style={{
            flex: 1,
            padding: '10px 12px',
            borderRadius: 10,
            border: 'none',
            background: '#34d399',
            color: '#052e1f',
            fontWeight: 600,
            cursor: job ? 'pointer' : 'not-allowed',
          }}
        >
          Save to JobOS
        </button>
      </div>

      {job && (
        <div style={{ marginTop: 14, padding: 12, borderRadius: 10, background: '#18181b', fontSize: 12 }}>
          <p style={{ margin: 0, fontWeight: 600 }}>{job.title}</p>
          <p style={{ margin: '4px 0 0', color: '#a1a1aa' }}>
            {job.company}
            {job.location ? ` · ${job.location}` : ''}
          </p>
        </div>
      )}

      {status && (
        <p style={{ marginTop: 12, fontSize: 12, color: status.includes('Saved') ? '#34d399' : '#fca5a5' }}>
          {status}
        </p>
      )}
    </div>
  );
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Popup />
  </StrictMode>,
);
