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
      .from('end_of_life_checklist')
      .select('*')
      .eq('user_id', auth.userId)
      .single();

    if (error && error.code !== 'PGRST116') throw error;

    if (!data) {
      return NextResponse.json({ checklist: null });
    }

    const checklist = {
      id: data.id,
      organDonationPreference: data.organ_donation_preference,
      organDonationDetails: data.organ_donation_details,
      lastWords: data.last_words,
      finalNotes: data.final_notes,
      prayers: data.prayers,
      scriptures: data.scriptures,
      songs: data.songs,
      poems: data.poems,
      readings: data.readings,
      immediateNotifications: data.immediate_notifications,
      doNotDoList: data.do_not_do_list,
      specialInstructions: data.special_instructions,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };

    return NextResponse.json({ checklist });
  } catch (error) {
    console.error('End of life checklist GET error:', error);
    return NextResponse.json({ error: 'Failed to load checklist' }, { status: 500 });
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
      .from('end_of_life_checklist')
      .select('id')
      .eq('user_id', auth.userId)
      .maybeSingle();

    const checklistData: any = {
      user_id: auth.userId,
      organ_donation_preference: body.organDonationPreference,
      organ_donation_details: body.organDonationDetails,
      last_words: body.lastWords,
      final_notes: body.finalNotes,
      prayers: body.prayers,
      scriptures: body.scriptures,
      songs: body.songs,
      poems: body.poems,
      readings: body.readings,
      immediate_notifications: body.immediateNotifications,
      do_not_do_list: body.doNotDoList,
      special_instructions: body.specialInstructions,
    };

    let data, error;
    if (existing) {
      const result = await supabase
        .from('end_of_life_checklist')
        .update(checklistData)
        .eq('user_id', auth.userId)
        .select()
        .single();
      data = result.data;
      error = result.error;
    } else {
      const result = await supabase
        .from('end_of_life_checklist')
        .insert(checklistData)
        .select()
        .single();
      data = result.data;
      error = result.error;
    }

    if (error) throw error;
    return NextResponse.json({ checklist: data });
  } catch (error) {
    console.error('End of life checklist POST error:', error);
    return NextResponse.json({ error: 'Failed to save checklist' }, { status: 500 });
  }
}

