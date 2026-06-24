import { useCallback, useEffect, useMemo, useState } from "react";

const API_KEY = "53356cf4d2194f55b1f8bccccc45abe6";
const BRAZIL_TEAM_ID = 764;
const COMPETITION_CODE = "WC";
const SEASON = 2026;
const CORS_PROXY_URL = "https://corsproxy.io/?";

const LIVE_STATUSES = ["LIVE", "IN_PLAY", "PAUSED"];
const LIVE_DURATIONS = ["EXTRA_TIME", "PENALTY_SHOOTOUT"];
const NEXT_STATUSES = ["SCHEDULED", "TIMED"];

function isLiveMatch(match) {
    return (
        LIVE_STATUSES.includes(match.status) ||
        LIVE_DURATIONS.includes(match.score?.duration)
    );
}

function getLiveScoreFromGoals(match) {
    const goals = Array.isArray(match.goals) ? match.goals : [];
    const home = goals.filter((goal) => goal.team?.side === "HOME").length;
    const away = goals.filter((goal) => goal.team?.side === "AWAY").length;
    return { home, away };
}

// ✅ CORRIGIDO: Ordem de verificação correta
function getDetailedStatus(match) {
    if (!match) return "Aguardando";
    
    const duration = match.score?.duration;
    const status = match.status;
    
    // Verifica primeiro o status principal
    if (status === "FINISHED") return "✅ Finalizado";
    if (status === "SCHEDULED" || status === "TIMED") return "📅 Agendado";
    if (status === "POSTPONED") return "⏸️ Adiado";
    if (status === "CANCELED" || status === "CANCELLED") return "❌ Cancelado";
    
    // Status de jogo ao vivo
    if (status === "PAUSED") return "⏸️ Intervalo";
    if (status === "LIVE" || status === "IN_PLAY") {
        if (duration === "EXTRA_TIME") return "⏱️ Prorrogação";
        if (duration === "PENALTY_SHOOTOUT") return "🎯 Pênaltis";
        if (duration === "REGULAR") return "⚽ Em Jogo";
        return "🔴 Ao Vivo";
    }
    
    return status;
}

// ✅ Formatar eventos recentes
function getRecentEvents(match) {
    if (!match) return [];
    
    const events = [];
    const goals = Array.isArray(match.goals) ? match.goals : [];
    const bookings = Array.isArray(match.bookings) ? match.bookings : [];
    
    // Últimos 3 gols
    goals.slice(-3).reverse().forEach(goal => {
        const teamName = goal.team?.name || "Time";
        const playerName = goal.scorer?.name || "Jogador";
        const minute = goal.minute || "?";
        events.push(`⚽ Gol de ${teamName} - ${playerName} (${minute}')`);
    });
    
    // Últimos 3 cartões
    bookings.slice(-3).reverse().forEach(booking => {
        const teamName = booking.team?.name || "Time";
        const playerName = booking.player?.name || "Jogador";
        const minute = booking.minute || "?";
        const card = booking.card === "YELLOW_CARD" ? "🟨" : "🟥";
        events.push(`${card} Cartão para ${teamName} - ${playerName} (${minute}')`);
    });
    
    return events.slice(0, 5);
}

async function apiGet(url, signal) {
    // ✅REMOVIDO O CORS PROXY - Fazendo requisição direta:
    // const proxiedUrl = `${CORS_PROXY_URL}url=${encodeURIComponent(url)}&_=${Date.now()}&debug=1`;

    // ✅ USAR O CORS PROXY (necessário para evitar bloqueio CORS)
    const proxiedUrl = `${CORS_PROXY_URL}${encodeURIComponent(url)}`;

    const res = await fetch(proxiedUrl, {
        signal,
        cache: "no-store",
        headers: {
            "X-Auth-Token": API_KEY,
            "X-Unfold-Goals": "true",
            "X-Unfold-Bookings": "true",
            "X-Unfold-Subs": "true",
            "Cache-Control": "no-cache",
            Pragma: "no-cache",
        },
    });

    if (!res.ok) {
        const text = await res.text();
        throw new Error(`Erro ${res.status}: ${text}`);
    }

    return res.json();
}

