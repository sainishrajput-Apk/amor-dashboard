import { useState, useMemo, useEffect } from "react";
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line, ScatterChart, Scatter,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, Cell
} from "recharts";

/* ─── Global Style Injection (The "Smart & Modern" Aesthetic) ────────────── */
(() => {
  const existing = document.getElementById("amoi-modern-styles");
  if (existing) {
    existing.remove();
  }
  const s = document.createElement("style");
  s.id = "amoi-modern-styles";
  s.textContent = `
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
    
    :root {
      /* User specifically requested these exact hex codes: */
      --bg-base: #0F172A;
      --surface-card: #1E293B;
      --surface-hover: #334155;
      
      --accent-primary: #22C55E;
      --accent-secondary: #3B82F6;
      --accent-error: #EF4444;

      /* Additional accents derived to maintain visual hierarchy where needed */
      --accent-warning: #eab308;
      
      --border-subtle: rgba(255, 255, 255, 0.08);
      --border-highlight: rgba(255, 255, 255, 0.15);
      
      --text-main: #f8fafc;
      --text-muted: #cbd5e1;
      --text-dim: #94a3b8;
      
      --radius-xl: 16px;
      --radius-lg: 12px;
      --radius-md: 8px;
      --transition-smooth: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
    }

    * { box-sizing: border-box; margin: 0; padding: 0; }
    
    body {
      background-color: var(--bg-base);
      color: var(--text-main);
      font-family: 'Inter', sans-serif;
      -webkit-font-smoothing: antialiased;
      overflow: hidden;
    }

    /* Custom Scrollbar */
    ::-webkit-scrollbar { width: 6px; height: 6px; }
    ::-webkit-scrollbar-track { background: transparent; }
    ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 10px; }
    ::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.2); }

    /* Typography globally set to Inter as requested */
    h1, h2, h3, h4, .font-display { font-family: 'Inter', sans-serif; font-weight: 600; }
    
    /* Animations */
    @keyframes fadeInUp { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
    @keyframes pulseSoft { 0%, 100% { opacity: 1; transform: scale(1); } 50% { opacity: 0.8; transform: scale(0.98); } }
    @keyframes gradientScan { 0% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } 100% { background-position: 0% 50%; } }
    
    .animate-in { animation: fadeInUp 0.4s cubic-bezier(0.16, 1, 0.3, 1) both; }
    .pulse-soft { animation: pulseSoft 3s ease-in-out infinite; }
    
    /* Utility Classes using exact requested colors */
    .solid-panel {
      background: var(--surface-card);
      border: 1px solid var(--border-subtle);
      border-radius: var(--radius-xl);
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
    }
    
    .nav-item {
      transition: var(--transition-smooth);
      position: relative;
      overflow: hidden;
    }
    .nav-item:hover {
      background: var(--surface-hover);
      color: var(--text-main) !important;
    }
    
    .interactive-card {
      transition: var(--transition-smooth);
      cursor: pointer;
    }
    .interactive-card:hover {
      transform: translateY(-4px);
      border-color: var(--border-highlight);
      box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.2), 0 4px 6px -2px rgba(0, 0, 0, 0.1);
      background: var(--surface-hover);
    }

    .badge-pill {
      display: inline-flex; alignItems: center; gap: 6px;
      padding: 4px 10px; border-radius: 999px;
      font-size: 0.7rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em;
    }

    table { border-collapse: separate; border-spacing: 0; width: 100%; }
    th { padding: 12px 16px; text-align: left; font-size: 0.75rem; color: var(--text-muted); font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; border-bottom: 1px solid var(--border-subtle); }
    td { padding: 16px; font-size: 0.85rem; border-bottom: 1px solid rgba(255,255,255,0.03); transition: background 0.2s ease; }
    tr:hover td { background: var(--surface-hover); }
    tr:last-child td { border-bottom: none; }
  `;
  document.head.appendChild(s);
})();

/* ─── Mock Data Generators (Unchanged Logic, Simplified Output) ──────────── */
function rng(seed) {
  let s = seed;
  return () => { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646; };
}

const rand = rng(42);
const BATCHES = Array.from({ length: 150 }, (_, idx) => {
  const i = idx + 1;
  const temp = 185 + rand() * 35;
  const feed = 16 + rand() * 18;
  const anomaly = rand() < 0.06;
  const energy = +((temp * 1.1 + feed * 3) * (anomaly ? 1.25 : 1)).toFixed(1);
  const oee = +(96.5 - (anomaly ? 12 : 0) + (rand() - 0.5) * 4).toFixed(1);
  const carbon = +(energy * 0.23).toFixed(2);
  const quality = +(85 + (rand() - 0.5) * (anomaly ? 20 : 8)).toFixed(1);
  return { id: i, name: `#${String(i).padStart(3, "0")}`, temp: +temp.toFixed(1), feed: +feed.toFixed(1), anomaly, energy, oee, carbon, quality };
});

