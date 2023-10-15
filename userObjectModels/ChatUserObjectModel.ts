export interface ChatUserObjectModel {
  userId: any;

  login(): Promise<unknown>;

  sendMessage(toId: ChatUserObjectModel['userId'], message: string): Promise<unknown>;

  checkMessages(mask: string): Promise<string[]>;

  getUserId(): Promise<ChatUserObjectModel['userId']>;

  // technical method
  kill(): Promise<unknown>;
}

export type ChatUserObjectModelConstructor = new <T>(name: string) => ChatUserObjectModel;
