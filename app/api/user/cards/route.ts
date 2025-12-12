import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { createServerClient } from '@/lib/auth';

export async function GET(request: Request) {
  try {
    const auth = await requireAuth();
    if ('error' in auth) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const db = createServerClient();
    const userId = auth.userId;

    // Check if requesting session cards
    const url = new URL(request.url);
    const sessionId = url.searchParams.get('session_id');

    if (sessionId) {
      // Return cards for existing session
      const { data: sessionItems } = await db
        .from('card_session_items')
        .select(`
          *,
          card:user_cards(*)
        `)
        .eq('session_id', sessionId)
        .order('created_at', { ascending: true });

      if (!sessionItems) {
        return NextResponse.json({ cards: [] });
      }

      // Map to card format
      const cards = sessionItems
        .filter(item => item.status === 'pending')
        .map(item => ({
          ...item.card,
          session_item_id: item.id,
          session_id: item.session_id,
        }));

      return NextResponse.json({ cards });
    }

    // Original logic for new card selection
    // Get user preference for cards
    const { data: userPrefs } = await db
      .from('users')
      .select('show_cards_on_login, login_count')
      .eq('id', userId)
      .single();

    // If user has disabled cards, return empty array
    if (userPrefs?.show_cards_on_login === false) {
      return NextResponse.json({ cards: [] });
    }

    // Get incomplete sections to determine which cards to show
    const incompleteSections = await getIncompleteSections(db, userId);

    // Get cards that aren't snoozed and haven't been shown recently
    const now = new Date().toISOString();
    const { data: availableCards } = await db
      .from('user_cards')
      .select('*')
      .eq('user_id', userId)
      .or(`snoozed_until.is.null,snoozed_until.lt.${now}`)
      .order('priority', { ascending: false });

    if (!availableCards || availableCards.length === 0) {
      return NextResponse.json({ cards: [] });
    }

    // Filter and select cards based on logic
    const selectedCards = selectCards(availableCards, incompleteSections, userPrefs?.login_count || 0);

    // Update last_shown_at for selected cards
    for (const card of selectedCards) {
      await db
        .from('user_cards')
        .update({ last_shown_at: now })
        .eq('id', card.id);
    }

    return NextResponse.json({ cards: selectedCards });
  } catch (error) {
    console.error('Error fetching cards:', error);
    return NextResponse.json({ error: 'Failed to fetch cards' }, { status: 500 });
  }
}

async function getIncompleteSections(db: any, userId: string): Promise<string[]> {
  const incomplete: string[] = [];
  
  // Check each section for completion
  const sections = [
    { key: 'personalDetails', table: 'personal_details' },
    { key: 'medicalContacts', table: 'medical_contacts' },
    { key: 'funeralPreferences', table: 'funeral_preferences' },
    { key: 'willQuestionnaire', table: 'will_questionnaire' },
    { key: 'documents', table: 'documents' },
    { key: 'letters', table: 'letters' },
    { key: 'trustedContacts', table: 'trusted_contacts' },
    { key: 'releaseSettings', table: 'release_settings' },
    { key: 'digitalAccounts', table: 'digital_accounts' },
    { key: 'assets', table: 'assets' },
    { key: 'legacyMessages', table: 'legacy_messages' },
    { key: 'endOfLifeChecklist', table: 'end_of_life_checklist' },
    { key: 'biography', table: 'biography' },
    { key: 'insuranceFinancial', table: 'insurance_financial' },
    { key: 'household', table: 'household' },
    { key: 'childrenWishes', table: 'children_wishes' },
    { key: 'familyLegacy', table: 'family_legacy' },
    { key: 'endOfLifeDirectives', table: 'end_of_life_directives' },
  ];

  for (const section of sections) {
    try {
      const { data, error } = await db
        .from(section.table)
        .select('id')
        .eq('user_id', userId)
        .limit(1);

      // If no data found or error, section is incomplete
      if (!data || data.length === 0 || error) {
        incomplete.push(section.key);
      }
    } catch (error) {
      // If table doesn't exist or error, assume incomplete
      incomplete.push(section.key);
    }
  }

  return incomplete;
}

function selectCards(
  availableCards: any[],
  incompleteSections: string[],
  loginCount: number
): any[] {
  const selected: any[] = [];
  let hasHeavyCard = false;
  const maxCards = 7;

  // Sort by priority and filter
  const sortedCards = availableCards
    .filter(card => {
      // Don't show if snoozed
      if (card.snoozed_until && new Date(card.snoozed_until) > new Date()) {
        return false;
      }
      
      // Don't show if shown recently (within last 24 hours)
      if (card.last_shown_at) {
        const lastShown = new Date(card.last_shown_at);
        const hoursSinceShown = (Date.now() - lastShown.getTime()) / (1000 * 60 * 60);
        if (hoursSinceShown < 24) {
          return false;
        }
      }

      return true;
    })
    .sort((a, b) => b.priority - a.priority);

  for (const card of sortedCards) {
    if (selected.length >= maxCards) break;

    // Only allow one heavy card per session
    if (card.emotional_weight === 'heavy' && hasHeavyCard) {
      continue;
    }

    // Prioritize action cards for incomplete sections
    if (card.card_type === 'action' && card.linked_section) {
      const sectionKey = card.linked_section.replace('/dashboard/', '').replace(/-/g, '');
      // If section is incomplete, prioritize it
      if (incompleteSections.includes(sectionKey) || incompleteSections.length === 0) {
        selected.push(card);
        if (card.emotional_weight === 'heavy') hasHeavyCard = true;
        continue;
      }
    }

    // Add other cards
    selected.push(card);
    if (card.emotional_weight === 'heavy') hasHeavyCard = true;
  }

  return selected.slice(0, maxCards);
}

