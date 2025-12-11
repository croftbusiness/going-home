import { NextResponse } from 'next/server';
import { requireAuth, createServerClient } from '@/lib/auth';

export async function GET() {
  try {
    const auth = await requireAuth();
    if ('error' in auth) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const supabase = createServerClient();
    const { data, error } = await supabase
      .from('funeral_planning_boards')
      .select('*')
      .eq('user_id', auth.userId)
      .maybeSingle();

    if (error) {
      return NextResponse.json({ error: 'Failed to load planning board' }, { status: 500 });
    }

    // Transform snake_case to camelCase
    const board = data ? {
      casketImages: data.casket_images || [],
      casketNotes: data.casket_notes || '',
      urnImages: data.urn_images || [],
      urnNotes: data.urn_notes || '',
      flowerImages: data.flower_images || [],
      flowerNotes: data.flower_notes || '',
      colorPaletteImages: data.color_palette_images || [],
      colorPaletteNotes: data.color_palette_notes || '',
      serviceStyleImages: data.service_style_images || [],
      serviceStyleNotes: data.service_style_notes || '',
      outfitImages: data.outfit_images || [],
      outfitNotes: data.outfit_notes || '',
      personalPhotos: data.personal_photos || [],
      personalPhotosNotes: data.personal_photos_notes || '',
      generalNotes: data.general_notes || '',
    } : null;

    return NextResponse.json({ board });
  } catch (error: any) {
    console.error('Planning board GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch planning board' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const auth = await requireAuth();
    if ('error' in auth) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const supabase = createServerClient();
    const body = await request.json();

    // Check if board exists
    const { data: existing } = await supabase
      .from('funeral_planning_boards')
      .select('id')
      .eq('user_id', auth.userId)
      .maybeSingle();

    const boardData = {
      user_id: auth.userId,
      casket_images: body.casketImages || [],
      casket_notes: body.casketNotes || null,
      urn_images: body.urnImages || [],
      urn_notes: body.urnNotes || null,
      flower_images: body.flowerImages || [],
      flower_notes: body.flowerNotes || null,
      color_palette_images: body.colorPaletteImages || [],
      color_palette_notes: body.colorPaletteNotes || null,
      service_style_images: body.serviceStyleImages || [],
      service_style_notes: body.serviceStyleNotes || null,
      outfit_images: body.outfitImages || [],
      outfit_notes: body.outfitNotes || null,
      personal_photos: body.personalPhotos || [],
      personal_photos_notes: body.personalPhotosNotes || null,
      general_notes: body.generalNotes || null,
    };

    let data, error;
    if (existing) {
      const result = await supabase
        .from('funeral_planning_boards')
        .update(boardData)
        .eq('user_id', auth.userId)
        .select()
        .single();
      data = result.data;
      error = result.error;
    } else {
      const result = await supabase
        .from('funeral_planning_boards')
        .insert(boardData)
        .select()
        .single();
      data = result.data;
      error = result.error;
    }

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json({ error: 'Failed to save planning board' }, { status: 500 });
    }

    // Transform back to camelCase
    const board = data ? {
      casketImages: data.casket_images || [],
      casketNotes: data.casket_notes || '',
      urnImages: data.urn_images || [],
      urnNotes: data.urn_notes || '',
      flowerImages: data.flower_images || [],
      flowerNotes: data.flower_notes || '',
      colorPaletteImages: data.color_palette_images || [],
      colorPaletteNotes: data.color_palette_notes || '',
      serviceStyleImages: data.service_style_images || [],
      serviceStyleNotes: data.service_style_notes || '',
      outfitImages: data.outfit_images || [],
      outfitNotes: data.outfit_notes || '',
      personalPhotos: data.personal_photos || [],
      personalPhotosNotes: data.personal_photos_notes || '',
      generalNotes: data.general_notes || '',
    } : null;

    return NextResponse.json({ board });
  } catch (error: any) {
    console.error('Planning board POST error:', error);
    return NextResponse.json({ error: error.message || 'Failed to save planning board' }, { status: 500 });
  }
}

