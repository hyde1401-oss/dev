https://github.dev/github/devimport { useState, useEffect } from "react";

// ── Design tokens ──────────────────────────────────────────────
const COLORS = {
  navy: "#0D1B2A",
  navyLight: "#1A2E45",
  saffron: "#F5A623",
  saffronLight: "#FFD580",
  white: "#F8F5EF",
  muted: "#8A9BB0",
  success: "#2ECC71",
  danger: "#E74C3C",
};

// ══════════════════════════════════════════════════════════════
// 🔧 ALGORITHME DE MATCHING (intégré depuis ton index.js)
// ══════════════════════════════════════════════════════════════

const PRIORITY_WEIGHT = { vip: 300, high: 200, normal: 100 };

function clientScore(client) {
  const base = PRIORITY_WEIGHT[client.priority] ?? 100;
  // Chaque minute d'attente ajoute 1 point (plafond à 60)
  const waitBonus = Math.min(Math.floor(client.waitSeconds / 60), 60);
  return base + waitBonus;
}

function matchClientsToAgents(allAgents, allClients) {
  // 1. Agents disponibles triés par note (meilleurs en premier)
  const available = [...allAgents]
    .filter(a => a.dispo)
    .sort((a, b) => b.note - a.note);

  // 2. Clients triés par urgence (priorité + attente)
  const ranked = [...allClients]
    .map(c => ({ ...c, score: clientScore(c) }))
    .sort((a, b) => b.score - a.score);

  // 3. Appariement greedy : agent[i] → client[i]
  const matchCount = Math.min(available.length, ranked.length);
  const matches = [];
  for (let i = 0; i < matchCount; i++) {
    matches.push({ agent: available[i], client: ranked[i], score: ranked[i].score });
  }

  // 4. Clients restants → liste d'attente
  const unmatched = ranked.slice(matchCount);
  return { matches, unmatched };
}

// ══════════════════════════════════════════════════════════════
// 📦 DATA — enrichie avec priority + waitSeconds pour l'algo
// ══════════════════════════════════════════════════════════════

const MISSIONS = [
  { id: 1, type: "Préfecture", lieu: "Préfecture de Marseille", attente: 95, prix: 35, icon: "🏛️", segment: "Administratif" },
  { id: 2, type: "Boîte de nuit", lieu: "Le Trolleybus, Vieux-Port", attente: 45, prix: 20, icon: "🎶", segment: "Loisirs" },
  { id: 3, type: "Médecin", lieu: "Cabinet Dr. Benali, 13006", attente: 30, prix: 15, icon: "🩺", segment: "Médical" },
  { id: 4, type: "CAF", lieu: "CAF Marseille Centre", attente: 120, prix: 35, icon: "📋", segment: "Administratif" },
  { id: 5, type: "Sneakers Drop", lieu: "Nike Store La Canebière", attente: 60, prix: 25, icon: "👟", segment: "Loisirs" },
];

const AGENTS = [
  { id: 1, nom: "Karim B.", note: 4.9, missions: 87, photo: "K", dispo: true },
  { id: 2, nom: "Sofia M.", note: 4.8, missions: 124, photo: "S", dispo: true },
  { id: 3, nom: "Youssef D.", note: 5.0, missions: 43, photo: "Y", dispo: false },
  { id: 4, nom: "Amina L.", note: 4.7, missions: 201, photo: "A", dispo: true },
];

// Clients en attente avec priority + waitSeconds (pour l'algo)
const WAITING_CLIENTS = [
  { id: 101, name: "Marie Dupont", ticketNumber: "A001", priority: "normal", waitSeconds: 420, missionId: 1 },
  { id: 102, name: "Jean-Paul Blanc", ticketNumber: "A002", priority: "vip", waitSeconds: 60, missionId: 4 },
  { id: 103, name: "Isabelle Noir", ticketNumber: "A003", priority: "high", waitSeconds: 310, missionId: 2 },
  { id: 104, name: "Paul Lebrun", ticketNumber: "A004", priority: "normal", waitSeconds: 180, missionId: 3 },
  { id: 105, name: "Nadia Rousseau", ticketNumber: "A005", priority: "high", waitSeconds: 500, missionId: 1 },
  { id: 106, name: "Marc Garnier", ticketNumber: "A006", priority: "normal", waitSeconds: 90, missionId: 5 },
];

