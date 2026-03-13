import { Injectable } from '@nestjs/common';
import { Tool } from '@rekog/mcp-nest';
import type { Context } from '@rekog/mcp-nest';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { z } from 'zod';

@Injectable()
export class AnalyzeTool {
  constructor(private readonly httpService: HttpService) {}

  @Tool({
    name: 'analyze_messages',
    description: 'Mesajları analiz et: kaç mesaj var, en son ne zaman gönderilmiş, saatlik dağılım.',
    parameters: z.object({})
  })
  async analyzeMessages(context: Context) {
    try {
      const response = await firstValueFrom(
        this.httpService.get('http://api:8000/api/messages?limit=100')
      );
      const messages = response.data;

      if (!messages || messages.length === 0) {
        return {
          content: [{ type: 'text', text: 'Henüz hiç mesaj yok.' }]
        };
      }

      const total = messages.length;
      const lastMsg = messages[0]?.timestamp;
      
      const hours = messages.map(m => new Date(m.timestamp).getHours());
      const hourCounts = hours.reduce((acc, h) => {
        acc[h] = (acc[h] || 0) + 1;
        return acc;
      }, {});
      
      const peakHour = Object.entries(hourCounts)
        .sort((a, b) => (b[1] as number) - (a[1] as number))[0];

      const avgLength = messages.reduce((sum, m) => sum + m.content.length, 0) / total;

      const analysis = `
📊 Mesaj Analizi:
- Toplam mesaj: ${total}
- Son mesaj: ${lastMsg}
- En yoğun saat: ${peakHour?.[0]}:00 (${peakHour?.[1]} mesaj)
- Ortalama mesaj uzunluğu: ${avgLength.toFixed(1)} karakter
      `;

      return {
        content: [{ type: 'text', text: analysis }]
      };
    } catch (error) {
      return {
        content: [{ type: 'text', text: `❌ Analiz yapılamadı: ${error.message}` }],
        isError: true
      };
    }
  }

  @Tool({
    name: 'search_messages',
    description: 'Mesajlarda kelime ara.',
    parameters: z.object({
      keyword: z.string().min(1).describe('Aranacak kelime')
    })
  })
  async searchMessages({ keyword }: { keyword: string }, context: Context) {
    try {
      const response = await firstValueFrom(
        this.httpService.get('http://api:8000/api/messages?limit=100')
      );
      const allMessages = response.data;

      const found = allMessages.filter(m => 
        m.content.toLowerCase().includes(keyword.toLowerCase())
      );

      if (found.length === 0) {
        return {
          content: [{ type: 'text', text: `'${keyword}' ile eşleşen mesaj bulunamadı.` }]
        };
      }

      let result = `🔍 '${keyword}' için ${found.length} sonuç:\n`;
      found.slice(0, 5).forEach(m => {
        result += `- ${m.timestamp}: ${m.content}\n`;
      });
      
      if (found.length > 5) {
        result += `... ve ${found.length - 5} mesaj daha`;
      }

      return {
        content: [{ type: 'text', text: result }]
      };
    } catch (error) {
      return {
        content: [{ type: 'text', text: `❌ Arama yapılamadı: ${error.message}` }],
        isError: true
      };
    }
  }
}