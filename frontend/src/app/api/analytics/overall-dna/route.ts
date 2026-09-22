import { NextResponse } from 'next/server';
import { BACKEND_URL } from '@/lib/api-client';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const college = searchParams.get('college') || '';
    const department = searchParams.get('department') || '';
    
    try {
        const res = await fetch(`${BACKEND_URL}/analytics/overall-dna?college=${encodeURIComponent(college)}&department=${encodeURIComponent(department)}`);
        if (!res.ok) throw new Error('Backend failed');
        const data = await res.json();
        return NextResponse.json(data);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch DNA analytics' }, { status: 500 });
    }
}
