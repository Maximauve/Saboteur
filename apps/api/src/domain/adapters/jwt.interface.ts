export interface IJwtServicePayload {
  username: string;
}

export interface IJwtService {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  checkToken(token: string): Promise<any>;
  createToken(payload: IJwtServicePayload, secret: string, expiresIn: string): string;
}
