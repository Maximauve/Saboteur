export interface DatabaseConfig {
  getDatabaseHost(): string | undefined;
  getDBDatabase(): string | undefined;
  getDBPassword(): string | undefined;
  getDBPort(): number | undefined;
  getDBSSL(): boolean | undefined;
  getDBUser(): string | undefined;
  getJwtSecret(): string | undefined;
}