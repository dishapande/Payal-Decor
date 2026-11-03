import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Globe } from "lucide-react";

const LANGS = [
  { code: "en", label: "English" },
  { code: "mr", label: "मराठी" },
  { code: "hi", label: "हिन्दी" },
];

// Google Translate मुळे React चे DOM बदल तुटू नयेत म्हणून safety patch
if (typeof window !== "undefined" && typeof Node === "function") {
  const w = window as any;
  if (!w.__domPatched) {
    w.__domPatched = true;
    const origRemove = Node.prototype.removeChild;
    (Node.prototype as any).removeChild = function (child: Node) {
      if (child.parentNode !== this) return child;
      return origRemove.call(this, child);
    };
    const origInsert = Node.prototype.insertBefore;
    (Node.prototype as any).insertBefore = function (newNode: Node, ref: Node | null) {
      if (ref && ref.parentNode !== this) return newNode;
      return origInsert.call(this, newNode, ref);
    };
  }
}

function setGoogleCookie(code: string) {
  const expire = "expires=Thu, 01 Jan 1970 00:00:00 UTC";
  const isLocal = location.hostname === "localhost";
  if (code === "en") {
    document.cookie = `googtrans=; ${expire}; path=/`;
    if (!isLocal) document.cookie = `googtrans=; ${expire}; path=/; domain=${location.hostname}`;
  } else {
    document.cookie = `googtrans=/en/${code}; path=/`;
    if (!isLocal)
      document.cookie = `googtrans=/en/${code}; path=/; domain=${location.hostname}`;
  }
}

export default function LanguageSwitcher() {
  const { i18n } = useTranslation();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("lang");
    if (saved && saved !== i18n.language) i18n.changeLanguage(saved);

    // Google Translate script load
    const w = window as any;
    w.googleTranslateElementInit = () => {
      new w.google.translate.TranslateElement(
        {
          pageLanguage: "en",
          includedLanguages: "en,mr,hi",
          autoDisplay: false,
        },
        "google_translate_element",
      );
    };
    if (!document.getElementById("google-translate-script")) {
      const s = document.createElement("script");
      s.id = "google-translate-script";
      s.src =
        "https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
      s.async = true;
      document.body.appendChild(s);
    }
  }, [i18n]);

  const change = (code: string) => {
    localStorage.setItem("lang", code);
    i18n.changeLanguage(code);
    setGoogleCookie(code);
    setOpen(false);
    window.location.reload(); // पूर्ण page नवीन भाषेत लोड होण्यासाठी
  };

  const current = LANGS.find((l) => l.code === i18n.language)?.label ?? "English";

  return (
    <div className="relative">
      <div id="google_translate_element" className="hidden" />

      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm hover:bg-muted"
      >
        <Globe className="size-4" />
        <span className="hidden sm:inline">{current}</span>
      </button>

      {open && (
        <div className="absolute right-0 z-50 mt-2 w-36 overflow-hidden rounded-lg border border-border bg-card shadow-lg">
          {LANGS.map((l) => (
            <button
              key={l.code}
              onClick={() => change(l.code)}
              className="block w-full px-4 py-2 text-left text-sm hover:bg-muted"
            >
              {l.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}