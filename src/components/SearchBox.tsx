import React, { useState, useRef, useEffect } from 'react';
import { Search, MapPin, X, ChevronDown, Sparkles } from 'lucide-react';
import { PREDEFINED_DESTINATIONS } from '../data/busRoutes';

interface SearchBoxProps {
  onSearch: (destination: string) => void;
  initialValue?: string;
}

export const SearchBox: React.FC<SearchBoxProps> = ({ onSearch, initialValue = '' }) => {
  const [query, setQuery] = useState(initialValue);
  const [isOpen, setIsOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setQuery(initialValue);
  }, [initialValue]);

  // Filter predefined destinations based on user input
  const filteredDestinations = PREDEFINED_DESTINATIONS.filter((dest) =>
    dest.toLowerCase().includes(query.trim().toLowerCase())
  );

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelectDestination = (dest: string) => {
    setQuery(dest);
    setIsOpen(false);
    setErrorMessage('');
    onSearch(dest);
  };

  const handleSearchSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = query.trim();
    if (!trimmed) {
      setErrorMessage('Please enter or select a destination stop.');
      if (inputRef.current) inputRef.current.focus();
      return;
    }
    setErrorMessage('');
    setIsOpen(false);
    onSearch(trimmed);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (!isOpen) {
        setIsOpen(true);
        setHighlightedIndex(0);
      } else {
        setHighlightedIndex((prev) =>
          prev < filteredDestinations.length - 1 ? prev + 1 : 0
        );
      }
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (isOpen) {
        setHighlightedIndex((prev) =>
          prev > 0 ? prev - 1 : filteredDestinations.length - 1
        );
      }
    } else if (e.key === 'Enter') {
      if (isOpen && highlightedIndex >= 0 && filteredDestinations[highlightedIndex]) {
        e.preventDefault();
        handleSelectDestination(filteredDestinations[highlightedIndex]);
      } else {
        handleSearchSubmit();
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  const handleClear = () => {
    setQuery('');
    setErrorMessage('');
    setIsOpen(false);
    if (inputRef.current) inputRef.current.focus();
  };

  return (
    <div className="w-full max-w-3xl mx-auto" ref={wrapperRef}>
      <form onSubmit={handleSearchSubmit} className="relative">
        <label htmlFor="destination-input" className="block text-slate-800 font-semibold text-base mb-2 flex items-center justify-between">
          <span className="flex items-center gap-2">
            <MapPin className="w-5 h-5 text-blue-600" />
            Where are you going?
          </span>
          <span className="text-xs text-slate-500 font-normal hidden sm:inline">
            Select or type your college drop point
          </span>
        </label>

        <div className="relative flex flex-col sm:flex-row gap-2 sm:gap-0 items-stretch bg-white border-2 border-blue-600/30 focus-within:border-blue-600 rounded-xl shadow-md p-1.5 transition-all">
          <div className="relative flex-1 flex items-center">
            <Search className="w-5 h-5 text-slate-400 ml-3 shrink-0" />
            <input
              id="destination-input"
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setIsOpen(true);
                setErrorMessage('');
                setHighlightedIndex(-1);
              }}
              onFocus={() => setIsOpen(true)}
              onKeyDown={handleKeyDown}
              placeholder="Enter destination (e.g., JP Nagar, Electronic City)..."
              className="w-full px-3 py-3 text-slate-800 placeholder-slate-400 bg-transparent text-base focus:outline-hidden"
              autoComplete="off"
            />
            {query && (
              <button
                type="button"
                onClick={handleClear}
                className="p-1.5 mr-1 text-slate-400 hover:text-slate-600 rounded-md hover:bg-slate-100"
                aria-label="Clear input"
              >
                <X className="w-4 h-4" />
              </button>
            )}
            <button
              type="button"
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 mr-2 text-slate-400 hover:text-slate-600 rounded-md hover:bg-slate-100"
              aria-label="Toggle options dropdown"
            >
              <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>
          </div>

          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-lg shadow-xs transition-colors flex items-center justify-center gap-2 shrink-0 cursor-pointer text-base"
          >
            <Search className="w-4 h-4" />
            <span>Find Bus</span>
          </button>
        </div>

        {/* Validation error */}
        {errorMessage && (
          <p className="mt-2 text-sm text-red-600 flex items-center gap-1.5 font-medium">
            <span>⚠</span> {errorMessage}
          </p>
        )}

        {/* Autocomplete / Dropdown list */}
        {isOpen && (
          <div className="absolute left-0 right-0 top-full mt-1.5 bg-white border border-slate-200 rounded-xl shadow-xl z-50 max-h-72 overflow-y-auto">
            <div className="p-2 border-b border-slate-100 bg-slate-50 flex items-center justify-between text-xs font-semibold text-slate-500 uppercase tracking-wider">
              <span>Predefined Campus Bus Stops ({filteredDestinations.length})</span>
              <span>Click or Press Enter</span>
            </div>
            {filteredDestinations.length > 0 ? (
              <ul className="py-1">
                {filteredDestinations.map((dest, idx) => (
                  <li key={dest}>
                    <button
                      type="button"
                      onClick={() => handleSelectDestination(dest)}
                      className={`w-full text-left px-4 py-2.5 text-sm flex items-center justify-between transition-colors ${
                        highlightedIndex === idx
                          ? 'bg-blue-50 text-blue-700 font-medium'
                          : 'text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <MapPin className="w-4 h-4 text-blue-500 shrink-0" />
                        <span className="font-medium text-slate-900">{dest}</span>
                      </div>
                      <span className="text-xs text-slate-400 bg-slate-100 px-2 py-0.5 rounded-sm">
                        College Stop
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="p-4 text-center text-sm text-slate-500">
                No matching campus stops found for &ldquo;{query}&rdquo;.
                <div className="mt-2 text-xs text-slate-400">
                  Tip: Try searching JP Nagar, Electronic City, Koramangala, etc.
                </div>
              </div>
            )}
          </div>
        )}
      </form>

      {/* Quick destination suggestion chips */}
      <div className="mt-4 pt-2">
        <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium mb-2">
          <Sparkles className="w-3.5 h-3.5 text-blue-500" />
          <span>Popular student stops (click to quick search):</span>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {PREDEFINED_DESTINATIONS.map((dest) => (
            <button
              key={dest}
              type="button"
              onClick={() => handleSelectDestination(dest)}
              className={`text-xs px-2.5 py-1 rounded-md border transition-all cursor-pointer ${
                query.toLowerCase() === dest.toLowerCase()
                  ? 'bg-blue-600 text-white border-blue-600 font-semibold shadow-xs'
                  : 'bg-white text-slate-700 border-slate-200 hover:border-blue-400 hover:bg-blue-50/50'
              }`}
            >
              {dest}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