// ── Helpers ────────────────────────────────────────────────────
function formatMin(min) {
  if (min >= 60) return `${Math.floor(min / 60)}h${min % 60 > 0 ? (min % 60) + "min" : ""}`;
  return `${min} min`;
}

function formatWait(seconds) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  if (m === 0) return `${s}s`;
  return `${m}m${s > 0 ? s + "s" : ""}`;
}

const PRIORITY_LABEL = { vip: { label: "VIP", color: "#FFD700" }, high: { label: "URGENT", color: "#E74C3C" }, normal: { label: "Normal", color: "#8A9BB0" } };

// ── Components ─────────────────────────────────────────────────
function Logo() {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <div style={{ width: 36, height: 36, borderRadius: 10, background: COLORS.saffron, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, fontSize: 18, color: COLORS.navy }}>Z</div>
      <span style={{ fontWeight: 800, fontSize: 20, color: COLORS.white, letterSpacing: -0.5 }}>
        Zéro<span style={{ color: COLORS.saffron }}>File</span>
      </span>
    </div>
  );
}

function Badge({ children, color = COLORS.saffron }) {
  return (
    <span style={{ background: color + "22", color, border: `1px solid ${color}44`, borderRadius: 20, padding: "2px 10px", fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.5 }}>{children}</span>
  );
}

