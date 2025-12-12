import { NextResponse } from 'next/server';
import { requireAuth, createServerClient } from '@/lib/auth';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';

export async function POST(request: Request) {
  try {
    const auth = await requireAuth();
    if ('error' in auth) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const body = await request.json();
    const { sections, template } = body;

    if (!sections || !Array.isArray(sections)) {
      return NextResponse.json({ error: 'Sections array is required' }, { status: 400 });
    }

    // Fetch all user data
    const supabase = createServerClient();
    const [
      personalDetails,
      medicalContacts,
      funeralPreferences,
      documents,
      letters,
      trustedContacts,
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

    const data = {
      personalDetails: personalDetails.data,
      medicalContacts: medicalContacts.data,
      funeralPreferences: funeralPreferences.data,
      documents: documents.data || [],
      letters: letters.data || [],
      trustedContacts: trustedContacts.data || [],
      digitalAccounts: digitalAccounts.data || [],
      assets: assets.data || [],
      legacyMessages: legacyMessages.data || [],
      endOfLifeChecklist: endOfLifeChecklist.data,
      biography: biography.data,
      insuranceFinancial: insuranceFinancial.data || [],
      household: household.data,
      childrenWishes: childrenWishes.data || [],
      endOfLifeDirectives: endOfLifeDirectives.data,
    };

    // Generate PDF
    const pdfBytes = await generatePDF(data, sections, template);

    // Convert to Buffer
    const pdfBuffer = Buffer.from(pdfBytes);

    const fileName = template 
      ? `final-arrangements-${template}-${Date.now()}.pdf`
      : `final-arrangements-${Date.now()}.pdf`;

    return new NextResponse(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${fileName}"`,
      },
    });
  } catch (error: any) {
    console.error('PDF export error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to export PDF' },
      { status: 500 }
    );
  }
}

