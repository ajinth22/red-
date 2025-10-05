import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { songs } from '@/db/schema';
import { eq, like, and, or, desc } from 'drizzle-orm';
import { getCurrentUser } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);
    if (!user) return NextResponse.json({ error: 'Authentication required' }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const limit = Math.min(parseInt(searchParams.get('limit') || '10'), 100);
    const offset = parseInt(searchParams.get('offset') || '0');
    const search = searchParams.get('search');
    const userId = searchParams.get('user_id');

    // Single song by ID
    if (id) {
      if (!id || isNaN(parseInt(id))) {
        return NextResponse.json({ 
          error: "Valid ID is required",
          code: "INVALID_ID" 
        }, { status: 400 });
      }

      const song = await db.select()
        .from(songs)
        .where(eq(songs.id, parseInt(id)))
        .limit(1);

      if (song.length === 0) {
        return NextResponse.json({ error: 'Song not found' }, { status: 404 });
      }

      return NextResponse.json(song[0]);
    }

    // List songs with filtering
    let query = db.select().from(songs);

    const conditions = [];

    // Filter by user if provided
    if (userId) {
      conditions.push(eq(songs.userId, userId));
    }

    // Search across title and artist
    if (search) {
      conditions.push(
        or(
          like(songs.title, `%${search}%`),
          like(songs.artist, `%${search}%`)
        )
      );
    }

    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    const results = await query
      .orderBy(desc(songs.createdAt))
      .limit(limit)
      .offset(offset);

    return NextResponse.json(results);

  } catch (error) {
    console.error('GET error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + error 
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);
    if (!user) return NextResponse.json({ error: 'Authentication required' }, { status: 401 });

    const requestBody = await request.json();
    
    // Security check: reject if userId provided in body
    if ('userId' in requestBody || 'user_id' in requestBody) {
      return NextResponse.json({ 
        error: "User ID cannot be provided in request body",
        code: "USER_ID_NOT_ALLOWED" 
      }, { status: 400 });
    }

    const { title, artist, duration, thumbnail, sourceType, sourceId, fileUrl } = requestBody;

    // Validate required fields
    if (!title) {
      return NextResponse.json({ 
        error: "Title is required",
        code: "MISSING_TITLE" 
      }, { status: 400 });
    }

    if (!artist) {
      return NextResponse.json({ 
        error: "Artist is required",
        code: "MISSING_ARTIST" 
      }, { status: 400 });
    }

    if (!duration) {
      return NextResponse.json({ 
        error: "Duration is required",
        code: "MISSING_DURATION" 
      }, { status: 400 });
    }

    if (!thumbnail) {
      return NextResponse.json({ 
        error: "Thumbnail is required",
        code: "MISSING_THUMBNAIL" 
      }, { status: 400 });
    }

    if (!sourceType) {
      return NextResponse.json({ 
        error: "Source type is required",
        code: "MISSING_SOURCE_TYPE" 
      }, { status: 400 });
    }

    if (!sourceId) {
      return NextResponse.json({ 
        error: "Source ID is required",
        code: "MISSING_SOURCE_ID" 
      }, { status: 400 });
    }

    // Validate sourceType
    if (sourceType !== 'youtube' && sourceType !== 'local') {
      return NextResponse.json({ 
        error: "Source type must be 'youtube' or 'local'",
        code: "INVALID_SOURCE_TYPE" 
      }, { status: 400 });
    }

    // For local songs, fileUrl is required
    if (sourceType === 'local' && !fileUrl) {
      return NextResponse.json({ 
        error: "File URL is required for local songs",
        code: "MISSING_FILE_URL" 
      }, { status: 400 });
    }

    // Prepare insert data
    const insertData = {
      title: title.trim(),
      artist: artist.trim(),
      duration: duration.trim(),
      thumbnail: thumbnail.trim(),
      sourceType,
      sourceId: sourceId.trim(),
      fileUrl: fileUrl ? fileUrl.trim() : null,
      userId: sourceType === 'local' ? user.id : null,
      createdAt: new Date().toISOString()
    };

    const newSong = await db.insert(songs)
      .values(insertData)
      .returning();

    return NextResponse.json(newSong[0], { status: 201 });

  } catch (error) {
    console.error('POST error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + error 
    }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);
    if (!user) return NextResponse.json({ error: 'Authentication required' }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json({ 
        error: "Valid ID is required",
        code: "INVALID_ID" 
      }, { status: 400 });
    }

    const requestBody = await request.json();
    
    // Security check: reject if userId provided in body
    if ('userId' in requestBody || 'user_id' in requestBody) {
      return NextResponse.json({ 
        error: "User ID cannot be provided in request body",
        code: "USER_ID_NOT_ALLOWED" 
      }, { status: 400 });
    }

    // Check if song exists
    const existingSong = await db.select()
      .from(songs)
      .where(eq(songs.id, parseInt(id)))
      .limit(1);

    if (existingSong.length === 0) {
      return NextResponse.json({ error: 'Song not found' }, { status: 404 });
    }

    const { title, artist, duration, thumbnail, sourceType, sourceId, fileUrl } = requestBody;

    // Validate sourceType if provided
    if (sourceType && sourceType !== 'youtube' && sourceType !== 'local') {
      return NextResponse.json({ 
        error: "Source type must be 'youtube' or 'local'",
        code: "INVALID_SOURCE_TYPE" 
      }, { status: 400 });
    }

    // For local songs, fileUrl is required
    if (sourceType === 'local' && !fileUrl) {
      return NextResponse.json({ 
        error: "File URL is required for local songs",
        code: "MISSING_FILE_URL" 
      }, { status: 400 });
    }

    // Prepare update data
    const updateData = {
      ...(title && { title: title.trim() }),
      ...(artist && { artist: artist.trim() }),
      ...(duration && { duration: duration.trim() }),
      ...(thumbnail && { thumbnail: thumbnail.trim() }),
      ...(sourceType && { sourceType }),
      ...(sourceId && { sourceId: sourceId.trim() }),
      ...(fileUrl !== undefined && { fileUrl: fileUrl ? fileUrl.trim() : null }),
      updatedAt: new Date().toISOString()
    };

    const updated = await db.update(songs)
      .set(updateData)
      .where(eq(songs.id, parseInt(id)))
      .returning();

    if (updated.length === 0) {
      return NextResponse.json({ error: 'Song not found' }, { status: 404 });
    }

    return NextResponse.json(updated[0]);

  } catch (error) {
    console.error('PUT error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + error 
    }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);
    if (!user) return NextResponse.json({ error: 'Authentication required' }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json({ 
        error: "Valid ID is required",
        code: "INVALID_ID" 
      }, { status: 400 });
    }

    // Check if song exists
    const existingSong = await db.select()
      .from(songs)
      .where(eq(songs.id, parseInt(id)))
      .limit(1);

    if (existingSong.length === 0) {
      return NextResponse.json({ error: 'Song not found' }, { status: 404 });
    }

    const deleted = await db.delete(songs)
      .where(eq(songs.id, parseInt(id)))
      .returning();

    if (deleted.length === 0) {
      return NextResponse.json({ error: 'Song not found' }, { status: 404 });
    }

    return NextResponse.json({ 
      message: 'Song deleted successfully',
      deletedSong: deleted[0]
    });

  } catch (error) {
    console.error('DELETE error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + error 
    }, { status: 500 });
  }
}