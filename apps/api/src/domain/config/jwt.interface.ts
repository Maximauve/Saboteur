export interface JWTConfig {
  getJwtSecret(): string | undefined;
}