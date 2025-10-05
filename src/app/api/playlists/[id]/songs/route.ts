import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { playlists, songs, playlistSongs } from "@/db/schema";
import { eq, and, asc, max, gte } from "drizzle-orm";
import { getCurrentUser } from "@/lib/auth";

// ---------------------
// GET - Get playlist songs
// ---------------------
export async function GET(
  request: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const params = await props.params;
    const id = params.id;
    
    const user = await getCurrentUser(request);
    if (!user)
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });

    const playlistId = parseInt(id);
    if (isNaN(playlistId))
      return NextResponse.json(
        { error: "Valid playlist ID is required", code: "INVALID_PLAYLIST_ID" },
        { status: 400 }
      );

    const playlist = await db
      .select()
      .from(playlists)
      .where(and(eq(playlists.id, playlistId), eq(playlists.userId, user.id)))
      .limit(1);

    if (playlist.length === 0)
      return NextResponse.json({ error: "Playlist not found" }, { status: 404 });

    const searchParams = request.nextUrl.searchParams;
    const limit = Math.min(parseInt(searchParams.get("limit") || "50"), 100);
    const offset = parseInt(searchParams.get("offset") || "0");

    const playlistSongsWithDetails = await db
      .select({
        id: playlistSongs.id,
        position: playlistSongs.position,
        addedAt: playlistSongs.addedAt,
        song: {
          id: songs.id,
          title: songs.title,
          artist: songs.artist,
          duration: songs.duration,
          thumbnail: songs.thumbnail,
          sourceType: songs.sourceType,
          sourceId: songs.sourceId,
          fileUrl: songs.fileUrl,
          createdAt: songs.createdAt,
        },
      })
      .from(playlistSongs)
      .innerJoin(songs, eq(playlistSongs.songId, songs.id))
      .where(eq(playlistSongs.playlistId, playlistId))
      .orderBy(asc(playlistSongs.position))
      .limit(limit)
      .offset(offset);

    return NextResponse.json(playlistSongsWithDetails);
  } catch (error) {
    console.error("GET error:", error);
    return NextResponse.json({ error: "Internal server error: " + error }, { status: 500 });
  }
}

// ---------------------
// POST - Add song to playlist
// ---------------------
export async function POST(
  request: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const params = await props.params;
    const id = params.id;
    
    const user = await getCurrentUser(request);
    if (!user)
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });

    const playlistId = parseInt(id);
    if (isNaN(playlistId))
      return NextResponse.json(
        { error: "Valid playlist ID is required", code: "INVALID_PLAYLIST_ID" },
        { status: 400 }
      );

    const playlist = await db
      .select()
      .from(playlists)
      .where(and(eq(playlists.id, playlistId), eq(playlists.userId, user.id)))
      .limit(1);

    if (playlist.length === 0)
      return NextResponse.json({ error: "Playlist not found" }, { status: 404 });

    const { songId, position } = await request.json();
    if (!songId || isNaN(parseInt(songId)))
      return NextResponse.json(
        { error: "Valid song ID is required", code: "INVALID_SONG_ID" },
        { status: 400 }
      );

    const song = await db.select().from(songs).where(eq(songs.id, parseInt(songId))).limit(1);
    if (song.length === 0)
      return NextResponse.json({ error: "Song not found", code: "SONG_NOT_FOUND" }, { status: 404 });

    const existingSong = await db
      .select()
      .from(playlistSongs)
      .where(and(eq(playlistSongs.playlistId, playlistId), eq(playlistSongs.songId, parseInt(songId))))
      .limit(1);

    if (existingSong.length > 0)
      return NextResponse.json(
        { error: "Song is already in playlist", code: "SONG_ALREADY_IN_PLAYLIST" },
        { status: 400 }
      );

    let finalPosition = position;
    if (!finalPosition) {
      const maxPositionResult = await db
        .select({ maxPos: max(playlistSongs.position) })
        .from(playlistSongs)
        .where(eq(playlistSongs.playlistId, playlistId));

      finalPosition = (maxPositionResult[0]?.maxPos || 0) + 1;
    } else {
      await db
        .update(playlistSongs)
        .set({ position: playlistSongs.position + 1 })
        .where(and(eq(playlistSongs.playlistId, playlistId), gte(playlistSongs.position, finalPosition)));
    }

    const newPlaylistSong = await db
      .insert(playlistSongs)
      .values({
        playlistId,
        songId: parseInt(songId),
        position: finalPosition,
        addedAt: new Date().toISOString(),
      })
      .returning();

    const addedSongWithDetails = await db
      .select({
        id: playlistSongs.id,
        position: playlistSongs.position,
        addedAt: playlistSongs.addedAt,
        song: {
          id: songs.id,
          title: songs.title,
          artist: songs.artist,
          duration: songs.duration,
          thumbnail: songs.thumbnail,
          sourceType: songs.sourceType,
          sourceId: songs.sourceId,
          fileUrl: songs.fileUrl,
          createdAt: songs.createdAt,
        },
      })
      .from(playlistSongs)
      .innerJoin(songs, eq(playlistSongs.songId, songs.id))
      .where(eq(playlistSongs.id, newPlaylistSong[0].id))
      .limit(1);

    return NextResponse.json(addedSongWithDetails[0], { status: 201 });
  } catch (error) {
    console.error("POST error:", error);
    return NextResponse.json({ error: "Internal server error: " + error }, { status: 500 });
  }
}

// ---------------------
// DELETE - Remove song from playlist
// ---------------------
export async function DELETE(
  request: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const params = await props.params;
    const id = params.id;
    
    const user = await getCurrentUser(request);
    if (!user)
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });

    const playlistId = parseInt(id);
    if (isNaN(playlistId))
      return NextResponse.json(
        { error: "Valid playlist ID is required", code: "INVALID_PLAYLIST_ID" },
        { status: 400 }
      );

    const songIdParam = request.nextUrl.searchParams.get("song_id");
    if (!songIdParam || isNaN(parseInt(songIdParam)))
      return NextResponse.json(
        { error: "Valid song ID is required", code: "INVALID_SONG_ID" },
        { status: 400 }
      );

    const songId = parseInt(songIdParam);

    const playlist = await db
      .select()
      .from(playlists)
      .where(and(eq(playlists.id, playlistId), eq(playlists.userId, user.id)))
      .limit(1);

    if (playlist.length === 0)
      return NextResponse.json({ error: "Playlist not found" }, { status: 404 });

    const playlistSong = await db
      .select()
      .from(playlistSongs)
      .where(and(eq(playlistSongs.playlistId, playlistId), eq(playlistSongs.songId, songId)))
      .limit(1);

    if (playlistSong.length === 0)
      return NextResponse.json(
        { error: "Song not found in playlist", code: "SONG_NOT_IN_PLAYLIST" },
        { status: 404 }
      );

    const removedPosition = playlistSong[0].position;

    const deleted = await db
      .delete(playlistSongs)
      .where(and(eq(playlistSongs.playlistId, playlistId), eq(playlistSongs.songId, songId)))
      .returning();

    await db
      .update(playlistSongs)
      .set({ position: playlistSongs.position - 1 })
      .where(and(eq(playlistSongs.playlistId, playlistId), gte(playlistSongs.position, removedPosition)));

    return NextResponse.json({
      message: "Song removed from playlist successfully",
      deletedSong: deleted[0],
    });
  } catch (error) {
    console.error("DELETE error:", error);
    return NextResponse.json({ error: "Internal server error: " + error }, { status: 500 });
  }
}
