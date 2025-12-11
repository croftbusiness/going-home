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
      .from('end_of_life_directives')
      .select('*')
      .eq('user_id', auth.userId)
      .maybeSingle();

    if (error && error.code !== 'PGRST116') {
      throw error;
    }

    // Transform snake_case to camelCase for frontend
    const directives = data ? {
      // Care Location
      preferredPlaceToPass: data.preferred_place_to_pass || '',
      secondaryOption: data.secondary_option || '',
      notesForFamily: data.notes_for_family || '',
      environmentPreferences: data.environment_preferences || '',
      
      // Visitors & Personal Presence
      whoWantPresent: data.who_want_present || '',
      whoNotWantPresent: data.who_not_want_present || '',
      maxVisitors: data.max_visitors || null,
      visitorHours: data.visitor_hours || '',
      privacyQuietPreferences: data.privacy_quiet_preferences || '',
      
      // Pain Management
      preferredPainMedications: data.preferred_pain_medications || '',
      medicationsNotWanted: data.medications_not_wanted || '',
      comfortMeasures: data.comfort_measures || '',
      sedationLevel: data.sedation_level || '',
      
      // Life-Sustaining Treatment
      cprPreference: data.cpr_preference || '',
      ventilatorPreference: data.ventilator_preference || '',
      feedingTubePreference: data.feeding_tube_preference || '',
      ivHydrationPreference: data.iv_hydration_preference || '',
      antibioticsPreference: data.antibiotics_preference || '',
      conditionalDecisions: data.conditional_decisions || '',
      notesForDoctors: data.notes_for_doctors || '',
      
      // Organ Donation
      donorStatus: data.donor_status || '',
      organsTissuesConsent: data.organs_tissues_consent || '',
      religiousPhilosophicalNotes: data.religious_philosophical_notes || '',
      organDonationOrgContact: data.organ_donation_org_contact || '',
      
      // Spiritual Care
      preferredSpiritualLeader: data.preferred_spiritual_leader || '',
      specificPrayersRituals: data.specific_prayers_rituals || '',
      favoriteBibleVerses: data.favorite_bible_verses || '',
      worshipMusicPreferences: data.worship_music_preferences || '',
      notesForSpiritualCaregivers: data.notes_for_spiritual_caregivers || '',
      
      // Sensory Environment
      lightingPreferences: data.lighting_preferences || '',
      soundPreferences: data.sound_preferences || '',
      scentPreferences: data.scent_preferences || '',
      clothingBlanketsComfort: data.clothing_blankets_comfort || '',
      itemsWantAround: data.items_want_around || '',
      
      // Emergency Instructions
      whoToCallFirst: data.who_to_call_first || '',
      whenNotToCall911: data.when_not_to_call_911 || '',
      hospiceInstructions: data.hospice_instructions || '',
      underNoCircumstances: data.under_no_circumstances || '',
      importantDocumentsLocation: data.important_documents_location || '',
      
      // Final Moments
      whatLovedOnesShouldKnow: data.what_loved_ones_should_know || '',
      lastRightsRitualsTraditions: data.last_rights_rituals_traditions || '',
      touchHoldingHandsPreference: data.touch_holding_hands_preference || '',
      whatToSayReadAloud: data.what_to_say_read_aloud || '',
      finalMessageForFamily: data.final_message_for_family || '',
    } : null;

    return NextResponse.json({ directives });
  } catch (error) {
    console.error('End of life directives GET error:', error);
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

    // Get existing data to preserve fields not being updated
    const { data: existing } = await supabase
      .from('end_of_life_directives')
      .select('*')
      .eq('user_id', auth.userId)
      .maybeSingle();

    // Helper function to merge: use new value if provided, otherwise keep existing
    const mergeField = (newVal: any, existingVal: any) => {
      return newVal !== undefined ? (newVal || null) : (existingVal || null);
    };

    // Merge existing data with new data (new data takes precedence)
    const directivesData: any = {
      user_id: auth.userId,
      // Care Location
      preferred_place_to_pass: mergeField(body.preferredPlaceToPass, existing?.preferred_place_to_pass),
      secondary_option: mergeField(body.secondaryOption, existing?.secondary_option),
      notes_for_family: mergeField(body.notesForFamily, existing?.notes_for_family),
      environment_preferences: mergeField(body.environmentPreferences, existing?.environment_preferences),
      
      // Visitors & Personal Presence
      who_want_present: mergeField(body.whoWantPresent, existing?.who_want_present),
      who_not_want_present: mergeField(body.whoNotWantPresent, existing?.who_not_want_present),
      max_visitors: mergeField(body.maxVisitors, existing?.max_visitors),
      visitor_hours: mergeField(body.visitorHours, existing?.visitor_hours),
      privacy_quiet_preferences: mergeField(body.privacyQuietPreferences, existing?.privacy_quiet_preferences),
      
      // Pain Management
      preferred_pain_medications: mergeField(body.preferredPainMedications, existing?.preferred_pain_medications),
      medications_not_wanted: mergeField(body.medicationsNotWanted, existing?.medications_not_wanted),
      comfort_measures: mergeField(body.comfortMeasures, existing?.comfort_measures),
      sedation_level: mergeField(body.sedationLevel, existing?.sedation_level),
      
      // Life-Sustaining Treatment
      cpr_preference: mergeField(body.cprPreference, existing?.cpr_preference),
      ventilator_preference: mergeField(body.ventilatorPreference, existing?.ventilator_preference),
      feeding_tube_preference: mergeField(body.feedingTubePreference, existing?.feeding_tube_preference),
      iv_hydration_preference: mergeField(body.ivHydrationPreference, existing?.iv_hydration_preference),
      antibiotics_preference: mergeField(body.antibioticsPreference, existing?.antibiotics_preference),
      conditional_decisions: mergeField(body.conditionalDecisions, existing?.conditional_decisions),
      notes_for_doctors: mergeField(body.notesForDoctors, existing?.notes_for_doctors),
      
      // Organ Donation
      donor_status: mergeField(body.donorStatus, existing?.donor_status),
      organs_tissues_consent: mergeField(body.organsTissuesConsent, existing?.organs_tissues_consent),
      religious_philosophical_notes: mergeField(body.religiousPhilosophicalNotes, existing?.religious_philosophical_notes),
      organ_donation_org_contact: mergeField(body.organDonationOrgContact, existing?.organ_donation_org_contact),
      
      // Spiritual Care
      preferred_spiritual_leader: mergeField(body.preferredSpiritualLeader, existing?.preferred_spiritual_leader),
      specific_prayers_rituals: mergeField(body.specificPrayersRituals, existing?.specific_prayers_rituals),
      favorite_bible_verses: mergeField(body.favoriteBibleVerses, existing?.favorite_bible_verses),
      worship_music_preferences: mergeField(body.worshipMusicPreferences, existing?.worship_music_preferences),
      notes_for_spiritual_caregivers: mergeField(body.notesForSpiritualCaregivers, existing?.notes_for_spiritual_caregivers),
      
      // Sensory Environment
      lighting_preferences: mergeField(body.lightingPreferences, existing?.lighting_preferences),
      sound_preferences: mergeField(body.soundPreferences, existing?.sound_preferences),
      scent_preferences: mergeField(body.scentPreferences, existing?.scent_preferences),
      clothing_blankets_comfort: mergeField(body.clothingBlanketsComfort, existing?.clothing_blankets_comfort),
      items_want_around: mergeField(body.itemsWantAround, existing?.items_want_around),
      
      // Emergency Instructions
      who_to_call_first: mergeField(body.whoToCallFirst, existing?.who_to_call_first),
      when_not_to_call_911: mergeField(body.whenNotToCall911, existing?.when_not_to_call_911),
      hospice_instructions: mergeField(body.hospiceInstructions, existing?.hospice_instructions),
      under_no_circumstances: mergeField(body.underNoCircumstances, existing?.under_no_circumstances),
      important_documents_location: mergeField(body.importantDocumentsLocation, existing?.important_documents_location),
      
      // Final Moments
      what_loved_ones_should_know: mergeField(body.whatLovedOnesShouldKnow, existing?.what_loved_ones_should_know),
      last_rights_rituals_traditions: mergeField(body.lastRightsRitualsTraditions, existing?.last_rights_rituals_traditions),
      touch_holding_hands_preference: mergeField(body.touchHoldingHandsPreference, existing?.touch_holding_hands_preference),
      what_to_say_read_aloud: mergeField(body.whatToSayReadAloud, existing?.what_to_say_read_aloud),
      final_message_for_family: mergeField(body.finalMessageForFamily, existing?.final_message_for_family),
    };

    let data, error;
    if (existing) {
      const result = await supabase
        .from('end_of_life_directives')
        .update(directivesData)
        .eq('user_id', auth.userId)
        .select()
        .single();
      data = result.data;
      error = result.error;
    } else {
      const result = await supabase
        .from('end_of_life_directives')
        .insert(directivesData)
        .select()
        .single();
      data = result.data;
      error = result.error;
    }

    if (error) throw error;

    // Transform back to camelCase
    const directives = data ? {
      preferredPlaceToPass: data.preferred_place_to_pass || '',
      secondaryOption: data.secondary_option || '',
      notesForFamily: data.notes_for_family || '',
      environmentPreferences: data.environment_preferences || '',
      whoWantPresent: data.who_want_present || '',
      whoNotWantPresent: data.who_not_want_present || '',
      maxVisitors: data.max_visitors || null,
      visitorHours: data.visitor_hours || '',
      privacyQuietPreferences: data.privacy_quiet_preferences || '',
      preferredPainMedications: data.preferred_pain_medications || '',
      medicationsNotWanted: data.medications_not_wanted || '',
      comfortMeasures: data.comfort_measures || '',
      sedationLevel: data.sedation_level || '',
      cprPreference: data.cpr_preference || '',
      ventilatorPreference: data.ventilator_preference || '',
      feedingTubePreference: data.feeding_tube_preference || '',
      ivHydrationPreference: data.iv_hydration_preference || '',
      antibioticsPreference: data.antibiotics_preference || '',
      conditionalDecisions: data.conditional_decisions || '',
      notesForDoctors: data.notes_for_doctors || '',
      donorStatus: data.donor_status || '',
      organsTissuesConsent: data.organs_tissues_consent || '',
      religiousPhilosophicalNotes: data.religious_philosophical_notes || '',
      organDonationOrgContact: data.organ_donation_org_contact || '',
      preferredSpiritualLeader: data.preferred_spiritual_leader || '',
      specificPrayersRituals: data.specific_prayers_rituals || '',
      favoriteBibleVerses: data.favorite_bible_verses || '',
      worshipMusicPreferences: data.worship_music_preferences || '',
      notesForSpiritualCaregivers: data.notes_for_spiritual_caregivers || '',
      lightingPreferences: data.lighting_preferences || '',
      soundPreferences: data.sound_preferences || '',
      scentPreferences: data.scent_preferences || '',
      clothingBlanketsComfort: data.clothing_blankets_comfort || '',
      itemsWantAround: data.items_want_around || '',
      whoToCallFirst: data.who_to_call_first || '',
      whenNotToCall911: data.when_not_to_call_911 || '',
      hospiceInstructions: data.hospice_instructions || '',
      underNoCircumstances: data.under_no_circumstances || '',
      importantDocumentsLocation: data.important_documents_location || '',
      whatLovedOnesShouldKnow: data.what_loved_ones_should_know || '',
      lastRightsRitualsTraditions: data.last_rights_rituals_traditions || '',
      touchHoldingHandsPreference: data.touch_holding_hands_preference || '',
      whatToSayReadAloud: data.what_to_say_read_aloud || '',
      finalMessageForFamily: data.final_message_for_family || '',
    } : null;

    return NextResponse.json({ directives });
  } catch (error) {
    console.error('End of life directives POST error:', error);
    return NextResponse.json({ error: 'Failed to save' }, { status: 500 });
  }
}

