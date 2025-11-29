import { useCallback, useEffect, useMemo, useRef, useState } from "react";

export type HighlightSegment = {
  text: string;
  highlight: boolean;
  matchIndex: number | null;
};

export const useJsonSearch = (
  text: string,
  textareaRef: React.RefObject<HTMLTextAreaElement | null>,
  highlightRef: React.RefObject<HTMLPreElement | null>,
) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [matchIndex, setMatchIndex] = useState(0);
  const matchRefs = useRef<Array<HTMLElement | null>>([]);
  const shouldSelectMatch = useRef(false);

  const normalizedSearch = searchTerm.trim().toLowerCase();

  const escapeRegex = (input: string) => input.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

  const matches = useMemo(() => {
    if (!normalizedSearch) return [];
    const indices: number[] = [];
    const haystack = text.toLowerCase();
    const needle = normalizedSearch;
    let currentIndex = haystack.indexOf(needle);
    while (currentIndex !== -1) {
      indices.push(currentIndex);
      currentIndex = haystack.indexOf(needle, currentIndex + needle.length);
    }
    return indices;
  }, [normalizedSearch, text]);

  const matchCount = matches.length;
  const safeMatchIndex = matchCount === 0 ? 0 : ((matchIndex % matchCount) + matchCount) % matchCount;

  const highlightSegments = useMemo<HighlightSegment[]>(() => {
    if (!normalizedSearch) {
      return [{ text: text || "\u200B", highlight: false, matchIndex: null }];
    }
    const regex = new RegExp(`(${escapeRegex(normalizedSearch)})`, "gi");
    const parts = text.split(regex);
    let matchCounter = -1;
    return parts.map((segment, index) => {
      const highlight = index % 2 === 1;
      const text = segment === "" ? "\u200B" : segment;
      const matchIndex = highlight ? (matchCounter += 1) : null;
      return { text, highlight, matchIndex };
    });
  }, [normalizedSearch, text]);

  useMemo(() => {
    matchRefs.current = new Array(matchCount).fill(null);
  }, [matchCount]);

  const selectMatch = useCallback(
    (index: number) => {
      if (!matchCount || !normalizedSearch) return;
      const textarea = textareaRef.current;
      const overlay = highlightRef.current;
      if (!textarea || !overlay) return;
      const targetMark = matchRefs.current[index];
      const wasTextareaFocused = typeof document !== "undefined" && document.activeElement === textarea;

      if (targetMark) {
        const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(value, max));

        const markTop = targetMark.offsetTop;
        const markLeft = targetMark.offsetLeft;
        const markHeight = targetMark.offsetHeight;
        const markWidth = targetMark.offsetWidth;

        const targetScrollTop = markTop + markHeight / 2 - overlay.clientHeight / 2;
        const targetScrollLeft = markLeft + markWidth / 2 - overlay.clientWidth / 2;

        const maxScrollTop = Math.max(0, overlay.scrollHeight - overlay.clientHeight);
        const maxScrollLeft = Math.max(0, overlay.scrollWidth - overlay.clientWidth);

        const clampedTop = clamp(targetScrollTop, 0, maxScrollTop);
        const clampedLeft = clamp(targetScrollLeft, 0, maxScrollLeft);

        overlay.scrollTop = clampedTop;
        textarea.scrollTop = clampedTop;
        overlay.scrollLeft = clampedLeft;
        textarea.scrollLeft = clampedLeft;
      }

      if (wasTextareaFocused) {
        const start = matches[index];
        const end = start + normalizedSearch.length;
        requestAnimationFrame(() => {
          if (textareaRef.current) {
            textareaRef.current.focus({ preventScroll: true });
            textareaRef.current.setSelectionRange(start, end);
          }
        });
      }
    },
    [matchCount, normalizedSearch, matches, textareaRef, highlightRef],
  );

  useEffect(() => {
    if (shouldSelectMatch.current && matchCount > 0 && normalizedSearch) {
      const timeoutId = setTimeout(() => {
        if (matchRefs.current[safeMatchIndex]) {
          selectMatch(safeMatchIndex);
          shouldSelectMatch.current = false;
        }
      }, 0);
      return () => clearTimeout(timeoutId);
    }
  }, [safeMatchIndex, matchCount, normalizedSearch, highlightSegments.length, selectMatch]);

  const goToMatch = useCallback(
    (direction: 1 | -1) => {
      if (!matchCount) return;
      shouldSelectMatch.current = true;
      setMatchIndex((prev) => {
        const next = (prev + direction + matchCount) % matchCount;
        return next;
      });
    },
    [matchCount],
  );

  const handleSearchChange = useCallback((value: string) => {
    setSearchTerm(value);
    setMatchIndex(0);
  }, []);

  return {
    searchTerm,
    setSearchTerm: handleSearchChange,
    matchIndex,
    setMatchIndex,
    matchCount,
    safeMatchIndex,
    matches,
    highlightSegments,
    matchRefs,
    goToMatch,
  };
};

