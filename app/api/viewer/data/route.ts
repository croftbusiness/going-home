import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/auth';

// Helper to get viewer context from session/cookie or request body
async function getViewerContext(request: Request) {
  const supabase = createServerClient();
  
  // First, try to get session from request body (for simulation mode)
  // This works for POST requests
  if (request.method === 'POST') {
    try {
      const body = await request.clone().json().catch(() => null);
      if (body?.session) {
        const session = body.session;
        // For simulation mode, use the session data directly
        if (session.isSimulation && session.contact?.ownerId) {
          // Fetch the contact record to get permissions
          const { data: contact, error: contactError } = await supabase
            .from('trusted_contacts')
            .select('*')
            .eq('id', session.contact.id)
            .single();
          
          if (contact && !contactError) {
            // Build permissions from JSONB first, then fallback to boolean columns
            const permissions: Record<string, boolean> = {};
            if (contact.permissions && typeof contact.permissions === 'object') {
              Object.assign(permissions, contact.permissions);
            }
            // Merge with boolean columns (these take precedence if JSONB doesn't have them)
            permissions.canViewPersonalDetails = permissions.canViewPersonalDetails ?? contact.can_view_personal_details ?? false;
            permissions.canViewMedicalContacts = permissions.canViewMedicalContacts ?? contact.can_view_medical_contacts ?? false;
            permissions.canViewFuneralPreferences = permissions.canViewFuneralPreferences ?? contact.can_view_funeral_preferences ?? false;
            permissions.canViewDocuments = permissions.canViewDocuments ?? contact.can_view_documents ?? false;
            permissions.canViewLetters = permissions.canViewLetters ?? contact.can_view_letters ?? false;
            
            // Use session permissions if provided, otherwise use what we built
            const finalPermissions = session.permissions && Object.keys(session.permissions).length > 0 
              ? { ...permissions, ...session.permissions }
              : permissions;
            
            return {
              ownerId: contact.owner_id || session.contact.ownerId,
              contactId: contact.id,
              permissions: finalPermissions,
            };
          }
        }
      }
    } catch (e) {
      console.error('Error parsing request body for viewer context:', e);
      // Continue to cookie-based auth
    }
  }
  
  // Fallback to cookie-based token (for real viewer sessions)
  const cookies = request.headers.get('cookie') || '';
  const viewerTokenMatch = cookies.match(/viewer_token=([^;]+)/);
  
  if (!viewerTokenMatch) {
    return null;
  }
  
  // Verify the viewer session is still valid
  const { data: tokenRecord } = await supabase
    .from('viewer_tokens')
    .select(`
      *,
      trusted_contacts (
        id,
        owner_id,
        permissions,
        can_view_personal_details,
        can_view_medical_contacts,
        can_view_funeral_preferences,
        can_view_documents,
        can_view_letters
      )
    `)
    .eq('id', viewerTokenMatch[1])
    .single();

  if (!tokenRecord || !tokenRecord.trusted_contacts) {
    return null;
  }

  const contact = tokenRecord.trusted_contacts;
  
  // Build permissions
  const permissions: Record<string, boolean> = {};
  if (contact.permissions && typeof contact.permissions === 'object') {
    Object.assign(permissions, contact.permissions);
  } else {
    permissions.canViewPersonalDetails = contact.can_view_personal_details || false;
    permissions.medicalContacts = contact.can_view_medical_contacts || false;
    permissions.funeralPreferences = contact.can_view_funeral_preferences || false;
    permissions.documents = contact.can_view_documents || false;
    permissions.letters = contact.can_view_letters || false;
  }

  return {
    ownerId: contact.owner_id,
    contactId: contact.id,
    permissions,
  };
}

export async function GET(request: Request) {
  return handleViewerDataRequest(request);
}

export async function POST(request: Request) {
  return handleViewerDataRequest(request);
}

