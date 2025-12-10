import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface QuestionnaireData {
  id: string;
  user_id: string;
  personal_info: any;
  executor: any;
  guardians: any;
  bequests: any;
  digital_assets: any;
  notes: string;
  created_at: string;
  updated_at: string;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Parse request body
    const { questionnaireId } = await req.json();

    if (!questionnaireId) {
      return new Response(
        JSON.stringify({ error: "Questionnaire ID is required" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Fetch questionnaire data
    const { data: questionnaire, error } = await supabase
      .from("will_questionnaires")
      .select("*")
      .eq("id", questionnaireId)
      .single();

    if (error || !questionnaire) {
      return new Response(
        JSON.stringify({ error: "Questionnaire not found" }),
        {
          status: 404,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Generate PDF
    const pdfBytes = await generatePDF(questionnaire as QuestionnaireData);

    // Return PDF
    return new Response(pdfBytes, {
      headers: {
        ...corsHeaders,
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="will-questionnaire-${questionnaireId}.pdf"`,
      },
    });
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});

async function generatePDF(data: QuestionnaireData): Promise<Uint8Array> {
  // Use pdf-lib which works well with Deno
  const pdfLib = await import("https://esm.sh/pdf-lib@1.17.1");
  const { PDFDocument, rgb, StandardFonts } = pdfLib;

  // Create a new PDF document
  const pdfDoc = await PDFDocument.create();
  let page = pdfDoc.addPage([612, 792]); // Letter size in points
  const { width, height } = page.getSize();
  const margin = 50;
  let y = height - margin;

  // Embed fonts
  const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const helveticaBoldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  // Helper function to add text with wrapping
  const addText = async (text: string, size: number, bold: boolean = false, textColor = rgb(0, 0, 0)) => {
    const font = bold ? helveticaBoldFont : helveticaFont;
    const maxWidth = width - 2 * margin;
    
    // Simple text wrapping - split into lines that fit
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
        // Create new page if needed
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
  await addText("LEGAL DISCLAIMER", 12, true, rgb(1, 0, 0));
  await addText(
    "Going Home does not provide legal advice or create legally binding documents. " +
    "This questionnaire is for informational and planning purposes only. " +
    "Please consult with a qualified attorney to create a legally valid will.",
    10,
    false
  );
  y -= 20;

  // Title
  await addText("Will Planning Questionnaire", 18, true);
  await addText(`Generated: ${new Date().toLocaleDateString()}`, 10, false, rgb(0.5, 0.5, 0.5));
  y -= 20;

  // Personal Information
  if (data.personal_info) {
    await addText("1. Personal Information", 14, true);
    const pi = data.personal_info;
    if (pi.fullLegalName) await addText(`Full Legal Name: ${pi.fullLegalName}`, 11);
    if (pi.dateOfBirth) await addText(`Date of Birth: ${pi.dateOfBirth}`, 11);
    if (pi.address) await addText(`Address: ${pi.address}`, 11);
    if (pi.city) await addText(`City: ${pi.city}`, 11);
    if (pi.state) await addText(`State: ${pi.state}`, 11);
    if (pi.zipCode) await addText(`ZIP Code: ${pi.zipCode}`, 11);
    if (pi.maritalStatus) await addText(`Marital Status: ${pi.maritalStatus}`, 11);
    y -= 10;
  }

  // Executor
  if (data.executor) {
    await addText("2. Executor", 14, true);
    const exec = data.executor;
    if (exec.primaryName) {
      await addText("Primary Executor:", 11, true);
      await addText(`  Name: ${exec.primaryName}`, 11);
      if (exec.primaryRelationship) await addText(`  Relationship: ${exec.primaryRelationship}`, 11);
      if (exec.primaryAddress) await addText(`  Address: ${exec.primaryAddress}`, 11);
      if (exec.primaryPhone) await addText(`  Phone: ${exec.primaryPhone}`, 11);
      if (exec.primaryEmail) await addText(`  Email: ${exec.primaryEmail}`, 11);
      y -= 5;
    }
    if (exec.backupName) {
      await addText("Backup Executor:", 11, true);
      await addText(`  Name: ${exec.backupName}`, 11);
      if (exec.backupRelationship) await addText(`  Relationship: ${exec.backupRelationship}`, 11);
      if (exec.backupAddress) await addText(`  Address: ${exec.backupAddress}`, 11);
      if (exec.backupPhone) await addText(`  Phone: ${exec.backupPhone}`, 11);
      if (exec.backupEmail) await addText(`  Email: ${exec.backupEmail}`, 11);
    }
    y -= 10;
  }

  // Guardianship
  if (data.guardians) {
    await addText("3. Guardianship", 14, true);
    const guard = data.guardians;
    if (guard.primaryGuardianName) {
      await addText("Primary Guardian:", 11, true);
      await addText(`  Name: ${guard.primaryGuardianName}`, 11);
      if (guard.primaryGuardianRelationship) await addText(`  Relationship: ${guard.primaryGuardianRelationship}`, 11);
      if (guard.primaryGuardianAddress) await addText(`  Address: ${guard.primaryGuardianAddress}`, 11);
      if (guard.primaryGuardianPhone) await addText(`  Phone: ${guard.primaryGuardianPhone}`, 11);
      y -= 5;
    }
    if (guard.backupGuardianName) {
      await addText("Backup Guardian:", 11, true);
      await addText(`  Name: ${guard.backupGuardianName}`, 11);
      if (guard.backupGuardianRelationship) await addText(`  Relationship: ${guard.backupGuardianRelationship}`, 11);
      if (guard.backupGuardianAddress) await addText(`  Address: ${guard.backupGuardianAddress}`, 11);
      if (guard.backupGuardianPhone) await addText(`  Phone: ${guard.backupGuardianPhone}`, 11);
    }
    y -= 10;
  }

  // Bequests
  if (data.bequests) {
    await addText("4. Bequests", 14, true);
    const beq = data.bequests;
    if (beq.specificGifts && beq.specificGifts.length > 0) {
      await addText("Specific Gifts:", 11, true);
      for (let idx = 0; idx < beq.specificGifts.length; idx++) {
        const gift = beq.specificGifts[idx];
        await addText(`  ${idx + 1}. ${gift.item || "Item"} - To: ${gift.recipient || "Recipient"}`, 11);
      }
      y -= 5;
    }
    if (beq.residualEstate) {
      await addText("Residual Estate Distribution:", 11, true);
      await addText(beq.residualEstate, 11);
      y -= 5;
    }
    if (beq.charitableGiving) {
      await addText("Charitable Giving:", 11, true);
      await addText(beq.charitableGiving, 11);
    }
    y -= 10;
  }

  // Digital Assets
  if (data.digital_assets) {
    await addText("5. Digital Assets", 14, true);
    const da = data.digital_assets;
    if (da.socialMediaAccounts) {
      await addText("Social Media Accounts:", 11, true);
      await addText(da.socialMediaAccounts, 11);
      y -= 5;
    }
    if (da.emailAccounts) {
      await addText("Email Accounts:", 11, true);
      await addText(da.emailAccounts, 11);
      y -= 5;
    }
    if (da.instructions) {
      await addText("Instructions:", 11, true);
      await addText(da.instructions, 11);
    }
    y -= 10;
  }

  // Additional Notes
  if (data.notes) {
    await addText("6. Additional Notes", 14, true);
    await addText(data.notes, 11);
    y -= 10;
  }

  // Footer
  await addText(
    "This document is for planning purposes only and does not constitute a legal will.",
    9,
    false,
    rgb(0.5, 0.5, 0.5)
  );

  // Serialize the PDF
  const pdfBytes = await pdfDoc.save();
  return new Uint8Array(pdfBytes);
}

