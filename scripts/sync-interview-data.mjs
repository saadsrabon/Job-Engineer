#!/usr/bin/env node
/**
 * Sync interview questions from interview-questions-bangladesh (GitHub).
 * Output: packages/interview-data/data/companies.json
 */
import { writeFileSync, mkdirSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const REPO = 'saadsrabon/interview-questions-bangladesh';
const BRANCH = 'master';
const COMPANIES_DIR = 'docs/companies';
const OUT_PATH = join(dirname(fileURLToPath(import.meta.url)), '../packages/interview-data/data/companies.json');

const SKIP_FILES = new Set(['README.md', 'beforeapplying.md', 'competitions.md', 'reverse-interview.md']);

function isValidQuestion(text) {
  if (text.length < 20) return false;
  if (text.startsWith('[!')) return false;
  if (/^#+\s/.test(text)) return false;
  if (/^\*\*/.test(text)) return false;
  if (/collected from|permission|disclosed the questions|interview bd|github\.com|all rights reserved/i.test(text)) {
    return false;
  }
  return true;
}

function slugFromFilename(filename) {
  return filename.replace(/\.md$/, '').replace(/\.draft$/, '');
}

function titleCaseFromSlug(slug) {
  return slug
    .replace(/-/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase())
    .replace(/\bBs23\b/i, 'Brain Station 23')
    .replace(/\bBkash\b/i, 'bKash');
}

function stripFrontmatter(content) {
  return content.replace(/^---[\s\S]*?---\n?/, '');
}

function splitBlocks(text) {
  return text
    .split(/\n{2,}/)
    .map((block) => block.trim())
    .filter(Boolean);
}

function isSkippableBlock(block) {
  if (block.startsWith('## ')) return true;
  if (block.startsWith('|') || block.startsWith('|-')) return true;
  if (block.startsWith('>')) return true;
  if (/^Topics Covered are:/i.test(block)) return true;
  if (/^The problems presented in this round/i.test(block)) return true;
  if (/^This round is a mixture/i.test(block)) return true;
  if (/^On average, the number/i.test(block)) return true;
  return false;
}

function stripHtml(raw) {
  return raw.replace(/<[^>]+>/g, '').trim();
}

function normalizeInterviewMarkdown(content) {
  return stripFrontmatter(content)
    .replace(/<details>\s*<summary>\s*Show Answer\s*<\/summary>\s*/gi, '\n\nShow Answer\n\n')
    .replace(/<\/details>/gi, '\n\n')
    .replace(/<\/?article>/gi, '\n\n')
    .replace(/<[^>]+>/g, '');
}

function isLikelyQuestionBlock(block) {
  const text = block.replace(/```[\s\S]*?```/g, ' ').replace(/\[[^\]]*\]\([^)]*\)/g, ' ').trim();
  if (text.length < 15) return false;
  if (/^(The correct answer|Final answer|Output:|Because |So, |Let the |Relative Speed)/i.test(text)) {
    return false;
  }
  return (
    /\?/.test(text) ||
    /\b(what|which|how|why|write|given|explain|describe|implement|find|can you|reverse|build|design|solve|rotate|format|difference)\b/i.test(
      text,
    ) ||
    /^(Mr\.|Ms\.|You are|Once upon|A train|Who is|If the|In the following|Reverse|Given|Build|Design|Solve|Explain|Describe|Implement|Write|Find|How do|What are|What is|Tell me)/i.test(
      text,
    ) ||
    /\[\*\*.*Submit Code/i.test(block) ||
    /\[\*\*.*Problem Repository/i.test(block)
  );
}

function isLikelyAnswerBlock(block) {
  const text = block.trim();
  return (
    text.startsWith('```') ||
    /^(The |In |We |Division|Final answer|Let |Output|Because|So,|When |Static |Developers |Immutable |Relative Speed|Both |Kruskal|Prim's|Agile)/i.test(
      text,
    )
  );
}

function normalizeQuestionText(raw) {
  return raw
    .replace(/\[\*\*[^\]]*\*\*\]\([^)]+\)/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function extractExternalUrl(raw) {
  const match = raw.match(/\]\((https?:\/\/[^)]+)\)/);
  return match?.[1] ?? null;
}

function cleanAnswerText(raw) {
  return raw
    .replace(/:::\s*code-group[\s\S]*?:::/g, (match) => {
      const codeMatch = match.match(/```[\w]*\n([\s\S]*?)```/);
      return codeMatch ? `\`\`\`\n${codeMatch[1]}\n\`\`\`` : '';
    })
    .replace(/<[^>]+>/g, '')
    .trim()
    .slice(0, 8000);
}

