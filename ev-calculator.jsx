import { useState, useEffect } from "react";

// Convert American odds to implied probability %
function oddsToProb(odds) {
  const n = parseFloat(odds);
  if (isNaN(n)) return null;
  if (n < 0) return (Math.abs(n) / (Math.abs(n) + 100)) * 100;
  return (100 / (n + 100)) * 100;
}

const APP_CONFIG = {
  PrizePicks: {
    slipTypes: [
      { label: "3-Leg Power",  legs: 3, type: "Power", threshold: 58.33, thresholdOdds: -140, thresholdPct: 55.0 },
      { label: "5/6-Leg Flex", legs: 5, type: "Flex",  threshold: 57.63, thresholdOdds: -136, thresholdPct: 54.3 },
    ],
  },
  Underdog: {
    slipTypes: [
      { label: "3-Leg Power", legs: 3, type: "Power", threshold: 56.52, thresholdOdds: -130, thresholdPct: 55.0 },
      { label: "6-Leg Flex",  legs: 6, type: "Flex",  threshold: 56.52, thresholdOdds: -130, thresholdPct: 53.8 },
    ],
  },
  Betr: {
    slipTypes: [
      { label: "3-Leg Power", legs: 3, type: "Power", threshold: 58.33, thresholdOdds: -140, thresholdPct: 55.0 },
      { label: "5-Leg Flex",  legs: 5, type: "Flex",  threshold: 57.63, thresholdOdds: -136, thresholdPct: 54.2 },
    ],
  },
  Dabble: {
    slipTypes: [
      { label: "3-Leg Power", legs: 3, type: "Power", threshold: 58.33, thresholdOdds: -140, thresholdPct: 55.0 },
      { label: "5-Leg Power", legs: 5, type: "Power", threshold: 58.33, thresholdOdds: -140, thresholdPct: 55.0 },
    ],
  },
  "DraftKings Pick 6": {
    slipTypes: [
      { label: "3-Leg Power", legs: 3, type: "Power", threshold: 58.33, thresholdOdds: -140, thresholdPct: 55.0 },
    ],
  },
  "Parlayplay / Sleeper / Fliff": {
    slipTypes: [
      { label: "Any Props (2% EV+)", legs: 1, type: "EV", threshold: 2.0, thresholdOdds: null, thresholdPct: 2.0, evMode: true },
    ],
  },
};

const APPS = Object.keys(APP_CONFIG);

