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
      .from('assets')
      .select('*')
      .eq('user_id', auth.userId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    const assets = (data || []).map((asset: any) => ({
      id: asset.id,
      assetType: asset.asset_type,
      name: asset.name,
      description: asset.description,
      location: asset.location,
      accountNumber: asset.account_number,
      institutionName: asset.institution_name,
      contactInfo: asset.contact_info,
      estimatedValue: asset.estimated_value,
      notes: asset.notes,
      createdAt: asset.created_at,
      updatedAt: asset.updated_at,
    }));

    return NextResponse.json({ assets });
  } catch (error) {
    console.error('Assets GET error:', error);
    return NextResponse.json({ error: 'Failed to load assets' }, { status: 500 });
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

    const assetData = {
      user_id: auth.userId,
      asset_type: body.assetType,
      name: body.name,
      description: body.description,
      location: body.location,
      account_number: body.accountNumber,
      institution_name: body.institutionName,
      contact_info: body.contactInfo,
      estimated_value: body.estimatedValue,
      notes: body.notes,
    };

    const { data, error } = await supabase
      .from('assets')
      .insert(assetData)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ asset: data });
  } catch (error) {
    console.error('Assets POST error:', error);
    return NextResponse.json({ error: 'Failed to save asset' }, { status: 500 });
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
      return NextResponse.json({ error: 'Asset ID is required' }, { status: 400 });
    }

    const updateData: any = {};
    if (body.assetType) updateData.asset_type = body.assetType;
    if (body.name) updateData.name = body.name;
    if (body.description !== undefined) updateData.description = body.description;
    if (body.location !== undefined) updateData.location = body.location;
    if (body.accountNumber !== undefined) updateData.account_number = body.accountNumber;
    if (body.institutionName !== undefined) updateData.institution_name = body.institutionName;
    if (body.contactInfo !== undefined) updateData.contact_info = body.contactInfo;
    if (body.estimatedValue !== undefined) updateData.estimated_value = body.estimatedValue;
    if (body.notes !== undefined) updateData.notes = body.notes;

    const { data, error } = await supabase
      .from('assets')
      .update(updateData)
      .eq('id', body.id)
      .eq('user_id', auth.userId)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ asset: data });
  } catch (error) {
    console.error('Assets PUT error:', error);
    return NextResponse.json({ error: 'Failed to update asset' }, { status: 500 });
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
      return NextResponse.json({ error: 'Asset ID is required' }, { status: 400 });
    }

    const supabase = createServerClient();

    const { error } = await supabase
      .from('assets')
      .delete()
      .eq('id', id)
      .eq('user_id', auth.userId);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Assets DELETE error:', error);
    return NextResponse.json({ error: 'Failed to delete asset' }, { status: 500 });
  }
}

