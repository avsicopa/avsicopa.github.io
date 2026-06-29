import { useEffect, useRef, useState } from "react";

const BRAZIL_TEAM_ID = 764;

function getScore(match) {
  const home = match?.score?.fullTime?.home;
  const away = match?.score?.fullTime?.away;
  if (typeof home !== "number" || typeof away !== "number") return null;
  return { home, away };
}

/**
 * Retorna:
 * - play: boolean (se deve tocar)
 * - scorerSide: "HOME" | "AWAY" | null (quem marcou)
 * - isBrazilGoal: boolean
 */
function diffScore(prev, next, match) {
  if (!prev || !next) return { play: false, scorerSide: null, isBrazilGoal: false };

  const homeScored = next.home > prev.home;
  const awayScored = next.away > prev.away;
  if (!homeScored && !awayScored) return { play: false, scorerSide: null, isBrazilGoal: false };

  // Em tese pode haver mais de 1 gol entre updates; aqui prioriza o lado que aumentou
  const scorerSide = homeScored ? "HOME" : "AWAY";

  const isBrazilHome = match?.homeTeam?.id === BRAZIL_TEAM_ID;
  const isBrazilAway = match?.awayTeam?.id === BRAZIL_TEAM_ID;

  const isBrazilGoal = (scorerSide === "HOME" && isBrazilHome) || (scorerSide === "AWAY" && isBrazilAway);

  return { play: true, scorerSide, isBrazilGoal };
}

/**
 * - Toca som apenas se o placar daquele match.id aumentou desde a última vez.
 * - Expõe um "highlight" de 15s para o App aplicar CSS.
 */
export function useGoalSound(activeMatch) {
  const lastScoreByMatchIdRef = useRef(new Map()); // matchId -> {home, away}

  const [goalHighlight, setGoalHighlight] = useState(null);
  // goalHighlight: { matchId, scorerSide: "HOME"|"AWAY", isBrazilGoal, until }

  const audioBrazilRef = useRef(null);
  const audioOtherRef = useRef(null);

  // cria audio 1x
  useEffect(() => {
    if (!audioBrazilRef.current) {
      audioBrazilRef.current = new Audio(`${process.env.PUBLIC_URL}/Gol-Brasil.mp3`);
      audioBrazilRef.current.volume = 0.8;
    }
    if (!audioOtherRef.current) {
      audioOtherRef.current = new Audio(`${process.env.PUBLIC_URL}/Gol-Advers.mp3`);
      audioOtherRef.current.volume = 0.8;
    }
  }, []);

  useEffect(() => {
    if (!activeMatch?.id) return;

    const matchId = activeMatch.id;
    const next = getScore(activeMatch);
    if (!next) return;

    const prev = lastScoreByMatchIdRef.current.get(matchId) || null;

    // Se é a primeira vez que vemos esse jogo, apenas registra e NÃO toca.
    if (!prev) {
      lastScoreByMatchIdRef.current.set(matchId, next);
      return;
    }

    const { play, scorerSide, isBrazilGoal } = diffScore(prev, next, activeMatch);

    // atualiza sempre o "último placar conhecido"
    lastScoreByMatchIdRef.current.set(matchId, next);

    if (!play) return;

    // toca som
    const audio = isBrazilGoal ? audioBrazilRef.current : audioOtherRef.current;
    audio?.play().catch(() => {
      // navegadores podem bloquear autoplay; sem spam de erro
    });

    // ativa highlight por 15s
    const until = Date.now() + 15000;
    setGoalHighlight({ matchId, scorerSide, isBrazilGoal, until });

    const t = setTimeout(() => {
      setGoalHighlight((cur) => {
        if (!cur) return null;
        if (cur.matchId !== matchId) return cur; // não apaga outro highlight
        return null;
      });
    }, 15000);

    return () => clearTimeout(t);
  }, [activeMatch]);

  return goalHighlight;
}