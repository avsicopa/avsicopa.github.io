import React from "react";
import {
    formatDate,
    formatTime,
    getReadableMatchStatus,
    isAdversaryHighlight,
    translateCountryName,
} from "../utils/helpers";

function MatchCard({ match, onClick, isActive }) {
    if (!match) {
        return null;
    }

    const homeTeamName = translateCountryName(match.homeTeam?.name || "Time da Casa");
    const awayTeamName = translateCountryName(match.awayTeam?.name || "Time Visitante");

    const homeTeamCrest = match.homeTeam?.crest || "";
    const awayTeamCrest = match.awayTeam?.crest || "";

    const homeScore = match.score?.fullTime?.home;
    const awayScore = match.score?.fullTime?.away;

    const isLive =
        ["LIVE", "IN_PLAY", "PAUSED"].includes(match.status) ||
        ["EXTRA_TIME", "PENALTY_SHOOTOUT"].includes(match.score?.duration);

    const isUpcoming = ["SCHEDULED", "TIMED"].includes(match.status);
    const isFinished = match.status === "FINISHED";

    const statusText = getReadableMatchStatus(match);
    const isOpponentGood = isAdversaryHighlight(match);

    let statusClass = "other-status";

    if (isLive) {
        statusClass = "live";
    } else if (isUpcoming) {
        statusClass = "upcoming";
    } else if (isFinished) {
        statusClass = "finished";
    }

    return (
        <div
            className={`match-card ${statusClass} ${isActive ? "active" : ""}`}
            onClick={onClick}
        >
            <div className="match-teams-line">
                <div className="team-info">
                    {homeTeamCrest && (
                        <img
                            src={homeTeamCrest}
                            alt={`${homeTeamName} crest`}
                            className="team-crest"
                        />
                    )}
                    <span>{homeTeamName}</span>
                </div>

                <span className="score-info">
                    {homeScore ?? "-"} x {awayScore ?? "-"}
                </span>

                <div className="team-info">
                    <span>{awayTeamName}</span>
                    {awayTeamCrest && (
                        <img
                            src={awayTeamCrest}
                            alt={`${awayTeamName} crest`}
                            className="team-crest"
                        />
                    )}
                </div>
            </div>

            <div className="match-date-time-line">
                <span>{formatDate(match.utcDate)}</span>
                <span>às</span>
                <span>{formatTime(match.utcDate)}</span>
            </div>

            <span
                className={`match-status-badge ${statusClass} ${
                    isOpponentGood ? "adversary-highlight" : ""
                }`}
            >
                {statusText}
            </span>
        </div>
    );
}

export default MatchCard;