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
      .from('legacy_instructions')
      .select('*')
      .eq('user_id', auth.userId)
      .single();

    if (error && error.code !== 'PGRST116') throw error;

    if (!data) {
      return NextResponse.json({ instructions: null });
    }

    return NextResponse.json({
      instructions: {
        id: data.id,
        whatToDoFirst: data.what_to_do_first,
        whereThingsAreLocated: data.where_things_are_located,
        importantContacts: data.important_contacts,
        homeQuirks: data.home_quirks,
        petCare: data.pet_care,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
      },
    });
  } catch (error: any) {
    console.error('Instructions GET error:', error);
    return NextResponse.json({ error: 'Failed to load instructions' }, { status: 500 });
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

    // Check if record exists
    const { data: existing } = await supabase
      .from('legacy_instructions')
      .select('id')
      .eq('user_id', auth.userId)
      .maybeSingle();

    let data, error;

    if (existing) {
      // Update existing
      const result = await supabase
        .from('legacy_instructions')
        .update({
          what_to_do_first: body.whatToDoFirst || null,
          where_things_are_located: body.whereThingsAreLocated || null,
          important_contacts: body.importantContacts || null,
          home_quirks: body.homeQuirks || null,
          pet_care: body.petCare || null,
        })
        .eq('id', existing.id)
        .select()
        .single();
      data = result.data;
      error = result.error;
    } else {
      // Insert new
      const result = await supabase
        .from('legacy_instructions')
        .insert({
          user_id: auth.userId,
          what_to_do_first: body.whatToDoFirst || null,
          where_things_are_located: body.whereThingsAreLocated || null,
          important_contacts: body.importantContacts || null,
          home_quirks: body.homeQuirks || null,
          pet_care: body.petCare || null,
        })
        .select()
        .single();
      data = result.data;
      error = result.error;
    }

    if (error) throw error;

    return NextResponse.json({
      instructions: {
        id: data.id,
        whatToDoFirst: data.what_to_do_first,
        whereThingsAreLocated: data.where_things_are_located,
        importantContacts: data.important_contacts,
        homeQuirks: data.home_quirks,
        petCare: data.pet_care,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
      },
    });
  } catch (error: any) {
    console.error('Instructions POST error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to save instructions' },
      { status: 500 }
    );
  }
}

