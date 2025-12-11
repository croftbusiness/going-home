import { NextResponse } from 'next/server';
import { requireAuth, createServerClient } from '@/lib/auth';

export async function POST() {
  try {
    const auth = await requireAuth();
    if ('error' in auth) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const supabase = createServerClient();

    // Mark onboarding as complete
    const { error } = await supabase
      .from('users')
      .update({ onboarding_complete: true })
      .eq('id', auth.userId);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Onboarding complete error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to mark onboarding complete' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const auth = await requireAuth();
    if ('error' in auth) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const supabase = createServerClient();

    // Check onboarding status
    const { data, error } = await supabase
      .from('users')
      .select('onboarding_complete')
      .eq('id', auth.userId)
      .single();

    if (error) throw error;

    return NextResponse.json({ 
      onboardingComplete: data?.onboarding_complete || false 
    });
  } catch (error: any) {
    console.error('Check onboarding error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to check onboarding status' },
      { status: 500 }
    );
  }
}

