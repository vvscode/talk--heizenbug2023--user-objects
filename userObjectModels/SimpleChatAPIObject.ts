import { ChatUserObjectModel } from './ChatUserObjectModel';
import { sleep } from '../utils/sleep';
import axios from 'axios';

const FETCH_PERIOD_MS = 2000;

export class SimpleChatAPIObject implements ChatUserObjectModel {
  userId: string = '';

  private name: string;
  private timer: NodeJS.Timeout;

  private messages: {
    from: string;
    message: string;
  }[] = [];

  constructor(name: string) {
    this.name = name;
    this.timer = setInterval(this.fetchMessages, FETCH_PERIOD_MS);
  }

  login = async () => {};

  sendMessage = async (to: string, message: string) => {
    return await axios.post(
      'http://arkanis.de/projects/simple-chat/index.php',
      new URLSearchParams({
        name: this.name,
        content: message,
      }),
    );
  };

  fetchMessages = async () => {
    const response = await axios.get('http://arkanis.de/projects/simple-chat/messages.json');
    this.messages = response.data.map((el: any) => ({
      from: el.name,
      message: el.content,
    }));
  };

  checkMessages = async (mask: string) => {
    await sleep(FETCH_PERIOD_MS);
    return this.messages.map((el) => el.message).filter((el) => el.includes(mask));
  };

  getUserId = async () => this.name;

  kill = async () => {
    clearTimeout(this.timer);
  };
}
