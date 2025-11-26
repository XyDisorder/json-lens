"use client";

import { useMemo, useState } from "react";
import JsonInput from "@/components/JsonInput";
import JsonPaths from "@/components/JsonPaths";
import JsonTree from "@/components/JsonTree";
import SchemaView from "@/components/SchemaView";
import Tabs from "@/components/Tabs";
import TsTypesView from "@/components/TsTypesView";
import { buildTree, type JsonValue } from "@/lib/treeBuilder";
import { jsonToPaths } from "@/lib/jsonToPaths";
import { jsonToSchema } from "@/lib/jsonToSchema";
import { jsonToTs } from "@/lib/jsonToTs";

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

const FieldLensPage = () => {
  const [jsonValue, setJsonValue] = useState<JsonValue>(defaultJson);
  const [jsonVersion, setJsonVersion] = useState(0);
  const [activeTab, setActiveTab] = useState<string>(tabs[0].id);
  const [searchTerm, setSearchTerm] = useState<string>("");

  const tree = useMemo(() => buildTree(jsonValue), [jsonValue]);
  const paths = useMemo(() => jsonToPaths(jsonValue), [jsonValue]);
  const tsTypes = useMemo(() => jsonToTs(jsonValue), [jsonValue]);
  const schema = useMemo(() => jsonToSchema(jsonValue), [jsonValue]);
  const handleJsonChange = (value: JsonValue) => {
    setJsonValue(value);
    setJsonVersion((prev) => prev + 1);
  };

  return (
    <main className="min-h-screen">
      <div className="mx-auto max-w-6xl space-y-10 px-6 py-12">
        <header className="space-y-3">
          <p className="text-xs uppercase tracking-[0.4em] text-emerald-300">Developer Tool</p>
          <h1 className="text-4xl font-semibold text-white">FieldLens — JSON Inspector</h1>
          <p className="text-slate-400">Paste JSON - Explore - Generate Types</p>
        </header>

        <section className="grid gap-8 lg:grid-cols-2">
          <div className="rounded-3xl border border-white/10 bg-surface-raised/80 p-6 shadow-glow">
            <JsonInput initialValue={defaultText} onJsonChange={handleJsonChange} />
          </div>

          <div className="rounded-3xl border border-white/10 bg-surface-raised/80 p-6 shadow-glow">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />
              <label className="flex w-full max-w-xs items-center gap-2 rounded-full border border-white/10 bg-black/20 px-3 py-1 text-sm text-slate-300 focus-within:border-emerald-300 focus-within:text-white">
                <span className="text-xs uppercase tracking-[0.2em] text-slate-500">Search</span>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  placeholder="key, path, value..."
                  className="w-full bg-transparent text-white placeholder:text-slate-500 focus:outline-none"
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
      </div>
    </main>
  );
};

export default FieldLensPage;
