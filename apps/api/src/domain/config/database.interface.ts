export interface DatabaseConfig {
  getDatabaseHost(): string;
  getDatabaseName(): string;
  getDatabasePassword(): string;
  getDatabasePort(): number;
  getDatabaseSchema(): string;
  getDatabaseSync(): boolean;
  getDatabaseUser(): string;
}
