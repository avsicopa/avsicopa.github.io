export function getFlagEmoji(countryName) {
    const flags = {
        Brazil: "🇧🇷",
        Brasil: "🇧🇷",
        Morocco: "🇲🇦",
        Marrocos: "🇲🇦",
        Argentina: "🇦🇷",
        Germany: "🇩🇪",
        Alemanha: "🇩🇪",
        France: "🇫🇷",
        França: "🇫🇷",
        England: "🏴",
        Inglaterra: "🏴",
        Spain: "🇪🇸",
        Espanha: "🇪🇸",
        Portugal: "🇵🇹",
        Italy: "🇮🇹",
        Itália: "🇮🇹",
        Netherlands: "🇳🇱",
        Holanda: "🇳🇱",
        Belgium: "🇧🇪",
        Bélgica: "🇧🇪",
        Croatia: "🇭🇷",
        Croácia: "🇭🇷",
        Uruguay: "🇺🇾",
        México: "🇲🇽",
        Mexico: "🇲🇽",
        USA: "🇺🇸",
        EUA: "🇺🇸",
        Canada: "🇨🇦",
        Canadá: "🇨🇦",
        Scotland: "🏴",
        Haiti: "🇭🇹",
        Czechia: "🇨🇿",
        "South Africa": "🇿🇦",
        "South Korea": "🇰🇷",
        Ecuador: "🇪🇨",
        Curaçao: "🇨🇼",
        "Ivory Coast": "🇨🇮",
        Tunisia: "🇹🇳",
        Turkey: "🇹🇷",
        Japan: "🇯🇵",
        Sweden: "🇸🇪",
        Paraguay: "🇵🇾",
        Australia: "🇦🇺",
        Norway: "🇳🇴",
        Senegal: "🇸🇳",
        Iraq: "🇮🇶",
        Colombia: "🇨🇴",
        Panama: "🇵🇦",
        Ghana: "🇬🇭",
        "Congo DR": "🇨🇩",
        Uzbekistan: "🇺🇿",
    };

    return flags[countryName] || "🏳️";
}

export function formatDate(utcDateString) {
    const date = new Date(utcDateString);

    return date.toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
    });
}

export function formatTime(utcDateString) {
    const date = new Date(utcDateString);

    return date.toLocaleTimeString("pt-BR", {
        hour: "2-digit",
        minute: "2-digit",
    });
}

export function translateMatchStatus(status) {
    switch (status) {
        case "FINISHED":
            return "Finalizado";
        case "SCHEDULED":
            return "Agendado";
        case "TIMED":
            return "Programado";
        case "LIVE":
            return "Ao Vivo";
        case "IN_PLAY":
            return "Em Jogo";
        case "PAUSED":
            return "Intervalo";
        case "CANCELED":
        case "CANCELLED":
            return "Cancelado";
        case "POSTPONED":
            return "Adiado";
        default:
            return status || "-";
    }
}

/* Usa displayStatus quando existir, senão usa o status traduzido normal */
export function getReadableMatchStatus(match) {
    if (!match) return "-";

    return match.displayStatus || translateMatchStatus(match.status);
}

/* Define quando o status deve ficar vermelho por favorecer o adversário */
export function isAdversaryHighlight(match) {
    if (!match) return false;

    const texto = (match.displayStatus || "").toLowerCase();

    if (!texto) return false;

    if (texto.includes("gol de brasil")) return false;
    if (texto.includes("gol de ")) return true;

    if (texto.includes("cartão vermelho para brasil")) return true;
    if (texto.includes("cartão amarelo para brasil")) return true;

    if (texto.includes("cartão vermelho para ")) return false;
    if (texto.includes("cartão amarelo para ")) return false;

    return false;
}

export function translateMatchStage(stage) {
    switch (stage) {
        case "GROUP_STAGE":
            return "Fase de Grupos";
        case "ROUND_OF_16":
            return "Oitavas de Final";
        case "QUARTER_FINALS":
            return "Quartas de Final";
        case "SEMI_FINALS":
            return "Semifinais";
        case "FINAL":
            return "Final";
        default:
            return stage || "-";
    }
}

/* Traduz alguns nomes de países mostrados na interface */
export function translateCountryName(name) {
    switch (name) {
        case "Brazil":
            return "Brasil";
        case "Morocco":
            return "Marrocos";
        case "Haiti":
            return "Haiti";
        default:
            return name;
    }
}