import { Injectable } from '@nestjs/common';
import { Tool } from '@rekog/mcp-nest';
import type { Context } from '@rekog/mcp-nest';  // <-- import TYPE olarak değişti
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { z } from 'zod';

@Injectable()
export class HelloWorldTool {
  constructor(private readonly httpService: HttpService) {}

  @Tool({
    name: 'get_recent_messages',
    description: 'Son mesajları getir. Kullanıcı son konuşmaları görmek istediğinde bunu kullan.',
    parameters: z.object({
      limit: z.number().min(1).max(50).default(10).describe('Kaç mesaj getirileceği')
    })
  })
  async getRecentMessages({ limit }: { limit: number }, context: Context) {
    try {
      const response = await firstValueFrom(
        this.httpService.get(`http://api:8000/api/messages?limit=${limit}`)
      );
      
      return {
        content: [{
          type: 'text',
          text: JSON.stringify(response.data, null, 2)
        }]
      };
    } catch (error) {
      return {
        content: [{
          type: 'text',
          text: `❌ Mesajlar alınamadı: ${error.message}`
        }],
        isError: true
      };
    }
  }

  @Tool({
    name: 'send_hello_message',
    description: 'Yeni bir Hello World mesajı gönder.',
    parameters: z.object({
      custom_message: z.string().optional().default('Hello World').describe('Özel mesaj içeriği')
    })
  })
  async sendMessage({ custom_message }: { custom_message: string }, context: Context) {
    try {
      const response = await firstValueFrom(
        this.httpService.post('http://api:8000/api/messages', { 
          content: custom_message 
        })
      );
      
      return {
        content: [{
          type: 'text',
          text: `✅ Mesaj gönderildi: ${response.data.content} (ID: ${response.data.id})`
        }]
      };
    } catch (error) {
      return {
        content: [{
          type: 'text',
          text: `❌ Mesaj gönderilemedi: ${error.message}`
        }],
        isError: true
      };
    }
  }
}