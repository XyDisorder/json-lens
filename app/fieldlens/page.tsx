"use client";

import { useEffect, useMemo, useState } from "react";
import JsonInput from "@/components/inspector/JsonInput";
import JsonPaths from "@/components/inspector/JsonPaths";
import JsonTree from "@/components/inspector/JsonTree";
import SchemaView from "@/components/inspector/SchemaView";
import Tabs from "@/components/ui/Tabs";
import TsTypesView from "@/components/inspector/TsTypesView";
import JsonCompare from "@/components/compare/JsonCompare";
import JsonCompareInput from "@/components/compare/JsonCompareInput";
import Footer from "@/components/ui/Footer";
import ThemeToggle from "@/components/ui/ThemeToggle";
import { buildTree, type JsonValue } from "@/lib/treeBuilder";
import { jsonToPaths } from "@/lib/jsonToPaths";
import { jsonToSchema } from "@/lib/jsonToSchema";
import { jsonToTs } from "@/lib/jsonToTs";
import { compareJson } from "@/lib/jsonCompare";
import { compareJsonText } from "@/lib/jsonCompareText";

const defaultJson = {
  name: "FieldLens",
  version: "1.0.0",
  features: [
    { title: "Tree View", status: "stable" },
    { title: "Paths", status: "beta" },
    { title: "Types", status: "beta" },
  ],
  meta: {
    author: "DevTools",
    tags: ["json", "inspector", "typescript"],
    stats: {
      nodes: 48,
      paths: 48,
    },
  },
} satisfies JsonValue;

const defaultText = JSON.stringify(defaultJson, null, 2);

const tabs = [
  { id: "tree", label: "Tree" },
  { id: "paths", label: "Paths" },
  { id: "types", label: "Types" },
  { id: "schema", label: "Schema" },
];

const STORAGE_KEYS = {
  inspector: "fieldlens-inspector-json",
  compareLeft: "fieldlens-compare-left-json",
  compareRight: "fieldlens-compare-right-json",
};

