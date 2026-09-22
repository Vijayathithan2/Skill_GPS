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

        // Fallback response when AI key is missing or unreachable
        return NextResponse.json({
            targetRole: "AI Engineer",
            nodes: [
                { id: 1, title: "Frontend Foundation", description: "Mastering HTML, CSS, JavaScript basics and DOM manipulation.", status: "completed", xp: 150 },
                { id: 2, title: "React & Next.js Ecosystem", description: "Building interactive user interfaces, SSR, state management.", status: "active", xp: 300 },
                { id: 3, title: "Professional Communication", description: "Mock interviews, professional email writing, and verbal articulation.", status: "active", xp: 250 },
                { id: 4, title: "Aptitude Trainer", description: "Quantitative problem solving and logical reasoning challenges.", status: "active", xp: 200 },
                { id: 5, title: "Backend & Systems Design", description: "APIs, databases, scalable architecture, and microservices.", status: "locked", xp: 500 },
                { id: 6, title: "Cloud Deployment (AWS)", description: "Deploying applications, Docker, CI/CD, and Serverless.", status: "locked", xp: 400 }
            ],
            estimatedTime: "6-8 Months",
            marketDemand: "High",
            avgSalary: "₹12-24 LPA"
        });
    }
}
