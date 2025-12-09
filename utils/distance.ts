// Distance calculation utilities

export function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 3959; // Earth's radius in miles
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
    Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) *
    Math.sin(dLon / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  
  return distance;
}

function toRad(value: number): number {
  return (value * Math.PI) / 180;
}

export function formatDistance(distance: number): string {
  if (distance < 1) {
    return `${(distance * 5280).toFixed(0)} feet`;
  } else {
    return `${distance.toFixed(2)} miles`;
  }
}

export function calculateETA(
  distance: number,
  speedMph: number = 30
): Date {
  const hours = distance / speedMph;
  const milliseconds = hours * 60 * 60 * 1000;
  return new Date(Date.now() + milliseconds);
}
