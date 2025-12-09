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
      .from('digital_accounts')
      .select('*')
      .eq('user_id', auth.userId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    // Transform snake_case to camelCase
    const accounts = (data || []).map((account: any) => ({
      id: account.id,
      accountType: account.account_type,
      accountName: account.account_name,
      username: account.username,
      email: account.email,
      url: account.url,
      notes: account.notes,
      passwordEncrypted: account.password_encrypted,
      createdAt: account.created_at,
      updatedAt: account.updated_at,
    }));

    return NextResponse.json({ accounts });
  } catch (error) {
    console.error('Digital accounts GET error:', error);
    return NextResponse.json({ error: 'Failed to load digital accounts' }, { status: 500 });
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

    // TODO: Encrypt password before storing
    // For now, storing as-is (should implement encryption)
    const accountData = {
      user_id: auth.userId,
      account_type: body.accountType,
      account_name: body.accountName,
      username: body.username,
      email: body.email,
      url: body.url,
      notes: body.notes,
      password_encrypted: body.passwordEncrypted, // Should be encrypted
    };

    const { data, error } = await supabase
      .from('digital_accounts')
      .insert(accountData)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ account: data });
  } catch (error) {
    console.error('Digital accounts POST error:', error);
    return NextResponse.json({ error: 'Failed to save digital account' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const auth = await requireAuth();
    if ('error' in auth) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const supabase = createServerClient();
    const body = await request.json();

    if (!body.id) {
      return NextResponse.json({ error: 'Account ID is required' }, { status: 400 });
    }

    const updateData: any = {};
    if (body.accountType) updateData.account_type = body.accountType;
    if (body.accountName) updateData.account_name = body.accountName;
    if (body.username !== undefined) updateData.username = body.username;
    if (body.email !== undefined) updateData.email = body.email;
    if (body.url !== undefined) updateData.url = body.url;
    if (body.notes !== undefined) updateData.notes = body.notes;
    if (body.passwordEncrypted !== undefined) updateData.password_encrypted = body.passwordEncrypted;

    const { data, error } = await supabase
      .from('digital_accounts')
      .update(updateData)
      .eq('id', body.id)
      .eq('user_id', auth.userId)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ account: data });
  } catch (error) {
    console.error('Digital accounts PUT error:', error);
    return NextResponse.json({ error: 'Failed to update digital account' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const auth = await requireAuth();
    if ('error' in auth) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Account ID is required' }, { status: 400 });
    }

    const supabase = createServerClient();

    const { error } = await supabase
      .from('digital_accounts')
      .delete()
      .eq('id', id)
      .eq('user_id', auth.userId);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Digital accounts DELETE error:', error);
    return NextResponse.json({ error: 'Failed to delete digital account' }, { status: 500 });
  }
}

