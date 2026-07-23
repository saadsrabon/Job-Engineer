import type { JobAssistantResult } from '../lib/types';
import { CONFIG } from '../lib/config';

interface AssistantResultsProps {
  result: JobAssistantResult;
  onCopy: (label: string) => void;
}

function ChipList({ items }: { items: string[] }) {
  if (items.length === 0) return <p className="assistant__empty">None identified</p>;
  return (
    <div className="assistant__chips">
      {items.slice(0, 8).map((item) => (
        <span key={item} className="assistant__chip">
          {item}
        </span>
      ))}
    </div>
  );
}

function CopyBlock({
  title,
  text,
  onCopy,
}: {
  title: string;
  text: string;
  onCopy: (label: string) => void;
}) {
  return (
    <section className="assistant__section">
      <div className="assistant__section-head">
        <h3>{title}</h3>
        <button type="button" className="assistant__copy" onClick={() => onCopy(title)}>
          Copy
        </button>
      </div>
      <pre className="assistant__text">{text}</pre>
    </section>
  );
}

export function AssistantResults({ result, onCopy }: AssistantResultsProps) {
  const focusTopics = [
    ...(result.analysis?.requiredSkills.slice(0, 4) ?? []),
    ...(result.ats?.missingSkills.slice(0, 4) ?? []),
    ...(result.analysis?.keywords.slice(0, 4) ?? []),
  ].filter((value, index, array) => array.indexOf(value) === index);

  const topQuestions = result.questions.questions.slice(0, 5);

  return (
    <div className="assistant">
      {result.errors?.length ? (
        <section className="assistant__section assistant__errors">
          <h3>Some AI steps failed</h3>
          <ul className="assistant__list">
            {result.errors.map((error) => (
              <li key={error}>{error}</li>
            ))}
          </ul>
        </section>
      ) : null}

      {result.ats ? (
        <>
          <div className="assistant__score">
            <div>
              <p className="assistant__score-label">Resume fit</p>
              <p className="assistant__score-value">{result.ats.score}/100</p>
            </div>
            <a
              className="assistant__open"
              href={`${CONFIG.syncHost}/dashboard/jobs/${result.job.id}`}
              target="_blank"
              rel="noreferrer"
            >
              Open in JobOS
            </a>
          </div>

          <section className="assistant__section">
            <h3>Resume suggestions</h3>
            <p className="assistant__summary">{result.ats.summary}</p>
            <ul className="assistant__list">
              {result.ats.recommendations.slice(0, 4).map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </section>
        </>
      ) : null}

      {result.analysis ? (
        <section className="assistant__section">
          <h3>Focus topics</h3>
          <p className="assistant__summary">{result.analysis.summary}</p>
          <ChipList items={focusTopics} />
        </section>
      ) : null}

      {result.coverLetter ? (
        <CopyBlock title="Cover letter" text={result.coverLetter} onCopy={onCopy} />
      ) : null}

      {result.email.subject || result.email.body ? (
        <CopyBlock
          title="Networking email"
          text={`Subject: ${result.email.subject}\n\n${result.email.body}`}
          onCopy={onCopy}
        />
      ) : null}

      <section className="assistant__section">
        <div className="assistant__section-head">
          <h3>Interview questions</h3>
          {result.questions.matchedCompany ? (
            <span className="assistant__meta">{result.questions.matchedCompany.name}</span>
          ) : null}
        </div>
        {topQuestions.length > 0 ? (
          <ol className="assistant__questions">
            {topQuestions.map((question) => (
              <li key={question.id}>{question.question}</li>
            ))}
          </ol>
        ) : (
          <p className="assistant__empty">
            No company-specific questions yet. Add more interview data in JobOS or practice general
            topics from the dashboard.
          </p>
        )}
      </section>
    </div>
  );
}
