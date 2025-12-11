import { NextResponse } from 'next/server';
import { requireAuth, createServerClient } from '@/lib/auth';

export async function GET() {
  try {
    const auth = await requireAuth();
    if ('error' in auth) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const supabase = createServerClient();

    // Fetch all data in parallel
    const [
      personalDetails,
      medicalContacts,
      funeralPreferences,
      documents,
      letters,
      trustedContacts,
      releaseSettings,
      digitalAccounts,
      assets,
      legacyMessages,
      endOfLifeChecklist,
      biography,
      insuranceFinancial,
      household,
      childrenWishes,
      endOfLifeDirectives,
    ] = await Promise.all([
      supabase.from('personal_details').select('*').eq('user_id', auth.userId).single(),
      supabase.from('medical_contacts').select('*').eq('user_id', auth.userId).single(),
      supabase.from('funeral_preferences').select('*').eq('user_id', auth.userId).single(),
      supabase.from('documents').select('*').eq('user_id', auth.userId),
      supabase.from('letters').select('*').eq('user_id', auth.userId),
      supabase.from('trusted_contacts').select('*').eq('user_id', auth.userId),
      supabase.from('release_settings').select('*').eq('user_id', auth.userId).single(),
      supabase.from('digital_accounts').select('*').eq('user_id', auth.userId),
      supabase.from('assets').select('*').eq('user_id', auth.userId),
      supabase.from('legacy_messages').select('*').eq('user_id', auth.userId),
      supabase.from('end_of_life_checklist').select('*').eq('user_id', auth.userId).single(),
      supabase.from('personal_biography').select('*').eq('user_id', auth.userId).single(),
      supabase.from('insurance_financial_contacts').select('*').eq('user_id', auth.userId),
      supabase.from('household_information').select('*').eq('user_id', auth.userId).single(),
      supabase.from('children_wishes').select('*').eq('user_id', auth.userId),
      supabase.from('end_of_life_directives').select('*').eq('user_id', auth.userId).single(),
    ]);

    const summary = {
      personalDetails: personalDetails.data || null,
      medicalContacts: medicalContacts.data || null,
      funeralPreferences: funeralPreferences.data || null,
      documents: documents.data || [],
      letters: letters.data || [],
      trustedContacts: trustedContacts.data || [],
      releaseSettings: releaseSettings.data || null,
      digitalAccounts: digitalAccounts.data || [],
      assets: assets.data || [],
      legacyMessages: legacyMessages.data || [],
      endOfLifeChecklist: endOfLifeChecklist.data || null,
      biography: biography.data || null,
      insuranceFinancial: insuranceFinancial.data || [],
      household: household.data || null,
      childrenWishes: childrenWishes.data || [],
      endOfLifeDirectives: endOfLifeDirectives.data || null,
    };

    return NextResponse.json({ summary });
  } catch (error) {
    console.error('Final summary GET error:', error);
    return NextResponse.json({ error: 'Failed to load summary' }, { status: 500 });
  }
}

