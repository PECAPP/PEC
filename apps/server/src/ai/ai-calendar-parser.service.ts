import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { GenerativeModel, GoogleGenerativeAI } from '@google/generative-ai';

/**
 * AiCalendarParserService
 *
 * Uses Google Gemini to parse a base64-encoded academic-calendar PDF and
 * return a structured array of calendar events.  Extracted from AiService to
 * give it a single, focused responsibility.
 */
@Injectable()
export class AiCalendarParserService {
  private geminiModel: GenerativeModel | null = null;

  constructor() {
    const geminiApiKey = process.env.GEMINI_API_KEY;
    if (geminiApiKey) {
      const genAI = new GoogleGenerativeAI(geminiApiKey);
      this.geminiModel = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
    }
  }

  async parseAcademicCalendarPdf(pdfBase64: string): Promise<any[]> {
    if (!this.geminiModel) {
      throw new InternalServerErrorException('Gemini API key is not configured.');
    }

    try {
      const pdfBuffer = Buffer.from(pdfBase64, 'base64');

      const prompt = `You are an expert at extracting academic calendar information from PDF documents. Analyze this academic calendar PDF and extract ALL events, holidays, exam schedules, and important dates.

Return ONLY a valid JSON array with the following structure for each event:
[
  {
    "title": "Event name/title",
    "description": "Detailed description of the event",
    "date": "YYYY-MM-DD format",
    "endDate": "YYYY-MM-DD format or null if single day",
    "startTime": "HH:MM or null if not specified",
    "endTime": "HH:MM or null if not specified",
    "eventType": "one of: holiday|exam|event|deadline|working-day|orientation|registration|result|recess",
    "category": "broader category like: academic|examination|holiday|administrative|cultural|sports|technical",
    "location": "venue or null if not specified",
    "importance": "one of: high|medium|low",
    "targetAudience": "who it applies to: all|students|faculty|specific-department or null"
  }
]

Rules:
1. Extract EVERY event and date mentioned in the calendar
2. Use the current academic year context (2025-2026) if years are not explicitly mentioned
3. For date ranges, create separate start and end dates
4. For recurring events, create individual entries
5. If a date is ambiguous, make your best guess based on context
6. Return ONLY the JSON array, no markdown formatting, no explanations
7. If no date is found for an event, skip it
8. Parse tables carefully - they often contain exam schedules`;

      const result = await this.geminiModel.generateContent([
        prompt,
        {
          inlineData: {
            data: pdfBuffer.toString('base64'),
            mimeType: 'application/pdf',
          },
        },
      ]);

      const response = await result.response;
      let text = response.text();

      // Strip any markdown code fences the model may add
      text = text.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim();

      const jsonMatch = text.match(/\[[\s\S]*\]/);
      if (!jsonMatch) {
        throw new Error('Could not parse calendar events from AI response');
      }

      return JSON.parse(jsonMatch[0]);
    } catch (error) {
      throw new InternalServerErrorException(
        error.message || 'Failed to parse academic calendar PDF',
      );
    }
  }
}
