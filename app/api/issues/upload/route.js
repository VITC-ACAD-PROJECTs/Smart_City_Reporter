
import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { requireApiKey } from '@/lib/api-utils';
import { locateWard } from '@/lib/locator';
import exif from 'exif-parser';

// Helper to parse DMS coordinates (from original backend)
function parseDMS(dms, ref) {
  if (typeof dms === 'string') {
    const match = dms.match(/(\d+)[^\d]+(\d+)[^\d]+([\d.]+)/);
    if (match) {
      let degrees = parseFloat(match[1]);
      let minutes = parseFloat(match[2]);
      let seconds = parseFloat(match[3]);
      let decimal = degrees + minutes / 60 + seconds / 3600;
      if (ref === 'S' || ref === 'W') {
        decimal = -decimal;
      }
      return decimal;
    }
  } else if (Array.isArray(dms)) {
    let decimal = dms[0] + dms[1] / 60 + dms[2] / 3600;
    if (ref === 'S' || ref === 'W') {
      decimal = -decimal;
    }
    return decimal;
  }
  return null;
}

export async function POST(request) {
  const apiKeyError = await requireApiKey(request);
  if (apiKeyError) return apiKeyError;

  try {
    const { db } = await connectToDatabase();
    const formData = await request.formData();

    const title = formData.get('title');
    const description = formData.get('description');
    const category = formData.get('category');
    const latIn = formData.get('lat');
    const lngIn = formData.get('lng');
    const photoFile = formData.get('photo');

    let lat = null;
    let lng = null;
    let imageData = null;

    if (photoFile) {
      const buffer = Buffer.from(await photoFile.arrayBuffer());
      imageData = buffer.toString('base64');

      try {
        const parsed = exif.create(buffer).parse();
        if (
          parsed.tags.GPSLatitude &&
          parsed.tags.GPSLongitude &&
          parsed.tags.GPSLatitudeRef &&
          parsed.tags.GPSLongitudeRef
        ) {
          lat = parseDMS(parsed.tags.GPSLatitude, parsed.tags.GPSLatitudeRef);
          lng = parseDMS(parsed.tags.GPSLongitude, parsed.tags.GPSLongitudeRef);
        }
      } catch (exifErr) {
        console.warn('EXIF GPS parse failed or no GPS tags:', exifErr);
      }
    }

    // If EXIF didn't provide coords, try from form data
    if (lat === null || lng === null) {
      const fl = Number(latIn);
      const fg = Number(lngIn);
      if (Number.isFinite(fl) && Number.isFinite(fg)) {
        lat = fl;
        lng = fg;
      }
    }

    if (lat === null || lng === null) {
      return NextResponse.json({ error: 'Invalid or missing location information' }, { status: 400 });
    }

    const wardInfo = locateWard(lat, lng);
    if (!wardInfo) {
      return NextResponse.json({ error: 'Location outside supported area' }, { status: 400 });
    }

    const now = new Date();

    const doc = {
      title,
      description,
      category,
      lat,
      lng,
      photo: imageData,
      wardNumber: wardInfo?.wardNumber ?? null,
      wardName: wardInfo?.wardName ?? null,
      upvotes: 0,
      priority: 'medium',
      createdAt: now,
      updatedAt: now,
      status: 'open',
      assignedTo: null,
      history: [{ status: 'open', timestamp: now }],
      userId: null,
      comments: [],
      flags: [],
      feedback: null,
    };

    const result = await db.collection('issues').insertOne(doc);

    return NextResponse.json({ id: result.insertedId, ...doc }, { status: 201 });
  } catch (error) {
    console.error('Error uploading issue:', error);
    return NextResponse.json({ error: 'Failed to upload issue' }, { status: 500 });
  }
}
