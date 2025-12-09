import { NextResponse } from 'next/server';
import { requireAuth, createServerClient } from '@/lib/auth';

export async function GET() {
  try {
    const auth = await requireAuth();
    if ('error' in auth) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const supabase = createServerClient();

    // Get user details
    const { data: user } = await supabase
      .from('users')
      .select('email')
      .eq('id', auth.userId)
      .single();

    // Check completion status of each section
    const [
      personalDetails, medicalContacts, funeralPrefs, documents, letters, 
      trustedContacts, releaseSettings, digitalAccounts, assets, legacyMessages,
      endOfLifeChecklist, biography, insuranceFinancial, household, childrenWishes
    ] = await Promise.all([
      supabase.from('personal_details').select('id').eq('user_id', auth.userId).single(),
      supabase.from('medical_contacts').select('id').eq('user_id', auth.userId).single(),
      supabase.from('funeral_preferences').select('id').eq('user_id', auth.userId).single(),
      supabase.from('documents').select('id').eq('user_id', auth.userId).limit(1).single(),
      supabase.from('letters').select('id').eq('user_id', auth.userId).limit(1).single(),
      supabase.from('trusted_contacts').select('id').eq('user_id', auth.userId).limit(1).single(),
      supabase.from('release_settings').select('is_locked').eq('user_id', auth.userId).single(),
      supabase.from('digital_accounts').select('id').eq('user_id', auth.userId).limit(1).single(),
      supabase.from('assets').select('id').eq('user_id', auth.userId).limit(1).single(),
      supabase.from('legacy_messages').select('id').eq('user_id', auth.userId).limit(1).single(),
      supabase.from('end_of_life_checklist').select('id').eq('user_id', auth.userId).single(),
      supabase.from('personal_biography').select('id').eq('user_id', auth.userId).single(),
      supabase.from('insurance_financial_contacts').select('id').eq('user_id', auth.userId).limit(1).single(),
      supabase.from('household_information').select('id').eq('user_id', auth.userId).single(),
      supabase.from('children_wishes').select('id').eq('user_id', auth.userId).limit(1).single(),
    ]);

    const status = {
      personalDetails: !!personalDetails.data,
      medicalContacts: !!medicalContacts.data,
      funeralPreferences: !!funeralPrefs.data,
      documents: !!documents.data,
      letters: !!letters.data,
      trustedContacts: !!trustedContacts.data,
      releaseSettings: releaseSettings.data?.is_locked || false,
      digitalAccounts: !!digitalAccounts.data,
      assets: !!assets.data,
      legacyMessages: !!legacyMessages.data,
      endOfLifeChecklist: !!endOfLifeChecklist.data,
      biography: !!biography.data,
      insuranceFinancial: !!insuranceFinancial.data,
      household: !!household.data,
      childrenWishes: !!childrenWishes.data,
    };

    return NextResponse.json({
      userName: user?.email?.split('@')[0] || 'User',
      status,
    });
  } catch (error) {
    console.error('Status error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
