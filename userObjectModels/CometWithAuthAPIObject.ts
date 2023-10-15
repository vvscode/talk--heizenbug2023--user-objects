import axios, { AxiosInstance } from 'axios';
import { ChatUserObjectModel } from './ChatUserObjectModel';
import { wrapper } from 'axios-cookiejar-support';
import { CookieJar } from 'tough-cookie';
import WS from 'ws';
import { sleep } from '../utils/sleep';
import { mtrim } from '../utils/mtrim';

const COMET_AUTH_PASSWORD = 'qwerty';

const crypto: any = (global as any).crypto;

export class CometWithAuthAPIObject implements ChatUserObjectModel {
  userId: string = '';

  private client: AxiosInstance;
  private name: string;
  private hash: string = '';
  private ws?: WS;
  private messages: {
    message: string;
  }[] = [];
  constructor(name: string) {
    this.name = name;
    const jar = new CookieJar();
    this.client = wrapper(
      axios.create({
        jar,
        withCredentials: true,
      }),
    );
  }

  login = async () => {
    return this.client
      .get(`https://comet-server.com/doc/example/5/?login=${this.name}&pass=${COMET_AUTH_PASSWORD}`)
      .then((response) => {
        const match = response.data.match(/INSERT INTO users_auth \(id, hash\)VALUES \((\d+), '(.+)'\)/);
        this.userId = match[1];
        this.hash = match[2];
      })
      .then(() => this.client.get('https://comet-server.com/doc/example/5/')) // ??
      .then(this.initialiseWs);
  };

  private initialiseWs = async () => {
    await sleep(200);
    return new Promise((resolve) => {
      const wsUrl = `wss://app.comet-server.ru/ws/sesion=${this.hash}&myid=${
        this.userId
      }&devid=15&v=4.09&uuid=${crypto.randomUUID()}&api=js`;
      this.ws = new WS(wsUrl);
      this.ws.on('error', console.error);
      this.ws.on('message', this.onWsMessage);
      this.ws.on('open', resolve);
    })
      .catch((e) => {
        console.error('onInitialiseWs', { e });
        throw e;
      })
      .then(() => {
        this.ws?.send(
          mtrim(`subscription
          web_php_chat
          loginPipe`),
        );
        this.ws?.send(
          mtrim(`statistics
            {"url":"https://comet-server.com/doc/example/5/","dev_id":15,"version":"4.09"}`),
        );
      });
  };

  private onWsMessage = (data: Buffer) => {
    let str;
    try {
      str = data.toString('utf8').trim();
      switch (true) {
        case str.includes('"pipe":"web_php_chat"'): {
          str = str.endsWith('}') ? str : str + '}';
          str = str.replaceAll('\x00', '');
          const msg = JSON.parse(str);
          let msgData = JSON.parse(msg.data.replaceAll('\\', ''));
          this.messages.push({ message: msgData.text });
        }
      }
    } catch (e) {
      console.error({ e, str });
    }
  };

  sendMessage = async (to: string, message: string) => {
    const msg = mtrim(`web_pipe2
        web_php_chat
        undefined
        *
        ${JSON.stringify({ text: message })}`);
    this.ws?.send(msg);
  };

  checkMessages = async (mask: string) => {
    await sleep(500);
    return this.messages.filter((m) => m.message.includes(mask)).map((el) => el.message);
  };

  getUserId = async () => this.name;

  kill = async () => {
    this.ws?.close();
  };
}
