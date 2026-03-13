import { Module } from '@nestjs/common';
import { McpModule, McpTransportType } from '@rekog/mcp-nest';  // Değişti
import { HttpModule } from '@nestjs/axios';
import { HelloWorldTool } from './tools/hello-world.tool';
import { AnalyzeTool } from './tools/analyze.tool';

@Module({
  imports: [
    HttpModule.register({
      timeout: 5000,
      maxRedirects: 5,
    }),
    McpModule.forRoot({
      name: 'hello-world-agent',
      version: '1.0.0',
      transport: McpTransportType.STDIO,  // TEKİL, obje değil!
      instructions: 'Hello World uygulaması için MCP ajanı. Mesajları getir, gönder, analiz et.',
    }),
  ],
  providers: [HelloWorldTool, AnalyzeTool],
})
export class AppModule {}