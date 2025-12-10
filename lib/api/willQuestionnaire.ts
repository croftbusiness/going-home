interface WillQuestionnaire {
  id?: string;
  personalInfo?: any;
  executor?: any;
  guardians?: any;
  bequests?: any;
  digitalAssets?: any;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

export async function createWillQuestionnaire(data: Partial<WillQuestionnaire>): Promise<WillQuestionnaire> {
  const response = await fetch('/api/user/will-questionnaire', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to create questionnaire');
  }

  const result = await response.json();
  return result.questionnaire;
}

export async function getWillQuestionnaire(): Promise<WillQuestionnaire | null> {
  const response = await fetch('/api/user/will-questionnaire');

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to load questionnaire');
  }

  const result = await response.json();
  return result.questionnaire;
}

export async function updateWillQuestionnaire(id: string, data: Partial<WillQuestionnaire>): Promise<WillQuestionnaire> {
  const response = await fetch('/api/user/will-questionnaire', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to update questionnaire');
  }

  const result = await response.json();
  return result.questionnaire;
}

export async function exportWillQuestionnaire(id: string): Promise<Blob> {
  // Call our Next.js API route which proxies to Supabase Edge Function
  const response = await fetch('/api/export-will-questionnaire', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ questionnaireId: id }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Failed to export PDF' }));
    throw new Error(error.error || 'Failed to export PDF');
  }

  return await response.blob();
}

