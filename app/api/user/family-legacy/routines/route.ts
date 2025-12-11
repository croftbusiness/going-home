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
      .from('legacy_routines')
      .select('*')
      .eq('user_id', auth.userId)
      .single();

    if (error && error.code !== 'PGRST116') throw error;

    if (!data) {
      return NextResponse.json({ routines: null });
    }

    return NextResponse.json({
      routines: {
        id: data.id,
        morningRoutine: data.morning_routine,
        eveningRoutine: data.evening_routine,
        favoriteFoods: data.favorite_foods,
        quirks: data.quirks,
        specialHabits: data.special_habits,
        thingsToRemember: data.things_to_remember,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
      },
    });
  } catch (error: any) {
    console.error('Routines GET error:', error);
    return NextResponse.json({ error: 'Failed to load routines' }, { status: 500 });
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
      .from('legacy_routines')
      .select('id')
      .eq('user_id', auth.userId)
      .maybeSingle();

    let data, error;

    if (existing) {
      // Update existing
      const result = await supabase
        .from('legacy_routines')
        .update({
          morning_routine: body.morningRoutine || null,
          evening_routine: body.eveningRoutine || null,
          favorite_foods: body.favoriteFoods || null,
          quirks: body.quirks || null,
          special_habits: body.specialHabits || null,
          things_to_remember: body.thingsToRemember || null,
        })
        .eq('id', existing.id)
        .select()
        .single();
      data = result.data;
      error = result.error;
    } else {
      // Insert new
      const result = await supabase
        .from('legacy_routines')
        .insert({
          user_id: auth.userId,
          morning_routine: body.morningRoutine || null,
          evening_routine: body.eveningRoutine || null,
          favorite_foods: body.favoriteFoods || null,
          quirks: body.quirks || null,
          special_habits: body.specialHabits || null,
          things_to_remember: body.thingsToRemember || null,
        })
        .select()
        .single();
      data = result.data;
      error = result.error;
    }

    if (error) throw error;

    return NextResponse.json({
      routines: {
        id: data.id,
        morningRoutine: data.morning_routine,
        eveningRoutine: data.evening_routine,
        favoriteFoods: data.favorite_foods,
        quirks: data.quirks,
        specialHabits: data.special_habits,
        thingsToRemember: data.things_to_remember,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
      },
    });
  } catch (error: any) {
    console.error('Routines POST error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to save routines' },
      { status: 500 }
    );
  }
}