const ENERGY_SERIES = BATCHES.map(b => ({ name: b.name, energy: b.energy, anom: b.anomaly ? b.energy : null }));

/* ─── Shared Components ──────────────────────────────────────────────────── */

function SolidCard({ children, className = "", style = {}, delay = 0, interactive = false }) {
  return (
    <div 
      className={`solid-panel animate-in ${interactive ? 'interactive-card' : ''} ${className}`} 
      style={{ padding: '24px', animationDelay: `${delay}ms`, ...style }}
    >
      {children}
    </div>
  );
}

function SectionHeader({ title, subtitle }) {
  return (
    <div style={{ marginBottom: '32px' }}>
      <h2 className="font-display" style={{ fontSize: '2rem', color: 'var(--text-main)', margin: 0 }}>
        {title}
      </h2>
      <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginTop: '8px', lineHeight: 1.5, maxWidth: '600px' }}>
        {subtitle}
      </p>
    </div>
  );
}

function Metric({ label, value, trend, color = "var(--accent-primary)", delay = 0 }) {
  return (
    <SolidCard delay={delay} style={{ position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', top: 0, left: 0, width: '40%', height: '2px', background: `linear-gradient(90deg, ${color}, transparent)` }} />
      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600, marginBottom: '8px' }}>
        {label}
      </div>
      <div className="font-display" style={{ fontSize: '2.5rem', color: '#fff', letterSpacing: '-0.03em', lineHeight: 1.1 }}>
        {value}
      </div>
      {trend && (
        <div style={{ marginTop: '12px', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', color: trend.isGood ? 'var(--accent-primary)' : 'var(--accent-error)' }}>
          <span style={{ padding: '2px 6px', borderRadius: '4px', background: trend.isGood ? 'rgba(34, 197, 94, 0.15)' : 'rgba(239, 68, 68, 0.15)' }}>
            {trend.val}
          </span>
          <span style={{ color: 'var(--text-dim)' }}>vs last period</span>
        </div>
      )}
    </SolidCard>
  );
}

function Badge({ children, variant = "neutral" }) {
  const vmap = {
    primary: { bg: 'rgba(34, 197, 94, 0.15)', color: 'var(--accent-primary)', dot: 'var(--accent-primary)' },
    error: { bg: 'rgba(239, 68, 68, 0.15)', color: 'var(--accent-error)', dot: 'var(--accent-error)' },
    warning: { bg: 'rgba(234, 179, 8, 0.15)', color: 'var(--accent-warning)', dot: 'var(--accent-warning)' },
    secondary: { bg: 'rgba(59, 130, 246, 0.15)', color: 'var(--accent-secondary)', dot: 'var(--accent-secondary)' },
    neutral: { bg: 'var(--border-subtle)', color: 'var(--text-muted)', dot: 'var(--text-dim)' }
  };
  const theme = vmap[variant];
  return (
    <span className="badge-pill" style={{ background: theme.bg, color: theme.color }}>
      <div style={{ width: 6, height: 6, borderRadius: '50%', background: theme.dot }} />
      {children}
    </span>
  );
}

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div style={{ background: 'var(--surface-card)', border: '1px solid var(--border-subtle)', borderRadius: '12px', padding: '12px 16px', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.2)', minWidth: '140px' }}>
        <p style={{ margin: 0, marginBottom: 8, fontSize: '0.75rem', color: 'var(--text-muted)' }}>{label}</p>
        {payload.map((p, i) => (
          <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
            <span style={{ color: p.color || '#fff', fontSize: '0.85rem', fontWeight: 500 }}>{p.name}</span>
            <span style={{ color: '#fff', fontSize: '0.9rem', fontWeight: 600, fontFamily: 'Inter' }}>{p.value}</span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

/* ─── Views ──────────────────────────────────────────────────────────────── */

function Overview() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <SectionHeader 
        title="System Overview" 
        subtitle="Real-time pulse of your production environment. Minimal interruptions, maximum clarity." 
      />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px' }}>
        <Metric label="Plant Efficiency (OEE)" value="94.2%" trend={{ val: "+1.2%", isGood: true }} delay={0} color="var(--accent-secondary)" />
        <Metric label="Energy per Batch" value="284.5" trend={{ val: "-2.4%", isGood: true }} delay={50} color="var(--accent-primary)" />
        <Metric label="Carbon Intensity" value="65.4t" trend={{ val: "-0.8%", isGood: true }} delay={100} color="var(--accent-secondary)" />
        <Metric label="Anomaly Rate" value="6.0%" trend={{ val: "+0.4%", isGood: false }} delay={150} color="var(--accent-error)" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px' }}>
        <SolidCard delay={200} style={{ padding: '32px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <h3 className="font-display" style={{ fontSize: '1.2rem', fontWeight: 600 }}>Energy Consumption Profile</h3>
            <Badge variant="secondary">Live Tracing</Badge>
          </div>
          <div style={{ height: '300px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={ENERGY_SERIES} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorEnergy" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--accent-secondary)" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="var(--accent-secondary)" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="var(--border-subtle)" vertical={false} strokeDasharray="4 4" />
                <XAxis dataKey="name" stroke="var(--text-muted)" tick={{ fontSize: 11, fill: 'var(--text-muted)' }} tickLine={false} axisLine={false} />
                <YAxis stroke="var(--text-muted)" tick={{ fontSize: 11, fill: 'var(--text-muted)' }} tickLine={false} axisLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="energy" name="Energy (kWh)" stroke="var(--accent-secondary)" strokeWidth={3} fillOpacity={1} fill="url(#colorEnergy)" />
                <Area type="monotone" dataKey="anom" name="Anomaly Spike" stroke="var(--accent-error)" strokeWidth={0} fill="rgba(239, 68, 68, 0.4)" dot={{ r: 4, fill: 'var(--accent-error)', strokeWidth: 2, stroke: 'var(--surface-card)' }} connectNulls={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </SolidCard>

        <SolidCard delay={250} style={{ padding: '32px', display: 'flex', flexDirection: 'column' }}>
          <h3 className="font-display" style={{ fontSize: '1.2rem', fontWeight: 600, marginBottom: '24px' }}>Active Diagnostics</h3>
          
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {[
              { title: 'Thermal Drift Detected', desc: 'Mixer B showing +4% variance in heat capacity.', type: 'warning' },
              { title: 'Carbon Budget Optimized', desc: 'Shifted 4 batches to off-peak grid window.', type: 'primary' },
              { title: 'Yield Model Retraining', desc: 'Ingesting last 50 batches for R2 improvement.', type: 'secondary' }
            ].map((alert, i) => (
              <div key={i} className="interactive-card" style={{ padding: '16px', background: 'var(--surface-hover)', borderRadius: '12px', border: `1px solid var(--border-subtle)` }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: `var(--accent-${alert.type})` }} />
                  <span style={{ fontSize: '0.9rem', fontWeight: 600, color: '#fff' }}>{alert.title}</span>
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: 1.5, paddingLeft: '16px' }}>
                  {alert.desc}
                </div>
              </div>
            ))}
          </div>

          <button style={{ marginTop: '20px', padding: '14px', borderRadius: '10px', background: 'var(--accent-primary)', color: '#000', border: 'none', fontWeight: 600, fontSize: '0.9rem', cursor: 'pointer', transition: 'background 0.2s, transform 0.2s', width: '100%' }}
                  onMouseOver={(e) => { e.target.style.background = '#1dae52'; e.target.style.transform = 'translateY(-2px)'; }}
                  onMouseOut={(e) => { e.target.style.background = 'var(--accent-primary)'; e.target.style.transform = 'none'; }}>
            View Full Report
          </button>
        </SolidCard>
      </div>
    </div>
  );
}

function EngineView() {
  const models = [
    { target: "Energy Efficiency", score: 98, status: "secondary", val: "0.98 R²" },
    { target: "Yield Prediction", score: 85, status: "warning", val: "0.85 R²" },
    { target: "Carbon Output", score: 95, status: "primary", val: "0.95 R²" },
    { target: "Defect Rate", score: 72, status: "error", val: "0.72 R²" }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <SectionHeader 
        title="Intelligence Engine" 
        subtitle="Deep learning models driving predictive accuracy and process optimization parameters." 
      />

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '24px' }}>
        <SolidCard delay={0}>
          <h3 className="font-display" style={{ fontSize: '1.2rem', fontWeight: 600, marginBottom: '24px' }}>Model Confidence</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {models.map((m, i) => (
              <div key={i}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-main)', fontWeight: 500 }}>{m.target}</span>
                  <span style={{ fontSize: '0.85rem', color: `var(--accent-${m.status})`, fontWeight: 600 }}>{m.val}</span>
                </div>
                <div style={{ height: '6px', background: 'var(--border-subtle)', borderRadius: '3px', overflow: 'hidden' }}>
                  <div style={{ width: `${m.score}%`, height: '100%', background: `var(--accent-${m.status})`, borderRadius: '3px', transition: 'width 1s ease-out' }} />
                </div>
              </div>
            ))}
          </div>
        </SolidCard>

        <SolidCard delay={100}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h3 className="font-display" style={{ fontSize: '1.2rem', fontWeight: 600 }}>Recent Evaluation Batches</h3>
            <Badge variant="secondary">Auto-scoring active</Badge>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table>
              <thead>
                <tr>
                  <th>Batch ID</th>
                  <th>Temp Setpt</th>
                  <th>Feed Rate</th>
                  <th>Predicted OEE</th>
                  <th>Quality Score</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {BATCHES.slice(0, 8).map(b => (
                  <tr key={b.id}>
                    <td style={{ fontWeight: 600, color: 'var(--text-main)' }}>{b.name}</td>
                    <td>{b.temp}°C</td>
                    <td>{b.feed} kg/s</td>
                    <td style={{ color: b.oee > 90 ? 'var(--text-main)' : 'var(--accent-warning)', fontWeight: 500 }}>{b.oee}%</td>
                    <td>{b.quality}</td>
                    <td>
                      {b.anomaly ? <Badge variant="error">Anomaly</Badge> : <Badge variant="primary">Optimal</Badge>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </SolidCard>
      </div>
    </div>
  );
}

function SettingsView() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
      <div className="pulse-soft" style={{ width: 80, height: 80, borderRadius: '50%', background: 'rgba(59, 130, 246, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(59, 130, 246, 0.3)' }}>
        <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'var(--accent-secondary)', boxShadow: '0 0 30px rgba(59, 130, 246, 0.6)' }} />
      </div>
      <SectionHeader 
        title="System Calibrating" 
        subtitle="The advanced neural core is currently processing offline training data. Configuration options will be available shortly." 
      />
    </div>
  );
}

/* ─── Main App Shell ─────────────────────────────────────────────────────── */

const NAV_ITEMS = [
  { id: 'overview', label: 'Monitor' },
  { id: 'engine', label: 'Intelligence' },
  { id: 'settings', label: 'Configuration' }
];

export default function AMOIApp() {
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    // Ensures styles are replaced gracefully upon app reload
  }, []);

  return (
    <div style={{ display: 'flex', height: '100vh', width: '100vw' }}>
      
      {/* Sidebar Navigation */}
      <div style={{ width: '260px', padding: '32px 24px', display: 'flex', flexDirection: 'column', zIndex: 10, background: 'var(--surface-card)', borderRight: '1px solid var(--border-subtle)' }}>
        <div style={{ marginBottom: '60px', paddingLeft: '12px' }}>
          <h1 className="font-display" style={{ fontSize: '2.5rem', margin: 0, letterSpacing: '-0.05em', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: 14, height: 14, borderRadius: '50%', background: 'var(--accent-primary)', boxShadow: '0 0 20px var(--accent-primary)' }} />
            AMOI
          </h1>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', letterSpacing: '0.2em', textTransform: 'uppercase', marginTop: '4px' }}>
            Core Systems OS
          </p>
        </div>

        <nav style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 }}>
          {NAV_ITEMS.map((item, i) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className="nav-item animate-in"
                style={{
                  animationDelay: `${i * 100}ms`,
                  background: isActive ? 'var(--surface-hover)' : 'transparent',
                  color: isActive ? 'var(--text-main)' : 'var(--text-muted)',
                  border: 'none',
                  outline: 'none',
                  padding: '16px 20px',
                  borderRadius: 'var(--radius-md)',
                  textAlign: 'left',
                  fontSize: '0.95rem',
                  fontWeight: isActive ? 600 : 500,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px'
                }}
              >
                {isActive && <div style={{ width: 4, height: 16, background: 'var(--accent-primary)', borderRadius: 2, position: 'absolute', left: 0 }} />}
                {item.label}
              </button>
            )
          })}
        </nav>

        <div className="animate-in" style={{ animationDelay: '500ms', padding: '20px', background: 'var(--surface-hover)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-subtle)' }}>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 600, marginBottom: '8px' }}>System Status</div>
          <div style={{ fontSize: '1rem', color: 'var(--accent-primary)', fontWeight: 600 }}>Optimal</div>
          <div style={{ height: 2, background: 'var(--border-subtle)', marginTop: 12, borderRadius: 2, overflow: 'hidden' }}>
            <div style={{ width: '100%', height: '100%', background: 'var(--accent-primary)', animation: 'gradientScan 2s linear infinite' }} />
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div style={{ flex: 1, padding: '32px 40px 32px 40px', overflowY: 'auto' }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto', height: '100%' }}>
          {activeTab === 'overview' && <Overview />}
          {activeTab === 'engine' && <EngineView />}
          {activeTab === 'settings' && <SettingsView />}
        </div>
      </div>

    </div>
  );
}
