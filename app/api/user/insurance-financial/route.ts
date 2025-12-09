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
      .from('insurance_financial_contacts')
      .select('*')
      .eq('user_id', auth.userId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    const contacts = (data || []).map((contact: any) => ({
      id: contact.id,
      contactType: contact.contact_type,
      companyName: contact.company_name,
      policyNumber: contact.policy_number,
      accountNumber: contact.account_number,
      contactName: contact.contact_name,
      contactPhone: contact.contact_phone,
      contactEmail: contact.contact_email,
      contactAddress: contact.contact_address,
      notes: contact.notes,
      createdAt: contact.created_at,
      updatedAt: contact.updated_at,
    }));

    return NextResponse.json({ contacts });
  } catch (error) {
    console.error('Insurance financial GET error:', error);
    return NextResponse.json({ error: 'Failed to load contacts' }, { status: 500 });
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

    const contactData = {
      user_id: auth.userId,
      contact_type: body.contactType,
      company_name: body.companyName,
      policy_number: body.policyNumber,
      account_number: body.accountNumber,
      contact_name: body.contactName,
      contact_phone: body.contactPhone,
      contact_email: body.contactEmail,
      contact_address: body.contactAddress,
      notes: body.notes,
    };

    const { data, error } = await supabase
      .from('insurance_financial_contacts')
      .insert(contactData)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ contact: data });
  } catch (error) {
    console.error('Insurance financial POST error:', error);
    return NextResponse.json({ error: 'Failed to save contact' }, { status: 500 });
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
      return NextResponse.json({ error: 'Contact ID is required' }, { status: 400 });
    }

    const updateData: any = {};
    if (body.contactType) updateData.contact_type = body.contactType;
    if (body.companyName !== undefined) updateData.company_name = body.companyName;
    if (body.policyNumber !== undefined) updateData.policy_number = body.policyNumber;
    if (body.accountNumber !== undefined) updateData.account_number = body.accountNumber;
    if (body.contactName !== undefined) updateData.contact_name = body.contactName;
    if (body.contactPhone !== undefined) updateData.contact_phone = body.contactPhone;
    if (body.contactEmail !== undefined) updateData.contact_email = body.contactEmail;
    if (body.contactAddress !== undefined) updateData.contact_address = body.contactAddress;
    if (body.notes !== undefined) updateData.notes = body.notes;

    const { data, error } = await supabase
      .from('insurance_financial_contacts')
      .update(updateData)
      .eq('id', body.id)
      .eq('user_id', auth.userId)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ contact: data });
  } catch (error) {
    console.error('Insurance financial PUT error:', error);
    return NextResponse.json({ error: 'Failed to update contact' }, { status: 500 });
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
      return NextResponse.json({ error: 'Contact ID is required' }, { status: 400 });
    }

    const supabase = createServerClient();

    const { error } = await supabase
      .from('insurance_financial_contacts')
      .delete()
      .eq('id', id)
      .eq('user_id', auth.userId);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Insurance financial DELETE error:', error);
    return NextResponse.json({ error: 'Failed to delete contact' }, { status: 500 });
  }
}

