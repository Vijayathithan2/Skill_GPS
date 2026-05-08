import { NextResponse } from 'next/server';
import { BACKEND_URL } from '@/lib/api-client';

// GET /api/students?college=...
export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const college = searchParams.get('college');

        const res = await fetch(`${BACKEND_URL}/students?college=${encodeURIComponent(college || '')}`);
        if (!res.ok) throw new Error("Backend unreachable");
        const students = await res.json();

        return NextResponse.json(students);
    } catch (err: any) {
        console.error("Fetch students proxy error:", err);
        return NextResponse.json({ error: 'Failed to fetch students from backend' }, { status: 500 });
    }
}

// POST /api/students — add new student (admin)
export async function POST(req: Request) {
    try {
        const body = await req.json();
        const res = await fetch(`${BACKEND_URL}/students`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        });
        
        if (!res.ok) throw new Error("Backend failed to save student");
        const newStudent = await res.json();
        
        return NextResponse.json(newStudent, { status: 201 });
    } catch (err: any) {
        console.error("Add student proxy error:", err);
        return NextResponse.json({ error: 'Failed to add student to backend' }, { status: 500 });
    }
}
