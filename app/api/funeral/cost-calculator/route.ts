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
      .from('funeral_cost_calculations')
      .select('*')
      .eq('user_id', auth.userId)
      .maybeSingle();

    if (error && error.code !== 'PGRST116') throw error;

    if (!data) {
      return NextResponse.json({ calculation: null });
    }

    return NextResponse.json({ calculation: data });
  } catch (error) {
    console.error('Funeral cost calculator GET error:', error);
    return NextResponse.json({ error: 'Failed to load calculation' }, { status: 500 });
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
      .from('funeral_cost_calculations')
      .select('id')
      .eq('user_id', auth.userId)
      .maybeSingle();

    const calculationData: any = {
      user_id: auth.userId,
      burial_or_cremation: body.burialOrCremation || null,
      funeral_home_services: body.funeralHomeServices || {},
      burial_costs: body.burialCosts || {},
      cremation_costs: body.cremationCosts || {},
      service_addons: body.serviceAddons || {},
      venue_and_catering: body.venueAndCatering || {},
      transportation: body.transportation || {},
      legal_and_admin: body.legalAndAdmin || {},
      total_cost: body.totalCost || 0,
      notes: body.notes || null,
    };

    let data, error;
    if (existing) {
      const result = await supabase
        .from('funeral_cost_calculations')
        .update(calculationData)
        .eq('user_id', auth.userId)
        .select()
        .single();
      data = result.data;
      error = result.error;
    } else {
      const result = await supabase
        .from('funeral_cost_calculations')
        .insert(calculationData)
        .select()
        .single();
      data = result.data;
      error = result.error;
    }

    if (error) throw error;
    return NextResponse.json({ calculation: data });
  } catch (error) {
    console.error('Funeral cost calculator POST error:', error);
    return NextResponse.json({ error: 'Failed to save calculation' }, { status: 500 });
  }
}




