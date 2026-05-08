import { NextResponse } from 'next/server';
import { callGroq } from '@/lib/gemini';

const SYSTEM_PROMPT = `You are an AI Certification recommender.
Based on the user's targeted career role, their current university degree, and skill gaps, suggest exactly 4 highly-valued industry certifications or available courses.

These recommendations should directly help them complete the next logical nodes in their roadmap towards their target role. 
For example, if they are a CSE student targeting DevOps, recommend AWS/Docker certifications that align with a standard DevOps roadmap.

Return a valid JSON object with EXACTLY this structure (no markdown formatting, just JSON):
{
  "recommendations": [
    {
      "title": "AWS Certified Solutions Architect",
      "issuer": "Amazon Web Services",
      "difficulty": "Intermediate",
      "estimatedHours": "120h",
      "why": "Crucial for clearing the Cloud Deployment roadmap node for DevOps roles."
    }
  ]
}`;

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { targetRole, skillGaps, department, year } = body;

        const userMessage = `I am a Year ${year || '3'} student studying ${department || 'Computer Science'}. My target role is "${targetRole}". My skill gaps are: ${skillGaps}. What certifications or courses should I pursue next to complete my roadmap?`;

        const reply = await callGroq(SYSTEM_PROMPT, [{ role: 'user', content: userMessage }], true);
        const parsed = JSON.parse(reply);
        return NextResponse.json(parsed);

    } catch (error: unknown) {
        console.error('Cert recommendations error:', error);
        return NextResponse.json({ error: 'Failed to fetch recommendations.' }, { status: 500 });
    }
}
