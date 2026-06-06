import { Injectable } from '@nestjs/common';
import type { Response as ExpressResponse } from 'express';
import { AiOrchestrationService } from './ai-orchestration.service';
import { AiCalendarParserService } from './ai-calendar-parser.service';

/**
 * AiService — public façade
 *
 * This class is the single entry-point consumed by AiController (and any other
 * module that imports AiModule).  All heavy logic lives in the focused
 * sub-services; AiService just wires them together so the external interface
 * stays unchanged.
 *
 * Sub-service responsibilities:
 *   AiOrchestrationService  — agentic loop, SSE streaming, model routing, history truncation
 *   AiToolsService          — individual tool dispatch + data fetching
 *   AiCalendarParserService — Gemini-powered PDF → calendar events
 *   RagService              — Qdrant vector search for college notices
 */
@Injectable()
export class AiService {
  constructor(
    private readonly orchestration: AiOrchestrationService,
    private readonly calendarParser: AiCalendarParserService,
  ) {}

  /**
   * Handle an AI chat-completion request and stream the response as SSE.
   * Called by AiController.
   */
  getCompletion(body: any, res: ExpressResponse, userId?: string): Promise<void> {
    return this.orchestration.getCompletion(body, res, userId);
  }

  /**
   * Parse an academic calendar PDF (base64-encoded) using Gemini vision.
   * Called by AiController / AcademicCalendarModule.
   */
  parseAcademicCalendarPdf(pdfBase64: string): Promise<any[]> {
    return this.calendarParser.parseAcademicCalendarPdf(pdfBase64);
  }
}
