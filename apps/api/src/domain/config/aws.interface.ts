export interface AWSS3Config {
  getAWSAccessKeyId(): string | undefined;
  getAWSEndpoint(): string | undefined;
  getAWSS3Bucket(): string | undefined;
  getAWSSecretAccessKey(): string | undefined;
}