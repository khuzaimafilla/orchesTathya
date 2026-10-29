import { NextRequest, NextResponse } from 'next/server';
import fs from 'node:fs';
import path from 'node:path';

export interface SusSubmission {
  id: string;
  respondentName: string;
  respondentRole: string; // e.g., 'QA Engineer', 'Software Developer', 'Student', 'Lecturer'
  timestamp: string;
  responses: number[]; // 10 items, values 1-5
  susScore: number;
  grade: string;
  acceptability: string;
  feedback?: string;
}

const DATA_DIR = path.resolve(process.cwd(), 'data');
const SUS_FILE = path.join(DATA_DIR, 'sus_evaluation.json');

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

/**
 * Calculates standard SUS Score based on Brooke (1996)
 * Odd items: score - 1
 * Even items: 5 - score
 * Total sum * 2.5
 */
export function calculateSusScore(responses: number[]): { score: number; grade: string; acceptability: string } {
  if (!responses || responses.length !== 10) {
    throw new Error('SUS questionnaire requires exactly 10 responses (items 1-10)');
  }

  let totalPoints = 0;
  for (let i = 0; i < 10; i++) {
    const val = Number(responses[i]);
    if (isNaN(val) || val < 1 || val > 5) {
      throw new Error(`Item ${i + 1} must be an integer between 1 and 5`);
    }

    if (i % 2 === 0) {
      // Odd items (Q1, Q3, Q5, Q7, Q9 - 0-indexed: 0, 2, 4, 6, 8)
      totalPoints += val - 1;
    } else {
      // Even items (Q2, Q4, Q6, Q8, Q10 - 0-indexed: 1, 3, 5, 7, 9)
      totalPoints += 5 - val;
    }
  }

  const score = +(totalPoints * 2.5).toFixed(1);

  // Determine grade and acceptability according to Bangor, Kortum, and Miller (2008)
  let grade = 'F';
  let acceptability = 'Not Acceptable';

  if (score >= 80.3) {
    grade = 'A (Excellent)';
    acceptability = 'Acceptable';
  } else if (score >= 74) {
    grade = 'B (Good)';
    acceptability = 'Acceptable';
  } else if (score >= 68) {
    grade = 'C (OK / Average)';
    acceptability = 'Marginal (High)';
  } else if (score >= 51) {
    grade = 'D (Poor)';
    acceptability = 'Marginal (Low)';
  } else {
    grade = 'F (Awful)';
    acceptability = 'Not Acceptable';
  }

  return { score, grade, acceptability };
}

export async function GET() {
  ensureDataDir();
  if (!fs.existsSync(SUS_FILE)) {
    return NextResponse.json({ submissions: [], averageScore: 0, count: 0 });
  }

  try {
    const content = fs.readFileSync(SUS_FILE, 'utf-8');
    const submissions: SusSubmission[] = JSON.parse(content);
    const count = submissions.length;
    const averageScore = count > 0
      ? +(submissions.reduce((acc, curr) => acc + curr.susScore, 0) / count).toFixed(1)
      : 0;

    return NextResponse.json({
      submissions,
      count,
      averageScore,
    });
  } catch {
    return NextResponse.json({ submissions: [], averageScore: 0, count: 0 });
  }
}

export async function POST(req: NextRequest) {
  ensureDataDir();
  const body = await req.json();

  const { respondentName, respondentRole, responses, feedback } = body;

  try {
    const { score, grade, acceptability } = calculateSusScore(responses);

    const submission: SusSubmission = {
      id: `sus_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      respondentName: respondentName || 'Anonymous Respondent',
      respondentRole: respondentRole || 'QA / Tester',
      timestamp: new Date().toISOString(),
      responses,
      susScore: score,
      grade,
      acceptability,
      feedback: feedback || '',
    };

    let existing: SusSubmission[] = [];
    if (fs.existsSync(SUS_FILE)) {
      try {
        existing = JSON.parse(fs.readFileSync(SUS_FILE, 'utf-8'));
      } catch {
        existing = [];
      }
    }

    existing.unshift(submission);
    fs.writeFileSync(SUS_FILE, JSON.stringify(existing, null, 2), 'utf-8');

    return NextResponse.json({
      success: true,
      submission,
      totalSubmissions: existing.length,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 400 });
  }
}
