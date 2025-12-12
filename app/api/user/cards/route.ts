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
    let { data: availableCards } = await db
      .from('user_cards')
      .select('*')
      .eq('user_id', userId)
      .or(`snoozed_until.is.null,snoozed_until.lt.${now}`)
      .order('priority', { ascending: false });

    // If no cards exist, create default cards for this user
    if (!availableCards || availableCards.length === 0) {
      await createDefaultCards(db, userId, incompleteSections);
      
      // Fetch again after creating defaults
      const { data: newCards } = await db
        .from('user_cards')
        .select('*')
        .eq('user_id', userId)
        .or(`snoozed_until.is.null,snoozed_until.lt.${now}`)
        .order('priority', { ascending: false });
      
      availableCards = newCards;
    }

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

async function createDefaultCards(db: any, userId: string, incompleteSections: string[]) {
  const defaultCards = [];
  
  // Personal Details card (always create if incomplete)
  if (incompleteSections.includes('personalDetails')) {
    defaultCards.push({
      user_id: userId,
      card_type: 'action',
      title: 'Complete Your Personal Details',
      description: 'Add your name, address, and contact information to get started with your planning.',
      linked_section: '/dashboard/personal-details',
      priority: 10,
      emotional_weight: 'light',
    });
  }
  
  // Documents card
  if (incompleteSections.includes('documents')) {
    defaultCards.push({
      user_id: userId,
      card_type: 'action',
      title: 'Upload Important Documents',
      description: 'Store your will, IDs, insurance papers, and other important documents securely.',
      linked_section: '/dashboard/documents',
      priority: 9,
      emotional_weight: 'light',
    });
  }
  
  // Trusted Contacts card
  if (incompleteSections.includes('trustedContacts')) {
    defaultCards.push({
      user_id: userId,
      card_type: 'action',
      title: 'Add Trusted Contacts',
      description: 'Designate family members or friends who should have access to your information.',
      linked_section: '/dashboard/trusted-contacts',
      priority: 8,
      emotional_weight: 'light',
    });
  }
  
  // Medical Contacts card
  if (incompleteSections.includes('medicalContacts')) {
    defaultCards.push({
      user_id: userId,
      card_type: 'action',
      title: 'Add Medical & Legal Contacts',
      description: 'Include your physician and attorney information for your loved ones.',
      linked_section: '/dashboard/medical-contacts',
      priority: 7,
      emotional_weight: 'light',
    });
  }
  
  // Affirmation card (always add at least one)
  defaultCards.push({
    user_id: userId,
    card_type: 'affirmation',
    title: 'You\'re Taking Important Steps',
    description: 'Planning ahead is a gift to your loved ones. Every detail you add helps ensure your wishes are honored.',
    linked_section: null,
    priority: 5,
    emotional_weight: 'light',
  });
  
  // Only create if we have cards to add
  if (defaultCards.length > 0) {
    try {
      console.log(`Creating ${defaultCards.length} default cards for user ${userId}`);
      const { error } = await db.from('user_cards').insert(defaultCards);
      if (error) {
        console.error('Error creating default cards:', error);
        // Don't throw - cards might already exist
      } else {
        console.log('Successfully created default cards');
      }
    } catch (error) {
      console.error('Error creating default cards:', error);
      // Don't throw - cards might already exist
    }
  } else {
    console.log('No default cards to create - all sections complete or no incomplete sections');
  }
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
      // Extract section key from linked_section (e.g., /dashboard/personal-details -> personalDetails)
      const sectionPath = card.linked_section.replace('/dashboard/', '');
      const sectionKey = sectionPath.replace(/-([a-z])/g, (_: string, letter: string) => letter.toUpperCase());
      
      // If section is incomplete, prioritize it
      if (incompleteSections.includes(sectionKey)) {
        selected.push(card);
        if (card.emotional_weight === 'heavy') hasHeavyCard = true;
        continue;
      }
      // If section is complete, skip this action card
      continue;
    }

    // Add non-action cards (affirmations, reflections) - always include these
    selected.push(card);
    if (card.emotional_weight === 'heavy') hasHeavyCard = true;
  }

  // Ensure at least one card is returned if any cards exist
  // (This handles edge case where all action cards are filtered but affirmations exist)
  if (selected.length === 0 && sortedCards.length > 0) {
    // Fallback: add first non-action card
    const firstNonAction = sortedCards.find(card => card.card_type !== 'action');
    if (firstNonAction) {
      selected.push(firstNonAction);
    } else {
      // Last resort: add first card regardless
      selected.push(sortedCards[0]);
    }
  }

  return selected.slice(0, maxCards);
}

