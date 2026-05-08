import { NextResponse } from 'next/server';
import { BACKEND_URL } from '@/lib/api-client';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const college = searchParams.get('college') || '';
    
    try {
        const res = await fetch(`${BACKEND_URL}/analytics/risk?college=${encodeURIComponent(college)}`);
        if (!res.ok) throw new Error('Backend failed');
        const data = await res.json();
        return NextResponse.json(data);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch risk analytics' }, { status: 500 });
    }
}
