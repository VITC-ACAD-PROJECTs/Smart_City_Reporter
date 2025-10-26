
import { NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';
import { connectToDatabase } from '@/lib/mongodb';
import { requireApiKey, validate, StatusSchema, authenticateUser } from '@/lib/api-utils';

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

  const authError = await authenticateUser(request);
  if (authError) return authError;

  const validationError = await validate(StatusSchema)(request);
  if (validationError) return validationError;

  const { id } = await params;
  
  // parsedBody is attached by the validate function
  if (!request.parsedBody) {
    return NextResponse.json({ error: 'Request body missing' }, { status: 400 });
  }
  
  const { status, statusChangeReason } = request.parsedBody;
  const assignedEmail = request.user?.email || null;

  if (!assignedEmail) {
    return NextResponse.json({ error: 'Unable to determine authenticated user' }, { status: 401 });
  }

  const set = { updatedAt: new Date() };
  if (status) set.status = status;
  set.assignedTo = assignedEmail;

  const update = {
    $set: set,
    $push: { history: { status, assignedTo: assignedEmail, reason: statusChangeReason, timestamp: new Date() } }
  };

  try {
    const { db } = await connectToDatabase();
    const doc = await updateByEitherId(
      db.collection('issues'),
      id,
      update,
      { returnDocument: 'after' }
    );
    if (!doc) return NextResponse.json({ error: 'Issue not found' }, { status: 404 });
    return NextResponse.json(doc);
  } catch (error) {
    console.error('Error updating status:', error);
    return NextResponse.json({ error: 'Failed to update status' }, { status: 500 });
  }
}
