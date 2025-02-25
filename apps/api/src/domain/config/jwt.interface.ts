export interface JWTConfig {
  getJwtExpirationTime(): string;
  getJwtRefreshExpirationTime(): string;
  getJwtRefreshSecret(): string;
  getJwtSecret(): string;
}
