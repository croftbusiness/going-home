import { NextResponse } from 'next/server';
import { requireAuth, createServerClient } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const auth = await requireAuth();
    if ('error' in auth) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const { questionnaireId } = await request.json();

    if (!questionnaireId) {
      return NextResponse.json({ error: 'Questionnaire ID is required' }, { status: 400 });
    }

    // Fetch questionnaire to verify ownership
    const supabase = createServerClient();
    const { data: questionnaire, error } = await supabase
      .from('will_questionnaires')
      .select('*')
      .eq('id', questionnaireId)
      .eq('user_id', auth.userId)
      .single();

    if (error || !questionnaire) {
      return NextResponse.json({ error: 'Questionnaire not found' }, { status: 404 });
    }

    // Call Supabase Edge Function
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

    const edgeFunctionResponse = await fetch(
      `${supabaseUrl}/functions/v1/export-will-questionnaire`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${supabaseServiceKey}`,
        },
        body: JSON.stringify({ questionnaireId }),
      }
    );

    if (!edgeFunctionResponse.ok) {
      const error = await edgeFunctionResponse.json().catch(() => ({}));
      return NextResponse.json(
        { error: error.error || 'Failed to generate PDF' },
        { status: 500 }
      );
    }

    const pdfBlob = await edgeFunctionResponse.blob();

    return new NextResponse(pdfBlob, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="will-questionnaire-${questionnaireId}.pdf"`,
      },
    });
  } catch (error: any) {
    console.error('Export error:', error);
    return NextResponse.json({ error: 'Failed to export PDF' }, { status: 500 });
  }
}

