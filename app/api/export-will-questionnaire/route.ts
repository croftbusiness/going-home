import { NextResponse } from 'next/server';
import { requireAuth, createServerClient } from '@/lib/auth';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';

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

    // Generate PDF directly in Next.js API route
    const pdfBytes = await generatePDF(questionnaire);

    // Convert Uint8Array to Buffer for NextResponse
    const pdfBuffer = Buffer.from(pdfBytes);

    return new NextResponse(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="will-questionnaire-${questionnaireId}.pdf"`,
      },
    });
  } catch (error: any) {
    console.error('Export error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to export PDF' },
      { status: 500 }
    );
  }
}

async function generatePDF(data: any): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.create();
  let page = pdfDoc.addPage([612, 792]); // Letter size
  const { width, height } = page.getSize();
  const margin = 50;
  let y = height - margin;

  // Embed fonts
  const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const helveticaBoldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  // Helper function to add text with wrapping
  const addText = (text: string, size: number, bold: boolean = false, textColor = rgb(0, 0, 0)) => {
    const font = bold ? helveticaBoldFont : helveticaFont;
    const maxWidth = width - 2 * margin;
    
    // Simple text wrapping
    const words = text.split(' ');
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
      if (y < margin + 20) {
        page = pdfDoc.addPage([612, 792]);
        y = height - margin;
      }
      page.drawText(line, {
        x: margin,
        y: y,
        size: size,
        font: font,
        color: textColor,
      });
      y -= size + 5;
    }
    y -= 5; // Extra space after block
  };

  // Legal Disclaimer (at top)
  addText("LEGAL DISCLAIMER", 12, true, rgb(1, 0, 0));
  addText(
    "Going Home does not provide legal advice or create legally binding documents. " +
    "This questionnaire is for informational and planning purposes only. " +
    "Please consult with a qualified attorney to create a legally valid will.",
    10,
    false
  );
  y -= 20;

  // Title
  addText("Will Planning Questionnaire", 18, true);
  addText(`Generated: ${new Date().toLocaleDateString()}`, 10, false, rgb(0.5, 0.5, 0.5));
  y -= 20;

  // Personal Information
  if (data.personal_info) {
    addText("1. Personal Information", 14, true);
    const pi = data.personal_info;
    if (pi.fullLegalName) addText(`Full Legal Name: ${pi.fullLegalName}`, 11);
    if (pi.dateOfBirth) addText(`Date of Birth: ${pi.dateOfBirth}`, 11);
    if (pi.address) addText(`Address: ${pi.address}`, 11);
    if (pi.city) addText(`City: ${pi.city}`, 11);
    if (pi.state) addText(`State: ${pi.state}`, 11);
    if (pi.zipCode) addText(`ZIP Code: ${pi.zipCode}`, 11);
    if (pi.maritalStatus) addText(`Marital Status: ${pi.maritalStatus}`, 11);
    y -= 10;
  }

  // Executor
  if (data.executor) {
    addText("2. Executor", 14, true);
    const exec = data.executor;
    if (exec.primaryName) {
      addText("Primary Executor:", 11, true);
      addText(`  Name: ${exec.primaryName}`, 11);
      if (exec.primaryRelationship) addText(`  Relationship: ${exec.primaryRelationship}`, 11);
      if (exec.primaryAddress) addText(`  Address: ${exec.primaryAddress}`, 11);
      if (exec.primaryPhone) addText(`  Phone: ${exec.primaryPhone}`, 11);
      if (exec.primaryEmail) addText(`  Email: ${exec.primaryEmail}`, 11);
      y -= 5;
    }
    if (exec.backupName) {
      addText("Backup Executor:", 11, true);
      addText(`  Name: ${exec.backupName}`, 11);
      if (exec.backupRelationship) addText(`  Relationship: ${exec.backupRelationship}`, 11);
      if (exec.backupAddress) addText(`  Address: ${exec.backupAddress}`, 11);
      if (exec.backupPhone) addText(`  Phone: ${exec.backupPhone}`, 11);
      if (exec.backupEmail) addText(`  Email: ${exec.backupEmail}`, 11);
    }
    y -= 10;
  }

  // Guardianship
  if (data.guardians) {
    addText("3. Guardianship", 14, true);
    const guard = data.guardians;
    if (guard.primaryGuardianName) {
      addText("Primary Guardian:", 11, true);
      addText(`  Name: ${guard.primaryGuardianName}`, 11);
      if (guard.primaryGuardianRelationship) addText(`  Relationship: ${guard.primaryGuardianRelationship}`, 11);
      if (guard.primaryGuardianAddress) addText(`  Address: ${guard.primaryGuardianAddress}`, 11);
      if (guard.primaryGuardianPhone) addText(`  Phone: ${guard.primaryGuardianPhone}`, 11);
      y -= 5;
    }
    if (guard.backupGuardianName) {
      addText("Backup Guardian:", 11, true);
      addText(`  Name: ${guard.backupGuardianName}`, 11);
      if (guard.backupGuardianRelationship) addText(`  Relationship: ${guard.backupGuardianRelationship}`, 11);
      if (guard.backupGuardianAddress) addText(`  Address: ${guard.backupGuardianAddress}`, 11);
      if (guard.backupGuardianPhone) addText(`  Phone: ${guard.backupGuardianPhone}`, 11);
    }
    y -= 10;
  }

  // Bequests
  if (data.bequests) {
    addText("4. Bequests", 14, true);
    const beq = data.bequests;
    if (beq.specificGifts && beq.specificGifts.length > 0) {
      addText("Specific Gifts:", 11, true);
      beq.specificGifts.forEach((gift: any, idx: number) => {
        addText(`  ${idx + 1}. ${gift.item || "Item"} - To: ${gift.recipient || "Recipient"}`, 11);
      });
      y -= 5;
    }
    if (beq.residualEstate) {
      addText("Residual Estate Distribution:", 11, true);
      addText(beq.residualEstate, 11);
      y -= 5;
    }
    if (beq.charitableGiving) {
      addText("Charitable Giving:", 11, true);
      addText(beq.charitableGiving, 11);
    }
    y -= 10;
  }

  // Digital Assets
  if (data.digital_assets) {
    addText("5. Digital Assets", 14, true);
    const da = data.digital_assets;
    if (da.socialMediaAccounts) {
      addText("Social Media Accounts:", 11, true);
      addText(da.socialMediaAccounts, 11);
      y -= 5;
    }
    if (da.emailAccounts) {
      addText("Email Accounts:", 11, true);
      addText(da.emailAccounts, 11);
      y -= 5;
    }
    if (da.instructions) {
      addText("Instructions:", 11, true);
      addText(da.instructions, 11);
    }
    y -= 10;
  }

  // Additional Notes
  if (data.notes) {
    addText("6. Additional Notes", 14, true);
    addText(data.notes, 11);
    y -= 10;
  }

  // Footer
  addText(
    "This document is for planning purposes only and does not constitute a legal will.",
    9,
    false,
    rgb(0.5, 0.5, 0.5)
  );

  // Serialize the PDF
  return await pdfDoc.save();
}

