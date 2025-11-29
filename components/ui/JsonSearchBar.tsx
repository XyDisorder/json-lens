"use client";

type JsonSearchBarProps = {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  matchCount: number;
  matchIndex: number;
  onPrev: () => void;
  onNext: () => void;
};

const JsonSearchBar = ({ searchTerm, onSearchChange, matchCount, matchIndex, onPrev, onNext }: JsonSearchBarProps) => {
  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-gray-200 dark:border-white/5 bg-white dark:bg-black/20 p-3 text-sm text-gray-800 dark:text-slate-200 shadow-sm dark:shadow-none sm:flex-row sm:items-center sm:justify-between">
      <label className="flex flex-1 items-center gap-3">
        <span className="text-xs uppercase tracking-[0.2em] text-gray-500 dark:text-slate-500">Search JSON</span>
        <input
          type="text"
          value={searchTerm}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder="property, key, value..."
          className="w-full rounded-full bg-white dark:bg-slate-900/60 px-3 py-1 text-sm text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-400/60 border border-gray-200 dark:border-transparent"
        />
      </label>
      <div className="flex items-center gap-2">
        <span className="text-xs text-gray-600 dark:text-slate-400">
          {matchCount
            ? `Match ${matchIndex + 1}/${matchCount}`
            : searchTerm.trim()
              ? "No matches"
              : "Idle"}
        </span>
        <div className="flex gap-1">
          <button
            type="button"
            onClick={onPrev}
            disabled={!matchCount}
            className="rounded-full border border-gray-200 dark:border-white/10 px-3 py-1 text-xs uppercase tracking-wide text-gray-700 dark:text-white disabled:opacity-30 bg-white dark:bg-transparent shadow-sm dark:shadow-none"
          >
            Prev
          </button>
          <button
            type="button"
            onClick={onNext}
            disabled={!matchCount}
            className="rounded-full border border-gray-200 dark:border-white/10 px-3 py-1 text-xs uppercase tracking-wide text-gray-700 dark:text-white disabled:opacity-30 bg-white dark:bg-transparent shadow-sm dark:shadow-none"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default JsonSearchBar;

