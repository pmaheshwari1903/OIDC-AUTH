export const OIDC_SCOPES = {
    openid: [],
    profile: ["given_name", "family_name", "picture"],
    email: ["email"],
    location: ["city", "state", "country", "locale"],
    interests: ["interests"],
} as const;

export type SupportedScope = keyof typeof OIDC_SCOPES;
export const SUPPORTED_SCOPES = Object.keys(OIDC_SCOPES) as SupportedScope[];

export const isValidScope = (scope: string): boolean => {
    return SUPPORTED_SCOPES.includes(scope as SupportedScope);
};

export const getClaimsForScopes = (scopes: string[]): string[] => {
    const claims = new Set<string>();
    for (const scope of scopes) {
        if (isValidScope(scope)) {
            const scopeClaims = OIDC_SCOPES[scope as SupportedScope];
            scopeClaims.forEach(claim => claims.add(claim));
        }
    }
    return Array.from(claims);
};

export const SUPPORTED_CLAIMS = getClaimsForScopes(SUPPORTED_SCOPES);

export const SUPPORTED_PURPOSES = [
    "authentication",
    "personalization",
    "recommendations",
    "analytics",
    "marketing",
    "advertising"
] as const;

export type SupportedPurpose = typeof SUPPORTED_PURPOSES[number];
