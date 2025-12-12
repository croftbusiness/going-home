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
      .from('will_questionnaires')
      .select('*')
      .eq('user_id', auth.userId)
      .maybeSingle();

    if (error && error.code !== 'PGRST116') {
      throw error;
    }

    if (!data) {
      return NextResponse.json({ questionnaire: null });
    }

    return NextResponse.json({ 
      questionnaire: {
        id: data.id,
        personalInfo: data.personal_info,
        executor: data.executor,
        guardians: data.guardians,
        bequests: data.bequests,
        digitalAssets: data.digital_assets,
        notes: data.notes,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
      }
    });
  } catch (error) {
    console.error('Will questionnaire GET error:', error);
    return NextResponse.json({ error: 'Failed to load questionnaire' }, { status: 500 });
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
      .from('will_questionnaires')
      .select('id')
      .eq('user_id', auth.userId)
      .maybeSingle();

    const questionnaireData = {
      user_id: auth.userId,
      personal_info: body.personalInfo || null,
      executor: body.executor || null,
      guardians: body.guardians || null,
      bequests: body.bequests || null,
      digital_assets: body.digitalAssets || null,
      notes: body.notes || null,
    };

    let data, error;
    if (existing) {
      // Update existing record
      const result = await supabase
        .from('will_questionnaires')
        .update(questionnaireData)
        .eq('user_id', auth.userId)
        .select()
        .single();
      data = result.data;
      error = result.error;
    } else {
      // Insert new record
      const result = await supabase
        .from('will_questionnaires')
        .insert(questionnaireData)
        .select()
        .single();
      data = result.data;
      error = result.error;
    }

    if (error) throw error;

    return NextResponse.json({ 
      questionnaire: {
        id: data.id,
        personalInfo: data.personal_info,
        executor: data.executor,
        guardians: data.guardians,
        bequests: data.bequests,
        digitalAssets: data.digital_assets,
        notes: data.notes,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
      }
    });
  } catch (error) {
    console.error('Will questionnaire POST error:', error);
    return NextResponse.json({ error: 'Failed to save questionnaire' }, { status: 500 });
  }
}






