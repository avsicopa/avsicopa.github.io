import React, { useEffect, useMemo, useState } from "react";
import "./styles.css";
import { useBrazilWorldCup2026 } from "./hooks/useBrazilWorldCup2026";
import { useGoalSound } from "./hooks/useGoalSound"; // ✅ Adicionado: Importa o hook useGoalSound
import MatchCard from "./components/MatchCard";
import ContactSection from "./components/ContactSection";
import {
    formatDate,
    formatTime,
    getReadableMatchStatus,
    isAdversaryHighlight,
    translateMatchStage,
    translateCountryName,
} from "./utils/helpers";

function sortAsc(a, b) {
    return new Date(a.utcDate) - new Date(b.utcDate);
}

function sortDesc(a, b) {
    return new Date(b.utcDate) - new Date(a.utcDate);
}

function App() {
    const {
        loading,
        error,
        brazilLiveNow,
        brazilNextMatch,
        brazilPastResults,
        otherMatches,
        allMatches,
        reload,
    } = useBrazilWorldCup2026();

    const [activeMatchId, setActiveMatchId] = useState(null);
    const [showContact, setShowContact] = useState(false);
    const [imageModal, setImageModal] = useState(null); // ✅ ADICIONADO: Estado para modal de imagem

    // ✅ Garante que são arrays antes de fazer spread
    const leftSidebarMatches = useMemo(() => {
        return [
            ...(Array.isArray(brazilLiveNow) ? brazilLiveNow : []),
            ...(brazilNextMatch ? [brazilNextMatch] : []),
            ...(Array.isArray(brazilPastResults) ? brazilPastResults : []),
        ];
    }, [brazilLiveNow, brazilNextMatch, brazilPastResults]);

         const rightSidebarMatches = useMemo(() => {
        if (!Array.isArray(otherMatches)) return [];
        
        const pastResults = otherMatches
            .filter((m) => m.status === "FINISHED")
            .sort(sortDesc);

        const liveNow = otherMatches
            .filter((m) => ["LIVE", "IN_PLAY", "PAUSED"].includes(m.status))
            .sort(sortAsc);

        const nextMatch = otherMatches
            .filter((m) => ["SCHEDULED", "TIMED"].includes(m.status))
            .sort(sortAsc)[0] ?? null;

        return [
            ...liveNow,
            ...(nextMatch ? [nextMatch] : []),
            ...pastResults,
        ];
    }, [otherMatches]);

    const activeMatch = useMemo(() => {
        if (!activeMatchId || !Array.isArray(allMatches)) return null;
        return allMatches.find((m) => m.id === activeMatchId) || null;
    }, [activeMatchId, allMatches]);    
    
// ✅ ADICIONE AQUI - Hook de som de gol
// useGoalSound(activeMatch);
const goalHighlight = useGoalSound(activeMatch);

const highlightForThisMatch =
  goalHighlight && activeMatch && goalHighlight.matchId === activeMatch.id ? goalHighlight : null;

  const homeHighlightClass =
  highlightForThisMatch?.scorerSide === "HOME"
    ? (highlightForThisMatch.isBrazilGoal ? "goal-flash-brasil" : "goal-flash-home")
    : "";

const awayHighlightClass =
  highlightForThisMatch?.scorerSide === "AWAY"
    ? (highlightForThisMatch.isBrazilGoal ? "goal-flash-brasil" : "goal-flash-away")
    : "";

// ✅ COLE AQUI (antes do useEffect de rotação)
const rotatingLiveMatches = useMemo(() => {
  const liveStatuses = new Set(["LIVE", "IN_PLAY", "PAUSED"]);
  return (Array.isArray(allMatches) ? allMatches : []).filter((m) =>
    liveStatuses.has(m.status)
  );
}, [allMatches]);

    // ✅ Rotação automática de jogos
    useEffect(() => {
        if (loading || error) return;

        // PRIORIDADE 1: Jogo do Brasil AO VIVO (nunca rotaciona)
        if (brazilLiveNow && brazilLiveNow.length > 0) {
            if (activeMatchId !== brazilLiveNow[0].id) {
                setActiveMatchId(brazilLiveNow[0].id);
            }
            return; // Para aqui, não rotaciona
        }

// PRIORIDADE 2: Jogos AO VIVO (rotaciona a cada 10s)
if (rotatingLiveMatches.length > 0) {
  const interval = setInterval(() => {
    setActiveMatchId((prevId) => {
      const currentIndex = rotatingLiveMatches.findIndex((m) => m.id === prevId);
      const nextIndex = (currentIndex + 1) % rotatingLiveMatches.length;
      return rotatingLiveMatches[nextIndex].id;
    });
  }, 10000);

  if (!activeMatchId || !rotatingLiveMatches.find((m) => m.id === activeMatchId)) {
    setActiveMatchId(rotatingLiveMatches[0].id);
  }

  return () => clearInterval(interval);
}

// PRIORIDADE 3: não há ao vivo → escolher próximo horário (rotativo se tiver empate)
const now = Date.now();
const futureMatches = (Array.isArray(allMatches) ? allMatches : [])
  .filter(m => ["SCHEDULED", "TIMED"].includes(m.status))
  .filter(m => new Date(m.utcDate).getTime() >= now)
  .sort((a,b) => new Date(a.utcDate) - new Date(b.utcDate));

if (futureMatches.length > 0) {
  const nextTime = new Date(futureMatches[0].utcDate).getTime();

  // todos os jogos do MESMO horário do próximo jogo
  const sameTimeMatches = futureMatches.filter(m => new Date(m.utcDate).getTime() === nextTime);

  // se houver Brasil nesse mesmo horário, coloca ele primeiro
  sameTimeMatches.sort((a,b) => {
    const aIsBrazil = (a.homeTeam?.id === 764 || a.awayTeam?.id === 764) ? 0 : 1;
    const bIsBrazil = (b.homeTeam?.id === 764 || b.awayTeam?.id === 764) ? 0 : 1;
    return aIsBrazil - bIsBrazil;
  });

  if (sameTimeMatches.length === 1) {
    if (activeMatchId !== sameTimeMatches[0].id) setActiveMatchId(sameTimeMatches[0].id);
    return;
  }

  // mais de um no mesmo horário → rotaciona
  const interval = setInterval(() => {
    setActiveMatchId(prevId => {
      const currentIndex = sameTimeMatches.findIndex(m => m.id === prevId);
      const nextIndex = (currentIndex + 1) % sameTimeMatches.length;
      return sameTimeMatches[nextIndex].id;
    });
  }, 10000);

  if (!activeMatchId || !sameTimeMatches.find(m => m.id === activeMatchId)) {
    setActiveMatchId(sameTimeMatches[0].id);
  }

  return () => clearInterval(interval);
}

// PRIORIDADE 4: últimos resultados do Brasil
if (brazilPastResults && brazilPastResults.length > 0) {
  if (activeMatchId !== brazilPastResults[0].id) setActiveMatchId(brazilPastResults[0].id);
  return;
}

        // PRIORIDADE 5: Qualquer outro jogo
        if (otherMatches && otherMatches.length > 0) {
            if (activeMatchId !== otherMatches[0].id) {
                setActiveMatchId(otherMatches[0].id);
            }
        }
    }, [loading, error, activeMatchId, brazilLiveNow, rotatingLiveMatches, brazilNextMatch, brazilPastResults, otherMatches]);

    // ✅ Encontra o jogo ativo
    // const activeMatch = useMemo(() => {
        // if (!activeMatchId || !Array.isArray(allMatches)) return null;
        // return allMatches.find((m) => m.id === activeMatchId) || null;
    // }, [activeMatchId, allMatches]);

const homeScore = activeMatch?.liveScore?.home ?? activeMatch?.score?.fullTime?.home;
const awayScore = activeMatch?.liveScore?.away ?? activeMatch?.score?.fullTime?.away;
const homeTeamCrest = activeMatch?.homeTeam?.crest || "";
const awayTeamCrest = activeMatch?.awayTeam?.crest || "";
const homeTeamName = translateCountryName(activeMatch?.homeTeam?.name || "Time da Casa");
const awayTeamName = translateCountryName(activeMatch?.awayTeam?.name || "Time Visitante");

    return (
        <>
            <header className="header">
                <div className="logo-container">
                    <img
                        src={`${process.env.PUBLIC_URL}/LOGO_GRANDE.png`}
                        alt="Logo AVSI"
                        className="logo clickable-image"
            onClick={() => setImageModal(`${process.env.PUBLIC_URL}/LOGO_GRANDE.png`)}
                    />
                </div>

                <div className="title-container">
                    <h1 className="main-title">
                        Copa do Mundo 2026
                        <span className="highlight">Brasil x AVSI</span>
                    </h1>
                </div>

                {/* QR CODE À DIREITA */}
                <div className="qrcode-container">
                    <img
                        src={`${process.env.PUBLIC_URL}/QRCode-Bola.gif`}
                        alt="QR Code Palpite AVSI"
                        className="qrcode clickable-image"
            onClick={() => setImageModal(`${process.env.PUBLIC_URL}/QRCode-Bola.gif`)}
                    />
                </div>
            </header>

            {/* MENU */}
<div className="menu">
    {/* ✅ Palpitão à ESQUERDA */}
    <div className="menu-item palpite-item">
        <span>🎯</span>
        <span>Palpitão AVSI - Dê seu Palpite clique aqui:</span>
        <a 
            href="https://forms.office.com/r/HY6qJPQzd6" 
            target="_blank" 
            rel="noopener noreferrer"
            className="palpite-link"
        >
            Clique Aqui
        </a>
    </div>

    {/* ✅ ESPAÇADOR - Empurra botões para direita */}
    <div className="menu-spacer"></div>

    {/* ✅ Botões à DIREITA */}
    <div className="menu-buttons-row">
        {/* Contador de Visitantes */}
        <div className="menu-item visitor-counter-item">
            <span className="visitor-label">Visitantes:</span>
            <img
                src="https://hits.sh/avsicopa.github.io.svg?label=%20&color=ff2bd6&labelColor=ff2bd6&style=for-the-badge"
                alt="Contador de Visitantes"
                className="visitor-count-img"
            />
        </div>

        {/* Botão Nossas Lojas */}
        <button
            className="menu-item contact-menu"
            onClick={() => setShowContact(true)}
            style={{ 
                background: 'none', 
                border: 'none', 
                cursor: 'pointer',
                color: 'white',
                fontWeight: 'bold'
            }}
        >
            <span>📞</span> Nossas Lojas
        </button>

        {/* Botão Atualizar */}
        <button
            className="menu-item"
            onClick={reload}
            disabled={loading}
            style={{ background: 'none', border: 'none', cursor: 'pointer' }}
        >
            {loading ? "⏳ Carregando..." : "🔄 Atualizar"}
        </button>
    </div>
</div>

            <div className="container">
                {/* SIDEBAR ESQUERDA - BRASIL */}
                <aside className="sidebar-left">
                    <h2 className="section-title">Brasil</h2>

                    {error && <div className="error-message">⚠️ {error}</div>}

                    {loading ? (
                        <div className="loading-message">Carregando...</div>
                    ) : leftSidebarMatches.length > 0 ? (
                        <div className="matches-list">
                            {leftSidebarMatches.map((match) => (
                                <MatchCard
                                    key={match.id}
                                    match={match}
                                    onClick={() => setActiveMatchId(match.id)}
                                    isActive={activeMatchId === match.id}
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="loading-message">Nenhum jogo para Brasil</div>
                    )}
                </aside>

                {/* ÁREA CENTRAL */}
                <main className="main-content">
                    {/* ✅ Indicador quando está rotacionando */}
                    {rotatingLiveMatches.length > 1 &&
 (!brazilLiveNow || brazilLiveNow.length === 0) && (
   <div className="rotation-indicator">
     🔄 Rotação automática
   </div>
)}
                    {activeMatch ? (
                        <div className="game-details">
                            {/* Times na mesma linha com vs. */}
                            
                        <div className="team-display-central">

  <div className={`team-side-central ${homeHighlightClass}`}>
    {homeTeamCrest && (
      <img
        src={homeTeamCrest}
        alt={`${homeTeamName} crest`}
        className="team-crest-central"
      />
    )}
    <span className="team-name-central">{homeTeamName}</span>
  </div>

  <span className="vs-text-central">vs.</span>

  <div className={`team-side-central ${awayHighlightClass}`}>
    <span className="team-name-central">{awayTeamName}</span>

    {awayTeamCrest && (
      <img
        src={awayTeamCrest}
        alt={`${awayTeamName} crest`}
        className="team-crest-central"
      />
    )}
  </div>


                            {/* Placar abaixo */}
<div className="game-score">
  {homeScore ?? "-"} x {awayScore ?? "-"}
</div>

</div>
                            {/* Resumo abaixo do placar */}
                            <div className="game-summary">
                                <h3>Resumo</h3>
                                <ul>
                                    <li>
                                        <strong>Status:</strong>{" "}
                                        <span
                                            className={
                                                isAdversaryHighlight(activeMatch)
                                                    ? "status-highlight status-highlight-adversary"
                                                    : "status-highlight"
                                            }
                                        >
                                            {getReadableMatchStatus(activeMatch)}
                                        </span>
                                    </li>
                                    <li>
                                        <strong>Estágio:</strong>{" "}
                                        {translateMatchStage(activeMatch.stage || "-")}
                                    </li>
                                    <li>
                                        <strong>Competição:</strong> Copa do Mundo 2026
                                    </li>
                                    <li>
                                        <strong>Data:</strong>{" "}
                                        {formatDate(activeMatch.utcDate)} às{" "}
                                        {formatTime(activeMatch.utcDate)}
                                    </li>
                                </ul>

                                {activeMatch.latestEvents?.length > 0 && (
                                    <>
                                        <h3>Últimos eventos</h3>
                                        <ul className="status-event-list">
                                            {activeMatch.latestEvents.map((event, index) => {
                                                const isOpponentEvent =
                                                    event.toLowerCase().includes("gol de ") &&
                                                    !event.toLowerCase().includes("gol de brasil");

                                                const isBrazilCard =
                                                    event.toLowerCase().includes("cartão") &&
                                                    event.toLowerCase().includes("para brasil");

                                                const isAdversaryEvent =
                                                    isOpponentEvent || isBrazilCard;

                                                return (
                                                    <li
                                                        key={`${activeMatch.id}-${index}`}
                                                        className={isAdversaryEvent ? "adversary-highlight" : ""}
                                                    >
                                                        {event}
                                                    </li>
                                                );
                                            })}
                                        </ul>
                                    </>
                                )}
                            </div>
                        </div>
                    ) : (
                        <div className="welcome-message">
                            <h2>Bem-vindo ao Painel da Copa! ⚽</h2>
                            <p>
                                Selecione um jogo nas colunas laterais para ver os detalhes,
                                ou aguarde o próximo jogo ao vivo.
                            </p>
                        </div>
                    )}
                </main>

                {/* SIDEBAR DIREITA - OUTROS PAÍSES */}
                <aside className="sidebar-right">
                    <h2 className="section-title">Outros Países</h2>

                    {loading ? (
                        <div className="loading-message">Carregando...</div>
                    ) : rightSidebarMatches.length > 0 ? (
                        <div className="matches-list">
                            {rightSidebarMatches.map((match) => (
                                <MatchCard
                                    key={match.id}
                                    match={match}
                                    onClick={() => setActiveMatchId(match.id)}
                                    isActive={activeMatchId === match.id}
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="loading-message">Nenhum outro jogo disponível</div>
                    )}
                </aside>
            </div>

            {/* CONTACT SECTION */}
            <ContactSection show={showContact} onClose={() => setShowContact(false)} />
        
        {/* MODAL DE IMAGEM */}
{imageModal && (
    <div className="image-modal" onClick={() => setImageModal(null)}>
        <div className="image-modal-content">
            <button className="close-btn" onClick={() => setImageModal(null)}>×</button>
            <img src={imageModal} alt="Visualização ampliada" />
        </div>
    </div>
)}

<footer className="footer-dev">
  Site desenvolvido por 🤓 Onitla SA 📞 63 98111-0357
</footer>

</>
    );
}

export default App;