import { type Socket, io } from "socket.io-client";
import { z } from "zod";

import { getPostsSocketUrl } from "../config";

const isoDateSchema = z.string().refine((value) => {
  const date = new Date(value);
  return !Number.isNaN(date.getTime()) && date.toISOString() === value;
});

const postsCreatedSchema = z
  .object({
    email: z.string().min(1),
    parentId: z.uuid().nullable(),
    postId: z.uuid(),
    publishDate: isoDateSchema,
    rootId: z.uuid().nullable(),
    userName: z.string().min(1),
  })
  .refine(
    (event) =>
      (event.parentId === null && event.rootId === null) ||
      (event.parentId !== null && event.rootId !== null),
  );

export type PostsCreatedEvent = z.infer<typeof postsCreatedSchema>;

export class PostsSocketClient {
  readonly #socket: Socket;

  public constructor(backendUrl: string) {
    this.#socket = io(getPostsSocketUrl(backendUrl), {
      autoConnect: false,
      withCredentials: true,
    });
  }

  public connect(): void {
    this.#socket.connect();
  }

  public disconnect(): void {
    this.#socket.disconnect();
  }

  public onCreated(listener: (event: PostsCreatedEvent) => void): () => void {
    const handleCreated = (payload: unknown): void => {
      const result = postsCreatedSchema.safeParse(payload);
      if (result.success) listener(result.data);
    };

    this.#socket.on("posts.created", handleCreated);
    return () => this.#socket.off("posts.created", handleCreated);
  }
}
