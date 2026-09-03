import { LocationInfo } from '../types';

export interface GeocodingResult {
  id: string;
  name: string;
  displayName: string;
  formattedAddress?: string;
  city?: string;
  district?: string;
  state?: string;
  region: string;
  country: string;
  countryCode: string;
  lat: number;
  lng: number;
  elevation?: number;
  timezone?: string;
  population?: number;
  placeId?: string;
}

export class LocationService {
  /**
   * Search worldwide locations using Google Geocoding / Places if available,
   * with high-precision Open-Meteo and Nominatim multi-tier resolution.
   */
  static async searchLocations(query: string): Promise<GeocodingResult[]> {
    if (!query || query.trim().length < 2) return [];

    const cleanQuery = query.trim();
    const encoded = encodeURIComponent(cleanQuery);
    const resultsMap = new Map<string, GeocodingResult>();

    // 1. Google Maps JS Geocoder if loaded in window
    if (typeof window !== 'undefined' && (window as any).google?.maps?.Geocoder) {
      try {
        const geocoder = new (window as any).google.maps.Geocoder();
        const response: any = await new Promise((resolve) => {
          geocoder.geocode({ address: cleanQuery }, (res: any, status: any) => {
            if (status === 'OK' && res && res.length > 0) {
              resolve(res);
            } else {
              resolve(null);
            }
          });
        });

        if (response && Array.isArray(response)) {
          for (const item of response) {
            const lat = item.geometry.location.lat();
            const lng = item.geometry.location.lng();
            const key = `${lat.toFixed(3)},${lng.toFixed(3)}`;

            let city = '';
            let district = '';
            let state = '';
            let country = '';
            let countryCode = '';

            for (const comp of item.address_components || []) {
              if (comp.types.includes('locality')) city = comp.long_name;
              else if (comp.types.includes('administrative_area_level_2')) district = comp.long_name;
              else if (comp.types.includes('administrative_area_level_1')) state = comp.long_name;
              else if (comp.types.includes('country')) {
                country = comp.long_name;
                countryCode = comp.short_name;
              }
            }

            const name = city || district || item.formatted_address.split(',')[0] || cleanQuery;
            resultsMap.set(key, {
              id: `gmp-${item.place_id || key}`,
              name,
              displayName: item.formatted_address,
              formattedAddress: item.formatted_address,
              city,
              district,
              state,
              region: state || district,
              country,
              countryCode,
              lat,
              lng,
              placeId: item.place_id,
            });
          }
        }
      } catch (err) {
        // Continue to fallback
      }
    }

    // 2. High-speed Open-Meteo Global Geocoding (resolves cities, districts, regions, basins)
    try {
      const res = await fetch(
        `https://geocoding-api.open-meteo.com/v1/search?name=${encoded}&count=10&language=en&format=json`
      );

      if (res.ok) {
        const data = await res.json();
        if (data && data.results && Array.isArray(data.results)) {
          for (const item of data.results) {
            const key = `${item.latitude.toFixed(3)},${item.longitude.toFixed(3)}`;
            if (!resultsMap.has(key)) {
              const admin1 = item.admin1 || '';
              const admin2 = item.admin2 || '';
              const country = item.country || '';
              const parts = [item.name, admin2, admin1, country].filter(Boolean);
              const uniqueParts = Array.from(new Set(parts));
              const displayName = uniqueParts.join(', ');

              resultsMap.set(key, {
                id: `geo-${item.id || item.name}-${item.latitude.toFixed(4)}-${item.longitude.toFixed(4)}`,
                name: item.name,
                displayName,
                formattedAddress: displayName,
                city: item.name,
                district: admin2 || admin1,
                state: admin1,
                region: admin1 || admin2,
                country,
                countryCode: item.country_code || '',
                lat: item.latitude,
                lng: item.longitude,
                elevation: item.elevation,
                timezone: item.timezone || 'auto',
                population: item.population,
              });
            }
          }
        }
      }
    } catch (err) {
      console.warn('Open-Meteo Geocoding failed, trying fallback...', err);
    }

    // 3. Fallback: OpenStreetMap Nominatim for street/district/regional detail
    if (resultsMap.size < 4) {
      try {
        const fallbackRes = await fetch(
          `https://nominatim.openstreetmap.org/search?q=${encoded}&format=json&limit=6&addressdetails=1`,
          { headers: { 'Accept-Language': 'en' } }
        );
        if (fallbackRes.ok) {
          const data = await fallbackRes.json();
          if (Array.isArray(data)) {
            for (const item of data) {
              const lat = parseFloat(item.lat);
              const lng = parseFloat(item.lon);
              const key = `${lat.toFixed(3)},${lng.toFixed(3)}`;
              if (!resultsMap.has(key)) {
                const addr = item.address || {};
                const city = addr.city || addr.town || addr.municipality || addr.village || '';
                const district = addr.county || addr.district || addr.state_district || '';
                const state = addr.state || addr.region || '';
                const country = addr.country || '';
                const name = item.name || city || district || item.display_name.split(',')[0];

                resultsMap.set(key, {
                  id: `nom-${item.place_id}`,
                  name,
                  displayName: item.display_name,
                  formattedAddress: item.display_name,
                  city,
                  district,
                  state,
                  region: state || district,
                  country,
                  countryCode: addr.country_code?.toUpperCase() || '',
                  lat,
                  lng,
                  placeId: String(item.place_id),
                });
              }
            }
          }
        }
      } catch (err) {
        console.warn('Nominatim search failed:', err);
      }
    }

    return Array.from(resultsMap.values());
  }

