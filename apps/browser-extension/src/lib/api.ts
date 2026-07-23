import { buildAutofillProfile } from './autofill-profile';
import { CONFIG } from './config';
import type {
  AiProviderInfo,
  AtsScoreResult,
  AutofillProfile,
  CapturedJob,
  CareerLibraryData,
  GeneratedEmail,
  JobAnalyzerResult,
  JobAssistantResult,
  JobSuggestedQuestions,
  SavedJob,
  UserProfile,
} from './types';

function apiBase(apiUrl = CONFIG.apiUrl) {
  return `${apiUrl.replace(/\/$/, '')}/api/v1`;
}

function parseApiError(message: string) {
  try {
    const parsed = JSON.parse(message) as { message?: string | string[] };
    if (Array.isArray(parsed.message)) return parsed.message.join(', ');
    if (parsed.message) return parsed.message;
  } catch {
    // keep raw message
  }
  return message;
}

async function apiRequest<T>(
  path: string,
  token: string,
  init: RequestInit = {},
  apiUrl = CONFIG.apiUrl,
): Promise<T> {
  const response = await fetch(`${apiBase(apiUrl)}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      ...(init.headers as Record<string, string>),
    },
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(parseApiError(message) || `API error: ${response.status}`);
  }

  const json = (await response.json()) as { data: T };
  return json.data;
}

export async function saveJob(
  job: CapturedJob,
  token: string,
  apiUrl = CONFIG.apiUrl,
): Promise<SavedJob> {
  return apiRequest<SavedJob>(
    '/jobs',
    token,
    {
      method: 'POST',
      body: JSON.stringify({
        title: job.title,
        company: job.company,
        location: job.location,
        url: job.url,
        description: job.description,
        source: job.source || 'browser-extension',
      }),
    },
    apiUrl,
  );
}

export async function fetchAutofillProfile(
  token: string,
  apiUrl = CONFIG.apiUrl,
): Promise<AutofillProfile> {
  const [user, career] = await Promise.all([
    apiRequest<UserProfile>('/users/me', token, {}, apiUrl),
    apiRequest<CareerLibraryData>('/career', token, {}, apiUrl),
  ]);

  return buildAutofillProfile(user, career);
}

export async function scoreAts(jobId: string, token: string, apiUrl = CONFIG.apiUrl) {
  return apiRequest<AtsScoreResult>(
    '/ai/ats-score',
    token,
    { method: 'POST', body: JSON.stringify({ jobId }) },
    apiUrl,
  );
}

export async function analyzeJob(jobId: string, token: string, apiUrl = CONFIG.apiUrl) {
  return apiRequest<JobAnalyzerResult>(
    '/ai/analyze-job',
    token,
    { method: 'POST', body: JSON.stringify({ jobId }) },
    apiUrl,
  );
}

export async function generateCoverLetter(jobId: string, token: string, apiUrl = CONFIG.apiUrl) {
  const result = await apiRequest<{ letter: string }>(
    '/ai/cover-letter',
    token,
    { method: 'POST', body: JSON.stringify({ jobId }) },
    apiUrl,
  );
  return result.letter;
}

export async function generateEmail(
  jobId: string,
  templateId: 'follow-up' | 'thank-you' | 'networking',
  token: string,
  apiUrl = CONFIG.apiUrl,
) {
  return apiRequest<GeneratedEmail>(
    '/email/generate',
    token,
    { method: 'POST', body: JSON.stringify({ jobId, templateId }) },
    apiUrl,
  );
}

export async function fetchSuggestedQuestions(
  jobId: string,
  token: string,
  apiUrl = CONFIG.apiUrl,
) {
  return apiRequest<JobSuggestedQuestions>(
    `/interviews/jobs/${jobId}/suggested`,
    token,
    {},
    apiUrl,
  );
}

export async function fetchAiProvider(token: string, apiUrl = CONFIG.apiUrl) {
  return apiRequest<AiProviderInfo>('/ai/provider', token, {}, apiUrl);
}

function pause(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function runJobAssistant(
  job: CapturedJob,
  token: string,
  apiUrl = CONFIG.apiUrl,
): Promise<JobAssistantResult> {
  const saved = await saveJob(job, token, apiUrl);
  const errors: string[] = [];

  // Run sequentially to avoid custom gateway concurrency limits.
  let ats: JobAssistantResult['ats'] | undefined;
  let analysis: JobAssistantResult['analysis'] | undefined;
  let coverLetter: string | undefined;
  let email: JobAssistantResult['email'] | undefined;
  let questions: JobAssistantResult['questions'] | undefined;

  try {
    ats = await scoreAts(saved.id, token, apiUrl);
  } catch (error) {
    errors.push(error instanceof Error ? error.message : 'ATS score failed');
  }

  await pause(2000);

  try {
    analysis = await analyzeJob(saved.id, token, apiUrl);
  } catch (error) {
    errors.push(error instanceof Error ? error.message : 'Job analysis failed');
  }

  await pause(2000);

  try {
    coverLetter = await generateCoverLetter(saved.id, token, apiUrl);
  } catch (error) {
    errors.push(error instanceof Error ? error.message : 'Cover letter failed');
  }

  await pause(2000);

  try {
    email = await generateEmail(saved.id, 'networking', token, apiUrl);
  } catch (error) {
    errors.push(error instanceof Error ? error.message : 'Email generation failed');
  }

  await pause(1000);

  try {
    questions = await fetchSuggestedQuestions(saved.id, token, apiUrl);
  } catch (error) {
    errors.push(error instanceof Error ? error.message : 'Interview questions failed');
  }

  if (errors.length === 5) {
    throw new Error(errors.join(' · '));
  }

  return {
    job: saved,
    ats,
    analysis,
    coverLetter: coverLetter ?? '',
    email: email ?? { template: { id: 'networking', name: 'Networking', description: '' }, subject: '', body: '' },
    questions: questions ?? {
      job: { id: saved.id, company: saved.company, title: saved.title },
      matchedCompany: null,
      questions: [],
    },
    errors: errors.length ? errors : undefined,
  };
}