const FieldLensPage = () => {
  // Initialiser avec des valeurs par défaut pour éviter les problèmes d'hydratation
  const [inspectorJsonText, setInspectorJsonText] = useState<string>(defaultText);
  const [jsonValue, setJsonValue] = useState<JsonValue>(defaultJson);
  const [jsonVersion, setJsonVersion] = useState(0);
  const [activeTab, setActiveTab] = useState<string>(tabs[0].id);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [panelMode, setPanelMode] = useState<"split" | "input" | "output">("split");
  const [compareMode, setCompareMode] = useState(false);
  const [leftCompareText, setLeftCompareText] = useState<string>("");
  const [rightCompareText, setRightCompareText] = useState<string>("");
  const [leftCompareJson, setLeftCompareJson] = useState<JsonValue | null>(null);
  const [rightCompareJson, setRightCompareJson] = useState<JsonValue | null>(null);
  const [isMounted, setIsMounted] = useState(false);

  // Charger depuis localStorage après le montage pour éviter les problèmes d'hydratation
  useEffect(() => {
    setIsMounted(true);
    if (typeof window !== "undefined") {
      // Charger inspector JSON
      const savedInspector = localStorage.getItem(STORAGE_KEYS.inspector);
      if (savedInspector) {
        setInspectorJsonText(savedInspector);
        try {
          setJsonValue(JSON.parse(savedInspector) as JsonValue);
        } catch {
          // Ignore invalid JSON
        }
      }

      // Charger compare JSON
      const savedLeft = localStorage.getItem(STORAGE_KEYS.compareLeft);
      if (savedLeft) {
        setLeftCompareText(savedLeft);
        try {
          setLeftCompareJson(JSON.parse(savedLeft) as JsonValue);
        } catch {
          // Ignore invalid JSON
        }
      }

      const savedRight = localStorage.getItem(STORAGE_KEYS.compareRight);
      if (savedRight) {
        setRightCompareText(savedRight);
        try {
          setRightCompareJson(JSON.parse(savedRight) as JsonValue);
        } catch {
          // Ignore invalid JSON
        }
      }
    }
  }, []);

  const tree = useMemo(() => buildTree(jsonValue), [jsonValue]);
  const paths = useMemo(() => jsonToPaths(jsonValue), [jsonValue]);
  const tsTypes = useMemo(() => jsonToTs(jsonValue), [jsonValue]);
  const schema = useMemo(() => jsonToSchema(jsonValue), [jsonValue]);
  const compareDiffs = useMemo(() => {
    if (!leftCompareJson || !rightCompareJson) return [];
    const objectDiffs = compareJson(leftCompareJson, rightCompareJson);
    // Also compare text to detect duplicate keys
    const textDiffs = compareJsonText(leftCompareText, rightCompareText);
    // Merge diffs, prioritizing object diffs for same paths
    const mergedDiffs = [...objectDiffs];
    textDiffs.forEach((textDiff) => {
      // Only add text diff if there's no object diff for the same path
      const hasObjectDiff = objectDiffs.some((objDiff) => objDiff.path === textDiff.path);
      if (!hasObjectDiff) {
        mergedDiffs.push(textDiff);
      }
    });
    return mergedDiffs;
  }, [leftCompareJson, rightCompareJson, leftCompareText, rightCompareText]);
  const handleInspectorTextChange = (text: string) => {
    setInspectorJsonText(text);
    if (typeof window !== "undefined") {
      if (text) {
        localStorage.setItem(STORAGE_KEYS.inspector, text);
      } else {
        localStorage.removeItem(STORAGE_KEYS.inspector);
      }
    }
  };


  const handleJsonChange = (value: JsonValue) => {
    setJsonValue(value);
    setJsonVersion((prev) => prev + 1);
  };

  const handleLeftCompareChange = (value: JsonValue | null) => {
    setLeftCompareJson(value);
    // Only update text if we have a valid JSON value
    // Don't clear text when JSON is invalid (user is still typing)
    if (value) {
      const jsonString = JSON.stringify(value, null, 2);
      setLeftCompareText(jsonString);
    }
  };

  const handleRightCompareChange = (value: JsonValue | null) => {
    setRightCompareJson(value);
    // Only update text if we have a valid JSON value
    // Don't clear text when JSON is invalid (user is still typing)
    if (value) {
      const jsonString = JSON.stringify(value, null, 2);
      setRightCompareText(jsonString);
    }
  };

  return (
    <main className="min-h-screen">
      <div className="mx-auto max-w-6xl space-y-10 px-6 py-12">
        <header className="space-y-3">
          <div className="flex items-start justify-between">
            <div className="space-y-3">
              <p className="text-xs uppercase tracking-[0.4em] text-emerald-500 dark:text-emerald-300">Developer Tool</p>
              <h1 className="text-4xl font-semibold text-gray-900 dark:text-white">FieldLens — JSON Inspector</h1>
              <p className="text-gray-600 dark:text-slate-400">Paste JSON - Explore - Generate Types</p>
            </div>
            <ThemeToggle />
          </div>
        </header>

        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-2 border-b border-gray-200 dark:border-white/10 pb-2">
            <span className="text-xs uppercase tracking-[0.2em] text-emerald-500 dark:text-emerald-300">Mode</span>
            <div className="flex rounded-full border border-gray-200 dark:border-white/10 bg-white dark:bg-black/30 p-1 text-gray-800 dark:text-white shadow-sm dark:shadow-none">
              <button
                type="button"
                onClick={() => setCompareMode(false)}
                  className={`rounded-full px-4 py-1.5 text-xs font-medium transition ${
                  !compareMode ? "bg-emerald-500 text-white dark:bg-emerald-400/20 dark:text-white" : "text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-white"
                }`}
              >
                Inspector
              </button>
              <button
                type="button"
                onClick={() => setCompareMode(true)}
                  className={`rounded-full px-4 py-1.5 text-xs font-medium transition ${
                  compareMode ? "bg-amber-500 text-white dark:bg-amber-400/20 dark:text-amber-300" : "text-gray-500 dark:text-slate-400 hover:text-amber-600 dark:hover:text-amber-200"
                }`}
              >
                Compare
              </button>
            </div>
          </div>

          {!compareMode && (
            <div className="flex flex-wrap items-center gap-3 text-xs text-gray-600 dark:text-slate-400">
              <span className="uppercase tracking-[0.2em] text-emerald-500 dark:text-emerald-300">Panel layout</span>
              <div className="flex rounded-full border border-gray-200 dark:border-white/10 bg-white dark:bg-black/30 p-1 text-gray-800 dark:text-white shadow-sm dark:shadow-none">
                <button
                  type="button"
                  onClick={() => setPanelMode("input")}
                  className={`rounded-full px-3 py-1 transition ${
                    panelMode === "input" ? "bg-emerald-500 text-white dark:bg-emerald-400/20 dark:text-white" : "text-gray-500 dark:text-slate-400"
                  }`}
                >
                  Focus Input
                </button>
                <button
                  type="button"
                  onClick={() => setPanelMode("split")}
                  className={`rounded-full px-3 py-1 transition ${
                    panelMode === "split" ? "bg-emerald-500 text-white dark:bg-emerald-400/20 dark:text-white" : "text-gray-500 dark:text-slate-400"
                  }`}
                >
                  Split
                </button>
                <button
                  type="button"
                  onClick={() => setPanelMode("output")}
                  className={`rounded-full px-3 py-1 transition ${
                    panelMode === "output" ? "bg-emerald-500 text-white dark:bg-emerald-400/20 dark:text-white" : "text-gray-500 dark:text-slate-400"
                  }`}
                >
                  Focus Output
                </button>
              </div>
            </div>
          )}
        </div>

        {compareMode ? (
          <section className="space-y-6">
            <div className="rounded-3xl border border-gray-200 dark:border-white/10 bg-white dark:bg-surface-raised/80 p-6 shadow-sm dark:shadow-glow">
              <JsonCompareInput
                onLeftChange={handleLeftCompareChange}
                onRightChange={handleRightCompareChange}
                diffs={compareDiffs}
                initialLeftValue={leftCompareText}
                initialRightValue={rightCompareText}
                storageKeyLeft={STORAGE_KEYS.compareLeft}
                storageKeyRight={STORAGE_KEYS.compareRight}
              />
            </div>
            {leftCompareJson && rightCompareJson && (
              <div className="rounded-3xl border border-gray-200 dark:border-white/10 bg-white dark:bg-surface-raised/80 p-6 shadow-sm dark:shadow-glow">
                <div className="mb-4">
                  <p className="text-sm uppercase tracking-[0.2em] text-amber-600 dark:text-amber-300">DIFFERENCES</p>
                  <p className="text-xs text-slate-400">Visual comparison of the two JSON structures</p>
                </div>
                <JsonCompare leftJson={leftCompareJson} rightJson={rightCompareJson} />
              </div>
            )}
          </section>
        ) : (
          <section
            className={`grid gap-8 ${
              panelMode === "split" ? "lg:grid-cols-2" : "grid-cols-1"
            }`}
          >
            <div
              className={`rounded-3xl border border-gray-200 dark:border-white/10 bg-white dark:bg-surface-raised/80 p-6 shadow-sm dark:shadow-glow ${
                panelMode === "output" ? "hidden" : ""
              }`}
            >
              <JsonInput
                initialValue={inspectorJsonText}
                onJsonChange={handleJsonChange}
                onTextChange={handleInspectorTextChange}
              />
            </div>

            <div
              className={`rounded-3xl border border-gray-200 dark:border-white/10 bg-white dark:bg-surface-raised/80 p-6 shadow-sm dark:shadow-glow ${
                panelMode === "input" ? "hidden" : ""
              }`}
            >
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />
                <label className="flex w-full max-w-xs items-center gap-2 rounded-full border border-gray-200 dark:border-white/10 bg-white dark:bg-black/20 px-3 py-1 text-sm text-gray-700 dark:text-slate-300 focus-within:border-emerald-500 dark:focus-within:border-emerald-300 focus-within:text-gray-900 dark:focus-within:text-white shadow-sm dark:shadow-none">
                  <span className="text-xs uppercase tracking-[0.2em] text-gray-500 dark:text-slate-500">Search</span>
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(event) => setSearchTerm(event.target.value)}
                    placeholder="key, path, value..."
                    className="w-full bg-transparent text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-slate-500 focus:outline-none"
                  />
                </label>
              </div>
              <div className="mt-6 min-h-[520px]">
                {activeTab === "tree" && (
                  <JsonTree key={jsonVersion} tree={tree} searchTerm={searchTerm} />
                )}
                {activeTab === "paths" && <JsonPaths paths={paths} searchTerm={searchTerm} />}
                {activeTab === "types" && <TsTypesView types={tsTypes} />}
                {activeTab === "schema" && <SchemaView schema={schema} />}
              </div>
            </div>
          </section>
        )}
      </div>
      <Footer />
    </main>
  );
};

export default FieldLensPage;