function isBrazilMatch(match) {
    return (
        match.homeTeam?.id === BRAZIL_TEAM_ID ||
        match.awayTeam?.id === BRAZIL_TEAM_ID
    );
}

function sortAsc(a, b) {
    return new Date(a.utcDate) - new Date(b.utcDate);
}

function sortDesc(a, b) {
    return new Date(b.utcDate) - new Date(a.utcDate);
}

function mapMatch(match) {
    const isLive = isLiveMatch(match);
    const liveScore = isLive ? getLiveScoreFromGoals(match) : null;

    return {
        ...match,
        displayStatus: getDetailedStatus(match),
        liveScore,
        latestEvents: getRecentEvents(match), // ✅ Eventos formatados
    };
}

export function useBrazilWorldCup2026() {
    const [matches, setMatches] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const load = useCallback(async () => {
        const controller = new AbortController();

        try {
            setLoading(true);
            setError("");

            const url = `https://api.football-data.org/v4/competitions/${COMPETITION_CODE}/matches?season=${SEASON}&_=${Date.now()}`;
            const data = await apiGet(url, controller.signal);

            const allWorldCupMatches = (data.matches || [])
                .map(mapMatch)
                .sort(sortAsc);

            setMatches(allWorldCupMatches);
        } catch (err) {
            if (err.name !== "AbortError") {
                setError(err.message || "Erro ao carregar jogos.");
            }
        } finally {
            setLoading(false);
        }

        return () => controller.abort();
    }, []);

    useEffect(() => {
        load();
    }, [load]);

    // ✅ ATUALIZAÇÃO AUTOMÁTICA A CADA 30 SEGUNDOS
    useEffect(() => {
        const hasLive = matches.some(isLiveMatch);
        if (!hasLive) return;

        console.log("🔄 Atualização automática ativada (30s)");
        const interval = setInterval(load, 30000);
        return () => clearInterval(interval);
    }, [matches, load]);

    const brazilLiveNow = useMemo(() => {
        return matches.filter(isLiveMatch).filter(isBrazilMatch);
    }, [matches]);

    const brazilNextMatch = useMemo(() => {
        return (
            matches
                .filter((m) => NEXT_STATUSES.includes(m.status))
                .filter(isBrazilMatch)[0] || null
        );
    }, [matches]);

    const brazilPastResults = useMemo(() => {
        return matches
            .filter((m) => m.status === "FINISHED")
            .filter(isBrazilMatch)
            .sort(sortDesc);
    }, [matches]);

    const globalLiveNow = useMemo(() => {
        return matches.filter(isLiveMatch);
    }, [matches]);

    const globalNextMatch = useMemo(() => {
        return matches.filter((m) => NEXT_STATUSES.includes(m.status))[0] || null;
    }, [matches]);

    const otherMatches = useMemo(() => {
        return matches
            .filter((m) => !isBrazilMatch(m))
            .sort((a, b) => {
                const aIsLive = isLiveMatch(a);
                const bIsLive = isLiveMatch(b);
                if (aIsLive !== bIsLive) return bIsLive - aIsLive;
                return new Date(a.utcDate) - new Date(b.utcDate);
            });
    }, [matches]);

    const allMatches = useMemo(() => {
        return matches;
    }, [matches]);

    const reload = useCallback(() => {
        load();
    }, [load]);

    return {
        loading,
        error,
        brazilLiveNow: Array.isArray(brazilLiveNow) ? brazilLiveNow : [],
        brazilNextMatch: brazilNextMatch || null,
        brazilPastResults: Array.isArray(brazilPastResults) ? brazilPastResults : [],
        otherMatches: Array.isArray(otherMatches) ? otherMatches : [],
        globalLiveNow: Array.isArray(globalLiveNow) ? globalLiveNow : [],
        globalNextMatch: globalNextMatch || null,
        allMatches: Array.isArray(allMatches) ? allMatches : [],
        reload,
    };
}