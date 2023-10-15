import { ChatUserObjectModel } from './ChatUserObjectModel';
import axios, { AxiosInstance } from 'axios';
import https from 'https';
import http from 'http';
import { sleep } from '../utils/sleep';

export class RumbletalkAPIObject implements ChatUserObjectModel {
  userId: unknown;

  private name: string;
  private client: AxiosInstance;
  private s: string = '';
  private r: string = '';
  private rumbletalkPositions = '';

  private messages: {
    from: string;
    message: string;
  }[] = [];

  constructor(name: string) {
    this.name = name;
    const httpsAgent = new https.Agent({ keepAlive: true, maxSockets: 1 });
    const httpAgent = new http.Agent({ keepAlive: true, maxSockets: 1 });

    const ip =
      Math.floor(Math.random() * 255) +
      1 +
      '.' +
      Math.floor(Math.random() * 255) +
      '.' +
      Math.floor(Math.random() * 255) +
      '.' +
      Math.floor(Math.random() * 255);

    this.client = axios.create({
      withCredentials: true,
      headers: {
        'Content-Type': 'application/json',
        'X-Forwarded-For': `${ip}`,
      },
      httpsAgent,
      httpAgent,
    });
    this.client.interceptors.response.use((response: any) => {
      this.r = this.r || response.headers.r;
      this.s = this.s || response.headers.s;
      this.rumbletalkPositions = response.headers['rumbletalk-positions'];
      return response;
    });
    this.client.interceptors.request.use((request: any) => {
      if (this.s && this.r) {
        request.headers.Sookie = `s=${this.s};r=${this.r}`;
      }
      if (this.rumbletalkPositions) {
        request.headers['rumbletalk-positions'] = this.rumbletalkPositions;
      }
      return request;
    });
  }

  login = async () => {
    await sleep();
    return this.client.post('https://service9.rumbletalk.net/WPhBvIA2/', {
      cmd: 7,
      data: {
        username: this.name,
        type: 4,
      },
    });
  };

  sendMessage = async (_to: string, message: string) => {
    await sleep();
    return this.client.post('https://service9.rumbletalk.net/WPhBvIA2/', {
      cmd: 10,
      data: {
        text: message,
      },
    });
  };

  checkMessages = async (mask: string) => {
    await sleep();
    return this.client({
      method: 'post',
      url: 'https://service9.rumbletalk.net/WPhBvIA2/',
      data: {
        cmd: 39,
      },
      responseType: 'stream',
    })
      .then((response) => {
        return new Promise((resolve) => {
          response.data.on('data', (chunk: any) => {
            const bodyStr = chunk.toString();
            resolve(JSON.parse(bodyStr));
          });
        });
      })
      .then((data: any) => {
        this.messages.push(
          ...data
            .filter((el: any) => el.cmd === 10)
            .map((el: any) => ({
              from: el.um,
              message: el.text,
            })),
        );
      })
      .then(() => this.messages.filter((el) => el.message === mask).map((el) => el.message));
  };
  getUserId = async () => NaN;

  kill = async () => {};
}
