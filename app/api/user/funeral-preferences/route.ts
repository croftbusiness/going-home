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
      .from('funeral_preferences')
      .select('*')
      .eq('user_id', auth.userId)
      .single();

    if (error && error.code !== 'PGRST116') {
      throw error;
    }

    // Transform snake_case to camelCase for frontend
    const funeralPreferences = data ? {
      burialOrCremation: data.burial_or_cremation || '',
      funeralHome: data.funeral_home || '',
      serviceType: data.service_type || '',
      atmosphereWishes: data.atmosphere_wishes || '',
      song1: data.song_1 || '',
      song2: data.song_2 || '',
      song3: data.song_3 || '',
      photoPreferenceUrl: data.photo_preference_url || '',
      preferredClothing: data.preferred_clothing || '',
    } : null;

    return NextResponse.json({ funeralPreferences });
  } catch (error) {
    console.error('Funeral preferences GET error:', error);
    return NextResponse.json({ error: 'Failed to load' }, { status: 500 });
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
    const { data: existing, error: checkError } = await supabase
      .from('funeral_preferences')
      .select('id')
      .eq('user_id', auth.userId)
      .maybeSingle();

    const funeralPreferencesData = {
      user_id: auth.userId,
      burial_or_cremation: body.burialOrCremation,
      funeral_home: body.funeralHome,
      service_type: body.serviceType,
      atmosphere_wishes: body.atmosphereWishes,
      song_1: body.song1,
      song_2: body.song2,
      song_3: body.song3,
      photo_preference_url: body.photoPreferenceUrl,
      preferred_clothing: body.preferredClothing,
    };

    let data, error;
    if (existing) {
      // Update existing record
      const result = await supabase
        .from('funeral_preferences')
        .update(funeralPreferencesData)
        .eq('user_id', auth.userId)
        .select()
        .single();
      data = result.data;
      error = result.error;
    } else {
      // Insert new record
      const result = await supabase
        .from('funeral_preferences')
        .insert(funeralPreferencesData)
        .select()
        .single();
      data = result.data;
      error = result.error;
    }

    if (error) throw error;

    // Transform snake_case to camelCase for frontend
    const funeralPreferences = data ? {
      burialOrCremation: data.burial_or_cremation || '',
      funeralHome: data.funeral_home || '',
      serviceType: data.service_type || '',
      atmosphereWishes: data.atmosphere_wishes || '',
      song1: data.song_1 || '',
      song2: data.song_2 || '',
      song3: data.song_3 || '',
      photoPreferenceUrl: data.photo_preference_url || '',
      preferredClothing: data.preferred_clothing || '',
    } : null;

    return NextResponse.json({ funeralPreferences });
  } catch (error) {
    console.error('Funeral preferences POST error:', error);
    return NextResponse.json({ error: 'Failed to save' }, { status: 500 });
  }
}
