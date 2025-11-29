"use client";

import Link from "next/link";

const Footer = () => {
  const currentYear = new Date().getFullYear();
  const githubUrl = "https://github.com/XyDisorder/json-lens"; // Update with your GitHub URL

  return (
    <footer className="border-t border-gray-200 dark:border-white/10 bg-white dark:bg-black/20">
      <div className="mx-auto max-w-6xl px-6 py-12">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {/* About */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-500 dark:text-emerald-300">FieldLens</h3>
            <p className="text-xs text-gray-600 dark:text-slate-400">
              Developer tool to inspect, analyze and transform your JSON data instantly.
            </p>
            <p className="text-xs text-gray-500 dark:text-slate-500">© {currentYear} FieldLens. All rights reserved.</p>
          </div>

          {/* GitHub Section - Prominent */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-500 dark:text-emerald-300">GitHub & Contact</h3>
            <nav className="flex flex-col gap-2">
              <a
                href={githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-xs text-gray-700 dark:text-slate-400 transition hover:text-emerald-500 dark:hover:text-emerald-300"
              >
                <svg
                  className="h-4 w-4"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    fillRule="evenodd"
                    d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                    clipRule="evenodd"
                  />
                </svg>
                <span>View on GitHub</span>
              </a>
              <Link
                href="/contact"
                className="flex items-center gap-2 text-xs text-gray-700 dark:text-slate-400 transition hover:text-emerald-500 dark:hover:text-emerald-300"
              >
                <svg
                  className="h-4 w-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
                <span>Contact</span>
              </Link>
            </nav>
            <p className="text-xs text-gray-500 dark:text-slate-500">
              Made with <span className="text-rose-500 dark:text-rose-400">❤️</span> by XyDisorder
            </p>
            <div className="flex items-center gap-2">
              <a
                href={githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-full border border-gray-200 dark:border-white/10 bg-white dark:bg-black/30 px-2 py-1 text-xs font-medium text-gray-700 dark:text-slate-300 transition hover:border-emerald-500 hover:bg-emerald-50 dark:hover:border-emerald-500/50 dark:hover:bg-emerald-500/20 hover:text-emerald-600 dark:hover:text-emerald-300 shadow-sm dark:shadow-none"
              >
                ⭐ Star
              </a>
              <a
                href={`${githubUrl}/fork`}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-full border border-gray-200 dark:border-white/10 bg-white dark:bg-black/30 px-2 py-1 text-xs font-medium text-gray-700 dark:text-slate-300 transition hover:border-emerald-500 hover:bg-emerald-50 dark:hover:border-emerald-500/50 dark:hover:bg-emerald-500/20 hover:text-emerald-600 dark:hover:text-emerald-300 shadow-sm dark:shadow-none"
              >
                🍴 Fork
              </a>
            </div>
          </div>

          {/* Legal */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-gray-800 dark:text-slate-300">Legal</h3>
            <nav className="flex flex-col gap-2">
              <Link
                href="/legal-notice"
                className="text-xs text-gray-700 dark:text-slate-400 transition hover:text-emerald-500 dark:hover:text-emerald-300"
              >
                Legal Notice
              </Link>
              <Link
                href="/privacy-policy"
                className="text-xs text-gray-700 dark:text-slate-400 transition hover:text-emerald-500 dark:hover:text-emerald-300"
              >
                Privacy Policy
              </Link>
              <Link
                href="/terms-of-service"
                className="text-xs text-gray-700 dark:text-slate-400 transition hover:text-emerald-500 dark:hover:text-emerald-300"
              >
                Terms of Service
              </Link>
              <Link
                href="/cookie-policy"
                className="text-xs text-gray-700 dark:text-slate-400 transition hover:text-emerald-500 dark:hover:text-emerald-300"
              >
                Cookie Policy
              </Link>
            </nav>
          </div>

          {/* Privacy & Security */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-gray-800 dark:text-slate-300">Security</h3>
            <div className="space-y-2 text-xs text-gray-700 dark:text-slate-400">
              <p>
                <span className="font-medium text-emerald-500 dark:text-emerald-300">✓ 100% Client-Side</span>
                <br />
                Your data never leaves your machine. No data is sent to any server.
              </p>
              <p>
                <span className="font-medium text-emerald-500 dark:text-emerald-300">✓ Open Source</span>
                <br />
                Source code available and auditable.
              </p>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-8 border-t border-white/5 pt-8">
          <div className="flex flex-col items-center justify-between gap-4 text-xs text-slate-500 sm:flex-row">
            <p>
              FieldLens is a free and open source tool. Made with <span className="text-rose-500 dark:text-rose-400">❤️</span> No personal data is collected.
            </p>
            <div className="flex gap-4">
              <a
                href={githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-gray-700 dark:text-slate-400 transition hover:text-emerald-500 dark:hover:text-emerald-300"
              >
                GitHub
              </a>
              <Link href="/contact" className="font-medium text-gray-700 dark:text-slate-400 transition hover:text-emerald-500 dark:hover:text-emerald-300">
                Contact
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