async function handleViewerDataRequest(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const section = searchParams.get('section');
    
    if (!section) {
      return NextResponse.json({ error: 'Section required' }, { status: 400 });
    }
    
    // Try to get viewer context - this handles both simulation mode (POST with body) and real viewer sessions
    let viewerContext = await getViewerContext(request);
    
    // If no context from request, try to get from request body for simulation
    if (!viewerContext) {
      try {
        const body = await request.clone().json().catch(() => null);
        if (body?.session) {
          const session = body.session;
          if (session.isSimulation && session.contact?.ownerId) {
            const supabase = createServerClient();
            const { data: contact } = await supabase
              .from('trusted_contacts')
              .select('*')
              .eq('id', session.contact.id)
              .single();
            
            if (contact) {
              // Build permissions from JSONB or boolean columns
              const permissions: Record<string, boolean> = {};
              if (contact.permissions && typeof contact.permissions === 'object') {
                Object.assign(permissions, contact.permissions);
              }
              // Also check boolean columns as fallback
              permissions.canViewPersonalDetails = permissions.canViewPersonalDetails ?? contact.can_view_personal_details ?? false;
              permissions.canViewMedicalContacts = permissions.canViewMedicalContacts ?? contact.can_view_medical_contacts ?? false;
              permissions.canViewFuneralPreferences = permissions.canViewFuneralPreferences ?? contact.can_view_funeral_preferences ?? false;
              permissions.canViewDocuments = permissions.canViewDocuments ?? contact.can_view_documents ?? false;
              permissions.canViewLetters = permissions.canViewLetters ?? contact.can_view_letters ?? false;
              
              viewerContext = {
                ownerId: contact.owner_id || session.contact.ownerId,
                contactId: contact.id,
                permissions: session.permissions || permissions,
              };
            }
          }
        }
      } catch (e) {
        // Continue to error response
      }
    }
    
    if (!viewerContext) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check permission for this section
    // Map section names to permission keys
    const sectionPermissionMap: Record<string, string> = {
      'personalDetails': 'canViewPersonalDetails',
      'medicalContacts': 'canViewMedicalContacts',
      'funeralPreferences': 'canViewFuneralPreferences',
      'documents': 'canViewDocuments',
      'letters': 'canViewLetters',
      'legacyMessages': 'canViewLegacyMessages',
      'endOfLifeDirectives': 'canViewEndOfLifeDirectives',
      'endOfLifeChecklist': 'canViewEndOfLifeChecklist',
      'biography': 'canViewBiography',
      'willQuestionnaire': 'canViewWillQuestionnaire',
      'assets': 'canViewAssets',
      'digitalAccounts': 'canViewDigitalAccounts',
      'insuranceFinancial': 'canViewInsuranceFinancial',
      'household': 'canViewHousehold',
      'childrenWishes': 'canViewChildrenWishes',
      'familyLegacy': 'canViewFamilyLegacy',
      'finalSummary': 'canViewFinalSummary',
      'releaseSettings': 'canViewReleaseSettings',
    };
    
    const permissionKey = sectionPermissionMap[section] || `canView${section.charAt(0).toUpperCase() + section.slice(1)}`;
    const hasPermission = viewerContext.permissions[permissionKey] === true || 
                         viewerContext.permissions[section] === true ||
                         false;

    if (!hasPermission) {
      console.log('Permission denied:', {
        section,
        permissionKey,
        permissions: viewerContext.permissions,
        ownerId: viewerContext.ownerId,
      });
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    const supabase = createServerClient();
    let data: any = null;
    let dbError: any = null;

    // Fetch data based on section
    switch (section) {
      case 'personalDetails': {
        const { data: personalData, error: personalError } = await supabase
          .from('personal_details')
          .select('*')
          .eq('user_id', viewerContext.ownerId)
          .maybeSingle();
        data = personalData;
        dbError = personalError;
        break;
      }

      case 'medicalContacts': {
        const { data: medicalData, error: medicalError } = await supabase
          .from('medical_contacts')
          .select('*')
          .eq('user_id', viewerContext.ownerId);
        data = medicalData;
        dbError = medicalError;
        break;
      }

      case 'funeralPreferences': {
        const { data: funeralData, error: funeralError } = await supabase
          .from('funeral_preferences')
          .select('*')
          .eq('user_id', viewerContext.ownerId)
          .maybeSingle();
        data = funeralData;
        dbError = funeralError;
        break;
      }

      case 'documents': {
        const { data: documentsData, error: documentsError } = await supabase
          .from('documents')
          .select('*')
          .eq('user_id', viewerContext.ownerId);
        data = documentsData;
        dbError = documentsError;
        break;
      }

      case 'letters': {
        const { data: lettersData, error: lettersError } = await supabase
          .from('letters')
          .select('*')
          .eq('user_id', viewerContext.ownerId);
        data = lettersData;
        dbError = lettersError;
        break;
      }

      case 'legacyMessages':
        const { data: legacyMessagesData } = await supabase
          .from('legacy_messages')
          .select('*')
          .eq('user_id', viewerContext.ownerId);
        data = legacyMessagesData;
        break;

      case 'endOfLifeDirectives':
        const { data: endOfLifeDirectivesData } = await supabase
          .from('end_of_life_directives')
          .select('*')
          .eq('user_id', viewerContext.ownerId)
          .maybeSingle();
        data = endOfLifeDirectivesData;
        break;

      case 'endOfLifeChecklist':
        const { data: endOfLifeChecklistData } = await supabase
          .from('end_of_life_checklist')
          .select('*')
          .eq('user_id', viewerContext.ownerId)
          .maybeSingle();
        data = endOfLifeChecklistData;
        break;

      case 'biography':
        const { data: biographyData } = await supabase
          .from('personal_biography')
          .select('*')
          .eq('user_id', viewerContext.ownerId)
          .maybeSingle();
        data = biographyData;
        break;

      case 'willQuestionnaire':
        const { data: willQuestionnaireData } = await supabase
          .from('will_questionnaire')
          .select('*')
          .eq('user_id', viewerContext.ownerId)
          .maybeSingle();
        data = willQuestionnaireData;
        break;

      case 'assets':
        const { data: assetsData } = await supabase
          .from('assets')
          .select('*')
          .eq('user_id', viewerContext.ownerId);
        data = assetsData;
        break;

      case 'digitalAccounts':
        const { data: digitalAccountsData } = await supabase
          .from('digital_accounts')
          .select('*')
          .eq('user_id', viewerContext.ownerId);
        data = digitalAccountsData;
        break;

      case 'insuranceFinancial':
        const { data: insuranceFinancialData } = await supabase
          .from('insurance_financial_contacts')
          .select('*')
          .eq('user_id', viewerContext.ownerId)
          .maybeSingle();
        data = insuranceFinancialData;
        break;

      case 'household':
        const { data: householdData } = await supabase
          .from('household_information')
          .select('*')
          .eq('user_id', viewerContext.ownerId)
          .maybeSingle();
        data = householdData;
        break;

      case 'childrenWishes':
        const { data: childrenWishesData } = await supabase
          .from('children_wishes')
          .select('*')
          .eq('user_id', viewerContext.ownerId)
          .maybeSingle();
        data = childrenWishesData;
        break;

      case 'familyLegacy':
        // Family legacy is composed of multiple tables, fetch all related data
        const [recipesRes, storiesRes, traditionsRes, routinesRes, heirloomsRes, playlistsRes, lettersRes, instructionsRes, mediaRes] = await Promise.all([
          supabase.from('legacy_recipes').select('*').eq('user_id', viewerContext.ownerId),
          supabase.from('legacy_stories').select('*').eq('user_id', viewerContext.ownerId),
          supabase.from('legacy_traditions').select('*').eq('user_id', viewerContext.ownerId),
          supabase.from('legacy_routines').select('*').eq('user_id', viewerContext.ownerId),
          supabase.from('legacy_heirlooms').select('*').eq('user_id', viewerContext.ownerId),
          supabase.from('legacy_playlists').select('*').eq('user_id', viewerContext.ownerId),
          supabase.from('legacy_letters').select('*').eq('user_id', viewerContext.ownerId),
          supabase.from('legacy_instructions').select('*').eq('user_id', viewerContext.ownerId),
          supabase.from('legacy_media').select('*').eq('user_id', viewerContext.ownerId),
        ]);
        data = {
          recipes: recipesRes.data || [],
          stories: storiesRes.data || [],
          traditions: traditionsRes.data || [],
          routines: routinesRes.data || [],
          heirlooms: heirloomsRes.data || [],
          playlists: playlistsRes.data || [],
          letters: lettersRes.data || [],
          instructions: instructionsRes.data || [],
          media: mediaRes.data || [],
        };
        break;

      case 'finalSummary':
        // Final summary is a computed view, return empty for now
        data = null;
        break;

      case 'releaseSettings':
        const { data: releaseSettingsData } = await supabase
          .from('release_settings')
          .select('*')
          .eq('user_id', viewerContext.ownerId)
          .maybeSingle();
        data = releaseSettingsData;
        break;

      default:
        return NextResponse.json({ error: 'Invalid section' }, { status: 400 });
    }

    // Log if there was a database error (but don't fail - null data is valid)
    if (dbError) {
      console.error('Database error fetching viewer data:', {
        section,
        error: dbError.message,
        code: dbError.code,
        ownerId: viewerContext.ownerId,
      });
    }

    // Return data even if null - the frontend will handle showing "no data" message
    // This allows viewers to see sections they have permission for, even if no data exists yet
    return NextResponse.json({ 
      data, 
      permissions: viewerContext.permissions,
      hasData: data !== null && data !== undefined && (Array.isArray(data) ? data.length > 0 : true),
    });
  } catch (error: any) {
    console.error('Viewer data fetch error:', error);
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
      section: new URL(request.url).searchParams.get('section'),
    });
    return NextResponse.json({ error: error.message || 'Failed to fetch data' }, { status: 500 });
  }
}


