
import { NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';
import { connectToDatabase } from '@/lib/mongodb';
import { requireApiKey, validate, IssueCreateSchema, authenticateUser } from '@/lib/api-utils';
import { locateWard } from '@/lib/locator';

export async function GET(request) {
  const apiKeyError = await requireApiKey(request);
  if (apiKeyError) return apiKeyError;

  try {
    const { db } = await connectToDatabase();
    const { searchParams } = new URL(request.url);

    const limit = Math.min(Number(searchParams.get('limit')) || 50, 100);
    const cursor = searchParams.get('cursor');
    const wardSlug = searchParams.get('ward');

    const query = {};
    if (cursor && /^[0-9a-fA-F]{24}$/.test(cursor)) {
      query._id = { $lt: new ObjectId(cursor) };
    }

    if (wardSlug) {
      const wardName = wardSlug.replace(/-/g, ' ');
      query.wardName = new RegExp(`^${wardName}$`, 'i');
    }

    const items = await db.collection('issues')
      .find(query)
      .sort({ _id: -1 })
      .limit(limit)
      .toArray();

    const nextCursor = items.length ? String(items[items.length - 1]._id) : null;

    return NextResponse.json({ items, nextCursor });
  } catch (error) {
    console.error('Error fetching issues:', error);
    return NextResponse.json({ error: 'Failed to fetch issues' }, { status: 500 });
  }
}

export async function POST(request) {
  const apiKeyError = await requireApiKey(request);
  if (apiKeyError) return apiKeyError;

  const authError = await authenticateUser(request);
  if (authError) return authError;

  try {
    const { db } = await connectToDatabase();
    const body = await request.json();
    
    const validation = IssueCreateSchema.safeParse(body);
    if (!validation.success) {
      const details = validation.error.errors.map(e => ({
        path: Array.isArray(e.path) ? e.path.join('.') : '',
        message: e.message || 'Invalid input'
      }));
      return NextResponse.json({ error: 'Invalid payload', details }, { status: 400 });
    }
    
    const { title, description, category, lat, lng, photo, priority } = body;

    let wardInfo = null;
    if (typeof lat === 'number' && typeof lng === 'number') {
      wardInfo = locateWard(lat, lng);
      if (!wardInfo) return NextResponse.json({ error: 'Location outside service area' }, { status: 400 });
    }

    let imageData = null;
    if (photo && photo.startsWith('data:image/')) {
      try {
        const base64Data = photo.split(',')[1];
        imageData = Buffer.from(base64Data, 'base64');
      } catch (err) {
        return NextResponse.json({ error: 'Invalid image data' }, { status: 400 });
      }
    }

    const now = new Date();
    const doc = {
      title,
      description,
      category,
      lat: typeof lat === 'number' ? lat : null,
      lng: typeof lng === 'number' ? lng : null,
      photo: imageData ? imageData.toString('base64') : null,
      wardNumber: wardInfo?.wardNumber || null,
      wardName: wardInfo?.wardName || null,
      upvotes: 0,
      upvotedBy: [],
      priority: priority || 'medium',
      createdAt: now,
      updatedAt: now,
      status: 'open',
      assignedTo: null,
      history: [{ status: 'open', timestamp: now }],
      userId: request.user?.id || null,
      reporterEmail: request.user?.email || null,
      reporterName: request.user?.name || null,
      comments: [],
      flags: [],
      feedback: null
    };

    const result = await db.collection('issues').insertOne(doc);
    return NextResponse.json({ id: result.insertedId, ...doc, _id: result.insertedId }, { status: 201 });
  } catch (error) {
    console.error('Error creating issue:', error);
    return NextResponse.json({ error: 'Failed to create issue' }, { status: 500 });
  }
}