function extractQuestionFromSegment(segment) {
  const lines = segment.split('\n');
  const tailLines = [];

  for (let i = lines.length - 1; i >= 0; i--) {
    const raw = lines[i];
    const line = raw.trim();

    if (!line) {
      if (tailLines.length > 0) break;
      continue;
    }

    if (tailLines.length > 0) {
      if (line.startsWith('## ')) break;
      if (line.startsWith('>')) break;
      if (line.startsWith('|')) break;
      if (/^Topics Covered are:/i.test(line)) break;
      if (/^-\s/.test(line) && !/\?/.test(line)) break;
    }

    tailLines.unshift(raw);

    const candidate = tailLines.join('\n').trim();
    const question = normalizeQuestionText(candidate);
    if (isValidQuestion(question) && isLikelyQuestionBlock(candidate)) {
      return candidate;
    }

    if (tailLines.length > 20) break;
  }

  return null;
}

function extractAnswerFromSegment(segment) {
  const lines = segment.split('\n');
  const answerLines = [];

  for (const raw of lines) {
    const line = raw.trim();

    if (!line) {
      if (answerLines.length > 0) answerLines.push('');
      continue;
    }

    if (line.startsWith('## ')) break;

    if (answerLines.length > 0) {
      const candidate = [...answerLines, raw].join('\n').trim();
      const question = normalizeQuestionText(candidate);
      if (isLikelyQuestionBlock(candidate) && isValidQuestion(question) && !isLikelyAnswerBlock(raw)) {
        break;
      }
    }

    answerLines.push(raw);
  }

  const answer = cleanAnswerText(answerLines.join('\n'));
  return answer || null;
}

function pushQuestion(questions, seen, questionRaw, answerRaw) {
  const cleanedQuestion = stripHtml(questionRaw);
  const question = normalizeQuestionText(cleanedQuestion);
  if (!isValidQuestion(question) || !isLikelyQuestionBlock(cleanedQuestion)) return;

  const key = question.toLowerCase();
  if (seen.has(key)) return;
  seen.add(key);

  const answer = answerRaw ? cleanAnswerText(stripHtml(answerRaw)) : null;
  questions.push({
    question,
    answer: answer || null,
    externalUrl: extractExternalUrl(questionRaw),
    verified: Boolean(answer),
    topics: inferTopics(question, answer),
    order: questions.length,
  });
}

function parseArticleBlocks(rawContent, questions, seen) {
  const articleRegex = /<article>([\s\S]*?)<\/article>/gi;
  let match;

  while ((match = articleRegex.exec(rawContent)) !== null) {
    const block = match[1];
    const detailsMatch = block.match(
      /<details>\s*<summary>\s*Show Answer\s*<\/summary>\s*([\s\S]*?)<\/details>/i,
    );

    if (detailsMatch) {
      const questionPart = block.slice(0, detailsMatch.index).trim();
      pushQuestion(questions, seen, questionPart, detailsMatch[1]);
      continue;
    }

    const plainParts = block.split(/\sShow Answer\s/i);
    if (plainParts.length > 1) {
      pushQuestion(questions, seen, plainParts[0], plainParts.slice(1).join(' Show Answer '));
      continue;
    }

    const questionPart = block.replace(/<details>[\s\S]*?<\/details>/gi, '').trim();
    pushQuestion(questions, seen, questionPart, null);
  }
}

function parseBlockquoteQuestions(rawContent, questions, seen) {
  const blocks = rawContent.split(/\n(?=>)/);

  for (const block of blocks) {
    const trimmed = block.trim();
    if (!trimmed.startsWith('>')) continue;

    const lines = trimmed.split('\n');
    const questionLines = [];
    let i = 0;

    for (; i < lines.length; i++) {
      const line = lines[i];
      if (line.startsWith('>')) {
        questionLines.push(line.replace(/^>\s?/, ''));
      } else if (questionLines.length > 0) {
        break;
      }
    }

    const questionRaw = questionLines.join(' ').trim();
    if (/show answer/i.test(questionRaw)) continue;

    const rest = lines.slice(i).join('\n');
    const urlMatch = rest.match(/\]\((https?:\/\/[^)]+)\)/);
    const answerIdx = rest.search(/Show Answer/i);
    const answerRaw =
      answerIdx >= 0 ? rest.slice(answerIdx).replace(/Show Answer\s*/i, '').split(/\n>/)[0] : null;

    if (answerRaw) {
      pushQuestion(questions, seen, questionRaw, answerRaw);
    } else {
      pushQuestion(questions, seen, questionRaw, null);
    }

    if (urlMatch && questions.length > 0) {
      const last = questions[questions.length - 1];
      if (!last.externalUrl) last.externalUrl = urlMatch[1];
    }
  }
}

function parseShowAnswerSegments(content, questions, seen) {
  const body = normalizeInterviewMarkdown(content);
  const segments = body.split(/\sShow Answer\s/i);

  for (let i = 0; i < segments.length - 1; i++) {
    const questionRaw = extractQuestionFromSegment(segments[i]);
    if (!questionRaw) continue;
    pushQuestion(questions, seen, questionRaw, extractAnswerFromSegment(segments[i + 1]));
  }
}

