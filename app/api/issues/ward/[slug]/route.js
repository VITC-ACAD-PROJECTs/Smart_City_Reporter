import { NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';
import { connectToDatabase } from '@/lib/mongodb';
import { requireApiKey } from '@/lib/api-utils';

export async function GET(request, { params }) {
  const apiKeyError = await requireApiKey(request);
  if (apiKeyError) return apiKeyError;

  try {
    const { db } = await connectToDatabase();
    const { slug } = await params;
    
    // Convert slug to ward name (e.g., "royapuram" -> "Royapuram")
    const wardName = slug
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');

    console.log('Fetching issues for ward:', wardName, 'from slug:', slug);

    // Query for issues in this ward (case-insensitive)
    const query = {
      wardName: new RegExp(`^${wardName}$`, 'i')
    };

    const issues = await db.collection('issues')
      .find(query)
      .sort({ createdAt: -1 })
      .toArray();

    console.log(`Found ${issues.length} issues for ward ${wardName}`);

    // Group issues by status for stats
    const stats = issues.reduce((acc, issue) => {
      const status = issue.status || 'open';
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {});

    return NextResponse.json({
      wardName,
      issues,
      stats,
      total: issues.length
    });
  } catch (error) {
    console.error('Error fetching ward issues:', error);
    return NextResponse.json({ error: 'Failed to fetch ward issues' }, { status: 500 });
  }
}
