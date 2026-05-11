"use client";

import { useState } from "react";

const API = "https://api.notturaai.xyz";
const STRIPE_LINK = "https://buy.stripe.com/YOUR_LINK"; // replace after going live

export default function Home() {
  const [email, setEmail] = useState("");
  const [apiKey, setApiKey] = useState("");
  const [keyStatus, setKeyStatus] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  async function handleGetKey(e: React.FormEvent) {
    e.preventDefault();
    setKeyStatus("loading");
    setErrorMsg("");
    try {
      const res = await fetch(`${API}/get-key?email=${encodeURIComponent(email)}`);
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.detail || "Not found.");
      }
      const data = await res.json();
      setApiKey(data.api_key);
      setKeyStatus("done");
    } catch (err: any) {
      setErrorMsg(err.message);
      setKeyStatus("error");
    }
  }

  return (
    <main style={{ minHeight: "100vh" }}>

      {/* ── Nav ── */}
      <nav style={styles.nav}>
        <span style={styles.logo}>NOTTURA<span style={{ color: "var(--cyan)" }}>AI</span></span>
        <a href={STRIPE_LINK} style={styles.navCta}>Get Access →</a>
      </nav>

      {/* ── Hero ── */}
      <section style={styles.hero}>
        <div style={styles.bracketTL} />
        <div style={styles.bracketTR} />

        <p style={styles.eyebrow} className="mono">// CHROME EXTENSION</p>
        <h1 style={styles.headline}>
          Every video lesson.<br />
          <span style={{ color: "var(--cyan)", textShadow: "0 0 40px var(--cyan-glow)" }}>
            One clean PDF.
          </span>
        </h1>
        <p style={styles.subheadline}>
          Transform any video — paid courses, YouTube, lectures — into structured,
          readable notes. No re-watching. No scrubbing. Just knowledge on paper.
        </p>
        <div style={styles.heroActions}>
          <a href={STRIPE_LINK} style={styles.btnPrimary}>Start for $9 / month</a>
          <span style={{ ...styles.freeNote, ...{ fontFamily: "'Share Tech Mono', monospace" } }}>
            60 min free · no credit card to try
          </span>
        </div>

        <div style={styles.bracketBL} />
        <div style={styles.bracketBR} />
      </section>

      {/* ── How it works ── */}
      <section style={styles.section}>
        <p style={styles.sectionLabel} className="mono">// HOW IT WORKS</p>
        <h2 style={styles.sectionTitle}>Three steps. That's it.</h2>
        <div style={styles.steps}>
          {[
            { n: "01", title: "Install the extension", body: "Add NOTTURA AI to Chrome in one click. Works on any website — Udemy, Coursera, YouTube, private platforms." },
            { n: "02", title: "Record the lesson", body: "Open any video, press INITIATE CAPTURE. NOTTURA captures the audio directly from your browser tab." },
            { n: "03", title: "Download your notes", body: "Stop the recording. Within 30 seconds you have a structured, readable PDF — sections, key points, code snippets." },
          ].map((s) => (
            <div key={s.n} style={styles.step}>
              <span style={styles.stepNum} className="mono">{s.n}</span>
              <h3 style={styles.stepTitle}>{s.title}</h3>
              <p style={styles.stepBody}>{s.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Divider ── */}
      <div style={styles.divider} />

      {/* ── Why ── */}
      <section style={styles.section}>
        <p style={styles.sectionLabel} className="mono">// WHY NOTTURA</p>
        <h2 style={styles.sectionTitle}>Built for people who learn by reading.</h2>
        <div style={styles.reasons}>
          {[
            { label: "Any platform", text: "Works on paid courses behind a login. No downloads, no ToS violations." },
            { label: "AI-structured", text: "Claude organises the transcript into sections, bullets, and key takeaways — not just a raw text dump." },
            { label: "Code preserved", text: "CLI commands, configs, and code snippets are captured exactly as spoken." },
            { label: "Dark PDF", text: "Clean dark-theme PDF. Easy on the eyes for long reading sessions." },
          ].map((r) => (
            <div key={r.label} style={styles.reason}>
              <span style={styles.reasonLabel} className="mono">→ {r.label}</span>
              <p style={styles.reasonText}>{r.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Pricing ── */}
      <section style={{ ...styles.section, alignItems: "center", textAlign: "center" }}>
        <p style={styles.sectionLabel} className="mono">// PRICING</p>
        <div style={styles.pricingCard}>
          <div style={styles.bracketTL} />
          <div style={styles.bracketTR} />
          <div style={styles.bracketBL} />
          <div style={styles.bracketBR} />
          <p style={{ ...styles.eyebrow, marginBottom: 8 }} className="mono">NOTTURA AI</p>
          <div style={styles.price}>
            <span style={styles.priceAmount}>$9</span>
            <span style={styles.pricePer}>/month</span>
          </div>
          <ul style={styles.priceFeatures}>
            {[
              "Unlimited video captures",
              "Groq Whisper transcription",
              "Claude AI structuring",
              "Dark-theme PDF export",
              "Works on any platform",
              "60 free minutes to start",
            ].map((f) => (
              <li key={f} style={styles.priceFeature} className="mono">✓ {f}</li>
            ))}
          </ul>
          <a href={STRIPE_LINK} style={{ ...styles.btnPrimary, display: "inline-block", marginTop: 24 }}>
            Get Access
          </a>
          <p style={{ marginTop: 12, fontSize: 12, color: "var(--muted)", fontFamily: "'Share Tech Mono', monospace" }}>
            ~$0.07 per 20-min video in API costs
          </p>
        </div>
      </section>

      {/* ── Get Key ── */}
      <section style={{ ...styles.section, alignItems: "center" }} id="get-key">
        <p style={styles.sectionLabel} className="mono">// ALREADY PAID?</p>
        <h2 style={{ ...styles.sectionTitle, textAlign: "center" }}>Retrieve your API key.</h2>
        <p style={{ color: "var(--muted)", marginBottom: 24, textAlign: "center", maxWidth: 480 }}>
          Enter the email you used at checkout. We'll show your key instantly.
        </p>
        <form onSubmit={handleGetKey} style={styles.keyForm}>
          <input
            type="email"
            required
            placeholder="your@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={styles.keyInput}
          />
          <button type="submit" style={styles.btnPrimary} disabled={keyStatus === "loading"}>
            {keyStatus === "loading" ? "···" : "Get Key →"}
          </button>
        </form>
        {keyStatus === "done" && (
          <div style={styles.keyResult}>
            <p style={{ color: "var(--green)", fontFamily: "'Share Tech Mono', monospace", fontSize: 12, marginBottom: 8 }}>
              ✓ KEY RETRIEVED
            </p>
            <code style={styles.keyCode}>{apiKey}</code>
            <p style={{ color: "var(--muted)", fontSize: 12, marginTop: 8, fontFamily: "'Share Tech Mono', monospace" }}>
              Paste this into the NOTTURA AI extension popup.
            </p>
          </div>
        )}
        {keyStatus === "error" && (
          <p style={{ color: "var(--red)", fontFamily: "'Share Tech Mono', monospace", fontSize: 12, marginTop: 12 }}>
            ⚠ {errorMsg}
          </p>
        )}
      </section>

      {/* ── Footer ── */}
      <footer style={styles.footer}>
        <span style={styles.logo}>NOTTURA<span style={{ color: "var(--cyan)" }}>AI</span></span>
        <span style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: 11, color: "var(--muted)" }}>
          © 2026 · notturaai.xyz
        </span>
      </footer>

    </main>
  );
}

const styles: Record<string, React.CSSProperties> = {
  nav: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "20px 48px",
    borderBottom: "1px solid var(--border)",
    position: "sticky",
    top: 0,
    background: "rgba(7,7,9,0.92)",
    backdropFilter: "blur(12px)",
    zIndex: 100,
  },
  logo: {
    fontFamily: "'Rajdhani', sans-serif",
    fontWeight: 700,
    fontSize: 22,
    letterSpacing: "0.25em",
    color: "#fff",
  },
  navCta: {
    fontFamily: "'Share Tech Mono', monospace",
    fontSize: 12,
    letterSpacing: "0.1em",
    color: "var(--cyan)",
    border: "1px solid var(--cyan)",
    padding: "8px 16px",
    borderRadius: 2,
    transition: "background 0.2s",
  },
  hero: {
    position: "relative",
    maxWidth: 900,
    margin: "0 auto",
    padding: "120px 48px 100px",
    display: "flex",
    flexDirection: "column",
    gap: 24,
  },
  eyebrow: {
    fontSize: 11,
    letterSpacing: "0.2em",
    color: "var(--cyan)",
    opacity: 0.7,
  },
  headline: {
    fontFamily: "'Rajdhani', sans-serif",
    fontWeight: 700,
    fontSize: "clamp(48px, 8vw, 88px)",
    lineHeight: 1.05,
    letterSpacing: "-0.02em",
    color: "#fff",
  },
  subheadline: {
    fontSize: 18,
    color: "var(--muted)",
    maxWidth: 560,
    lineHeight: 1.7,
  },
  heroActions: {
    display: "flex",
    alignItems: "center",
    gap: 24,
    flexWrap: "wrap",
    marginTop: 8,
  },
  btnPrimary: {
    background: "var(--cyan-dim)",
    border: "1px solid var(--cyan)",
    color: "var(--cyan)",
    padding: "12px 28px",
    borderRadius: 2,
    fontFamily: "'Rajdhani', sans-serif",
    fontWeight: 700,
    fontSize: 14,
    letterSpacing: "0.1em",
    cursor: "pointer",
    boxShadow: "0 0 20px var(--cyan-dim)",
    transition: "all 0.2s",
    textDecoration: "none",
  },
  freeNote: {
    fontSize: 11,
    color: "var(--muted)",
    letterSpacing: "0.08em",
  },
  section: {
    maxWidth: 960,
    margin: "0 auto",
    padding: "80px 48px",
    display: "flex",
    flexDirection: "column",
    gap: 16,
  },
  sectionLabel: {
    fontSize: 11,
    letterSpacing: "0.2em",
    color: "var(--cyan)",
    opacity: 0.6,
  },
  sectionTitle: {
    fontFamily: "'Rajdhani', sans-serif",
    fontWeight: 700,
    fontSize: "clamp(28px, 4vw, 44px)",
    color: "#fff",
    letterSpacing: "-0.01em",
    marginBottom: 8,
  },
  steps: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
    gap: 32,
    marginTop: 16,
  },
  step: {
    background: "var(--bg2)",
    border: "1px solid var(--border)",
    borderRadius: 4,
    padding: 28,
    display: "flex",
    flexDirection: "column",
    gap: 10,
  },
  stepNum: {
    fontSize: 11,
    letterSpacing: "0.15em",
    color: "var(--cyan)",
    opacity: 0.6,
  },
  stepTitle: {
    fontFamily: "'Rajdhani', sans-serif",
    fontWeight: 700,
    fontSize: 18,
    color: "#fff",
  },
  stepBody: {
    fontSize: 14,
    color: "var(--muted)",
    lineHeight: 1.7,
  },
  divider: {
    height: 1,
    background: "linear-gradient(90deg, transparent, var(--cyan), transparent)",
    opacity: 0.2,
    maxWidth: 960,
    margin: "0 auto",
    width: "calc(100% - 96px)",
  },
  reasons: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: 24,
    marginTop: 16,
  },
  reason: {
    display: "flex",
    flexDirection: "column",
    gap: 8,
    padding: "20px 0",
    borderTop: "1px solid var(--border)",
  },
  reasonLabel: {
    fontSize: 12,
    letterSpacing: "0.1em",
    color: "var(--cyan)",
  },
  reasonText: {
    fontSize: 14,
    color: "var(--muted)",
    lineHeight: 1.6,
  },
  pricingCard: {
    position: "relative",
    background: "var(--bg2)",
    border: "1px solid var(--border)",
    borderRadius: 4,
    padding: "48px 56px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 4,
    maxWidth: 440,
    width: "100%",
    boxShadow: "0 0 60px rgba(0,229,255,0.04)",
  },
  price: {
    display: "flex",
    alignItems: "baseline",
    gap: 6,
    margin: "16px 0 8px",
  },
  priceAmount: {
    fontFamily: "'Rajdhani', sans-serif",
    fontWeight: 700,
    fontSize: 72,
    color: "#fff",
    letterSpacing: "-0.03em",
  },
  pricePer: {
    fontFamily: "'Share Tech Mono', monospace",
    fontSize: 14,
    color: "var(--muted)",
  },
  priceFeatures: {
    listStyle: "none",
    display: "flex",
    flexDirection: "column",
    gap: 10,
    marginTop: 8,
    alignSelf: "stretch",
  },
  priceFeature: {
    fontSize: 12,
    letterSpacing: "0.08em",
    color: "var(--text)",
    paddingBottom: 10,
    borderBottom: "1px solid rgba(255,255,255,0.04)",
  },
  keyForm: {
    display: "flex",
    gap: 12,
    width: "100%",
    maxWidth: 480,
    flexWrap: "wrap",
  },
  keyInput: {
    flex: 1,
    minWidth: 220,
    background: "var(--bg2)",
    border: "1px solid var(--border)",
    borderRadius: 2,
    padding: "12px 14px",
    fontFamily: "'Share Tech Mono', monospace",
    fontSize: 13,
    color: "var(--text)",
    outline: "none",
  },
  keyResult: {
    marginTop: 20,
    padding: 20,
    background: "var(--bg2)",
    border: "1px solid rgba(0,255,136,0.2)",
    borderRadius: 4,
    maxWidth: 480,
    width: "100%",
  },
  keyCode: {
    fontFamily: "'Share Tech Mono', monospace",
    fontSize: 13,
    color: "var(--cyan)",
    background: "rgba(0,229,255,0.06)",
    padding: "8px 12px",
    borderRadius: 2,
    display: "block",
    wordBreak: "break-all",
    letterSpacing: "0.05em",
  },
  footer: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "24px 48px",
    borderTop: "1px solid var(--border)",
    marginTop: 40,
  },
  // Corner brackets (reused from extension)
  bracketTL: {
    position: "absolute", top: 20, left: 20,
    width: 16, height: 16,
    borderTop: "1px solid var(--cyan)",
    borderLeft: "1px solid var(--cyan)",
    opacity: 0.5,
  },
  bracketTR: {
    position: "absolute", top: 20, right: 20,
    width: 16, height: 16,
    borderTop: "1px solid var(--cyan)",
    borderRight: "1px solid var(--cyan)",
    opacity: 0.5,
  },
  bracketBL: {
    position: "absolute", bottom: 20, left: 20,
    width: 16, height: 16,
    borderBottom: "1px solid var(--cyan)",
    borderLeft: "1px solid var(--cyan)",
    opacity: 0.5,
  },
  bracketBR: {
    position: "absolute", bottom: 20, right: 20,
    width: 16, height: 16,
    borderBottom: "1px solid var(--cyan)",
    borderRight: "1px solid var(--cyan)",
    opacity: 0.5,
  },
};
