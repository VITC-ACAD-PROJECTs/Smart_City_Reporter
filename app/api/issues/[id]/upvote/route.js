
import { NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';
import { connectToDatabase } from '@/lib/mongodb';
import { requireApiKey, authenticateUser } from '@/lib/api-utils';

export async function POST(request, { params }) {
  const apiKeyError = await requireApiKey(request);
  if (apiKeyError) return apiKeyError;

  const authError = await authenticateUser(request);
  if (authError) return authError;

  const { id } = await params;
  const userId = request.user.id; // Assuming authenticateUser attaches user to request

  try {
    const { db } = await connectToDatabase();

    // First, find the issue and check if user already upvoted
    let issue = null;
    if (ObjectId.isValid(id)) {
      issue = await db.collection('issues').findOne({ _id: new ObjectId(id) });
    }
    if (!issue) {
      issue = await db.collection('issues').findOne({ _id: id });
    }
    
    if (!issue) {
      return NextResponse.json({ error: 'Issue not found' }, { status: 404 });
    }

    // Initialize upvotedBy array if it doesn't exist
    const upvotedBy = issue.upvotedBy || [];
    const alreadyUpvoted = upvotedBy.includes(userId);

    let update = null;
    if (alreadyUpvoted) {
      // Remove upvote
      update = { 
        $inc: { upvotes: -1 }, 
        $pull: { upvotedBy: userId }, 
        $set: { updatedAt: new Date() } 
      };
    } else {
      // Add upvote
      update = { 
        $inc: { upvotes: 1 }, 
        $addToSet: { upvotedBy: userId }, 
        $set: { updatedAt: new Date() } 
      };
    }

    // Update the issue
    const result = await db.collection('issues').findOneAndUpdate(
      { _id: issue._id },
      update,
      { returnDocument: 'after' }
    );
    
    const updatedDoc = result?.value || result;

    if (!updatedDoc) {
      return NextResponse.json({ error: 'Failed to update issue' }, { status: 500 });
    }

    return NextResponse.json(updatedDoc);
  } catch (error) {
    console.error('Error upvoting issue:', error);
    return NextResponse.json({ error: 'Failed to upvote' }, { status: 500 });
  }
}
