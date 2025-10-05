import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { playlists } from '@/db/schema';
import { eq, like, and, or, desc, asc } from 'drizzle-orm';
import { getCurrentUser } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    // Single record fetch by ID
    if (id) {
      if (!id || isNaN(parseInt(id))) {
        return NextResponse.json({ 
          error: "Valid ID is required",
          code: "INVALID_ID" 
        }, { status: 400 });
      }

      const playlist = await db.select()
        .from(playlists)
        .where(and(eq(playlists.id, parseInt(id)), eq(playlists.userId, user.id)))
        .limit(1);

      if (playlist.length === 0) {
        return NextResponse.json({ error: 'Playlist not found' }, { status: 404 });
      }

      return NextResponse.json(playlist[0]);
    }

    // List with pagination and search
    const limit = Math.min(parseInt(searchParams.get('limit') || '10'), 100);
    const offset = parseInt(searchParams.get('offset') || '0');
    const search = searchParams.get('search');
    const sort = searchParams.get('sort') || 'createdAt';
    const order = searchParams.get('order') || 'desc';

    let query = db.select().from(playlists);

    // Always scope to authenticated user
    let whereCondition = eq(playlists.userId, user.id);

    if (search) {
      whereCondition = and(
        eq(playlists.userId, user.id),
        like(playlists.name, `%${search}%`)
      );
    }

    query = query.where(whereCondition);

    // Apply sorting
    if (order === 'desc') {
      query = query.orderBy(desc(playlists[sort as keyof typeof playlists] || playlists.createdAt));
    } else {
      query = query.orderBy(asc(playlists[sort as keyof typeof playlists] || playlists.createdAt));
    }

    const results = await query.limit(limit).offset(offset);

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
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const requestBody = await request.json();

    // Security check: reject if userId provided in body
    if ('userId' in requestBody || 'user_id' in requestBody) {
      return NextResponse.json({ 
        error: "User ID cannot be provided in request body",
        code: "USER_ID_NOT_ALLOWED" 
      }, { status: 400 });
    }

    const { name, description, coverImage } = requestBody;

    // Validate required fields
    if (!name || name.trim() === '') {
      return NextResponse.json({ 
        error: "Name is required",
        code: "MISSING_REQUIRED_FIELD" 
      }, { status: 400 });
    }

    // Prepare insert data
    const insertData = {
      name: name.trim(),
      description: description?.trim() || null,
      coverImage: coverImage?.trim() || null,
      userId: user.id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const newPlaylist = await db.insert(playlists)
      .values(insertData)
      .returning();

    return NextResponse.json(newPlaylist[0], { status: 201 });

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
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

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

    // Check if playlist exists and belongs to user
    const existingPlaylist = await db.select()
      .from(playlists)
      .where(and(eq(playlists.id, parseInt(id)), eq(playlists.userId, user.id)))
      .limit(1);

    if (existingPlaylist.length === 0) {
      return NextResponse.json({ error: 'Playlist not found' }, { status: 404 });
    }

    const { name, description, coverImage } = requestBody;

    // Validate name if provided
    if (name !== undefined && (!name || name.trim() === '')) {
      return NextResponse.json({ 
        error: "Name cannot be empty",
        code: "INVALID_NAME" 
      }, { status: 400 });
    }

    // Prepare update data
    const updateData: any = {
      updatedAt: new Date().toISOString()
    };

    if (name !== undefined) updateData.name = name.trim();
    if (description !== undefined) updateData.description = description?.trim() || null;
    if (coverImage !== undefined) updateData.coverImage = coverImage?.trim() || null;

    const updated = await db.update(playlists)
      .set(updateData)
      .where(and(eq(playlists.id, parseInt(id)), eq(playlists.userId, user.id)))
      .returning();

    if (updated.length === 0) {
      return NextResponse.json({ error: 'Playlist not found' }, { status: 404 });
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
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json({ 
        error: "Valid ID is required",
        code: "INVALID_ID" 
      }, { status: 400 });
    }

    // Check if playlist exists and belongs to user
    const existingPlaylist = await db.select()
      .from(playlists)
      .where(and(eq(playlists.id, parseInt(id)), eq(playlists.userId, user.id)))
      .limit(1);

    if (existingPlaylist.length === 0) {
      return NextResponse.json({ error: 'Playlist not found' }, { status: 404 });
    }

    const deleted = await db.delete(playlists)
      .where(and(eq(playlists.id, parseInt(id)), eq(playlists.userId, user.id)))
      .returning();

    if (deleted.length === 0) {
      return NextResponse.json({ error: 'Playlist not found' }, { status: 404 });
    }

    return NextResponse.json({ 
      message: 'Playlist deleted successfully',
      playlist: deleted[0]
    });

  } catch (error) {
    console.error('DELETE error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + error 
    }, { status: 500 });
  }
}