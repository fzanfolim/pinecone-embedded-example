import { Injectable } from '@nestjs/common';
import { PineconeClient } from '@pinecone-database/pinecone';

@Injectable()
export class PineconeService {
  private pinecone;
  constructor() {
    console.log(process.env.PINECONE_API_KEY);

    this.pinecone = new PineconeClient();
    this.pinecone.init({
      environment: 'asia-southeast1-gcp-free',
      apiKey: process.env.PINECONE_API_KEY,
    });

    // this.pinecone = new PineconeClient({
    //   apiKey: process.env.PINECONE_API_KEY,
    //   baseUrl: process.env.PINECONE_BASE_URL,
    //   namespace: process.env.PINECONE_NAMESPACE,
    // });
  }

  async upsert(vectors) {
    // return this.pinecone.upsert({
    //   vectors: [vectors],
    // });

    const index = this.pinecone.Index(process.env.PINECONE_NAMESPACE);
    const upsertRequest = {
      vectors: [vectors],
    };
    return index.upsert({ upsertRequest });
  }

  // async query(vector) {
  //   const { matches } = await this.pinecone.query({
  //     vector,
  //     topK: 10,
  //     includeMetadata: true,
  //     includeValues: false,
  //   });

  //   return matches
  //     .filter((match) => match.score > 0.8)
  //     .map((match) => parseInt(match.id));
  // }

  async query(vector) {
    const index = this.pinecone.Index(process.env.PINECONE_NAMESPACE);
    const queryRequest = {
      vector,
      topK: 10,
      includeValues: false,
      includeMetadata: true,
    };
    const { matches } = await index.query({ queryRequest });
    return matches
      .filter((match) => match.score > 0.8)
      .map((match) => parseInt(match.id));
  }
}
