
import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';

export async function GET() {
  try {
    const { db } = await connectToDatabase();

    const total = await db.collection('issues').countDocuments();
    const open = await db.collection('issues').countDocuments({ status: 'open' });
    const resolved = await db.collection('issues').countDocuments({ status: 'resolved' });

    return NextResponse.json({ total, open, resolved });
  } catch (error) {
    console.error('Error fetching analytics:', error);
    return NextResponse.json({ error: 'Failed to fetch analytics' }, { status: 500 });
  }
}
