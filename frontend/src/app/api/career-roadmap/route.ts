import { NextResponse } from 'next/server';
import { callGroq } from '@/lib/groq';

const SYSTEM_PROMPT = `You are an AI Career Roadmap Generator that tracks actual progress.
Generate a personalized step-by-step learning roadmap.

CRITICAL INSTRUCTION:
Look at the user's "Verified Certificates". 
If a node's required skills/topics match ANY of their verified certificates, mark that node as "completed".
The FIRST node that is not "completed" must be marked "active". All remaining nodes after it must be marked "locked".

Return a valid JSON object with EXACTLY this structure (no extra text, no markdown):
{
  "targetRole": "Full Stack Engineer",
  "nodes": [
    { "id": 1, "title": "Foundation", "description": "HTML, CSS, JS basics", "status": "completed", "xp": 100, "resources": ["freeCodeCamp", "MDN Docs"] },
    { "id": 2, "title": "React Mastery", "description": "Hooks, Context, Next.js", "status": "active", "xp": 300, "resources": ["React Docs", "Next.js Docs"] },
    { "id": 3, "title": "Backend Essentials", "description": "Node, Express, Databases", "status": "locked", "xp": 400, "resources": ["Node.js Docs"] }
  ],
  "estimatedTime": "6 Months",
  "marketDemand": "High",
  "avgSalary": "₹8-15 LPA"
}`;

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { currentSkills, targetRole, certificates } = body;
        
        const certsStr = certificates && certificates.length > 0 
            ? certificates.map((c: any) => c.title).join(", ") 
            : "None";

        const userMessage = `Target Role: "${targetRole || 'Software Engineer'}". Current Skills: "${currentSkills || 'beginner'}". Verified Certificates: "${certsStr}". Generate roadmap and track completion!`;

        const reply = await callGroq(SYSTEM_PROMPT, [{ role: 'user', content: userMessage }], true);
        const parsed = JSON.parse(reply);
        return NextResponse.json(parsed);

    } catch (error: unknown) {
        const msg = error instanceof Error ? error.message : 'Unknown error';
        console.error('Career roadmap error:', msg);
        if (msg.startsWith('RATE_LIMIT')) {
            return NextResponse.json({ error: '⏳ AI is busy. Please wait a moment and try again.' }, { status: 429 });
        }
        return NextResponse.json({ error: 'Failed to generate roadmap. Please try again.' }, { status: 500 });
    }
}
