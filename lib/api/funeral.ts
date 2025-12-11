/**
 * Client-side API utilities for Funeral Planning features
 */

import type {
  FuneralStoryInput,
  FuneralStoryOutput,
  MoodboardInput,
  MoodboardOutput,
  EulogyInput,
  EulogyOutput,
  CeremonyScriptInput,
  CeremonyScriptOutput,
  FuneralLetterInput,
  FuneralLetterOutput,
  LifeThemeInput,
  LifeThemeOutput,
  PlaylistInput,
  PlaylistOutput,
} from '@/types/funeral';

// Funeral Story
export async function getFuneralStory() {
  const response = await fetch('/api/funeral/story');
  if (!response.ok) throw new Error('Failed to load funeral story');
  const data = await response.json();
  return data.story;
}

export async function generateFuneralStory(input: FuneralStoryInput) {
  const response = await fetch('/api/funeral/story', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to generate story');
  }
  return response.json();
}

// Moodboard
export async function getMoodboard() {
  const response = await fetch('/api/funeral/moodboard');
  if (!response.ok) throw new Error('Failed to load moodboard');
  const data = await response.json();
  return data.moodboard;
}

export async function generateMoodboard(input: MoodboardInput) {
  const response = await fetch('/api/funeral/moodboard', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to generate moodboard');
  }
  return response.json();
}

// Eulogy
export async function generateEulogy(input: EulogyInput) {
  const response = await fetch('/api/funeral/eulogy', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to generate eulogy');
  }
  return response.json();
}

// Ceremony Script
export async function getScript() {
  const response = await fetch('/api/funeral/script');
  if (!response.ok) throw new Error('Failed to load script');
  const data = await response.json();
  return data.script;
}

export async function generateScript(input: CeremonyScriptInput) {
  const response = await fetch('/api/funeral/script', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to generate script');
  }
  return response.json();
}

// Playlist
export async function getPlaylist() {
  const response = await fetch('/api/funeral/playlist');
  if (!response.ok) throw new Error('Failed to load playlist');
  const data = await response.json();
  return data.playlist;
}

export async function generatePlaylist(input: PlaylistInput) {
  const response = await fetch('/api/funeral/playlist', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to generate playlist');
  }
  return response.json();
}

// Funeral Letters
export async function getLetters() {
  const response = await fetch('/api/funeral/letter');
  if (!response.ok) throw new Error('Failed to load letters');
  const data = await response.json();
  return data.letters || [];
}

export async function getLetter(id: string) {
  const response = await fetch(`/api/funeral/letter?id=${id}`);
  if (!response.ok) throw new Error('Failed to load letter');
  const data = await response.json();
  return data.letter;
}

export async function generateLetter(input: FuneralLetterInput & { id?: string }) {
  const response = await fetch('/api/funeral/letter', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to generate letter');
  }
  return response.json();
}

export async function updateLetter(id: string, finalContent: string) {
  const response = await fetch('/api/funeral/letter', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id, finalContent }),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to update letter');
  }
  return response.json();
}

// Life Themes
export async function getLifeThemes() {
  const response = await fetch('/api/funeral/life-themes');
  if (!response.ok) throw new Error('Failed to load themes');
  const data = await response.json();
  return data.themes;
}

export async function analyzeLifeThemes(input: LifeThemeInput) {
  const response = await fetch('/api/funeral/life-themes', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to analyze themes');
  }
  return response.json();
}




