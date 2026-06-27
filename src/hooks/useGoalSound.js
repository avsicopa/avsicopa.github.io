import { useEffect, useRef } from 'react';

const BRAZIL_TEAM_ID = 764;

export function useGoalSound(activeMatch) {
    const previousScoreRef = useRef(null);
    const audioRefBrazil = useRef(null);
    const audioRefAdversary = useRef(null);

    useEffect(() => {
        // Cria elementos de áudio se não existirem
        if (!audioRefBrazil.current) {
            audioRefBrazil.current = new Audio(`${process.env.PUBLIC_URL}/Gol-Brasil.mp3`);
            audioRefBrazil.current.volume = 0.7;
        }
        if (!audioRefAdversary.current) {
            audioRefAdversary.current = new Audio(`${process.env.PUBLIC_URL}/Gol-Advers.mp3`);
            audioRefAdversary.current.volume = 0.7;
        }
    }, []);

    useEffect(() => {
        if (!activeMatch) return;

        const currentHomeScore = activeMatch.score?.fullTime?.home;
        const currentAwayScore = activeMatch.score?.fullTime?.away;

        // Se não tem placar ainda, não faz nada
        if (currentHomeScore === undefined || currentAwayScore === undefined) return;

        // Primeira vez que carrega, salva o placar mas não toca som
        if (!previousScoreRef.current) {
            previousScoreRef.current = {
                home: currentHomeScore,
                away: currentAwayScore,
            };
            return;
        }

        const previousHome = previousScoreRef.current.home;
        const previousAway = previousScoreRef.current.away;

        // Verifica se houve mudança no placar
        const homeScored = currentHomeScore > previousHome;
        const awayScored = currentAwayScore > previousAway;

        if (homeScored || awayScored) {
            const isBrazilHome = activeMatch.homeTeam?.id === BRAZIL_TEAM_ID;
            const isBrazilAway = activeMatch.awayTeam?.id === BRAZIL_TEAM_ID;

            // Brasil fez gol
            if ((isBrazilHome && homeScored) || (isBrazilAway && awayScored)) {
                console.log('🎉 GOL DO BRASIL!');
                audioRefBrazil.current?.play().catch(err => console.error('Erro ao tocar som:', err));
            }
            // Adversário fez gol
            else if (homeScored || awayScored) {
                console.log('😔 Gol do adversário');
                audioRefAdversary.current?.play().catch(err => console.error('Erro ao tocar som:', err));
            }

            // Atualiza o placar anterior
            previousScoreRef.current = {
                home: currentHomeScore,
                away: currentAwayScore,
            };
        }
    }, [activeMatch]);
}