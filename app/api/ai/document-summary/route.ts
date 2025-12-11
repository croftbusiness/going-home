import { NextResponse } from 'next/server';
import { requireAuth, createServerClient } from '@/lib/auth';
import { generateAIResponse, extractTextFromFile } from '@/lib/utils/ai';
import type { DocumentSummary } from '@/types/ai';

/**
 * Document Analyzer and Summarizer
 * 
 * Analyzes uploaded documents, extracts text, summarizes key points,
 * suggests document type, and identifies missing information.
 */
export async function POST(request: Request) {
  try {
    const auth = await requireAuth();
    if ('error' in auth) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const body = await request.json();
    const { documentId, fileUrl, mimeType } = body;

    if (!documentId && !fileUrl) {
      return NextResponse.json(
        { error: 'Document ID or file URL is required' },
        { status: 400 }
      );
    }

    const supabase = createServerClient();

    // Fetch document from database if documentId provided
    let fileUrlToUse = fileUrl;
    let mimeTypeToUse = mimeType;

    if (documentId) {
      const { data: document, error: docError } = await supabase
        .from('documents')
        .select('file_url, mime_type, document_type')
        .eq('id', documentId)
        .eq('user_id', auth.userId)
        .single();

      if (docError || !document) {
        return NextResponse.json(
          { error: 'Document not found' },
          { status: 404 }
        );
      }

      fileUrlToUse = document.file_url;
      mimeTypeToUse = document.mime_type;
    }

    if (!fileUrlToUse || !mimeTypeToUse) {
      return NextResponse.json(
        { error: 'File URL and MIME type are required' },
        { status: 400 }
      );
    }

    // Extract text from document
    let extractedText = '';
    try {
      extractedText = await extractTextFromFile(fileUrlToUse, mimeTypeToUse);
      
      if (!extractedText || extractedText.trim().length < 50) {
        return NextResponse.json(
          { error: 'Could not extract meaningful text from document. Please ensure the document is clear and readable.' },
          { status: 400 }
        );
      }
    } catch (error: any) {
      return NextResponse.json(
        { error: error.message || 'Failed to extract text from document' },
        { status: 500 }
      );
    }

    // Analyze document with AI
    const analysisPrompt = `Analyze the following document text and provide:
1. A brief summary (2-3 sentences)
2. Suggested document type (will, deed, insurance policy, ID, other)
3. Key points or important information found
4. Any missing information that might be expected for this document type
5. Suggested tags for categorization

Document text:
${extractedText.substring(0, 8000)}`; // Limit to avoid token limits

    const systemPrompt = `You are analyzing legal and personal documents for end-of-life planning.
Be accurate and helpful. Identify important information and note any potential gaps.
Do not provide legal advice.`;

    const analysisResponse = await generateAIResponse(
      systemPrompt,
      analysisPrompt,
      'gpt-4.1-mini',
      0.3 // Lower temperature for more accurate analysis
    );

    // Parse the AI response into structured format
    // Since we're using text response, we'll extract key sections
    const summaryMatch = analysisResponse.match(/summary[:\-]?\s*(.+?)(?=\n\n|\n2\.|$)/is);
    const documentTypeMatch = analysisResponse.match(/document type[:\-]?\s*(.+?)(?=\n\n|\n3\.|$)/is);
    const keyPointsMatch = analysisResponse.match(/key points[:\-]?\s*(.+?)(?=\n\n|\n4\.|$)/is);
    const missingInfoMatch = analysisResponse.match(/missing[:\-]?\s*(.+?)(?=\n\n|\n5\.|$)/is);
    const tagsMatch = analysisResponse.match(/tags[:\-]?\s*(.+?)(?=\n\n|$)/is);

    const summary: DocumentSummary = {
      extractedText,
      summary: summaryMatch?.[1]?.trim() || analysisResponse.substring(0, 500),
      documentType: documentTypeMatch?.[1]?.trim()?.toLowerCase() || undefined,
      keyPoints: keyPointsMatch?.[1]
        ?.split(/[•\-\n]/)
        .map(p => p.trim())
        .filter(p => p.length > 0)
        .slice(0, 10) || [],
      missingInformation: missingInfoMatch?.[1]
        ?.split(/[•\-\n]/)
        .map(p => p.trim())
        .filter(p => p.length > 0)
        .slice(0, 5) || [],
      suggestedTags: tagsMatch?.[1]
        ?.split(/[,•\-\n]/)
        .map(t => t.trim())
        .filter(t => t.length > 0)
        .slice(0, 5) || [],
    };

    // Update document metadata if documentId was provided
    if (documentId) {
      await supabase
        .from('documents')
        .update({
          note: `AI Summary: ${summary.summary.substring(0, 500)}`,
          // You might want to add a metadata JSONB column for more structured data
        })
        .eq('id', documentId)
        .eq('user_id', auth.userId);
    }

    return NextResponse.json(summary);
  } catch (error: any) {
    console.error('Document analysis error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to analyze document' },
      { status: 500 }
    );
  }
}


