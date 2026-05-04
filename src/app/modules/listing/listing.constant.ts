export enum LISTING_TYPE {
    SALE = "SALE",
    RENT = "RENT",
}

export enum PROPERTY_TYPE {
    DETACHED = "DETACHED",
    SEMI = "SEMI",
    TERRACED = "TERRACED",
    BANGLOW = "BANGLOW",
    FLAT = "FLAT",
    PARK_HOME = "PARK_HOME",
}

export enum TENURE {
    FREEHOLD = "FREEHOLD",
    LEASEHOLD = "LEASEHOLD",
    SHARE_OF_FREEHOLD = "SHARE_OF_FREEHOLD",
}

export enum COUNCIL_TAX_BAND {
    A = "A",
    B = "B",
    C = "C",
    D = "D",
    E = "E",
    F = "F",
    G = "G",
    H = "H",
}

export const EPIC_ENERGY_RATING = {
    A: { label: "A", score: "92+" },
    B: { label: "B", score: "81 - 91" },
    C: { label: "C", score: "69 - 80" },
    D: { label: "D", score: "55 - 68" },
    E: { label: "E", score: "39 - 54" },
    F: { label: "F", score: "21 - 38" },
    G: { label: "G", score: "1 - 20" },
} as const;

export enum FEATURES {
    GARDEN = "GARDEN",
    PARKING = "PARKING",
    NEW_BUILD = "NEW_BUILD",
    CHAIN_FEE = "CHAIN_FEE",
    SWIMMING_POOL = "SWIMMING_POOL",
    GYM = "GYM",
    CONCIERGE = "CONCIERGE",
    BALCONY = "BALCONY",
    TERRACE = "TERRACE",
    LIFT = "LIFT",
    FITTED_KITCHEN = "FITTED_KITCHEN",
    UNDER_FLOOR_HEATING = "UNDER_FLOOR_HEATING",
    SOLAR_PANELS = "SOLAR_PANELS",
    OFF_STREET_PARKING = "OFF_STREET_PARKING",
    DRIVEWAY = "DRIVEWAY",
    ALARM_SYSTEM = "ALARM_SYSTEM",
}
