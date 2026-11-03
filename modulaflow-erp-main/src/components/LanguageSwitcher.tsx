import { useEffect, useState } from "react";
import { Globe } from "lucide-react";

const LANGS = [
  { code: "en", label: "English" },
  { code: "mr", label: "मराठी" },
  { code: "hi", label: "हिन्दी" },
];

// Google Translate मुळे React चे DOM तुटू नये म्हणून safety patch
if (typeof window !== "undefined") {
  const w = window as any;
  if (!w.__gtPatched) {
    w.__gtPatched = true;
    const origRemove = Node.prototype.removeChild;
    (Node.prototype as any).removeChild = function (child: Node) {
      if (child.parentNode !== this) return child;
      return origRemove.call(this, child) as Node;
    };
    const origInsert = Node.prototype.insertBefore;
    (Node.prototype as any).insertBefore = function (newNode: Node, ref: Node | null) {
      if (ref && ref.parentNode !== this) return newNode;
      return origInsert.call(this, newNode, ref) as Node;
    };
  }
}

function readLang(): string {
  const m = document.cookie.match(/(?:^|;\s*)googtrans=\/[^/]+\/(\w+)/);
  return m ? m[1] : "en";
}

function writeLang(code: string) {
  const host = location.hostname;
  const expire = "Thu, 01 Jan 1970 00:00:00 UTC";
  const clear = (domain?: string) => {
    document.cookie = `googtrans=; expires=${expire}; path=/${domain ? `; domain=${domain}` : ""}`;
  };
  clear();
  clear(host);
  clear("." + host);
  if (code !== "en") {
    const val = `/en/${code}`;
    document.cookie = `googtrans=${val}; path=/`;
    if (host !== "localhost") {
      document.cookie = `googtrans=${val}; path=/; domain=${host}`;
    }
  }
}

const CSS = `
  .goog-te-banner-frame, .goog-te-balloon-frame, #goog-gt-tt,
  .goog-tooltip, iframe.skiptranslate { display: none !important; }
  body { top: 0 !important; }
  .goog-text-highlight { background: none !important; box-shadow: none !important; }
  #google_translate_element { display: none; }
`;

export default function LanguageSwitcher() {
  const [open, setOpen] = useState(false);
  const [lang, setLang] = useState("en");

  useEffect(() => {
    setLang(readLang());

    // Google चा element एकदाच, React च्या बाहेर बनवतो
    if (!document.getElementById("google_translate_element")) {
      const el = document.createElement("div");
      el.id = "google_translate_element";
      document.body.appendChild(el);
    }

    const w = window as any;
    w.googleTranslateElementInit = () => {
      new w.google.translate.TranslateElement(
        { pageLanguage: "en", includedLanguages: "en,mr,hi", autoDisplay: false },
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
  }, []);

  const change = (code: string) => {
    writeLang(code);
    setOpen(false);
    window.location.reload();
  };

  const current = LANGS.find((l) => l.code === lang)?.label ?? "English";

  return (
    <div className="relative notranslate" translate="no">
      <style>{CSS}</style>

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