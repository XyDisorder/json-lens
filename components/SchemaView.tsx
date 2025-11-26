"use client";

import { useMemo, useState } from "react";
import type { SchemaNode } from "@/lib/jsonToSchema";

type SchemaViewProps = {
  schema: SchemaNode;
};

const SchemaView = ({ schema }: SchemaViewProps) => {
  const [copied, setCopied] = useState(false);
  const schemaText = useMemo(() => JSON.stringify(schema, null, 2), [schema]);

  const handleCopy = async () => {
    if (typeof navigator === "undefined" || !navigator.clipboard) return;
    try {
      await navigator.clipboard.writeText(schemaText);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between text-sm">
        <p className="text-slate-400">Minimal schema</p>
        <button
          type="button"
          onClick={handleCopy}
          className="rounded-full border border-white/20 px-4 py-1 text-xs font-semibold uppercase tracking-wide text-white transition hover:border-emerald-300 hover:text-emerald-200"
        >
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
      <pre className="max-h-[480px] overflow-auto rounded-2xl bg-slate-950/50 p-4 text-xs leading-6 text-slate-100 shadow-inner">
        {schemaText}
      </pre>
    </div>
  );
};

export default SchemaView;