function QueueProgress({ current, total, alertAt = 15 }) {
  const pct = Math.max(0, Math.min(100, ((total - current) / total) * 100));
  const isAlert = current <= alertAt;
  return (
    <div style={{ width: "100%" }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
        <span style={{ fontSize: 12, color: COLORS.muted }}>Progression</span>
        <span style={{ fontSize: 12, fontWeight: 700, color: isAlert ? COLORS.saffron : COLORS.white }}>
          {isAlert ? "⚡ Bientôt votre tour !" : `~${formatMin(current)} restant`}
        </span>
      </div>
      <div style={{ height: 8, background: COLORS.navyLight, borderRadius: 99, overflow: "hidden" }}>
        <div style={{
          height: "100%", borderRadius: 99,
          background: isAlert ? `linear-gradient(90deg, ${COLORS.saffron}, ${COLORS.saffronLight})` : `linear-gradient(90deg, ${COLORS.muted}66, ${COLORS.saffron}88)`,
          width: `${pct}%`, transition: "width 1s ease",
          boxShadow: isAlert ? `0 0 12px ${COLORS.saffron}88` : "none",
        }} />
      </div>
    </div>
  );
}

// ── Views ──────────────────────────────────────────────────────

function HomeView({ onBook }) {
  return (
    <div>
      <div style={{ background: `linear-gradient(135deg, ${COLORS.navyLight} 0%, ${COLORS.navy} 100%)`, borderRadius: 20, padding: "32px 24px", marginBottom: 20, border: `1px solid ${COLORS.saffron}22`, position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: -30, right: -30, width: 120, height: 120, borderRadius: "50%", background: COLORS.saffron + "11" }} />
        <Badge>🟢 Service actif à Marseille</Badge>
        <h1 style={{ margin: "16px 0 8px", fontSize: 28, fontWeight: 900, color: COLORS.white, lineHeight: 1.15, letterSpacing: -1 }}>
          Votre temps<br /><span style={{ color: COLORS.saffron }}>vaut plus que ça.</span>
        </h1>
        <p style={{ color: COLORS.muted, fontSize: 14, margin: "0 0 20px", lineHeight: 1.6 }}>
          On envoie un agent faire la queue à votre place. Vous arrivez quand c'est votre tour.
        </p>
        <button onClick={() => onBook(null)} style={{ background: COLORS.saffron, color: COLORS.navy, border: "none", borderRadius: 12, padding: "12px 24px", fontWeight: 800, fontSize: 15, cursor: "pointer", boxShadow: `0 4px 20px ${COLORS.saffron}55` }}>
          Réserver un agent →
        </button>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginBottom: 20 }}>
        {[{ v: "87", l: "Missions\nréussies" }, { v: "4.9★", l: "Note\nmoyenne" }, { v: "<15min", l: "Temps de\nréponse" }].map((s, i) => (
          <div key={i} style={{ background: COLORS.navyLight, borderRadius: 14, padding: "14px 10px", textAlign: "center", border: `1px solid ${COLORS.white}0A` }}>
            <div style={{ fontSize: 18, fontWeight: 900, color: COLORS.saffron }}>{s.v}</div>
            <div style={{ fontSize: 10, color: COLORS.muted, whiteSpace: "pre-line", marginTop: 2, lineHeight: 1.4 }}>{s.l}</div>
          </div>
        ))}
      </div>
      <h2 style={{ color: COLORS.white, fontSize: 16, fontWeight: 700, marginBottom: 12 }}>Où on fait la queue pour vous</h2>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {MISSIONS.map(m => (
          <div key={m.id} onClick={() => onBook(m)} style={{ background: COLORS.navyLight, borderRadius: 16, padding: "14px 16px", display: "flex", alignItems: "center", gap: 14, border: `1px solid ${COLORS.white}0A`, cursor: "pointer" }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: COLORS.saffron + "18", fontSize: 22, display: "flex", alignItems: "center", justifyContent: "center" }}>{m.icon}</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700, color: COLORS.white, fontSize: 14 }}>{m.type}</div>
              <div style={{ fontSize: 12, color: COLORS.muted, marginTop: 2 }}>{m.lieu}</div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontWeight: 800, color: COLORS.saffron, fontSize: 12 }}>à partir de</div>
              <div style={{ fontWeight: 900, color: COLORS.white, fontSize: 18 }}>{m.prix}€</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function BookingView({ onConfirm, onBack }) {
  const [selected, setSelected] = useState(MISSIONS[0]);
  const [step, setStep] = useState(1);
  const availableAgents = AGENTS.filter(a => a.dispo);

  if (step === 1) return (
    <div>
      <button onClick={onBack} style={{ background: "none", border: "none", color: COLORS.muted, cursor: "pointer", fontSize: 13, marginBottom: 16, padding: 0 }}>← Retour</button>
      <h2 style={{ color: COLORS.white, fontWeight: 800, fontSize: 20, marginBottom: 4 }}>Où voulez-vous qu'on fasse la queue ?</h2>
      <p style={{ color: COLORS.muted, fontSize: 13, marginBottom: 20 }}>Sélectionnez le type de file</p>
      <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 24 }}>
        {MISSIONS.map(m => (
          <div key={m.id} onClick={() => setSelected(m)} style={{ background: selected?.id === m.id ? COLORS.saffron + "18" : COLORS.navyLight, borderRadius: 14, padding: "14px 16px", border: `1.5px solid ${selected?.id === m.id ? COLORS.saffron : COLORS.white + "0A"}`, cursor: "pointer", display: "flex", alignItems: "center", gap: 12 }}>
            <span style={{ fontSize: 20 }}>{m.icon}</span>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700, color: COLORS.white, fontSize: 14 }}>{m.type}</div>
              <div style={{ fontSize: 12, color: COLORS.muted }}>Attente moy. {formatMin(m.attente)}</div>
            </div>
            <Badge color={selected?.id === m.id ? COLORS.saffron : COLORS.muted}>{m.prix}€</Badge>
          </div>
        ))}
      </div>
      <button onClick={() => setStep(2)} style={{ width: "100%", background: COLORS.saffron, border: "none", borderRadius: 14, padding: "15px", fontWeight: 800, fontSize: 16, color: COLORS.navy, cursor: "pointer" }}>Choisir un agent →</button>
    </div>
  );

  if (step === 2) return (
    <div>
      <button onClick={() => setStep(1)} style={{ background: "none", border: "none", color: COLORS.muted, cursor: "pointer", fontSize: 13, marginBottom: 16, padding: 0 }}>← Retour</button>
      <h2 style={{ color: COLORS.white, fontWeight: 800, fontSize: 20, marginBottom: 4 }}>Agents disponibles</h2>
      <p style={{ color: COLORS.muted, fontSize: 13, marginBottom: 20 }}>Tous vérifiés et notés par la communauté</p>
      <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 24 }}>
        {availableAgents.map(a => (
          <div key={a.id} style={{ background: COLORS.navyLight, borderRadius: 14, padding: "16px", border: `1px solid ${COLORS.white}0A`, display: "flex", alignItems: "center", gap: 14 }}>
            <div style={{ width: 46, height: 46, borderRadius: "50%", background: `linear-gradient(135deg, ${COLORS.saffron}, ${COLORS.navyLight})`, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, fontSize: 18, color: COLORS.navy }}>{a.photo}</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700, color: COLORS.white, fontSize: 15 }}>{a.nom}</div>
              <div style={{ fontSize: 12, color: COLORS.muted, marginTop: 2 }}>⭐ {a.note} · {a.missions} missions</div>
            </div>
            <button onClick={() => onConfirm({ mission: selected, agent: a })} style={{ background: COLORS.saffron, border: "none", borderRadius: 10, padding: "8px 16px", fontWeight: 700, fontSize: 13, color: COLORS.navy, cursor: "pointer" }}>Choisir</button>
          </div>
        ))}
      </div>
      <div style={{ background: COLORS.navyLight, borderRadius: 14, padding: 14, border: `1px solid ${COLORS.saffron}22` }}>
        <div style={{ fontSize: 12, color: COLORS.muted }}>💡 L'agent se rend sur place, prend votre place, et vous alerte 10–15 min avant votre tour.</div>
      </div>
    </div>
  );
}

