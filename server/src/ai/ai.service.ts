import { Injectable, InternalServerErrorException } from '@nestjs/common';
import OpenAI from 'openai';

@Injectable()
export class AiService {
  private client: OpenAI | null = null;

  constructor() {
    const apiKey = process.env.GITHUB_AI_API_KEY || process.env.OPENAI_API_KEY;
    if (apiKey) {
      this.client = new OpenAI({
        apiKey: apiKey,
        baseURL: process.env.GITHUB_AI_API_KEY ? "https://models.github.ai/inference" : undefined,
      });
    }
  }

  async getCompletion(body: any) {
    if (!this.client) {
      throw new InternalServerErrorException('AI API Key is not configured on the server.');
    }

    try {
      // Body can be direct ChatCompletionCreateParams
      const response = await this.client.chat.completions.create({
        ...body,
        model: body.model || "gpt-4o-mini",
      });

      return response;
    } catch (error) {
      throw new InternalServerErrorException(error.message || 'Failed to communicate with AI service');
    }
  }
}
