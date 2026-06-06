import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { QdrantClient } from '@qdrant/js-client-rest';
import OpenAI from 'openai';

@Injectable()
export class RagService {
  private qdrantClient: QdrantClient;
  private openaiClient: OpenAI;

  constructor() {
    this.qdrantClient = new QdrantClient({
      url: process.env.QDRANT_URL || 'http://localhost:6333',
      apiKey: process.env.QDRANT_API_KEY,
    });

    const openaiApiKey = process.env.GITHUB_AI_API_KEY || process.env.OPENAI_API_KEY;
    if (openaiApiKey) {
      this.openaiClient = new OpenAI({
        apiKey: openaiApiKey,
        baseURL: process.env.GITHUB_AI_API_KEY ? 'https://models.github.ai/inference' : undefined,
      });
    }
  }

  async getCollegeNotices(query: string, limit: number = 3): Promise<any[]> {
    if (!this.openaiClient) {
      throw new InternalServerErrorException('OpenAI client not configured for embeddings.');
    }

    try {
      const isGithub = Boolean(process.env.GITHUB_AI_API_KEY);
      const embeddingModel = isGithub ? 'openai/text-embedding-3-small' : 'text-embedding-3-small'; 

      // 1. Generate Embedding for the query
      const embeddingResponse = await this.openaiClient.embeddings.create({
        model: embeddingModel,
        input: query,
      });
      const queryVector = embeddingResponse.data[0].embedding;

      // 2. Query Qdrant
      const searchResult = await this.qdrantClient.search('college_notices', {
        vector: queryVector,
        limit,
        with_payload: true,
      });

      // 3. Format Results
      return searchResult.map(res => ({
        id: res.id,
        score: res.score,
        ...(res.payload || {}),
      }));
    } catch (error) {
      console.error('Error fetching notices from Qdrant:', error);
      return [{ error: 'Could not fetch college notices at this time.' }];
    }
  }
}