function parseQuestionsFromContent(content) {
  const questions = [];
  const seen = new Set();

  parseArticleBlocks(content, questions, seen);
  parseBlockquoteQuestions(content, questions, seen);
  parseShowAnswerSegments(content, questions, seen);

  questions.forEach((question, index) => {
    question.order = index;
  });

  return questions;
}

function parseCompanyMarkdown(slug, content, sourceFile) {
  const titleMatch = content.match(/^#\s+(.+)$/m);
  const name = titleMatch?.[1]?.trim() || titleCaseFromSlug(slug);

  const topicsMatch = content.match(/^## Topics:?[\s\S]*?(?=^## |\Z)/m);
  const topics = topicsMatch
    ? topicsMatch[0]
        .split('\n')
        .filter((l) => l.trim().startsWith('-'))
        .map((l) => l.replace(/^-\s*/, '').trim())
    : [];

  const stagesMatch = content.match(/^## Interview Stages:?[\s\S]*?(?=^## |\Z)/m);
  const stages = stagesMatch ? stagesMatch[0].trim() : null;

  const questions = parseQuestionsFromContent(content);

  return {
    slug,
    name,
    stages,
    topics,
    techStack: [],
    sourceUrl: `https://github.com/${REPO}/blob/${BRANCH}/${COMPANIES_DIR}/${sourceFile}`,
    questions,
  };
}

function inferTopics(question, answer) {
  const text = `${question} ${answer ?? ''}`.toLowerCase();
  const tags = [];
  if (/linked list|array|tree|graph|sort|complexity|leetcode|algorithm/.test(text)) tags.push('algorithms');
  if (/oop|inheritance|polymorphism|class|object/.test(text)) tags.push('oop');
  if (/database|sql|normalization|acid|transaction/.test(text)) tags.push('database');
  if (/system design|microservice|api|rest/.test(text)) tags.push('system-design');
  if (/linux|command|shell|deadlock|os\b/.test(text)) tags.push('os');
  if (/react|javascript|typescript|frontend|backend/.test(text)) tags.push('web');
  return tags;
}

async function fetchJson(url) {
  const res = await fetch(url, {
    headers: { Accept: 'application/vnd.github+json', 'User-Agent': 'JobOS-sync' },
  });
  if (!res.ok) throw new Error(`GitHub API ${res.status}: ${url}`);
  return res.json();
}

async function fetchRaw(path) {
  const url = `https://raw.githubusercontent.com/${REPO}/${BRANCH}/${path}`;
  const res = await fetch(url, { headers: { 'User-Agent': 'JobOS-sync' } });
  if (!res.ok) throw new Error(`Fetch failed ${res.status}: ${path}`);
  return res.text();
}

async function main() {
  console.log(`Syncing from ${REPO}...`);

  const repoMeta = await fetchJson(`https://api.github.com/repos/${REPO}`);
  const commitSha = repoMeta.default_branch
    ? (await fetchJson(`https://api.github.com/repos/${REPO}/commits/${BRANCH}`)).sha
    : null;

  const listing = await fetchJson(
    `https://api.github.com/repos/${REPO}/contents/${COMPANIES_DIR}?ref=${BRANCH}`,
  );

  const companies = [];
  let totalQuestions = 0;

  for (const entry of listing) {
    if (entry.type !== 'file') continue;
    if (!entry.name.endsWith('.md')) continue;
    if (SKIP_FILES.has(entry.name) || entry.name.includes('.draft')) continue;
    if (entry.name === 'general.md') continue;

    const slug = slugFromFilename(entry.name);
    console.log(`  Parsing ${slug}...`);

    try {
      const content = await fetchRaw(entry.path);
      const parsed = parseCompanyMarkdown(slug, content, entry.name);
      if (parsed.questions.length > 0) {
        companies.push(parsed);
        totalQuestions += parsed.questions.length;
      }
    } catch (err) {
      console.warn(`  Skipped ${entry.name}:`, err.message);
    }
  }

  // General fallback company
  try {
    const generalContent = await fetchRaw(`${COMPANIES_DIR}/general.md`);
    const general = parseCompanyMarkdown('general', generalContent, 'general.md');
    if (general.questions.length > 0) {
      companies.push(general);
      totalQuestions += general.questions.length;
    }
  } catch {
    console.warn('  Could not fetch general.md');
  }

  const payload = {
    syncedAt: new Date().toISOString(),
    commitSha,
    source: `https://github.com/${REPO}`,
    license: 'GPL-3.0',
    companyCount: companies.length,
    questionCount: totalQuestions,
    companies,
  };

  mkdirSync(dirname(OUT_PATH), { recursive: true });
  writeFileSync(OUT_PATH, JSON.stringify(payload, null, 2));

  console.log(`Done: ${companies.length} companies, ${totalQuestions} questions → ${OUT_PATH}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
