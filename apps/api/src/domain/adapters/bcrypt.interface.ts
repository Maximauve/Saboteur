export interface IBcryptService {
  compare(password: string, hashPassword: string): Promise<boolean>;
  hash(hashString: string): Promise<string>;
}
