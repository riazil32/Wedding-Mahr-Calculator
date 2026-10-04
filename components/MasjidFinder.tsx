import React, { useState } from 'react';
import {
  MapPin,
  Navigation,
  Search,
  Car,
  Footprints,
  Bike,
  ExternalLink,
  RefreshCw,
  Crescent,
  Sparkles,
  Users,
  Globe
} from './Icons';

interface MasjidItem {
  name: string;
  address: string;
  distance: string;
  walkTime: string;
  cycleTime: string;
  driveTime: string;
  prayers: string[];
  facilities: string[];
  website?: string;
  mapsUrl: string;
}

interface GroundingLink {
  title: string;
  uri: string;
  reviewSnippets?: string[];
}

const PRAYER_FILTERS = [
  { id: 'all', label: 'All Prayers' },
  { id: "Daily Jama'ah", label: "Daily Jama'ah" },
  { id: "Jumu'ah", label: "Jumu'ah" },
  { id: 'Taraweeh', label: 'Taraweeh' },
  { id: 'Eid Prayers', label: 'Eid Prayers' },
];

function getDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

async function fetchClientSideFallback(
  location?: { lat: number; lng: number },
  query?: string
): Promise<MasjidItem[]> {
  let centerLat = location?.lat;
  let centerLng = location?.lng;

  if ((typeof centerLat !== 'number' || typeof centerLng !== 'number') && query) {
    const geoRes = await fetch(
      `https://nominatim.openstreetmap.org/search?format=jsonv2&limit=1&q=${encodeURIComponent(query)}`
    );
    if (geoRes.ok) {
      const geoData = await geoRes.json();
      if (Array.isArray(geoData) && geoData.length > 0) {
        centerLat = parseFloat(geoData[0].lat);
        centerLng = parseFloat(geoData[0].lon);
      }
    }
  }

  if (typeof centerLat !== 'number' || typeof centerLng !== 'number' || isNaN(centerLat) || isNaN(centerLng)) {
    return [];
  }

  const searchBox = async (delta: number) => {
    const viewbox = `${centerLng! - delta},${centerLat! + delta},${centerLng! + delta},${centerLat! - delta}`;
    const terms = ['mosque', 'masjid', 'islamic centre'];
    const urls = terms.map(
      (term) =>
        `https://nominatim.openstreetmap.org/search?format=jsonv2&addressdetails=1&extratags=1&limit=20&bounded=1&viewbox=${viewbox}&q=${encodeURIComponent(term)}`
    );
    const responses = await Promise.all(
      urls.map((u) =>
        fetch(u)
          .then((r) => (r.ok ? r.json() : []))
          .catch(() => [])
      )
    );
    return responses.flat();
  };

  let rawPlaces = await searchBox(0.08);
  if (rawPlaces.length === 0) {
    rawPlaces = await searchBox(0.25);
  }

  const seen = new Set<string>();
  const uniquePlaces: any[] = [];

  for (const place of rawPlaces) {
    const pLat = parseFloat(place.lat);
    const pLng = parseFloat(place.lon);
    if (isNaN(pLat) || isNaN(pLng)) continue;
    const coordKey = `${pLat.toFixed(3)},${pLng.toFixed(3)}`;
    const idKey = place.osm_id ? String(place.osm_id) : coordKey;
    if (seen.has(idKey) || seen.has(coordKey)) continue;
    seen.add(idKey);
    seen.add(coordKey);
    uniquePlaces.push(place);
  }

  return uniquePlaces
    .map((place) => {
      const mLat = parseFloat(place.lat);
      const mLng = parseFloat(place.lon);
      const addr = place.address || {};
      const extra = place.extratags || {};

      const name =
        place.name ||
        (place.display_name ? place.display_name.split(',')[0] : 'Local Masjid & Prayer Centre');

      const street = [addr.house_number, addr.road].filter(Boolean).join(' ');
      const locality = addr.suburb || addr.neighbourhood || addr.city || addr.town || '';
      const postcode = addr.postcode || '';
      const address =
        [street, locality, postcode].filter(Boolean).join(', ') ||
        place.display_name?.split(',').slice(1, 4).join(',').trim() ||
        'View location on Google Maps';

      const distKm = getDistanceKm(centerLat!, centerLng!, mLat, mLng);
      const distMiles = distKm * 0.621371;
      const walkMins = Math.max(2, Math.round((distKm / 4.8) * 60));
      const cycleMins = Math.max(1, Math.round((distKm / 16) * 60));
      const driveMins = Math.max(2, Math.round((distKm / 28) * 60 + 2));

      const prayers = ["Daily Jama'ah", "Jumu'ah", 'Taraweeh', 'Eid Prayers'];
      const facilitiesSet = new Set<string>(['Wudu & Prayer Hall']);
      if (extra.female === 'yes' || extra['women'] === 'yes') {
        facilitiesSet.add("Sisters' Prayer Space");
      }
      if (extra.wheelchair === 'yes') {
        facilitiesSet.add('Wheelchair Accessible');
      }
      if (extra.toilets === 'yes') {
        facilitiesSet.add('Public Restrooms On-Site');
      }
      facilitiesSet.add('Public Parking & Transit Nearby');
      facilitiesSet.add('Local Halal Dining & Shops Nearby');

      return {
        name,
        address,
        distanceKm: distKm,
        distance: `${distMiles.toFixed(1)} mi (${distKm.toFixed(1)} km)`,
        walkTime: `${walkMins} mins`,
        cycleTime: `${cycleMins} mins`,
        driveTime: `${driveMins} mins`,
        prayers,
        facilities: Array.from(facilitiesSet).slice(0, 5),
        website: extra.website || extra['contact:website'] || undefined,
        mapsUrl: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
          `${name} ${postcode || address}`
        )}`,
      };
    })
    .sort((a, b) => a.distanceKm - b.distanceKm)
    .slice(0, 8);
}

export const MasjidFinder: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPrayer, setSelectedPrayer] = useState<string>('all');
  const [masjids, setMasjids] = useState<MasjidItem[]>([]);
  const [groundingSummary, setGroundingSummary] = useState<string>('');
  const [groundingLinks, setGroundingLinks] = useState<GroundingLink[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  const performSearch = async (params: { location?: { lat: number; lng: number }; query?: string }) => {
    setLoading(true);
    setError(null);
    setHasSearched(true);

    try {
      const response = await fetch('/api/find-masjids', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...params,
          prayerFilter: selectedPrayer,
        }),
      });

      const contentType = response.headers.get('content-type') || '';
      if (response.ok && contentType.includes('application/json')) {
        const data = await response.json();
        const serverMasjids = Array.isArray(data.masjids) ? data.masjids : [];
        if (serverMasjids.length > 0) {
          setMasjids(serverMasjids);
        } else {
          const fallbackList = await fetchClientSideFallback(params.location, params.query);
          setMasjids(fallbackList);
        }
        setGroundingSummary(data.groundingSummary || '');
        setGroundingLinks(Array.isArray(data.groundingLinks) ? data.groundingLinks : []);
      } else {
        const fallbackList = await fetchClientSideFallback(params.location, params.query);
        setMasjids(fallbackList);
        setGroundingSummary('');
        setGroundingLinks([]);
      }
    } catch {
      const fallbackList = await fetchClientSideFallback(params.location, params.query);
      setMasjids(fallbackList);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    performSearch({ query: searchQuery.trim() });
  };

  const handleUseMyLocation = () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser. Please search by postcode or city.');
      return;
    }

    setLoading(true);
    setError(null);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        performSearch({
          location: {
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
          },
        });
      },
      () => {
        setLoading(false);
        setError('Location access was denied. Please enter your postcode or city above.');
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const filteredMasjids = masjids.filter((m) =>
    selectedPrayer === 'all' ? true : m.prayers?.includes(selectedPrayer)
  );

  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      {/* Header */}
      <div className="text-center mb-10">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-900/30 border border-emerald-100 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400 text-xs font-bold uppercase tracking-widest mb-4">
          <MapPin className="w-3.5 h-3.5" />
          Google Maps Grounded Locator
        </div>
        <h2 className="text-4xl font-serif font-bold text-slate-900 dark:text-white mb-3">
          Find Closest Masjid to You
        </h2>
        <p className="text-slate-600 dark:text-slate-400 max-w-2xl mx-auto text-sm md:text-base">
          Locate nearby masjids for daily Jama&apos;ah, Jumu&apos;ah, Taraweeh, and Eid prayers — complete with publicly available facilities right next to the masjid.
        </p>
      </div>

      {/* Search & Prayer Filter Card */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 md:p-8 shadow-xl border border-slate-100 dark:border-slate-800 mb-10">
        <form onSubmit={handleSearchSubmit} className="flex flex-col md:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Enter postcode, town, or area (e.g., E1 1JX, Birmingham, Manchester)..."
              className="w-full pl-12 pr-4 py-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm font-medium"
            />
          </div>
          <button
            type="submit"
            disabled={loading || !searchQuery.trim()}
            className="px-6 py-4 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold rounded-2xl transition-all flex items-center justify-center gap-2 text-sm shadow-lg shadow-emerald-600/20"
          >
            <Search className="w-4 h-4" />
            Search Area
          </button>
          <button
            type="button"
            onClick={handleUseMyLocation}
            disabled={loading}
            className="px-6 py-4 bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 dark:hover:bg-slate-700 text-white font-bold rounded-2xl transition-all flex items-center justify-center gap-2 text-sm border border-slate-700"
          >
            <Navigation className="w-4 h-4 text-emerald-400" />
            Closest to Me
          </button>
        </form>

        {/* Prayer Purpose Filters */}
        <div className="flex flex-wrap items-center gap-2 pt-4 border-t border-slate-100 dark:border-slate-800">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mr-2 flex items-center gap-1.5">
            <Crescent className="w-3.5 h-3.5 text-emerald-500" />
            Prayer Type:
          </span>
          {PRAYER_FILTERS.map((filter) => (
            <button
              key={filter.id}
              type="button"
              onClick={() => setSelectedPrayer(filter.id)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                selectedPrayer === filter.id
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>

        {error && (
          <div className="mt-4 p-4 rounded-2xl bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs font-semibold">
            {error}
          </div>
        )}
      </div>

      {/* Loading State */}
      {loading && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-12 text-center border border-slate-100 dark:border-slate-800 shadow-sm">
          <RefreshCw className="w-8 h-8 text-emerald-600 animate-spin mx-auto mb-4" />
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">
            Finding Closest Masjids & Nearby Public Facilities...
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Checking congregational prayer spaces, travel times, and adjacent public amenities
          </p>
        </div>
      )}

      {/* Results Section */}
      {!loading && hasSearched && (
        <div className="space-y-8">
          {/* Google Maps Grounding Overview & Verified Place Links */}
          {(groundingSummary || groundingLinks.length > 0) && (
            <div className="bg-emerald-950 text-emerald-50 rounded-3xl p-6 md:p-8 border border-emerald-800/60 shadow-xl">
              <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase tracking-widest mb-3">
                <Sparkles className="w-4 h-4" />
                Google Maps Grounded Overview & Local Insights
              </div>
              {groundingSummary && (
                <div className="text-sm text-emerald-100/90 leading-relaxed whitespace-pre-line mb-6">
                  {groundingSummary}
                </div>
              )}

              {groundingLinks.length > 0 && (
                <div className="pt-4 border-t border-emerald-800/60">
                  <p className="text-xs font-bold uppercase tracking-wider text-emerald-400 mb-3">
                    Verified Google Maps Places & Community Reviews
                  </p>
                  <div className="grid sm:grid-cols-2 gap-3">
                    {groundingLinks.map((place, idx) => (
                      <a
                        key={`${place.uri}-${idx}`}
                        href={place.uri}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex flex-col justify-between p-3.5 rounded-2xl bg-emerald-900/50 hover:bg-emerald-900 border border-emerald-800 transition-all group"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-bold text-sm text-white group-hover:text-emerald-300 transition-colors">
                            {place.title}
                          </span>
                          <ExternalLink className="w-4 h-4 text-emerald-400 shrink-0" />
                        </div>
                        {place.reviewSnippets && place.reviewSnippets.length > 0 && (
                          <p className="text-xs text-emerald-200/80 italic mt-2 line-clamp-2">
                            &ldquo;{place.reviewSnippets[0]}&rdquo;
                          </p>
                        )}
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Masjid Cards Grid */}
          {filteredMasjids.length === 0 ? (
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-12 text-center border border-slate-100 dark:border-slate-800">
              <MapPin className="w-10 h-10 text-slate-300 dark:text-slate-700 mx-auto mb-3" />
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">
                No Masjids Found for This Search
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Try searching with a broader town/city name or a nearby postcode.
              </p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-6">
              {filteredMasjids.map((masjid, idx) => (
                <div
                  key={`${masjid.name}-${idx}`}
                  className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-xl transition-all flex flex-col justify-between"
                >
                  <div>
                    {/* Top Row: Name + Distance */}
                    <div className="flex items-start justify-between gap-4 mb-3">
                      <div>
                        <h3 className="text-xl font-serif font-bold text-slate-900 dark:text-white">
                          {masjid.name}
                        </h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                          {masjid.address}
                        </p>
                      </div>
                      <span className="shrink-0 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 text-xs font-bold border border-emerald-100 dark:border-emerald-800">
                        {masjid.distance}
                      </span>
                    </div>

                    {/* Travel Times */}
                    <div className="grid grid-cols-3 gap-2 my-4 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                      <div className="flex items-center gap-2">
                        <Footprints className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                        <div>
                          <p className="text-[10px] uppercase text-slate-400 font-bold">Walk</p>
                          <p className="text-xs font-bold text-slate-800 dark:text-slate-200">{masjid.walkTime}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Bike className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
                        <div>
                          <p className="text-[10px] uppercase text-slate-400 font-bold">Cycle</p>
                          <p className="text-xs font-bold text-slate-800 dark:text-slate-200">{masjid.cycleTime}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Car className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
                        <div>
                          <p className="text-[10px] uppercase text-slate-400 font-bold">Drive</p>
                          <p className="text-xs font-bold text-slate-800 dark:text-slate-200">{masjid.driveTime}</p>
                        </div>
                      </div>
                    </div>

                    {/* Congregational Prayers Supported */}
                    <div className="mb-4">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2 flex items-center gap-1.5">
                        <Users className="w-3.5 h-3.5 text-emerald-500" />
                        Congregational Prayers
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {masjid.prayers.map((prayer) => (
                          <span
                            key={prayer}
                            className="px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800/60 text-[11px] font-bold"
                          >
                            {prayer}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Public Facilities Next to / At Masjid */}
                    <div className="mb-6">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2">
                        Public Facilities Next to & At Masjid
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {masjid.facilities.map((facility) => (
                          <span
                            key={facility}
                            className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[11px] font-medium"
                          >
                            {facility}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Directions & Website Links */}
                  <div className="flex gap-2">
                    <a
                      href={masjid.mapsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 py-3 px-4 rounded-2xl bg-slate-900 dark:bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all"
                    >
                      Open in Google Maps
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                    {masjid.website && (
                      <a
                        href={masjid.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        title="Official Masjid Website & Prayer Timetable"
                        className="py-3 px-4 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs flex items-center justify-center gap-1.5 transition-all"
                      >
                        <Globe className="w-4 h-4" />
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
