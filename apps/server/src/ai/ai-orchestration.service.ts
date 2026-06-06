import { Injectable, ServiceUnavailableException } from '@nestjs/common';
import OpenAI from 'openai';
import type { Response as ExpressResponse } from 'express';
import { TOOL_DEFINITIONS } from './ai-tools.registry';
import { AiToolsService } from './ai-tools.service';

/**
 * Maximum number of non-system messages kept in the context window per request.
 * System prompts are always preserved; only the trailing MAX_HISTORY
 * conversational turns are forwarded to the model.
 */
const MAX_HISTORY_MESSAGES = 20;

/**
 * AiOrchestrationService
 *
 * Owns:
 *  - OpenAI client initialisation & model routing (OpenAI / GitHub Models)
 *  - Message-history truncation
 *  - The agentic tool-call loop
 *  - SSE streaming of the final answer to the frontend
 *
 * Delegates all individual tool execution to AiToolsService.
 */
@Injectable()
export class AiOrchestrationService {
  private openaiClient: OpenAI | null = null;
  private readonly isGithubModelsProvider: boolean;

  constructor(private readonly toolsService: AiToolsService) {
    this.isGithubModelsProvider = Boolean(
      process.env.GITHUB_AI_API_KEY || process.env.GITHUB_TOKEN,
    );

    const openaiApiKey =
      process.env.GITHUB_AI_API_KEY ||
      process.env.GITHUB_TOKEN ||
      process.env.OPENAI_API_KEY;

    if (openaiApiKey) {
      this.openaiClient = new OpenAI({
        apiKey: openaiApiKey,
        baseURL: this.isGithubModelsProvider
          ? 'https://models.github.ai/inference'
          : undefined,
      });
    }
  }

  // ── Public API ─────────────────────────────────────────────────────────────

  async getCompletion(
    body: any,
    res: ExpressResponse,
    userId?: string,
  ): Promise<void> {
    if (!this.openaiClient) {
      throw new ServiceUnavailableException(
        'AI provider is not configured on the server.',
      );
    }

    try {
      const resolvedModel = this.resolveModel(body?.model);

      // ── 1. Truncate history to keep context manageable ─────────────────
      const messages = this.truncateHistory([...(body.messages ?? [])]);

      // ── 2. First LLM call — let the model pick tools ───────────────────
      let response = await this.openaiClient.chat.completions.create({
        ...body,
        model: resolvedModel,
        messages,
        tools: TOOL_DEFINITIONS as any,
        tool_choice: 'auto',
        stream: false,
      });

      let responseMessage = response.choices[0].message;

      // ── 3. Agentic loop — resolve all tool calls ───────────────────────
      while (responseMessage.tool_calls && responseMessage.tool_calls.length > 0) {
        messages.push(responseMessage);

        for (const toolCall of responseMessage.tool_calls) {
          if (toolCall.type !== 'function') continue;

          const toolName = toolCall.function.name;
          const toolArgs = JSON.parse(toolCall.function.arguments || '{}');

          // Notify frontend which tool is running
          res.write(`data: ${JSON.stringify({ tool: toolName })}\n\n`);

          const { functionResult, sseEvents } = await this.toolsService.dispatch(
            toolName,
            toolArgs,
            userId,
          );

          // Emit any side-effect SSE events (e.g. gradesData, navigate)
          if (sseEvents) {
            for (const event of sseEvents) {
              res.write(`data: ${JSON.stringify(event)}\n\n`);
            }
          }

          messages.push({
            tool_call_id: toolCall.id,
            role: 'tool',
            name: toolName,
            content: functionResult,
          } as any);
        }

        // Next LLM call — may trigger more tools or produce final answer
        response = await this.openaiClient.chat.completions.create({
          ...body,
          model: resolvedModel,
          messages,
          tools: TOOL_DEFINITIONS as any,
          tool_choice: 'auto',
          stream: false,
        });
        responseMessage = response.choices[0].message;
      }

      // ── 4. Stream the final answer ─────────────────────────────────────
      const finalContent = responseMessage.content ?? '';

      if (finalContent.trim()) {
        res.write(`data: ${JSON.stringify({ text: finalContent })}\n\n`);
      } else {
        // Fallback: no cached content — make a real streaming call
        const stream = await this.openaiClient.chat.completions.create({
          ...body,
          model: resolvedModel,
          messages,
          stream: true,
          tools: undefined,
          tool_choice: undefined,
        });
        for await (const chunk of stream as any) {
          const content = chunk.choices[0]?.delta?.content ?? '';
          if (content) {
            res.write(`data: ${JSON.stringify({ text: content })}\n\n`);
          }
        }
      }

      res.write('data: [DONE]\n\n');
      res.end();
    } catch (error) {
      console.error('[AI] Error:', error);
      res.write(
        `data: ${JSON.stringify({ error: error.message || 'AI request failed' })}\n\n`,
      );
      res.write('data: [DONE]\n\n');
      res.end();
    }
  }

  // ── Private helpers ────────────────────────────────────────────────────────

  /**
   * Keeps the system prompt(s) intact and trims the conversational turns to the
   * trailing MAX_HISTORY_MESSAGES entries.  This prevents unbounded token growth
   * for long chat sessions.
   */
  private truncateHistory(messages: any[]): any[] {
    const system = messages.filter((m) => m.role === 'system');
    const rest = messages.filter((m) => m.role !== 'system');
    const recent = rest.slice(-MAX_HISTORY_MESSAGES);
    return [...system, ...recent];
  }

  /**
   * Resolves the model string, adding the "openai/" prefix required by the
   * GitHub Models inference endpoint when needed.
   */
  private resolveModel(requestedModel?: string): string {
    const base =
      typeof requestedModel === 'string' && requestedModel.trim().length > 0
        ? requestedModel.trim()
        : this.isGithubModelsProvider
          ? 'openai/gpt-4o-mini'
          : 'gpt-4o-mini';

    if (this.isGithubModelsProvider && !base.includes('/')) {
      return `openai/${base}`;
    }
    return base;
  }
}
