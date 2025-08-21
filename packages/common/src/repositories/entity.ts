export type Entity = {
  id: string;
  createdAt?: Date;
  updatedAt?: Date;
};

export type EntityWithEmbedding = Entity & {
  embedding?: number[];
};
