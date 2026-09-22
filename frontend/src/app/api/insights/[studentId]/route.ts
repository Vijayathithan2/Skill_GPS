import { NextResponse } from 'next/server';
import { BACKEND_URL } from '@/lib/api-client';

export async function GET(
    request: Request,
    { params }: { params: Promise<{ studentId: string }> }
) {
    const { studentId } = await params;
    
    try {
        const res = await fetch(`${BACKEND_URL}/insights/${studentId}`);
        if (!res.ok) throw new Error('Backend failed');
        const data = await res.json();
        return NextResponse.json(data);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch student insights' }, { status: 500 });
    }
}
