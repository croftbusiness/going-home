import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import pdfParse from 'pdf-parse';
import mammoth from 'mammoth';

export async function POST(request: Request) {
  try {
    const auth = await requireAuth();
    if ('error' in auth) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Check file type
    const fileType = file.type;
    const fileName = file.name.toLowerCase();
    let extractedText = '';

    // Extract text based on file type
    if (fileType === 'application/pdf' || fileName.endsWith('.pdf')) {
      // Extract text from PDF
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      const pdfData = await pdfParse(buffer);
      extractedText = pdfData.text;
    } else if (
      fileType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
      fileType === 'application/msword' ||
      fileName.endsWith('.docx') ||
      fileName.endsWith('.doc')
    ) {
      // Extract text from Word document
      const arrayBuffer = await file.arrayBuffer();
      const result = await mammoth.extractRawText({ arrayBuffer });
      extractedText = result.value;
    } else if (
      fileType === 'text/plain' ||
      fileName.endsWith('.txt')
    ) {
      // Read plain text file
      extractedText = await file.text();
    } else {
      return NextResponse.json(
        { error: 'Unsupported file type. Please upload a PDF, Word document (.docx, .doc), or plain text file (.txt)' },
        { status: 400 }
      );
    }

    // Clean up the text (remove excessive whitespace, normalize line breaks)
    extractedText = extractedText
      .replace(/\r\n/g, '\n')
      .replace(/\r/g, '\n')
      .replace(/\n{3,}/g, '\n\n')
      .trim();

    if (!extractedText || extractedText.length === 0) {
      return NextResponse.json(
        { error: 'No text could be extracted from this document. The file may be empty, corrupted, or contain only images.' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      text: extractedText,
      characterCount: extractedText.length,
      wordCount: extractedText.split(/\s+/).filter(word => word.length > 0).length,
    });
  } catch (error: any) {
    console.error('Text extraction error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to extract text from document' },
      { status: 500 }
    );
  }
}

