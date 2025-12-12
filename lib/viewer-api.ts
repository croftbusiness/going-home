// Helper function for viewer pages to fetch data with session
export async function fetchViewerData(section: string, session: any) {
  const response = await fetch(`/api/viewer/data?section=${section}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ session }),
  });

  if (!response.ok) {
    if (response.status === 403) {
      return { error: 'Access denied', data: null };
    }
    throw new Error('Failed to load data');
  }

  const result = await response.json();
  return { data: result.data, permissions: result.permissions };
}

