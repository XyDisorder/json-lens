"use client";

import { Fragment, useState } from "react";
import type { TreeNode } from "@/lib/treeBuilder";

type JsonTreeProps = {
  tree: TreeNode;
  searchTerm?: string;
};

const JsonTree = ({ tree, searchTerm = "" }: JsonTreeProps) => {
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});
  const [activePath, setActivePath] = useState<string>(tree.path);
  const normalizedSearch = searchTerm.trim().toLowerCase();

  const handleToggle = (path: string) => {
    setCollapsed((prev) => ({ ...prev, [path]: !prev[path] }));
  };

  const matchCache = new Map<string, boolean>();
  const doesNodeMatch = (node: TreeNode): boolean => {
    if (!normalizedSearch) return false;
    if (matchCache.has(node.path)) {
      return matchCache.get(node.path) ?? false;
    }
    const matchesSelf =
      node.key.toLowerCase().includes(normalizedSearch) ||
      node.path.toLowerCase().includes(normalizedSearch) ||
      (node.type === "primitive" && JSON.stringify(node.value).toLowerCase().includes(normalizedSearch));
    const childMatch = node.children.some(doesNodeMatch);
    const result = matchesSelf || childMatch;
    matchCache.set(node.path, result);
    return result;
  };

  const renderNode = (node: TreeNode, depth = 0) => {
    const hasChildren = node.children.length > 0;
    const isCollapsed = collapsed[node.path];
    const isActive = node.path === activePath;
    const matchesSearch = normalizedSearch ? doesNodeMatch(node) : false;

    return (
      <Fragment key={node.path}>
        <div
          className={`group rounded-xl px-3 py-2 text-sm transition-colors overflow-hidden ${
            isActive ? "bg-white/10" : matchesSearch ? "bg-emerald-500/10" : "hover:bg-white/5"
          }`}
          style={{ marginLeft: depth * 12 }}
          onClick={() => setActivePath(node.path)}
        >
          <div className="flex items-center gap-3">
            {hasChildren ? (
              <button
                type="button"
                aria-label="Toggle node"
                className="flex h-5 w-5 items-center justify-center rounded-md border border-white/20 text-xs text-white/80"
                onClick={(event) => {
                  event.stopPropagation();
                  handleToggle(node.path);
                }}
              >
                {isCollapsed ? "+" : "-"}
              </button>
            ) : (
              <span className="flex h-5 w-5 items-center justify-center text-slate-600">•</span>
            )}
            <div className="flex flex-1 items-center justify-between gap-3 min-w-0">
              <div className="min-w-0 flex-1">
                <p className="font-medium text-slate-100 truncate">{node.key}</p>
                <p className="text-xs uppercase tracking-wide text-slate-500">{node.type}</p>
              </div>
              {node.type === "primitive" && (
                <p className="text-xs text-emerald-300 truncate max-w-xs" title={JSON.stringify(node.value)}>
                  {JSON.stringify(node.value)}
                </p>
              )}
              {node.type === "array" && (
                <p className="text-xs text-sky-300 whitespace-nowrap">[{node.children.length} items]</p>
              )}
              {node.type === "object" && (
                <p className="text-xs text-slate-400 whitespace-nowrap">{node.children.length} keys</p>
              )}
            </div>
          </div>
          <p className="mt-1 text-xs text-slate-500 truncate" title={node.path}>
            {node.path}
          </p>
        </div>
        {hasChildren && !isCollapsed && (
          <div className="border-l border-white/5 pl-4">
            {node.children.map((child) => renderNode(child, depth + 1))}
          </div>
        )}
      </Fragment>
    );
  };

  return <div className="space-y-2 text-white overflow-x-auto">{renderNode(tree)}</div>;
};

export default JsonTree;
