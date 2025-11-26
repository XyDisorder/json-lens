# 🧩 JSONLens — Explore, Inspect & Transform JSON Instantly

**JSONLens** is a lightweight developer tool designed to help you:
- 🔍 **Inspect** JSON structures visually  
- 🌳 **Navigate** nested objects/arrays with a collapsible tree view  
- 🛣️ **List all paths** in dot-notation (`user.address.city`)  
- 🛠️ **Generate TypeScript types** automatically  
- 📐 **View minimal schemas** for objects & arrays  
- ⚡ **Work instantly** as you paste JSON (no backend, no login)

Perfect for backend devs, frontend devs, data engineers, or anyone dealing with messy JSON daily.

---

## ✨ Features

### 🔥 1. Live JSON Parsing  
Paste JSON → instantly see structure, paths, types, and schema.

### 🌳 2. Tree View  
A clean, collapsible explorer for deeply nested data.

### 🛣️ 3. Path Explorer  
Generate every path inside your data, ideal for mapping, validation, and debugging.

### 🛠️ 4. TypeScript Generator  
Automatically infer:
- objects
- arrays
- unions
- optional fields  
Output a clean, readable `type Root = { ... }`.

### 📐 5. Schema View  
Minimal, human-friendly schema for quick understanding.

### 🧪 6. 100% Client-Side  
No backend.  
Your data never leaves your machine.

### 🎨 7. Clean, minimal UI  
Modern TailwindCSS interface with smooth interactions & tabs.

---

## 🧰 Tech Stack

- **Next.js 14**
- **TypeScript**
- **TailwindCSS**
- **Canvas-free** (pure React + recursion)
- Works entirely client-side

---

## 🚀 Getting Started

```bash
pnpm install
pnpm dev