export default function EVCalculator() {
  const [selectedApp, setSelectedApp]         = useState("PrizePicks");
  const [selectedSlipIdx, setSelectedSlipIdx] = useState(0);
  const [inputMode, setInputMode]             = useState("odds");
  const [props, setProps]                     = useState(["", "", ""]);
  const [animateResult, setAnimateResult]     = useState(false);

  const slip    = APP_CONFIG[selectedApp].slipTypes[selectedSlipIdx];
  const isEV    = slip.evMode;
  const numLegs = isEV ? 1 : slip.legs;

  useEffect(() => { setProps(Array(numLegs).fill("")); setSelectedSlipIdx(0); }, [selectedApp]);
  useEffect(() => { setProps(Array(numLegs).fill("")); }, [selectedSlipIdx, inputMode]);

  const handleChange = (i, v) => { const u = [...props]; u[i] = v; setProps(u); };

  const legEvals = props.map((v) => {
    if (v === "" || v === "-") return null;
    if (isEV) {
      const n = parseFloat(v);
      return { value: n, prob: n, pass: !isNaN(n) && n >= slip.threshold };
    }
    if (inputMode === "odds") {
      const prob = oddsToProb(v);
      if (prob === null) return null;
      return { value: parseFloat(v), prob, pass: prob >= slip.threshold };
    } else {
      const n = parseFloat(v);
      if (isNaN(n)) return null;
      return { value: n, prob: n, pass: n >= slip.thresholdPct };
    }
  });

  const allFilled   = legEvals.length === numLegs && legEvals.every((e) => e !== null);
  const overallPass = allFilled && legEvals.every((e) => e.pass);
  const avgProb     = allFilled && !isEV ? legEvals.reduce((a, b) => a + b.prob, 0) / legEvals.length : null;

  useEffect(() => {
    if (allFilled) { setAnimateResult(false); setTimeout(() => setAnimateResult(true), 10); }
  }, [allFilled, overallPass]);

  const displayThreshold = isEV ? "2% EV+"
    : inputMode === "odds" ? `${slip.thresholdOdds} or better`
    : `${slip.thresholdPct}%+`;

  return (
    <div style={{
      minHeight: "100vh", background: "#0a0d0f",
      backgroundImage: `radial-gradient(ellipse at 20% 0%, rgba(0,200,100,0.06) 0%, transparent 50%),
                        radial-gradient(ellipse at 80% 100%, rgba(0,180,90,0.04) 0%, transparent 50%)`,
      fontFamily: "'IBM Plex Mono', 'Courier New', monospace",
      display: "flex", alignItems: "center", justifyContent: "center", padding: "24px 16px",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@300;400;500;600;700&family=Syne:wght@700;800&display=swap');
        * { box-sizing: border-box; }
        .card { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.07); border-radius: 2px; }
        .pill-btn {
          background: transparent; border: 1px solid rgba(255,255,255,0.12);
          color: rgba(255,255,255,0.45); padding: 7px 14px; border-radius: 2px;
          cursor: pointer; font-family: 'IBM Plex Mono', monospace; font-size: 11px;
          letter-spacing: 0.5px; transition: all 0.15s; white-space: nowrap;
        }
        .pill-btn:hover { border-color: rgba(0,220,110,0.4); color: rgba(255,255,255,0.7); }
        .pill-btn.active { background: rgba(0,220,110,0.12); border-color: #00dc6e; color: #00dc6e; }
        .mode-btn {
          flex: 1; padding: 10px; border: 1px solid rgba(255,255,255,0.1);
          background: transparent; color: rgba(255,255,255,0.4);
          font-family: 'IBM Plex Mono', monospace; font-size: 11px;
          cursor: pointer; transition: all 0.15s; letter-spacing: 1px;
        }
        .mode-btn:first-child { border-radius: 2px 0 0 2px; }
        .mode-btn:last-child  { border-radius: 0 2px 2px 0; border-left: none; }
        .mode-btn.active { background: rgba(0,220,110,0.15); border-color: #00dc6e; color: #00dc6e; font-weight: 700; }
        .prop-input {
          width: 100%; background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.1); border-radius: 2px;
          color: #fff; font-family: 'IBM Plex Mono', monospace;
          font-size: 20px; font-weight: 600; padding: 14px 16px;
          outline: none; transition: all 0.15s; text-align: center;
        }
        .prop-input:focus { border-color: rgba(0,220,110,0.5); background: rgba(0,220,110,0.05); }
        .prop-input.pass  { border-color: #00dc6e; }
        .prop-input.fail  { border-color: #ff4d4d; }
        .result-box {
          border-radius: 2px; padding: 24px; text-align: center;
          opacity: 0; transform: translateY(6px); transition: opacity 0.3s, transform 0.3s;
        }
        .result-box.show  { opacity: 1; transform: translateY(0); }
        .result-pass { background: rgba(0,220,110,0.1); border: 1px solid rgba(0,220,110,0.35); }
        .result-fail { background: rgba(255,77,77,0.08); border: 1px solid rgba(255,77,77,0.3); }
        .leg-badge {
          width: 24px; height: 24px; border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          font-size: 11px; font-weight: 700; flex-shrink: 0;
        }
        .badge-neutral { background: rgba(255,255,255,0.08); color: rgba(255,255,255,0.4); }
        .badge-pass    { background: rgba(0,220,110,0.2);    color: #00dc6e; }
        .badge-fail    { background: rgba(255,77,77,0.2);    color: #ff6b6b; }
        .stat-pill { background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08); border-radius: 2px; padding: 10px 16px; flex: 1; text-align: center; }
        .hint { font-size: 10px; color: rgba(255,255,255,0.25); text-align: center; margin-top: 4px; }
      `}</style>

      <div style={{ width: "100%", maxWidth: 560 }}>

        {/* Header */}
        <div style={{ marginBottom: 28, textAlign: "center" }}>
          <div style={{ fontFamily: "'Syne', sans-serif", fontSize: 28, fontWeight: 800, color: "#fff", letterSpacing: "-0.5px" }}>
            <span style={{ color: "#00dc6e" }}>+EV</span> CALCULATOR
          </div>
          <div style={{ marginTop: 8, fontSize: 11, color: "rgba(255,255,255,0.3)", letterSpacing: "2px", textTransform: "uppercase" }}>
            The +EV Cave · Slip Threshold Checker
          </div>
        </div>

        {/* Mode Toggle */}
        <div className="card" style={{ padding: "16px 20px", marginBottom: 12 }}>
          <div style={{ fontSize: 10, color: "rgba(255,255,255,0.3)", letterSpacing: "2px", marginBottom: 12 }}>INPUT MODE</div>
          <div style={{ display: "flex" }}>
            <button className={`mode-btn ${inputMode === "odds" ? "active" : ""}`} onClick={() => setInputMode("odds")}>AMERICAN ODDS (+/-)</button>
            <button className={`mode-btn ${inputMode === "pct"  ? "active" : ""}`} onClick={() => setInputMode("pct")}>% PROBABILITY</button>
          </div>
          <div style={{ marginTop: 8, fontSize: 10, color: "rgba(255,255,255,0.25)" }}>
            {inputMode === "odds" ? "Enter the American odds from your sportsbook line, e.g. -145 or +110" : "Enter the implied probability % from your DGF tool, e.g. 56.5"}
          </div>
        </div>

        {/* App Selector */}
        <div className="card" style={{ padding: "16px 20px", marginBottom: 12 }}>
          <div style={{ fontSize: 10, color: "rgba(255,255,255,0.3)", letterSpacing: "2px", marginBottom: 12 }}>SELECT APP</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {APPS.map((app) => (
              <button key={app} className={`pill-btn ${selectedApp === app ? "active" : ""}`}
                onClick={() => { setSelectedApp(app); setSelectedSlipIdx(0); }}>{app}</button>
            ))}
          </div>
        </div>

        {/* Slip Type */}
        <div className="card" style={{ padding: "16px 20px", marginBottom: 12 }}>
          <div style={{ fontSize: 10, color: "rgba(255,255,255,0.3)", letterSpacing: "2px", marginBottom: 12 }}>SLIP TYPE</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {APP_CONFIG[selectedApp].slipTypes.map((s, i) => (
              <button key={i} className={`pill-btn ${selectedSlipIdx === i ? "active" : ""}`}
                onClick={() => setSelectedSlipIdx(i)}>{s.label}</button>
            ))}
          </div>
          <div style={{ marginTop: 14, display: "flex", gap: 10 }}>
            <div className="stat-pill">
              <div style={{ fontSize: 10, color: "rgba(255,255,255,0.3)", letterSpacing: "1.5px" }}>MIN THRESHOLD</div>
              <div style={{ fontSize: 14, fontWeight: 700, color: "#00dc6e", marginTop: 3 }}>{displayThreshold}</div>
            </div>
            <div className="stat-pill">
              <div style={{ fontSize: 10, color: "rgba(255,255,255,0.3)", letterSpacing: "1.5px" }}>TYPE</div>
              <div style={{ fontSize: 14, fontWeight: 700, color: "#fff", marginTop: 3 }}>{slip.type}</div>
            </div>
            {!isEV && (
              <div className="stat-pill">
                <div style={{ fontSize: 10, color: "rgba(255,255,255,0.3)", letterSpacing: "1.5px" }}>LEGS</div>
                <div style={{ fontSize: 14, fontWeight: 700, color: "#fff", marginTop: 3 }}>{slip.legs}</div>
              </div>
            )}
          </div>
        </div>

        {/* Inputs */}
        <div className="card" style={{ padding: "16px 20px", marginBottom: 12 }}>
          <div style={{ fontSize: 10, color: "rgba(255,255,255,0.3)", letterSpacing: "2px", marginBottom: 14 }}>
            {isEV ? "ENTER EV %" : inputMode === "odds" ? "ENTER AMERICAN ODDS PER LEG" : "ENTER % PROBABILITY PER LEG"}
          </div>
          <div style={{ display: "grid", gridTemplateColumns: numLegs <= 3 ? `repeat(${numLegs}, 1fr)` : "repeat(3, 1fr)", gap: 10 }}>
            {props.map((val, i) => {
              const ev   = legEvals[i];
              const hasV = ev !== null;
              const pass = hasV && ev.pass;
              return (
                <div key={i} style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <div className={`leg-badge ${!hasV ? "badge-neutral" : pass ? "badge-pass" : "badge-fail"}`}>{i + 1}</div>
                    <span style={{ fontSize: 10, color: "rgba(255,255,255,0.25)" }}>LEG {i + 1}</span>
                  </div>
                  <input type="text" inputMode="decimal"
                    className={`prop-input ${!hasV ? "" : pass ? "pass" : "fail"}`}
                    placeholder={inputMode === "odds" ? "-145" : "56.5"}
                    value={val} onChange={(e) => handleChange(i, e.target.value)} />
                  {hasV && inputMode === "odds" && (
                    <div className="hint">{ev.prob.toFixed(1)}% implied prob</div>
                  )}
                  {hasV && (
                    <div style={{ textAlign: "center", fontSize: 10, fontWeight: 600, letterSpacing: "1px", color: pass ? "#00dc6e" : "#ff6b6b" }}>
                      {pass ? "✓ MEETS THRESHOLD"
                        : inputMode === "odds"
                        ? `✗ NEED ${(slip.threshold - ev.prob).toFixed(1)}% MORE`
                        : `✗ NEED ${(slip.thresholdPct - ev.value).toFixed(1)}% MORE`}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Result */}
        {allFilled && (
          <div className={`result-box ${animateResult ? "show" : ""} ${overallPass ? "result-pass" : "result-fail"}`}>
            <div style={{ fontSize: 32, fontFamily: "'Syne', sans-serif", fontWeight: 800, letterSpacing: "-0.5px", color: overallPass ? "#00dc6e" : "#ff6b6b" }}>
              {overallPass ? "✓ PLAY IT" : "✗ SKIP IT"}
            </div>
            <div style={{ marginTop: 6, fontSize: 12, color: "rgba(255,255,255,0.5)" }}>
              {overallPass
                ? `All legs meet the ${displayThreshold} threshold. This slip is +EV.`
                : `One or more legs fall below ${displayThreshold}. Don't force it.`}
            </div>
            {!isEV && avgProb !== null && (
              <div style={{ marginTop: 16, display: "flex", justifyContent: "center", gap: 24 }}>
                <div>
                  <div style={{ fontSize: 10, color: "rgba(255,255,255,0.3)", letterSpacing: "1.5px" }}>AVG PROB</div>
                  <div style={{ fontSize: 20, fontWeight: 700, color: "#fff", marginTop: 2 }}>{avgProb.toFixed(1)}%</div>
                </div>
                <div>
                  <div style={{ fontSize: 10, color: "rgba(255,255,255,0.3)", letterSpacing: "1.5px" }}>NEED</div>
                  <div style={{ fontSize: 20, fontWeight: 700, color: "rgba(255,255,255,0.5)", marginTop: 2 }}>
                    {inputMode === "odds" ? `${slip.threshold.toFixed(1)}%` : `${slip.thresholdPct}%`}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: 10, color: "rgba(255,255,255,0.3)", letterSpacing: "1.5px" }}>EDGE</div>
                  <div style={{ fontSize: 20, fontWeight: 700, marginTop: 2, color: overallPass ? "#00dc6e" : "#ff6b6b" }}>
                    {inputMode === "odds"
                      ? `${(avgProb - slip.threshold).toFixed(2)}%`
                      : `${(avgProb - slip.thresholdPct).toFixed(2)}%`}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        <div style={{ marginTop: 20, textAlign: "center", fontSize: 10, color: "rgba(255,255,255,0.18)", letterSpacing: "1px" }}>
          BASED ON "JOINING THE 5%" THRESHOLDS · THE +EV CAVE · NOT FINANCIAL ADVICE
        </div>
      </div>
    </div>
  );
}
