"use client";

import { Fragment, useEffect, useMemo, useState } from "react";
import type { TreeNode } from "@/lib/treeBuilder";

type JsonTreeProps = {
  tree: TreeNode;
  searchTerm?: string;
};

const collectAllPaths = (node: TreeNode): string[] => {
  const paths: string[] = [];
  if (node.children.length > 0) {
    paths.push(node.path);
    node.children.forEach((child) => {
      paths.push(...collectAllPaths(child));
    });
  }
  return paths;
};

const JsonTree = ({ tree, searchTerm = "" }: JsonTreeProps) => {
  const allPaths = useMemo(() => collectAllPaths(tree), [tree]);
  const initialCollapsed = useMemo(() => {
    const state: Record<string, boolean> = {};
    allPaths.forEach((path) => {
      state[path] = true; // All nodes collapsed by default
    });
    return state;
  }, [allPaths]);

  const [collapsed, setCollapsed] = useState<Record<string, boolean>>(initialCollapsed);
  const [activePath, setActivePath] = useState<string>(tree.path);
  const normalizedSearch = searchTerm.trim().toLowerCase();

  // Reset collapsed state when tree changes
  useEffect(() => {
    setCollapsed(initialCollapsed);
  }, [initialCollapsed]);

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
            isActive ? "bg-emerald-500/10 dark:bg-white/10" : matchesSearch ? "bg-emerald-500/10 dark:bg-emerald-500/10" : "hover:bg-emerald-500/5 dark:hover:bg-white/5"
          }`}
          style={{ marginLeft: depth * 12 }}
          onClick={() => setActivePath(node.path)}
        >
          <div className="flex items-center gap-3">
            {hasChildren ? (
              <button
                type="button"
                aria-label="Toggle node"
                className="flex h-5 w-5 items-center justify-center rounded-md border border-gray-300 dark:border-white/20 text-xs text-gray-700 dark:text-white/80"
                onClick={(event) => {
                  event.stopPropagation();
                  handleToggle(node.path);
                }}
              >
                {isCollapsed ? "+" : "-"}
              </button>
            ) : (
              <span className="flex h-5 w-5 items-center justify-center text-gray-400 dark:text-slate-600">•</span>
            )}
            <div className="flex flex-1 items-center justify-between gap-3 min-w-0">
              <div className="min-w-0 flex-1">
                <p className="font-medium text-gray-900 dark:text-slate-100 truncate">{node.key}</p>
                <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-slate-500">{node.type}</p>
              </div>
              {node.type === "primitive" && (
                <p className="text-xs text-emerald-600 dark:text-emerald-300 truncate max-w-xs" title={JSON.stringify(node.value)}>
                  {JSON.stringify(node.value)}
                </p>
              )}
              {node.type === "array" && (
                <p className="text-xs text-blue-600 dark:text-sky-300 whitespace-nowrap">[{node.children.length} items]</p>
              )}
              {node.type === "object" && (
                <p className="text-xs text-gray-500 dark:text-slate-400 whitespace-nowrap">{node.children.length} keys</p>
              )}
            </div>
          </div>
          <p className="mt-1 text-xs text-gray-500 dark:text-slate-500 truncate" title={node.path}>
            {node.path}
          </p>
        </div>
        {hasChildren && !isCollapsed && (
          <div className="border-l border-gray-200 dark:border-white/5 pl-4">
            {node.children.map((child) => renderNode(child, depth + 1))}
          </div>
        )}
      </Fragment>
    );
  };

  return <div className="space-y-2 text-gray-900 dark:text-white overflow-x-auto">{renderNode(tree)}</div>;
};

export default JsonTree;
