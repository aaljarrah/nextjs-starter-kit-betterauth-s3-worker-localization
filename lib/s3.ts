import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand, ListObjectsV2Command } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'

class S3StorageClient {
  private client: S3Client
  private bucketName: string

  constructor() {
    const endpoint = process.env.S3_ENDPOINT && process.env.S3_ENDPOINT.trim().length > 0
      ? process.env.S3_ENDPOINT
      : undefined

    const region = process.env.S3_REGION || 'us-east-1'
    const forcePathStyle = (process.env.S3_FORCE_PATH_STYLE || 'false').toLowerCase() === 'true'

    this.client = new S3Client({
      region,
      endpoint,
      forcePathStyle,
      credentials: process.env.S3_ACCESS_KEY_ID && process.env.S3_SECRET_ACCESS_KEY ? {
        accessKeyId: process.env.S3_ACCESS_KEY_ID,
        secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
      } : undefined,
    })

    this.bucketName = process.env.S3_BUCKET || 'uploads'
  }

  async uploadFile(fileName: string, fileBuffer: Buffer, contentType?: string): Promise<string> {
    await this.client.send(new PutObjectCommand({
      Bucket: this.bucketName,
      Key: fileName,
      Body: fileBuffer,
      ContentType: contentType,
    }))
    return fileName
  }

  async downloadFile(fileName: string): Promise<Buffer> {
    const response = await this.client.send(new GetObjectCommand({
      Bucket: this.bucketName,
      Key: fileName,
    }))
    const stream = response.Body as unknown as NodeJS.ReadableStream
    const chunks: Buffer[] = []

    return new Promise((resolve, reject) => {
      stream.on('data', (chunk) => chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk)))
      stream.on('end', () => resolve(Buffer.concat(chunks)))
      stream.on('error', reject)
    })
  }

  async deleteFile(fileName: string): Promise<void> {
    await this.client.send(new DeleteObjectCommand({
      Bucket: this.bucketName,
      Key: fileName,
    }))
  }

  async listFiles(prefix?: string): Promise<string[]> {
    const result = await this.client.send(new ListObjectsV2Command({
      Bucket: this.bucketName,
      Prefix: prefix,
    }))
    return (result.Contents || []).map((o) => o.Key!).filter(Boolean)
  }

  async getFileUrl(fileName: string, expirySeconds?: number): Promise<string> {
    const signedUrlExpiry = Number(process.env.S3_SIGNED_URL_EXPIRY_SECONDS || '604800')
    const expiresIn = expirySeconds ?? signedUrlExpiry
    const command = new GetObjectCommand({
      Bucket: this.bucketName,
      Key: fileName,
    })
    return await getSignedUrl(this.client, command, { expiresIn })
  }

  getClient(): S3Client {
    return this.client
  }
}

const s3StorageClient = new S3StorageClient()

export { s3StorageClient, S3StorageClient }