function TrackingView({ booking, onEnd }) {
  const [timeLeft, setTimeLeft] = useState(booking.mission.attente);
  const [status, setStatus] = useState("en_route");

  useEffect(() => {
    if (timeLeft <= 0) { setStatus("termine"); return; }
    const t = setInterval(() => {
      setTimeLeft(p => {
        const next = p - 1;
        if (next <= 15 && next > 0) setStatus("alerte");
        else if (next <= 0) setStatus("termine");
        else if (next < booking.mission.attente - 2) setStatus("en_file");
        return next;
      });
    }, 800);
    return () => clearInterval(t);
  }, []);

  const statusInfo = {
    en_route: { label: "Agent en route", color: COLORS.muted, icon: "🚶" },
    en_file: { label: "Agent dans la file", color: COLORS.saffron, icon: "⏳" },
    alerte: { label: "⚡ Préparez-vous !", color: COLORS.saffron, icon: "🔔" },
    termine: { label: "✅ Mission terminée", color: COLORS.success, icon: "🎉" },
  }[status];

  return (
    <div>
      <h2 style={{ color: COLORS.white, fontWeight: 800, fontSize: 20, marginBottom: 20 }}>Suivi en direct</h2>
      <div style={{ background: COLORS.navyLight, borderRadius: 18, padding: 20, marginBottom: 16, border: `1.5px solid ${status === "alerte" ? COLORS.saffron : COLORS.white + "0A"}`, boxShadow: status === "alerte" ? `0 0 24px ${COLORS.saffron}33` : "none", transition: "all 0.5s" }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
          <div>
            <div style={{ fontSize: 24 }}>{booking.mission.icon}</div>
            <div style={{ fontWeight: 700, color: COLORS.white, fontSize: 16, marginTop: 4 }}>{booking.mission.type}</div>
            <div style={{ fontSize: 12, color: COLORS.muted }}>{booking.mission.lieu}</div>
          </div>
          <div style={{ textAlign: "right" }}>
            <Badge color={statusInfo.color}>{statusInfo.icon} {statusInfo.label}</Badge>
            <div style={{ marginTop: 10, fontSize: 28, fontWeight: 900, color: status === "termine" ? COLORS.success : COLORS.saffron }}>
              {status === "termine" ? "C'est votre tour !" : formatMin(timeLeft)}
            </div>
            {status !== "termine" && <div style={{ fontSize: 11, color: COLORS.muted }}>estimé</div>}
          </div>
        </div>
        <QueueProgress current={timeLeft} total={booking.mission.attente} />
      </div>
      <div style={{ background: COLORS.navyLight, borderRadius: 16, padding: 16, marginBottom: 16, border: `1px solid ${COLORS.white}0A`, display: "flex", alignItems: "center", gap: 14 }}>
        <div style={{ width: 46, height: 46, borderRadius: "50%", background: `linear-gradient(135deg, ${COLORS.saffron}, ${COLORS.navyLight})`, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, fontSize: 18, color: COLORS.navy }}>{booking.agent.photo}</div>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 700, color: COLORS.white }}>{booking.agent.nom}</div>
          <div style={{ fontSize: 12, color: COLORS.muted }}>⭐ {booking.agent.note} · Votre agent</div>
        </div>
        <button style={{ background: COLORS.navyLight, border: `1px solid ${COLORS.muted}44`, borderRadius: 10, padding: "8px 14px", color: COLORS.white, fontSize: 12, fontWeight: 600, cursor: "pointer" }}>💬 Message</button>
      </div>
      <div style={{ background: COLORS.navyLight, borderRadius: 16, padding: 16 }}>
        <div style={{ fontWeight: 700, color: COLORS.white, marginBottom: 14, fontSize: 14 }}>Étapes</div>
        {[
          { label: "Réservation confirmée", done: true },
          { label: "Agent en route", done: true },
          { label: "Agent dans la file", done: ["en_file", "alerte", "termine"].includes(status) },
          { label: "Alerte 15 min", done: ["alerte", "termine"].includes(status) },
          { label: "Vous arrivez, mission accomplie", done: status === "termine" },
        ].map((e, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: i < 4 ? 12 : 0 }}>
            <div style={{ width: 22, height: 22, borderRadius: "50%", flexShrink: 0, background: e.done ? COLORS.saffron : COLORS.navyLight, border: `2px solid ${e.done ? COLORS.saffron : COLORS.muted + "44"}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, color: COLORS.navy, fontWeight: 800 }}>{e.done ? "✓" : ""}</div>
            <div style={{ fontSize: 13, color: e.done ? COLORS.white : COLORS.muted, fontWeight: e.done ? 600 : 400 }}>{e.label}</div>
          </div>
        ))}
      </div>
      {status === "termine" && (
        <button onClick={onEnd} style={{ width: "100%", marginTop: 16, background: COLORS.success, border: "none", borderRadius: 14, padding: "15px", fontWeight: 800, fontSize: 16, color: "#fff", cursor: "pointer" }}>🎉 Terminer et noter l'agent</button>
      )}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
// 🤖 DASHBOARD AGENT — avec matching algo intégré
// ══════════════════════════════════════════════════════════════

function DashboardView() {
  const [activeTab, setActiveTab] = useState("matching");

  // On lance l'algorithme de matching
  const { matches, unmatched } = matchClientsToAgents(AGENTS, WAITING_CLIENTS);

  return (
    <div>
      <h2 style={{ color: COLORS.white, fontWeight: 800, fontSize: 20, marginBottom: 4 }}>Dashboard Agent</h2>
      <p style={{ color: COLORS.muted, fontSize: 12, marginBottom: 16 }}>Algorithme de matching actif</p>

      <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
        {[
          { id: "matching", label: "🤖 Matching" },
          { id: "missions", label: "Missions" },
          { id: "gains", label: "Gains" },
        ].map(t => (
          <button key={t.id} onClick={() => setActiveTab(t.id)} style={{ flex: 1, padding: "10px 6px", border: "none", borderRadius: 12, background: activeTab === t.id ? COLORS.saffron : COLORS.navyLight, color: activeTab === t.id ? COLORS.navy : COLORS.muted, fontWeight: 700, fontSize: 12, cursor: "pointer" }}>{t.label}</button>
        ))}
      </div>

      {/* ── ONGLET MATCHING ── */}
      {activeTab === "matching" && (
        <div>
          {/* Résumé */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginBottom: 20 }}>
            {[
              { v: matches.length, l: "Matchés", c: COLORS.success },
              { v: unmatched.length, l: "En attente", c: COLORS.saffron },
              { v: AGENTS.filter(a => a.dispo).length, l: "Agents dispo", c: COLORS.white },
            ].map((s, i) => (
              <div key={i} style={{ background: COLORS.navyLight, borderRadius: 14, padding: "14px 10px", textAlign: "center", border: `1px solid ${COLORS.white}0A` }}>
                <div style={{ fontSize: 22, fontWeight: 900, color: s.c }}>{s.v}</div>
                <div style={{ fontSize: 10, color: COLORS.muted, marginTop: 4 }}>{s.l}</div>
              </div>
            ))}
          </div>

          {/* Matches */}
          <h3 style={{ color: COLORS.white, fontSize: 13, fontWeight: 700, marginBottom: 10, display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ color: COLORS.success }}>✅</span> Clients assignés ({matches.length})
          </h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 20 }}>
            {matches.map(({ agent, client, score }, i) => {
              const mission = MISSIONS.find(m => m.id === client.missionId);
              const prio = PRIORITY_LABEL[client.priority];
              return (
                <div key={i} style={{ background: COLORS.navyLight, borderRadius: 14, padding: "14px 16px", border: `1px solid ${COLORS.success}22` }}>
                  {/* Client */}
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ fontSize: 16 }}>{mission?.icon ?? "📋"}</span>
                      <div>
                        <div style={{ fontWeight: 700, color: COLORS.white, fontSize: 13 }}>{client.name}</div>
                        <div style={{ fontSize: 11, color: COLORS.muted }}>#{client.ticketNumber} · attendu {formatWait(client.waitSeconds)}</div>
                      </div>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4 }}>
                      <Badge color={prio.color}>{prio.label}</Badge>
                      <span style={{ fontSize: 10, color: COLORS.muted }}>score {score}</span>
                    </div>
                  </div>
                  {/* Flèche agent */}
                  <div style={{ borderTop: `1px solid ${COLORS.white}08`, paddingTop: 8, display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ fontSize: 11, color: COLORS.muted }}>→ assigné à</span>
                    <div style={{ width: 24, height: 24, borderRadius: "50%", background: `linear-gradient(135deg, ${COLORS.saffron}, ${COLORS.navyLight})`, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, fontSize: 11, color: COLORS.navy }}>{agent.photo}</div>
                    <span style={{ fontWeight: 700, color: COLORS.saffron, fontSize: 12 }}>{agent.nom}</span>
                    <span style={{ fontSize: 11, color: COLORS.muted }}>⭐ {agent.note}</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Unmatched */}
          {unmatched.length > 0 && (
            <>
              <h3 style={{ color: COLORS.white, fontSize: 13, fontWeight: 700, marginBottom: 10, display: "flex", alignItems: "center", gap: 6 }}>
                <span style={{ color: COLORS.saffron }}>⏳</span> Liste d'attente ({unmatched.length})
              </h3>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {unmatched.map((client, i) => {
                  const mission = MISSIONS.find(m => m.id === client.missionId);
                  const prio = PRIORITY_LABEL[client.priority];
                  return (
                    <div key={i} style={{ background: COLORS.navyLight, borderRadius: 14, padding: "12px 16px", border: `1px solid ${COLORS.saffron}22`, display: "flex", alignItems: "center", gap: 10 }}>
                      <span style={{ fontSize: 16 }}>{mission?.icon ?? "📋"}</span>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 700, color: COLORS.white, fontSize: 13 }}>{client.name}</div>
                        <div style={{ fontSize: 11, color: COLORS.muted }}>#{client.ticketNumber} · {formatWait(client.waitSeconds)} d'attente · score {client.score}</div>
                      </div>
                      <Badge color={prio.color}>{prio.label}</Badge>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>
      )}

      {/* ── ONGLET MISSIONS ── */}
      {activeTab === "missions" && (
        <div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 20 }}>
            {[{ v: "12", l: "Ce mois", c: COLORS.saffron }, { v: "87", l: "Total", c: COLORS.white }, { v: "4.9★", l: "Ma note", c: COLORS.success }, { v: "🟢", l: "Disponible", c: COLORS.success }].map((s, i) => (
              <div key={i} style={{ background: COLORS.navyLight, borderRadius: 14, padding: 16, textAlign: "center", border: `1px solid ${COLORS.white}0A` }}>
                <div style={{ fontSize: 22, fontWeight: 900, color: s.c }}>{s.v}</div>
                <div style={{ fontSize: 11, color: COLORS.muted, marginTop: 4 }}>{s.l}</div>
              </div>
            ))}
          </div>
          <h3 style={{ color: COLORS.white, fontSize: 14, fontWeight: 700, marginBottom: 10 }}>Demandes disponibles</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {MISSIONS.slice(0, 3).map(m => (
              <div key={m.id} style={{ background: COLORS.navyLight, borderRadius: 14, padding: "14px 16px", border: `1px solid ${COLORS.white}0A`, display: "flex", alignItems: "center", gap: 12 }}>
                <span style={{ fontSize: 22 }}>{m.icon}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, color: COLORS.white, fontSize: 13 }}>{m.type}</div>
                  <div style={{ fontSize: 12, color: COLORS.muted }}>{formatMin(m.attente)} · {m.lieu}</div>
                </div>
                <button style={{ background: COLORS.saffron, border: "none", borderRadius: 10, padding: "7px 14px", fontWeight: 700, fontSize: 12, color: COLORS.navy, cursor: "pointer" }}>Accepter</button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── ONGLET GAINS ── */}
      {activeTab === "gains" && (
        <div>
          <div style={{ background: COLORS.navyLight, borderRadius: 16, padding: 20, marginBottom: 16, border: `1px solid ${COLORS.saffron}22` }}>
            <div style={{ fontSize: 12, color: COLORS.muted, marginBottom: 4 }}>Gains ce mois</div>
            <div style={{ fontSize: 36, fontWeight: 900, color: COLORS.saffron }}>204€</div>
            <div style={{ fontSize: 12, color: COLORS.muted, marginTop: 4 }}>12 missions × ~17€ moy.</div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {[
              { date: "Aujourd'hui", type: "Préfecture", gain: 25 },
              { date: "Hier", type: "Boîte de nuit", gain: 14 },
              { date: "12 juin", type: "Médecin", gain: 10 },
              { date: "11 juin", type: "CAF", gain: 25 },
            ].map((t, i) => (
              <div key={i} style={{ background: COLORS.navyLight, borderRadius: 12, padding: "12px 16px", display: "flex", justifyContent: "space-between", alignItems: "center", border: `1px solid ${COLORS.white}0A` }}>
                <div>
                  <div style={{ color: COLORS.white, fontSize: 13, fontWeight: 600 }}>{t.type}</div>
                  <div style={{ color: COLORS.muted, fontSize: 11 }}>{t.date}</div>
                </div>
                <div style={{ fontWeight: 800, color: COLORS.success, fontSize: 16 }}>+{t.gain}€</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Main App ───────────────────────────────────────────────────
export default function ZeroFileApp() {
  const [view, setView] = useState("home");
  const [booking, setBooking] = useState(null);
  const [mode, setMode] = useState("client");

  function handleConfirm(b) {
    setBooking(b);
    setView("track");
  }

  return (
    <div style={{ minHeight: "100vh", background: COLORS.navy, fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif", display: "flex", justifyContent: "center", alignItems: "flex-start" }}>
      <div style={{ width: "100%", maxWidth: 420, minHeight: "100vh", display: "flex", flexDirection: "column" }}>
        {/* Header */}
        <div style={{ padding: "20px 20px 12px", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: `1px solid ${COLORS.white}08` }}>
          <Logo />
          <button onClick={() => { setMode(m => { const next = m === "client" ? "agent" : "client"; setView(next === "agent" ? "dashboard" : "home"); return next; })} } style={{ background: COLORS.navyLight, border: `1px solid ${COLORS.white}0F`, borderRadius: 20, padding: "6px 14px", color: COLORS.muted, fontSize: 12, fontWeight: 600, cursor: "pointer" }}>
            {mode === "client" ? "Vue Agent" : "Vue Client"}
          </button>
        </div>

        {/* Content */}
        <div style={{ flex: 1, padding: "20px 20px 100px", overflowY: "auto" }}>
          {mode === "client" && view === "home" && <HomeView onBook={() => setView("book")} />}
          {mode === "client" && view === "book" && <BookingView onConfirm={handleConfirm} onBack={() => setView("home")} />}
          {mode === "client" && view === "track" && booking && <TrackingView booking={booking} onEnd={() => setView("home")} />}
          {mode === "agent" && <DashboardView />}
        </div>

        {/* Bottom nav */}
        {mode === "client" && (
          <div style={{ position: "fixed", bottom: 0, left: "50%", transform: "translateX(-50%)", width: "100%", maxWidth: 420, background: COLORS.navyLight + "EE", backdropFilter: "blur(12px)", borderTop: `1px solid ${COLORS.white}0A`, display: "flex", padding: "10px 0 20px" }}>
            {[
              { id: "home", icon: "🏠", label: "Accueil" },
              { id: "book", icon: "➕", label: "Réserver" },
              { id: "track", icon: "📍", label: "Suivi" },
            ].map(n => (
              <button key={n.id} onClick={() => { if (n.id !== "track" || booking) setView(n.id); }} style={{ flex: 1, background: "none", border: "none", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 3 }}>
                <span style={{ fontSize: 20 }}>{n.icon}</span>
                <span style={{ fontSize: 10, fontWeight: 600, color: view === n.id ? COLORS.saffron : COLORS.muted }}>{n.label}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