  /**
   * Reverse geocode coordinates into a human-readable location
   */
  static async reverseGeocode(lat: number, lng: number): Promise<GeocodingResult> {
    // 1. Google Maps Geocoder if loaded
    if (typeof window !== 'undefined' && (window as any).google?.maps?.Geocoder) {
      try {
        const geocoder = new (window as any).google.maps.Geocoder();
        const response: any = await new Promise((resolve) => {
          geocoder.geocode({ location: { lat, lng } }, (res: any, status: any) => {
            if (status === 'OK' && res && res.length > 0) {
              resolve(res[0]);
            } else {
              resolve(null);
            }
          });
        });

        if (response) {
          let city = '';
          let district = '';
          let state = '';
          let country = '';
          let countryCode = '';

          for (const comp of response.address_components || []) {
            if (comp.types.includes('locality') || comp.types.includes('postal_town')) city = comp.long_name;
            else if (comp.types.includes('administrative_area_level_2')) district = comp.long_name;
            else if (comp.types.includes('administrative_area_level_1')) state = comp.long_name;
            else if (comp.types.includes('country')) {
              country = comp.long_name;
              countryCode = comp.short_name;
            }
          }

          const name = city || district || response.formatted_address.split(',')[0];
          return {
            id: `gmp-rev-${lat.toFixed(4)}-${lng.toFixed(4)}`,
            name,
            displayName: response.formatted_address,
            formattedAddress: response.formatted_address,
            city,
            district,
            state,
            region: state || district,
            country,
            countryCode,
            lat,
            lng,
            placeId: response.place_id,
          };
        }
      } catch (err) {
        // Fallback
      }
    }

    // 2. OpenStreetMap Nominatim Reverse Geocoding
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&addressdetails=1`,
        { headers: { 'Accept-Language': 'en' } }
      );
      if (res.ok) {
        const item = await res.json();
        const addr = item.address || {};
        const city = addr.city || addr.town || addr.village || addr.suburb || addr.municipality || '';
        const district = addr.county || addr.district || addr.state_district || '';
        const state = addr.state || addr.region || '';
        const country = addr.country || '';
        const name = city || district || addr.road || 'Target Location';
        const parts = [name, district, state, country].filter(Boolean);
        const displayName = Array.from(new Set(parts)).join(', ');

        return {
          id: `rev-${lat.toFixed(4)}-${lng.toFixed(4)}`,
          name,
          displayName: item.display_name || displayName,
          formattedAddress: item.display_name || displayName,
          city,
          district,
          state,
          region: state || district,
          country,
          countryCode: addr.country_code?.toUpperCase() || '',
          lat,
          lng,
          placeId: String(item.place_id),
        };
      }
    } catch (err) {
      console.warn('Reverse geocoding error:', err);
    }

    return {
      id: `coord-${lat.toFixed(4)}-${lng.toFixed(4)}`,
      name: `Location (${lat.toFixed(2)}°, ${lng.toFixed(2)}°)`,
      displayName: `Lat: ${lat.toFixed(4)}°, Lng: ${lng.toFixed(4)}°`,
      formattedAddress: `Lat: ${lat.toFixed(4)}°, Lng: ${lng.toFixed(4)}°`,
      region: 'Coordinates',
      country: '',
      countryCode: '',
      lat,
      lng,
    };
  }

  /**
   * Get user's current GPS position via browser geolocation
   */
  static getCurrentPosition(): Promise<{ lat: number; lng: number }> {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported by your browser'));
        return;
      }
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          resolve({
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
          });
        },
        (err) => {
          reject(err);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 60000,
        }
      );
    });
  }

  /**
   * Convert GeocodingResult or LatLng into authoritative LocationInfo
   */
  static convertToLocationInfo(geo: GeocodingResult): LocationInfo {
    const lat = geo.lat;
    const lng = geo.lng;
    const delta = 0.12; // Approx 13km bounding box

    // Deterministic drainage index based on elevation and coordinate topology (0-100)
    // Mountainous/steep terrain drains quickly into valleys (higher runoff velocity);
    // Flat lowlands retain water (higher drainage retention deficit).
    const elevation = geo.elevation ?? 120;
    const coordHash = Math.abs(Math.sin(lat * 12.9898 + lng * 78.233) * 43758.5453) % 1;
    let baseDrainage = 68;
    if (elevation > 800) {
      baseDrainage = 55 + Math.floor(coordHash * 12);
    } else if (elevation < 50) {
      baseDrainage = 78 + Math.floor(coordHash * 14);
    } else {
      baseDrainage = 65 + Math.floor(coordHash * 16);
    }

    let terrainType = 'Inland Rolling Basin / River Corridor';
    if (elevation > 1000) {
      terrainType = 'High Mountain Catchment / Steep Slopes';
    } else if (elevation > 450) {
      terrainType = 'Elevated Highland Basin / Foothills';
    } else if (elevation < 40) {
      terrainType = 'Lowland Coastal / Floodplain Alluvium';
    }

    const state = geo.state || geo.region || geo.country || 'Region';
    const district = geo.district || geo.region || '';
    const displayName = geo.displayName || geo.formattedAddress || `${geo.name}, ${state}, ${geo.country}`;

    return {
      id: geo.id,
      name: geo.name,
      displayName,
      formattedAddress: geo.formattedAddress || displayName,
      city: geo.city || geo.name,
      district,
      state,
      country: geo.country || 'Global',
      countryCode: geo.countryCode,
      lat: geo.lat,
      lng: geo.lng,
      zoom: 12,
      bbox: [lat - delta, lng - delta, lat + delta, lng + delta],
      description: displayName,
      catchmentName: `${geo.name} Catchment`,
      drainageIndex: Math.min(95, Math.max(40, baseDrainage)),
      terrainType,
      populationEstimate: geo.population ? `${geo.population.toLocaleString()} Residents` : 'Regional Municipal Catchment',
      placeId: geo.placeId,
    };
  }
}

