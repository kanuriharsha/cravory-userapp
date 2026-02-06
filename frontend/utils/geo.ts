export function toRadians(deg: number) {
  return deg * (Math.PI / 180);
}

// Haversine formula - returns distance in kilometers
export function haversineDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371; // Earth radius km
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export function normalizeRestaurant(r: any) {
  const id = r._id || r.id || (r._doc && r._doc._id) || null;
  const image = r.image || r.imageUrl || '';
  
  // Handle multiple coordinate structures:
  // New structure: location.coordinates.latitude/longitude
  // Old structure: location.lat/lng
  // Fallback: direct latitude/longitude properties
  let latitude = null;
  let longitude = null;
  
  if (r.location?.coordinates?.latitude && r.location?.coordinates?.longitude) {
    // New structure: location.coordinates.latitude/longitude
    latitude = r.location.coordinates.latitude;
    longitude = r.location.coordinates.longitude;
  } else if (r.location?.lat && r.location?.lng) {
    // Old structure: location.lat/lng
    latitude = r.location.lat;
    longitude = r.location.lng;
  } else if (r.coordinates?.latitude && r.coordinates?.longitude) {
    // Direct coordinates object
    latitude = r.coordinates.latitude;
    longitude = r.coordinates.longitude;
  } else if (r.latitude && r.longitude) {
    // Direct properties
    latitude = r.latitude;
    longitude = r.longitude;
  }
  
  // Normalize other properties
  const isOpen = r.isOpen ?? r.is_open ?? true;
  const deliveryTime = r.deliveryTime || r.delivery_time || 'N/A';
  
  return {
    ...r,
    id,
    image,
    latitude,
    longitude,
    isOpen,
    deliveryTime,
  };
}
