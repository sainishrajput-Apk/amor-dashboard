import { useState, useMemo, useEffect } from "react";
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line, ScatterChart, Scatter,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, Cell
} from "recharts";

/* ─── Global Style Injection (The "Smart & Modern" Aesthetic) ────────────── */
(() => {
  if (document.getElementById("amoi-modern-styles")) return;
  const s = document.createElement("style");
  s.id = "amoi-modern-styles";
  s.textContent = `
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&family=Outfit:wght@400;500;600;700&display=swap');
    
    :root {
      --bg-base: #030712;
      --surface-glass: rgba(17, 24, 39, 0.65);
      --surface-glass-hover: rgba(31, 41, 55, 0.75);
      --border-subtle: rgba(255, 255, 255, 0.08);
      --border-highlight: rgba(255, 255, 255, 0.15);
      --text-main: #f9fafb;
      --text-muted: #9ca3af;
      --text-dim: #4b5563;
      --accent-teal: #2dd4bf;
      --accent-purple: #c084fc;
      --accent-blue: #60a5fa;
      --accent-amber: #fbbf24;
      --accent-red: #f87171;
      --accent-green: #34d399;
      --radius-xl: 20px;
      --radius-lg: 16px;
      --radius-md: 12px;
      --transition-smooth: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
    }

    * { box-sizing: border-box; margin: 0; padding: 0; }
    
    body {
      background-color: var(--bg-base);
      background-image: 
        radial-gradient(circle at 15% 50%, rgba(96, 165, 250, 0.04) 0%, transparent 50%),
        radial-gradient(circle at 85% 30%, rgba(192, 132, 252, 0.04) 0%, transparent 50%);
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

    /* Typography */
    h1, h2, h3, h4, .font-display { font-family: 'Outfit', sans-serif; }
    
    /* Animations */
    @keyframes fadeInUp { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
    @keyframes pulseSoft { 0%, 100% { opacity: 1; transform: scale(1); } 50% { opacity: 0.8; transform: scale(0.98); } }
    @keyframes gradientScan { 0% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } 100% { background-position: 0% 50%; } }
    
    .animate-in { animation: fadeInUp 0.5s cubic-bezier(0.16, 1, 0.3, 1) both; }
    .pulse-soft { animation: pulseSoft 3s ease-in-out infinite; }
    
    /* Utility Classes */
    .glass-panel {
      background: var(--surface-glass);
      backdrop-filter: blur(24px);
      -webkit-backdrop-filter: blur(24px);
      border: 1px solid var(--border-subtle);
      border-radius: var(--radius-xl);
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
    }
    
    .nav-item {
      transition: var(--transition-smooth);
      position: relative;
      overflow: hidden;
    }
    .nav-item:hover {
      background: rgba(255,255,255,0.05);
      color: var(--text-main) !important;
    }
    
    .interactive-card {
      transition: var(--transition-smooth);
      cursor: pointer;
    }
    .interactive-card:hover {
      transform: translateY(-4px);
      border-color: var(--border-highlight);
      box-shadow: 0 12px 40px rgba(0,0,0,0.3);
      background: var(--surface-glass-hover);
    }

    .badge-pill {
      display: inline-flex; alignItems: center; gap: 6px;
      padding: 4px 10px; border-radius: 999px;
      font-size: 0.7rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em;
    }

    table { border-collapse: separate; border-spacing: 0; width: 100%; }
    th { padding: 12px 16px; text-align: left; font-size: 0.75rem; color: var(--text-muted); font-weight: 500; text-transform: uppercase; letter-spacing: 0.05em; border-bottom: 1px solid var(--border-subtle); }
    td { padding: 16px; font-size: 0.85rem; border-bottom: 1px solid rgba(255,255,255,0.03); transition: background 0.2s ease; }
    tr:hover td { background: rgba(255,255,255,0.02); }
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

function GlassCard({ children, className = "", style = {}, delay = 0, interactive = false }) {
  return (
    <div 
      className={`glass-panel animate-in ${interactive ? 'interactive-card' : ''} ${className}`} 
      style={{ padding: '24px', animationDelay: `${delay}ms`, ...style }}
    >
      {children}
    </div>
  );
}

function SectionHeader({ title, subtitle }) {
  return (
    <div style={{ marginBottom: '32px' }}>
      <h2 className="font-display" style={{ fontSize: '2rem', fontWeight: 600, letterSpacing: '-0.02em', background: 'linear-gradient(90deg, #fff, #9ca3af)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', margin: 0 }}>
        {title}
      </h2>
      <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginTop: '8px', lineHeight: 1.5, maxWidth: '600px' }}>
        {subtitle}
      </p>
    </div>
  );
}

function Metric({ label, value, trend, color = "var(--accent-teal)", delay = 0 }) {
  return (
    <GlassCard delay={delay} style={{ position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', top: 0, left: 0, width: '40%', height: '1px', background: `linear-gradient(90deg, ${color}, transparent)` }} />
      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 500, marginBottom: '8px' }}>
        {label}
      </div>
      <div className="font-display" style={{ fontSize: '2.5rem', fontWeight: 400, color: '#fff', letterSpacing: '-0.03em', lineHeight: 1.1 }}>
        {value}
      </div>
      {trend && (
        <div style={{ marginTop: '12px', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', color: trend.isGood ? 'var(--accent-green)' : 'var(--accent-red)' }}>
          <span style={{ padding: '2px 6px', borderRadius: '4px', background: trend.isGood ? 'rgba(52, 211, 153, 0.1)' : 'rgba(248, 113, 113, 0.1)' }}>
            {trend.val}
          </span>
          <span style={{ color: 'var(--text-dim)' }}>vs last period</span>
        </div>
      )}
    </GlassCard>
  );
}

function Badge({ children, variant = "neutral" }) {
  const vmap = {
    green: { bg: 'rgba(52, 211, 153, 0.1)', color: 'var(--accent-green)', dot: 'var(--accent-green)' },
    red: { bg: 'rgba(248, 113, 113, 0.1)', color: 'var(--accent-red)', dot: 'var(--accent-red)' },
    amber: { bg: 'rgba(251, 191, 36, 0.1)', color: 'var(--accent-amber)', dot: 'var(--accent-amber)' },
    teal: { bg: 'rgba(45, 212, 191, 0.1)', color: 'var(--accent-teal)', dot: 'var(--accent-teal)' },
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
      <div style={{ background: 'rgba(17, 24, 39, 0.85)', backdropFilter: 'blur(12px)', border: '1px solid var(--border-subtle)', borderRadius: '12px', padding: '12px 16px', boxShadow: '0 8px 32px rgba(0,0,0,0.3)', minWidth: '140px' }}>
        <p style={{ margin: 0, marginBottom: 8, fontSize: '0.75rem', color: 'var(--text-muted)' }}>{label}</p>
        {payload.map((p, i) => (
          <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
            <span style={{ color: p.color || '#fff', fontSize: '0.85rem', fontWeight: 500 }}>{p.name}</span>
            <span style={{ color: '#fff', fontSize: '0.9rem', fontWeight: 600, fontFamily: 'Outfit' }}>{p.value}</span>
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
        <Metric label="Plant Efficiency (OEE)" value="94.2%" trend={{ val: "+1.2%", isGood: true }} delay={0} color="var(--accent-teal)" />
        <Metric label="Energy per Batch" value="284.5" trend={{ val: "-2.4%", isGood: true }} delay={50} color="var(--accent-blue)" />
        <Metric label="Carbon Intensity" value="65.4t" trend={{ val: "-0.8%", isGood: true }} delay={100} color="var(--accent-green)" />
        <Metric label="Anomaly Rate" value="6.0%" trend={{ val: "+0.4%", isGood: false }} delay={150} color="var(--accent-red)" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px' }}>
        <GlassCard delay={200} style={{ padding: '32px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <h3 className="font-display" style={{ fontSize: '1.2rem', fontWeight: 500 }}>Energy Consumption Profile</h3>
            <Badge variant="teal">Live Tracing</Badge>
          </div>
          <div style={{ height: '300px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={ENERGY_SERIES} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorEnergy" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--accent-blue)" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="var(--accent-blue)" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="var(--border-subtle)" vertical={false} strokeDasharray="4 4" />
                <XAxis dataKey="name" stroke="var(--text-dim)" tick={{ fontSize: 11, fill: 'var(--text-dim)' }} tickLine={false} axisLine={false} />
                <YAxis stroke="var(--text-dim)" tick={{ fontSize: 11, fill: 'var(--text-dim)' }} tickLine={false} axisLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="energy" name="Energy (kWh)" stroke="var(--accent-blue)" strokeWidth={3} fillOpacity={1} fill="url(#colorEnergy)" />
                <Area type="monotone" dataKey="anom" name="Anomaly Spike" stroke="var(--accent-red)" strokeWidth={0} fill="rgba(248, 113, 113, 0.4)" dot={{ r: 4, fill: 'var(--accent-red)', strokeWidth: 2, stroke: '#111827' }} connectNulls={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>

        <GlassCard delay={250} style={{ padding: '32px', display: 'flex', flexDirection: 'column' }}>
          <h3 className="font-display" style={{ fontSize: '1.2rem', fontWeight: 500, marginBottom: '24px' }}>Active Diagnostics</h3>
          
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {[
              { title: 'Thermal Drift Detected', desc: 'Mixer B showing +4% variance in heat capacity.', type: 'amber' },
              { title: 'Carbon Budget Optimized', desc: 'Shifted 4 batches to off-peak grid window.', type: 'green' },
              { title: 'Yield Model Retraining', desc: 'Ingesting last 50 batches for R2 improvement.', type: 'teal' }
            ].map((alert, i) => (
              <div key={i} style={{ padding: '16px', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', border: '1px solid var(--border-subtle)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: `var(--accent-${alert.type})` }} />
                  <span style={{ fontSize: '0.9rem', fontWeight: 500, color: '#fff' }}>{alert.title}</span>
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: 1.5, paddingLeft: '16px' }}>
                  {alert.desc}
                </div>
              </div>
            ))}
          </div>

          <button style={{ marginTop: '20px', padding: '12px', borderRadius: '10px', background: 'var(--accent-teal)', color: '#030712', border: 'none', fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer', transition: 'transform 0.2s', width: '100%' }}>
            View Full Report
          </button>
        </GlassCard>
      </div>
    </div>
  );
}

function EngineView() {
  const models = [
    { target: "Energy Efficiency", score: 98, status: "green", val: "0.98 R²" },
    { target: "Yield Prediction", score: 85, status: "amber", val: "0.85 R²" },
    { target: "Carbon Output", score: 95, status: "green", val: "0.95 R²" },
    { target: "Defect Rate", score: 72, status: "red", val: "0.72 R²" }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <SectionHeader 
        title="Intelligence Engine" 
        subtitle="Deep learning models driving predictive accuracy and process optimization parameters." 
      />

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '24px' }}>
        <GlassCard delay={0}>
          <h3 className="font-display" style={{ fontSize: '1.2rem', fontWeight: 500, marginBottom: '24px' }}>Model Confidence</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {models.map((m, i) => (
              <div key={i}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-main)', fontWeight: 500 }}>{m.target}</span>
                  <span style={{ fontSize: '0.85rem', color: `var(--accent-${m.status})`, fontWeight: 600 }}>{m.val}</span>
                </div>
                <div style={{ height: '6px', background: 'rgba(255,255,255,0.05)', borderRadius: '3px', overflow: 'hidden' }}>
                  <div style={{ width: `${m.score}%`, height: '100%', background: `var(--accent-${m.status})`, borderRadius: '3px', transition: 'width 1s ease-out' }} />
                </div>
              </div>
            ))}
          </div>
        </GlassCard>

        <GlassCard delay={100}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h3 className="font-display" style={{ fontSize: '1.2rem', fontWeight: 500 }}>Recent Evaluation Batches</h3>
            <Badge variant="teal">Auto-scoring active</Badge>
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
                    <td style={{ fontWeight: 500, color: 'var(--accent-blue)' }}>{b.name}</td>
                    <td>{b.temp}°C</td>
                    <td>{b.feed} kg/s</td>
                    <td style={{ color: b.oee > 90 ? 'var(--text-main)' : 'var(--accent-amber)' }}>{b.oee}%</td>
                    <td>{b.quality}</td>
                    <td>
                      {b.anomaly ? <Badge variant="red">Anomaly</Badge> : <Badge variant="green">Optimal</Badge>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </GlassCard>
      </div>
    </div>
  );
}

function SettingsView() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
      <div className="pulse-soft" style={{ width: 80, height: 80, borderRadius: '50%', background: 'radial-gradient(circle, rgba(192, 132, 252, 0.2) 0%, transparent 70%)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(192, 132, 252, 0.3)' }}>
        <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'var(--accent-purple)', boxShadow: '0 0 30px rgba(192, 132, 252, 0.6)' }} />
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

  return (
    <div style={{ display: 'flex', height: '100vh', width: '100vw' }}>
      
      {/* Sidebar Navigation */}
      <div style={{ width: '260px', padding: '32px 24px', display: 'flex', flexDirection: 'column', zIndex: 10 }}>
        <div style={{ marginBottom: '60px', paddingLeft: '12px' }}>
          <h1 className="font-display" style={{ fontSize: '2.5rem', fontWeight: 700, margin: 0, letterSpacing: '-0.05em', color: '#fff', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: 14, height: 14, borderRadius: '50%', background: 'var(--accent-teal)', boxShadow: '0 0 20px var(--accent-teal)' }} />
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
                  background: isActive ? 'rgba(255,255,255,0.08)' : 'transparent',
                  color: isActive ? '#fff' : 'var(--text-muted)',
                  border: 'none',
                  outline: 'none',
                  padding: '16px 20px',
                  borderRadius: 'var(--radius-md)',
                  textAlign: 'left',
                  fontSize: '0.95rem',
                  fontWeight: isActive ? 600 : 400,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px'
                }}
              >
                {isActive && <div style={{ width: 4, height: 16, background: 'var(--accent-teal)', borderRadius: 2, position: 'absolute', left: 0 }} />}
                {item.label}
              </button>
            )
          })}
        </nav>

        <div className="animate-in" style={{ animationDelay: '500ms', padding: '20px', background: 'linear-gradient(135deg, rgba(45, 212, 191, 0.1), rgba(96, 165, 250, 0.05))', borderRadius: 'var(--radius-lg)', border: '1px solid rgba(45, 212, 191, 0.2)' }}>
          <div style={{ fontSize: '0.7rem', color: 'var(--accent-teal)', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 600, marginBottom: '8px' }}>System Status</div>
          <div style={{ fontSize: '1rem', color: '#fff', fontWeight: 500 }}>Optimal</div>
          <div style={{ height: 2, background: 'rgba(255,255,255,0.1)', marginTop: 12, borderRadius: 2, overflow: 'hidden' }}>
            <div style={{ width: '100%', height: '100%', background: 'var(--accent-teal)', animation: 'gradientScan 2s linear infinite' }} />
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div style={{ flex: 1, padding: '32px 40px 32px 0', overflowY: 'auto' }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto', height: '100%' }}>
          {activeTab === 'overview' && <Overview />}
          {activeTab === 'engine' && <EngineView />}
          {activeTab === 'settings' && <SettingsView />}
        </div>
      </div>

    </div>
  );
}
