import { Body, Controller, Post } from '@nestjs/common';
import { MessagesService } from './messages.service';
import { OpenaiService } from './openai/openai.service';
import { PineconeService } from './pinecone/pinecone.service';

@Controller('messages')
export class MessagesController {
  constructor(
    private readonly messagesService: MessagesService,
    private readonly openaiService: OpenaiService,
    private readonly pineconeService: PineconeService,
  ) {}

  @Post()
  async createMessage(@Body() data: { message: string }) {
    const { id, created } = await this.messagesService.createMessage(
      data.message,
    );
    const embed = await this.openaiService.createEmbedding(data.message);
    const matches = await this.pineconeService.query(embed.data[0].embedding);
    const context = await this.messagesService.getContext(matches);
    console.log('createMessage', id, created);
    // console.log('embed', embed);
    console.log('matches - Econtrou no pinecone: ', matches);
    console.log('context - Contexto:', context);
    if (created) {
      console.log('created - Criando no pinecone: ', id);
      await this.pineconeService.upsert({
        id: id.toString(),
        values: embed.data[0].embedding,
      });
    }

    return this.openaiService.createCompletion(data.message, context);
  }
}
