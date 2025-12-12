/**
 * Funeral Planning Feature Types
 * Types for AI-guided funeral planning in Going Home app
 */

// Funeral Story Types
export interface FuneralStoryInput {
  atmosphere?: string;
  musicChoices?: string[];
  toneTheme?: string;
  readingsScriptures?: string[];
  eulogyNotes?: string;
  messagesToAudience?: string;
  desiredFeeling?: string;
}

export interface FuneralStoryOutput {
  ceremonyScript: string;
  memorialNarrative: string;
  playlistSuggestions: Array<{
    song: string;
    artist: string;
    occasion: string;
    reason: string;
  }>;
  slideshowCaptions: Array<{
    caption: string;
    timing: string;
  }>;
  moodDescription: string;
}

// Moodboard Types
export interface MoodboardInput {
  colors?: string[];
  flowers?: string[];
  clothingPreferences?: string;
  aestheticStyle?: string;
  venueType?: string;
}

export interface MoodboardOutput {
  vibeGuide: string;
  decorSuggestions: Array<{
    item: string;
    placement: string;
    reason: string;
  }>;
  invitationWording: string;
  moodboardLayout: {
    colorPalette: string[];
    styleDescription: string;
    atmosphere: string;
  };
}

// Eulogy Types
export interface EulogyInput {
  biography?: string;
  highlights?: string[];
  faithBased?: boolean;
  desiredLength?: 'short' | 'medium' | 'long';
}

export interface EulogyOutput {
  fullDraft: string;
  shortVersion?: string;
  mediumVersion?: string;
  speechPacing: string;
  faithBasedVariation?: string;
}

// Ceremony Script Types
export interface CeremonyScriptInput {
  tone?: 'celebratory' | 'traditional' | 'spiritual' | 'casual' | 'formal';
  includePrayers?: boolean;
  includeReadings?: boolean;
  customRequests?: string;
}

export interface CeremonyScriptOutput {
  openingWords: string;
  closingBlessing: string;
  prayers?: Array<{
    title: string;
    text: string;
    timing: string;
  }>;
  readings?: Array<{
    title: string;
    text: string;
    source?: string;
    timing: string;
  }>;
  transitions: Array<{
    from: string;
    to: string;
    text: string;
  }>;
  fullScript: string;
}

// Funeral Letter Types
export interface FuneralLetterInput {
  letterType: 'friends' | 'spouse' | 'children' | 'everyone' | 'final_words';
  recipientDescription?: string;
  keyPoints?: string[];
  tone?: 'loving' | 'encouraging' | 'reflective' | 'grateful' | 'hopeful';
}

export interface FuneralLetterOutput {
  draft: string;
  suggestions?: string[];
}

// Life Themes Types
export interface LifeThemeInput {
  keyMemories: string[];
  values?: string[];
  preferences?: string;
}

export interface LifeThemeOutput {
  coreValues: string[];
  toneThemes: string[];
  lifeLessons: string[];
  identityMotifs: string[];
  themeDescription: string;
}

// Playlist Types
export interface PlaylistInput {
  favoriteSongs?: string[];
  genres?: string[];
  mood?: string;
  era?: string;
}

export interface PlaylistOutput {
  ceremonyMusic: Array<{
    song: string;
    artist: string;
    timing: string;
    reason: string;
  }>;
  slideshowSongs: Array<{
    song: string;
    artist: string;
    reason: string;
  }>;
  receptionPlaylist: Array<{
    song: string;
    artist: string;
    mood: string;
  }>;
  explanations: string;
}

// Slideshow Types
export interface SlideshowInput {
  photoIds?: string[];
  themes?: string[];
  desiredOrder?: string[];
}

export interface SlideshowOutput {
  photoOrder: Array<{
    photoId: string;
    position: number;
    group?: string;
  }>;
  captions: Array<{
    photoId: string;
    caption: string;
  }>;
  groupings: Array<{
    groupName: string;
    photoIds: string[];
    theme: string;
  }>;
  songMatches: Array<{
    groupName: string;
    song: string;
    artist: string;
    reason: string;
  }>;
}

// Database Record Types
export interface FuneralStory {
  id: string;
  user_id: string;
  atmosphere?: string;
  music_choices?: any;
  tone_theme?: string;
  readings_scriptures?: any;
  eulogy_notes?: string;
  messages_to_audience?: string;
  desired_feeling?: string;
  ceremony_script?: string;
  memorial_narrative?: string;
  playlist_suggestions?: any;
  slideshow_captions?: any;
  mood_description?: string;
  created_at: string;
  updated_at: string;
}

export interface FuneralMoodboard {
  id: string;
  user_id: string;
  colors?: any;
  flowers?: any;
  clothing_preferences?: string;
  aesthetic_style?: string;
  venue_type?: string;
  vibe_guide?: string;
  decor_suggestions?: any;
  invitation_wording?: string;
  moodboard_layout?: any;
  created_at: string;
  updated_at: string;
}

export interface FuneralScript {
  id: string;
  user_id: string;
  opening_words?: string;
  closing_blessing?: string;
  prayers?: any;
  readings?: any;
  transitions?: any;
  tone_variation?: string;
  full_script?: string;
  created_at: string;
  updated_at: string;
}

export interface FuneralPlaylist {
  id: string;
  user_id: string;
  ceremony_music?: any;
  slideshow_songs?: any;
  reception_playlist?: any;
  personalized_explanations?: any;
  created_at: string;
  updated_at: string;
}

export interface FuneralLetter {
  id: string;
  user_id: string;
  letter_type: 'friends' | 'spouse' | 'children' | 'everyone' | 'final_words';
  recipient_description?: string;
  draft_content?: string;
  final_content?: string;
  ai_suggestions?: string;
  created_at: string;
  updated_at: string;
}

export interface FuneralSlideshow {
  id: string;
  user_id: string;
  photo_order?: any;
  captions?: any;
  groupings?: any;
  song_matches?: any;
  slideshow_data?: any;
  created_at: string;
  updated_at: string;
}

export interface LifeTheme {
  id: string;
  user_id: string;
  key_memories?: any;
  core_values?: any;
  tone_themes?: any;
  life_lessons?: any;
  identity_motifs?: any;
  applied_to_eulogy?: boolean;
  applied_to_ceremony?: boolean;
  applied_to_playlist?: boolean;
  applied_to_letters?: boolean;
  applied_to_obituary?: boolean;
  created_at: string;
  updated_at: string;
}






