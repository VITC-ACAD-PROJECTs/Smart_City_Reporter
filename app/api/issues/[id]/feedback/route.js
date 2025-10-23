
import { NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';
import { connectToDatabase } from '@/lib/mongodb';
import { requireApiKey, validate, FeedbackSchema } from '@/lib/api-utils';

// Helper: update by ObjectId or string _id (from original backend)
async function updateByEitherId(collection, id, update, options) {
  if (ObjectId.isValid(id)) {
    const r1 = await collection.findOneAndUpdate({ _id: new ObjectId(id) }, update, options);
    const doc1 = r1?.value ?? r1;
    if (doc1) return doc1;
  }
  const r2 = await collection.findOneAndUpdate({ _id: id }, update, options);
  const doc2 = r2?.value ?? r2;
  return doc2 || null;
}

export async function POST(request, { params }) {
  const apiKeyError = await requireApiKey(request);
  if (apiKeyError) return apiKeyError;

  const validationError = await validate(FeedbackSchema)(request);
  if (validationError) return validationError;

  const { id } = await params;
  const { rating, comment } = request.parsedBody;

  try {
    const { db } = await connectToDatabase();
    const doc = await updateByEitherId(
      db.collection('issues'),
      id,
      { $set: { feedback: { rating, comment, timestamp: new Date() }, updatedAt: new Date() } },
      { returnDocument: 'after' }
    );
    if (!doc) return NextResponse.json({ error: 'Issue not found' }, { status: 404 });
    return NextResponse.json(doc);
  } catch (error) {
    console.error('Error adding feedback:', error);
    return NextResponse.json({ error: 'Failed to add feedback' }, { status: 500 });
  }
}
