export const tokenCookieKey = "token-session";
export const userCookieKey = "user-session";

// Separate cookies for the peserta portal. Sharing the staff keys would let a
// peserta session satisfy the backoffice layout's guard — every API call would
// then 401, but the shell would still render, which is a confusing lie.
export const portalTokenCookieKey = "portal-token-session";
export const portalPesertaCookieKey = "portal-peserta-session";
