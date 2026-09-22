export interface Article {
  id: string;
  url: string;
  title: string;
  source: string;
  content: string;
  wordCount: number;
}

export interface Chunk {
  chunkId: string;
  articleId: string;
  articleTitle: string;
  articleUrl: string;
  source: string;
  content: string;
  chunkIndex: number;
}

export interface RetrievedChunk {
  chunk: Chunk;
  score: number;
}

export interface SourceReference {
  title: string;
  source: string;
  url: string;
}

export interface ResearchResult {
  id: string;
  question: string;
  answer: string;
  sources: SourceReference[];
  retrievedChunks: RetrievedChunk[];
  modelUsed: string;
  hasSufficientContext: boolean;
  timestamp: string;
}

export interface ProjectFile {
  path: string;
  name: string;
  content: string;
}
