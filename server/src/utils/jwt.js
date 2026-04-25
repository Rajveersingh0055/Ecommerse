export const getJwtSecret = () => process.env.JWT_SECRET || "fallback_secret";
