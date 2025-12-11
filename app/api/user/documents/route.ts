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
      .from('documents')
      .select('*')
      .eq('user_id', auth.userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    
    // Transform database column names to camelCase for frontend
    const transformedDocuments = (data || []).map((doc: any) => ({
      id: doc.id,
      documentType: doc.document_type,
      fileName: doc.file_name,
      fileUrl: doc.file_url,
      fileSize: doc.file_size,
      note: doc.note || '',
      createdAt: doc.created_at,
    }));
    
    return NextResponse.json({ documents: transformedDocuments });
  } catch (error) {
    console.error('Documents GET error:', error);
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

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const documentType = formData.get('documentType') as string;
    const note = formData.get('note') as string;

    if (!file) return NextResponse.json({ error: 'No file provided' }, { status: 400 });

    // Upload file to Supabase Storage
    const fileName = `${auth.userId}/${Date.now()}_${file.name}`;
    const { error: uploadError } = await supabase.storage
      .from('documents')
      .upload(fileName, file);

    if (uploadError) throw uploadError;

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('documents')
      .getPublicUrl(fileName);

    // Save document record
    const { data: document, error: dbError } = await supabase
      .from('documents')
      .insert({
        user_id: auth.userId,
        document_type: documentType,
        file_name: file.name,
        file_url: publicUrl,
        file_size: file.size,
        mime_type: file.type,
        note: note || '',
      })
      .select()
      .single();

    if (dbError) throw dbError;
    
    // Transform database column names to camelCase for frontend
    const transformedDocument = {
      id: document.id,
      documentType: document.document_type,
      fileName: document.file_name,
      fileUrl: document.file_url,
      fileSize: document.file_size,
      note: document.note || '',
      createdAt: document.created_at,
    };
    
    return NextResponse.json({ document: transformedDocument });
  } catch (error: any) {
    console.error('Document upload error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to upload document' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const auth = await requireAuth();
    if ('error' in auth) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const supabase = createServerClient();

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 });

    const { error } = await supabase
      .from('documents')
      .delete()
      .eq('id', id)
      .eq('user_id', auth.userId);

    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete' }, { status: 500 });
  }
}
