
import React, { useState, useEffect } from 'react';
import { MapPin, Navigation, Car, Footprints, Bike, RefreshCw, Search, X } from './Icons';

interface Masjid {
  name: string;
  address: string;
  distance: string;
  driveTime: string;
  walkTime: string;
  cycleTime: string;
  mapsUrl: string;
}

interface SearchResults {
  masjids: Masjid[];
}

export const MasjidFinder: React.FC = () => {
  const [postcode, setPostcode] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<SearchResults>({ masjids: [] });
  const [error, setError] = useState<string | null>(null);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [isLocating, setIsLocating] = useState(false);

  const findNearest = async (location?: { lat: number; lng: number }, query?: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/find-masjids', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ location, query }),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch results from server');
      }

      const data = await response.json();
      setResults({
        masjids: data.masjids || []
      });
    } catch (err) {
      console.error(err);
      setError("Failed to find results. Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleLocationSearch = () => {
    setIsLocating(true);
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const loc = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          setUserLocation(loc);
          findNearest(loc);
          setIsLocating(false);
        },
        (err) => {
          console.error(err);
          setError("Location access denied. Please enter a postcode manually.");
          setIsLocating(false);
        }
      );
    } else {
      setError("Geolocation is not supported by your browser.");
      setIsLocating(false);
    }
  };

  const handlePostcodeSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (postcode.trim()) {
      findNearest(undefined, postcode);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 md:p-12 shadow-xl border border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-6 mb-10">
          <div className="w-16 h-16 rounded-2xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
            <MapPin className="w-8 h-8" />
          </div>
          <div>
            <h2 className="text-3xl font-serif font-bold text-slate-900 dark:text-white">Masjid Finder</h2>
            <p className="text-slate-500 dark:text-slate-400 font-medium">Find your nearest place of worship</p>
          </div>
        </div>

        <div className="space-y-6">
          <form onSubmit={handlePostcodeSearch} className="relative">
            <input
              type="text"
              placeholder="Enter postcode (e.g. NW1 6XE)"
              value={postcode}
              onChange={(e) => setPostcode(e.target.value)}
              className="w-full pl-14 pr-32 py-5 bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-emerald-400 focus:bg-white dark:focus:bg-slate-700 rounded-3xl transition-all outline-none font-bold text-slate-800 dark:text-white text-lg shadow-inner"
            />
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 w-6 h-6" />
            <button
              type="submit"
              disabled={loading}
              className="absolute right-3 top-1/2 -translate-y-1/2 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-bold transition-all shadow-lg shadow-emerald-200 dark:shadow-none disabled:opacity-50"
            >
              {loading ? <RefreshCw className="w-5 h-5 animate-spin" /> : 'Search'}
            </button>
          </form>

          <div className="flex items-center gap-4">
            <div className="h-px flex-1 bg-slate-100 dark:bg-slate-800"></div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">OR</span>
            <div className="h-px flex-1 bg-slate-100 dark:bg-slate-800"></div>
          </div>

          <button
            onClick={handleLocationSearch}
            disabled={isLocating || loading}
            className="w-full py-5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-3xl font-bold transition-all flex items-center justify-center gap-3 border border-slate-200 dark:border-slate-700"
          >
            {isLocating ? (
              <RefreshCw className="w-5 h-5 animate-spin" />
            ) : (
              <Navigation className="w-5 h-5" />
            )}
            Find Nearest to Me
          </button>
        </div>

        {error && (
          <div className="mt-8 p-4 bg-rose-50 dark:bg-rose-900/20 border border-rose-100 dark:border-rose-800 rounded-2xl text-rose-600 dark:text-rose-400 text-sm font-medium flex items-center gap-3">
            <X className="w-5 h-5" />
            {error}
          </div>
        )}

        {(results.masjids.length > 0) && (
          <div className="mt-12 space-y-6">
            <div className="grid gap-6">
              {results.masjids.map((masjid, index) => (
                  <div 
                    key={index}
                    className="group bg-slate-50 dark:bg-slate-800/50 p-6 rounded-[2rem] border border-slate-100 dark:border-slate-800 hover:border-emerald-200 dark:hover:border-emerald-800 transition-all hover:shadow-xl hover:shadow-emerald-100/20 dark:hover:shadow-none"
                  >
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                      <div className="flex-1">
                        <h4 className="text-xl font-bold text-slate-900 dark:text-white mb-1">{masjid.name}</h4>
                        <p className="text-slate-500 dark:text-slate-400 text-sm mb-4">{masjid.address}</p>
                        
                        <div className="flex flex-wrap gap-3">
                          <div className="flex items-center gap-2 px-3 py-1.5 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-600 dark:text-slate-300">
                            <Car className="w-4 h-4 text-emerald-500" />
                            {masjid.driveTime}
                          </div>
                          <div className="flex items-center gap-2 px-3 py-1.5 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-600 dark:text-slate-300">
                            <Footprints className="w-4 h-4 text-emerald-500" />
                            {masjid.walkTime}
                          </div>
                          <div className="flex items-center gap-2 px-3 py-1.5 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-600 dark:text-slate-300">
                            <Bike className="w-4 h-4 text-emerald-500" />
                            {masjid.cycleTime}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex flex-col items-end gap-2">
                        <span className="text-emerald-600 dark:text-emerald-400 font-bold text-lg">{masjid.distance}</span>
                        <a 
                          href={masjid.mapsUrl} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="px-6 py-3 bg-white dark:bg-slate-700 text-slate-700 dark:text-white rounded-xl font-bold text-sm border border-slate-200 dark:border-slate-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 hover:border-emerald-200 dark:hover:border-emerald-800 transition-all flex items-center gap-2"
                        >
                          <Navigation className="w-4 h-4" />
                          Directions
                        </a>
                      </div>
                    </div>
                  </div>
                ))
              }
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
