export interface RedisConfig {
  getRedisCloudURL(): string | undefined;
  getRedisHost(): string | undefined;
  getRedisPassword(): string | undefined;
  getRedisPort(): number | undefined;
  getRedisUser(): string | undefined;
}