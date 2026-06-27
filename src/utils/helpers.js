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

// Dicionário de tradução de países
const COUNTRY_TRANSLATIONS = {
    // Europa
    "Germany": "Alemanha",
    "Spain": "Espanha",
    "France": "França",
    "England": "Inglaterra",
    "Italy": "Itália",
    "Portugal": "Portugal",
    "Netherlands": "Holanda",
    "Belgium": "Bélgica",
    "Croatia": "Croácia",
    "Denmark": "Dinamarca",
    "Switzerland": "Suíça",
    "Poland": "Polônia",
    "Austria": "Áustria",
    "Sweden": "Suécia",
    "Norway": "Noruega",
    "Serbia": "Sérvia",
    "Ukraine": "Ucrânia",
    "Czech Republic": "República Tcheca",
    "Turkey": "Turquia",
    "Russia": "Rússia",
    "Scotland": "Escócia",
    "Wales": "País de Gales",
    "Greece": "Grécia",
    "Romania": "Romênia",
    
    // Américas
    "Brazil": "Brasil",
    "Argentina": "Argentina",
    "Uruguay": "Uruguai",
    "Colombia": "Colômbia",
    "Chile": "Chile",
    "Peru": "Peru",
    "Ecuador": "Equador",
    "Paraguay": "Paraguai",
    "Venezuela": "Venezuela",
    "Bolivia": "Bolívia",
    "Mexico": "México",
    "United States": "Estados Unidos",
    "USA": "Estados Unidos",
    "Canada": "Canadá",
    "Costa Rica": "Costa Rica",
    "Jamaica": "Jamaica",
    "Panama": "Panamá",
    "Honduras": "Honduras",
    
    // África
    "Morocco": "Marrocos",
    "Senegal": "Senegal",
    "Tunisia": "Tunísia",
    "Nigeria": "Nigéria",
    "Cameroon": "Camarões",
    "Ghana": "Gana",
    "Egypt": "Egito",
    "Algeria": "Argélia",
    "South Africa": "África do Sul",
    "Ivory Coast": "Costa do Marfim",
    
    // Ásia
    "Japan": "Japão",
    "South Korea": "Coreia do Sul",
    "Iran": "Irã",
    "Saudi Arabia": "Arábia Saudita",
    "Australia": "Austrália",
    "Qatar": "Catar",
    "Iraq": "Iraque",
    "China": "China",
    
    // Outros
    "New Zealand": "Nova Zelândia",
    "Haiti": "Haiti",
};

// Dicionário de tradução de estágios
const STAGE_TRANSLATIONS = {
    "GROUP_STAGE": "Fase de Grupos",
    "LAST_16": "Oitavas de Final",
    "LAST_32": "Primeira Fase",
    "ROUND_OF_16": "Oitavas de Final",
    "QUARTER_FINALS": "Quartas de Final",
    "SEMI_FINALS": "Semifinais",
    "THIRD_PLACE": "Disputa de 3º Lugar",
    "FINAL": "Final",
    "QUALIFICATION": "Eliminatórias",
};

// Função para traduzir nome do país
export function translateCountryName(countryName) {
    if (!countryName) return "Time";
    return COUNTRY_TRANSLATIONS[countryName] || countryName;
}

// Função para traduzir estágio da competição
export function translateMatchStage(stage) {
    if (!stage || stage === "-") return "Não definido";
    return STAGE_TRANSLATIONS[stage] || stage;
}
