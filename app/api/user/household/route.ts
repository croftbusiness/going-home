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
      .from('household_information')
      .select('*')
      .eq('user_id', auth.userId)
      .single();

    if (error && error.code !== 'PGRST116') throw error;

    if (!data) {
      return NextResponse.json({ household: null });
    }

    const household = {
      id: data.id,
      petCareInstructions: data.pet_care_instructions,
      homeAccessCodes: data.home_access_codes,
      vehicleLocations: data.vehicle_locations,
      monthlyBills: data.monthly_bills,
      serviceCancellationInstructions: data.service_cancellation_instructions,
      utilityAccounts: data.utility_accounts,
      homeMaintenanceNotes: data.home_maintenance_notes,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };

    return NextResponse.json({ household });
  } catch (error) {
    console.error('Household GET error:', error);
    return NextResponse.json({ error: 'Failed to load household information' }, { status: 500 });
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

    // Check if record exists
    const { data: existing } = await supabase
      .from('household_information')
      .select('id')
      .eq('user_id', auth.userId)
      .maybeSingle();

    const householdData: any = {
      user_id: auth.userId,
      pet_care_instructions: body.petCareInstructions,
      home_access_codes: body.homeAccessCodes,
      vehicle_locations: body.vehicleLocations,
      monthly_bills: body.monthlyBills,
      service_cancellation_instructions: body.serviceCancellationInstructions,
      utility_accounts: body.utilityAccounts,
      home_maintenance_notes: body.homeMaintenanceNotes,
    };

    let data, error;
    if (existing) {
      const result = await supabase
        .from('household_information')
        .update(householdData)
        .eq('user_id', auth.userId)
        .select()
        .single();
      data = result.data;
      error = result.error;
    } else {
      const result = await supabase
        .from('household_information')
        .insert(householdData)
        .select()
        .single();
      data = result.data;
      error = result.error;
    }

    if (error) throw error;
    return NextResponse.json({ household: data });
  } catch (error) {
    console.error('Household POST error:', error);
    return NextResponse.json({ error: 'Failed to save household information' }, { status: 500 });
  }
}