async function generatePDF(
  data: any,
  sections: string[],
  template?: string
): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.create();
  let page = pdfDoc.addPage([612, 792]); // Letter size
  const { width, height } = page.getSize();
  const margin = 50;
  let y = height - margin;

  // Embed fonts
  const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const helveticaBoldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const helveticaObliqueFont = await pdfDoc.embedFont(StandardFonts.HelveticaOblique);

  // Helper function to add text with wrapping
  const addText = (
    text: string,
    size: number,
    bold: boolean = false,
    textColor = rgb(0.17, 0.16, 0.16), // #2C2A29
    indent: number = 0
  ) => {
    const font = bold ? helveticaBoldFont : helveticaFont;
    const maxWidth = width - 2 * margin - indent;
    
    if (!text) return;
    
    // Simple text wrapping
    const words = String(text).split(' ');
    const lines: string[] = [];
    let currentLine = '';
    
    for (const word of words) {
      const testLine = currentLine + (currentLine ? ' ' : '') + word;
      const textWidth = font.widthOfTextAtSize(testLine, size);
      if (textWidth > maxWidth && currentLine) {
        lines.push(currentLine);
        currentLine = word;
      } else {
        currentLine = testLine;
      }
    }
    if (currentLine) lines.push(currentLine);
    
    // Draw each line
    for (const line of lines) {
      if (y < margin + 30) {
        page = pdfDoc.addPage([612, 792]);
        y = height - margin;
      }
      page.drawText(line, {
        x: margin + indent,
        y: y,
        size: size,
        font: font,
        color: textColor,
      });
      y -= size + 4;
    }
    y -= 4; // Extra space after block
  };

  // Add header with logo area
  const headerColor = rgb(0.65, 0.73, 0.60); // #A5B99A
  page.drawRectangle({
    x: 0,
    y: height - 80,
    width: width,
    height: 80,
    color: headerColor,
  });

  page.drawText('Final Arrangements Summary', {
    x: margin,
    y: height - 50,
    size: 24,
    font: helveticaBoldFont,
    color: rgb(1, 1, 1),
  });

  if (template) {
    page.drawText(`Template: ${template.charAt(0).toUpperCase() + template.slice(1)}`, {
      x: margin,
      y: height - 70,
      size: 10,
      font: helveticaFont,
      color: rgb(1, 1, 1),
    });
  }

  page.drawText(`Generated: ${new Date().toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  })}`, {
    x: width - margin - 150,
    y: height - 70,
    size: 10,
    font: helveticaFont,
    color: rgb(1, 1, 1),
  });

  y = height - 100;

  // Personal Details
  if (sections.includes('personalDetails') && data.personalDetails) {
    addText('PERSONAL DETAILS', 14, true, rgb(0.65, 0.73, 0.60));
    const pd = data.personalDetails;
    if (pd.full_name) addText(`Full Name: ${pd.full_name}`, 11);
    if (pd.preferred_name) addText(`Preferred Name: ${pd.preferred_name}`, 11);
    if (pd.date_of_birth) addText(`Date of Birth: ${pd.date_of_birth}`, 11);
    if (pd.phone) addText(`Phone: ${pd.phone}`, 11);
    if (pd.email) addText(`Email: ${pd.email}`, 11);
    if (pd.address) {
      addText(`Address: ${pd.address}`, 11);
      if (pd.city && pd.state) {
        addText(`${pd.city}, ${pd.state} ${pd.zip_code || ''}`, 11, false, rgb(0.17, 0.16, 0.16), 20);
      }
    }
    if (pd.emergency_contact_name) {
      addText(`Emergency Contact: ${pd.emergency_contact_name}`, 11);
      if (pd.emergency_contact_phone) addText(`Phone: ${pd.emergency_contact_phone}`, 11, false, rgb(0.17, 0.16, 0.16), 20);
      if (pd.emergency_contact_relationship) addText(`Relationship: ${pd.emergency_contact_relationship}`, 11, false, rgb(0.17, 0.16, 0.16), 20);
    }
    y -= 10;
  }

  // Medical Contacts
  if (sections.includes('medicalContacts') && data.medicalContacts) {
    addText('MEDICAL & LEGAL CONTACTS', 14, true, rgb(0.65, 0.73, 0.60));
    const mc = data.medicalContacts;
    if (mc.physician_name) {
      addText(`Physician: ${mc.physician_name}`, 11);
      if (mc.physician_phone) addText(`Phone: ${mc.physician_phone}`, 11, false, rgb(0.17, 0.16, 0.16), 20);
    }
    if (mc.lawyer_name) {
      addText(`Attorney: ${mc.lawyer_name}`, 11);
      if (mc.lawyer_phone) addText(`Phone: ${mc.lawyer_phone}`, 11, false, rgb(0.17, 0.16, 0.16), 20);
    }
    if (mc.medical_notes) {
      addText('Medical Notes:', 11, true);
      addText(mc.medical_notes, 10, false, rgb(0.17, 0.16, 0.16), 20);
    }
    y -= 10;
  }

  // End-of-Life Directives
  if (sections.includes('endOfLifeDirectives') && data.endOfLifeDirectives) {
    addText('END-OF-LIFE DIRECTIVES', 14, true, rgb(0.65, 0.73, 0.60));
    const eol = data.endOfLifeDirectives;
    
    if (eol.preferred_place_to_pass) {
      addText('Care Location:', 11, true);
      addText(`Preferred: ${eol.preferred_place_to_pass}`, 10, false, rgb(0.17, 0.16, 0.16), 20);
      if (eol.secondary_option) addText(`Secondary: ${eol.secondary_option}`, 10, false, rgb(0.17, 0.16, 0.16), 20);
      if (eol.environment_preferences) addText(`Environment: ${eol.environment_preferences}`, 10, false, rgb(0.17, 0.16, 0.16), 20);
    }
    
    if (eol.who_want_present || eol.visitor_hours) {
      addText('Visitors & Presence:', 11, true);
      if (eol.who_want_present) addText(eol.who_want_present, 10, false, rgb(0.17, 0.16, 0.16), 20);
      if (eol.visitor_hours) addText(`Hours: ${eol.visitor_hours}`, 10, false, rgb(0.17, 0.16, 0.16), 20);
      if (eol.max_visitors) addText(`Max visitors: ${eol.max_visitors}`, 10, false, rgb(0.17, 0.16, 0.16), 20);
    }
    
    if (eol.preferred_pain_medications || eol.comfort_measures) {
      addText('Pain Management:', 11, true);
      if (eol.preferred_pain_medications) addText(eol.preferred_pain_medications, 10, false, rgb(0.17, 0.16, 0.16), 20);
      if (eol.comfort_measures) addText(`Comfort: ${eol.comfort_measures}`, 10, false, rgb(0.17, 0.16, 0.16), 20);
      if (eol.sedation_level) addText(`Sedation level: ${eol.sedation_level}`, 10, false, rgb(0.17, 0.16, 0.16), 20);
    }
    
    if (eol.cpr_preference || eol.ventilator_preference) {
      addText('Life-Sustaining Treatments:', 11, true);
      if (eol.cpr_preference) addText(`CPR: ${eol.cpr_preference}`, 10, false, rgb(0.17, 0.16, 0.16), 20);
      if (eol.ventilator_preference) addText(`Ventilator: ${eol.ventilator_preference}`, 10, false, rgb(0.17, 0.16, 0.16), 20);
      if (eol.feeding_tube_preference) addText(`Feeding tube: ${eol.feeding_tube_preference}`, 10, false, rgb(0.17, 0.16, 0.16), 20);
      if (eol.iv_hydration_preference) addText(`IV hydration: ${eol.iv_hydration_preference}`, 10, false, rgb(0.17, 0.16, 0.16), 20);
      if (eol.notes_for_doctors) addText(`Notes: ${eol.notes_for_doctors}`, 10, false, rgb(0.17, 0.16, 0.16), 20);
    }
    
    if (eol.donor_status) {
      addText('Organ Donation:', 11, true);
      addText(`Status: ${eol.donor_status}`, 10, false, rgb(0.17, 0.16, 0.16), 20);
      if (eol.organs_tissues_consent) addText(eol.organs_tissues_consent, 10, false, rgb(0.17, 0.16, 0.16), 20);
    }
    
    if (eol.preferred_spiritual_leader || eol.favorite_bible_verses) {
      addText('Spiritual Care:', 11, true);
      if (eol.preferred_spiritual_leader) addText(eol.preferred_spiritual_leader, 10, false, rgb(0.17, 0.16, 0.16), 20);
      if (eol.favorite_bible_verses) addText(`Verses: ${eol.favorite_bible_verses}`, 10, false, rgb(0.17, 0.16, 0.16), 20);
    }
    
    if (eol.who_to_call_first || eol.hospice_instructions) {
      addText('Emergency Instructions:', 11, true);
      if (eol.who_to_call_first) addText(eol.who_to_call_first, 10, false, rgb(0.17, 0.16, 0.16), 20);
      if (eol.hospice_instructions) addText(`Hospice: ${eol.hospice_instructions}`, 10, false, rgb(0.17, 0.16, 0.16), 20);
      if (eol.when_not_to_call_911) addText(`Do NOT call 911: ${eol.when_not_to_call_911}`, 10, false, rgb(0.17, 0.16, 0.16), 20);
    }
    
    if (eol.final_message_for_family) {
      addText('Final Message:', 11, true);
      addText(eol.final_message_for_family, 10, false, rgb(0.17, 0.16, 0.16), 20);
    }
    
    y -= 10;
  }

  // Funeral Preferences
  if (sections.includes('funeralPreferences') && data.funeralPreferences) {
    addText('FUNERAL PREFERENCES', 14, true, rgb(0.65, 0.73, 0.60));
    const fp = data.funeralPreferences;
    if (fp.burial_or_cremation) addText(`Preference: ${fp.burial_or_cremation}`, 11);
    if (fp.funeral_home) addText(`Funeral Home: ${fp.funeral_home}`, 11);
    if (fp.service_type) addText(`Service Type: ${fp.service_type}`, 11);
    if (fp.atmosphere_wishes) {
      addText('Atmosphere Wishes:', 11, true);
      addText(fp.atmosphere_wishes, 10, false, rgb(0.17, 0.16, 0.16), 20);
    }
    if (fp.song_1) addText(`Song 1: ${fp.song_1}`, 11);
    if (fp.song_2) addText(`Song 2: ${fp.song_2}`, 11);
    if (fp.song_3) addText(`Song 3: ${fp.song_3}`, 11);
    y -= 10;
  }

  // Trusted Contacts
  if (sections.includes('trustedContacts') && data.trustedContacts && data.trustedContacts.length > 0) {
    addText('TRUSTED CONTACTS', 14, true, rgb(0.65, 0.73, 0.60));
    data.trustedContacts.forEach((contact: any, idx: number) => {
      addText(`${idx + 1}. ${contact.name}`, 11, true);
      addText(`   Relationship: ${contact.relationship}`, 10, false, rgb(0.17, 0.16, 0.16), 20);
      addText(`   Email: ${contact.email}`, 10, false, rgb(0.17, 0.16, 0.16), 20);
      addText(`   Phone: ${contact.phone}`, 10, false, rgb(0.17, 0.16, 0.16), 20);
    });
    y -= 10;
  }

  // Documents
  if (sections.includes('documents') && data.documents && data.documents.length > 0) {
    addText('DOCUMENTS', 14, true, rgb(0.65, 0.73, 0.60));
    data.documents.forEach((doc: any, idx: number) => {
      addText(`${idx + 1}. ${doc.document_type}: ${doc.file_name}`, 11);
      if (doc.note) addText(`   Note: ${doc.note}`, 10, false, rgb(0.17, 0.16, 0.16), 20);
    });
    y -= 10;
  }

  // Assets
  if (sections.includes('assets') && data.assets && data.assets.length > 0) {
    addText('ASSETS', 14, true, rgb(0.65, 0.73, 0.60));
    data.assets.forEach((asset: any, idx: number) => {
      addText(`${idx + 1}. ${asset.name} (${asset.asset_type})`, 11);
      if (asset.estimated_value) addText(`   Value: ${asset.estimated_value}`, 10, false, rgb(0.17, 0.16, 0.16), 20);
      if (asset.location) addText(`   Location: ${asset.location}`, 10, false, rgb(0.17, 0.16, 0.16), 20);
    });
    y -= 10;
  }

  // Insurance & Financial
  if (sections.includes('insuranceFinancial') && data.insuranceFinancial && data.insuranceFinancial.length > 0) {
    addText('INSURANCE & FINANCIAL CONTACTS', 14, true, rgb(0.65, 0.73, 0.60));
    data.insuranceFinancial.forEach((contact: any, idx: number) => {
      addText(`${idx + 1}. ${contact.company_name || contact.contact_type}`, 11);
      if (contact.policy_number) addText(`   Policy: ${contact.policy_number}`, 10, false, rgb(0.17, 0.16, 0.16), 20);
      if (contact.phone) addText(`   Phone: ${contact.phone}`, 10, false, rgb(0.17, 0.16, 0.16), 20);
    });
    y -= 10;
  }

  // Household
  if (sections.includes('household') && data.household) {
    addText('HOUSEHOLD INFORMATION', 14, true, rgb(0.65, 0.73, 0.60));
    const hh = data.household;
    if (hh.pet_care_instructions) {
      addText('Pet Care Instructions:', 11, true);
      addText(hh.pet_care_instructions, 10, false, rgb(0.17, 0.16, 0.16), 20);
    }
    if (hh.home_access_codes) {
      addText('Home Access Codes:', 11, true);
      addText('(Available in secure system)', 10, false, rgb(0.5, 0.5, 0.5), 20);
    }
    y -= 10;
  }

  // Digital Accounts
  if (sections.includes('digitalAccounts') && data.digitalAccounts && data.digitalAccounts.length > 0) {
    addText('DIGITAL ACCOUNTS', 14, true, rgb(0.65, 0.73, 0.60));
    data.digitalAccounts.forEach((account: any, idx: number) => {
      addText(`${idx + 1}. ${account.account_name} (${account.account_type})`, 11);
    });
    y -= 10;
  }

  // Children's Wishes
  if (sections.includes('childrenWishes') && data.childrenWishes && data.childrenWishes.length > 0) {
    addText('CHILDREN\'S WISHES', 14, true, rgb(0.65, 0.73, 0.60));
    data.childrenWishes.forEach((wish: any, idx: number) => {
      if (wish.child_name) addText(`${idx + 1}. ${wish.child_name}`, 11, true);
      if (wish.guardian_name) addText(`   Guardian: ${wish.guardian_name}`, 10, false, rgb(0.17, 0.16, 0.16), 20);
      if (wish.personal_message) {
        addText('   Message:', 10, true, rgb(0.17, 0.16, 0.16), 20);
        addText(wish.personal_message.substring(0, 200), 9, false, rgb(0.17, 0.16, 0.16), 30);
      }
    });
    y -= 10;
  }

  // Biography
  if (sections.includes('biography') && data.biography) {
    addText('PERSONAL BIOGRAPHY', 14, true, rgb(0.65, 0.73, 0.60));
    const bio = data.biography;
    if (bio.life_story) {
      addText('Life Story:', 11, true);
      addText(bio.life_story.substring(0, 500), 10, false, rgb(0.17, 0.16, 0.16), 20);
    }
    if (bio.major_accomplishments) {
      addText('Major Accomplishments:', 11, true);
      addText(bio.major_accomplishments.substring(0, 300), 10, false, rgb(0.17, 0.16, 0.16), 20);
    }
    y -= 10;
  }

  // Footer
  y -= 20;
  if (y < margin + 50) {
    page = pdfDoc.addPage([612, 792]);
    y = height - margin;
  }
  
  page.drawLine({
    start: { x: margin, y: y },
    end: { x: width - margin, y: y },
    thickness: 0.5,
    color: rgb(0.8, 0.8, 0.8),
  });
  y -= 15;

  addText('This document contains sensitive personal information. Please handle with care.', 9, false, rgb(0.5, 0.5, 0.5));
  addText('Generated by ReadyAtHand - Calm preparedness for life\'s unexpected moments.', 9, false, rgb(0.5, 0.5, 0.5));

  return await pdfDoc.save();
}




