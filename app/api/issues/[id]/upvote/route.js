
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
  const userId = request.user.id;

  console.log('🔵 Upvote request:', { issueId: id, userId });

  try {
    const { db } = await connectToDatabase();

    // Find the issue
    let issue = null;
    if (ObjectId.isValid(id)) {
      issue = await db.collection('issues').findOne({ _id: new ObjectId(id) });
    }
    if (!issue) {
      issue = await db.collection('issues').findOne({ _id: id });
    }
    
    if (!issue) {
      console.log('❌ Issue not found:', id);
      return NextResponse.json({ error: 'Issue not found' }, { status: 404 });
    }

    // Initialize upvotedBy array if it doesn't exist (for old data)
    const upvotedBy = Array.isArray(issue.upvotedBy) ? issue.upvotedBy : [];
    const userIdStr = String(userId);
    const alreadyUpvoted = upvotedBy.some(uid => String(uid) === userIdStr);

    console.log('📊 Before upvote:', { 
      currentUpvotes: issue.upvotes, 
      upvotedByCount: upvotedBy.length,
      alreadyUpvoted,
      userId: userIdStr
    });

    let update = null;
    if (alreadyUpvoted) {
      // Remove upvote (toggle off)
      console.log('➖ Removing upvote');
      update = { 
        $pull: { upvotedBy: userId },
        $set: { updatedAt: new Date() } 
      };
    } else {
      // Add upvote (toggle on)
      console.log('➕ Adding upvote');
      update = { 
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
      console.log('❌ Failed to update issue');
      return NextResponse.json({ error: 'Failed to update issue' }, { status: 500 });
    }

    // Recalculate upvotes from array length for accuracy
    const finalUpvotedBy = Array.isArray(updatedDoc.upvotedBy) ? updatedDoc.upvotedBy : [];
    const actualUpvoteCount = finalUpvotedBy.length;

    // If upvotes count doesn't match array length, fix it
    if (updatedDoc.upvotes !== actualUpvoteCount) {
      console.log('⚠️ Upvote count mismatch! Fixing...', {
        storedCount: updatedDoc.upvotes,
        actualCount: actualUpvoteCount
      });
      
      await db.collection('issues').updateOne(
        { _id: issue._id },
        { $set: { upvotes: actualUpvoteCount } }
      );
      
      updatedDoc.upvotes = actualUpvoteCount;
    }

    console.log('✅ After upvote:', { 
      upvotes: updatedDoc.upvotes,
      upvotedByCount: finalUpvotedBy.length
    });

    return NextResponse.json({
      ...updatedDoc,
      upvotes: actualUpvoteCount // Always return accurate count
    });
  } catch (error) {
    console.error('❌ Error upvoting issue:', error);
    return NextResponse.json({ error: 'Failed to upvote' }, { status: 500 });
  }
}
