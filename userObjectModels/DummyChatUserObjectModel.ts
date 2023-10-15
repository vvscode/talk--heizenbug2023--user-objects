import { ChatUserObjectModel } from './ChatUserObjectModel';

export class DummyChatUserObjectModel implements ChatUserObjectModel {
  userId: string;

  private name: string;
  constructor(name: string) {
    this.name = name;
  }

  login = async () => {};

  sendMessage = async (to: string, message: string) => {};

  checkMessages = async (mask: string) => [mask];

  getUserId = async () => this.name;

  kill = async () => {};
}
