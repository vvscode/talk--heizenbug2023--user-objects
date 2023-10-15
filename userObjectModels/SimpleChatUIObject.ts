import { ChatUserObjectModel } from './ChatUserObjectModel';
import { Browser, Page, chromium } from 'playwright';
import { sleep } from '../utils/sleep';

export class SimpleChatUIObject implements ChatUserObjectModel {
  userId: string;

  private browser!: Browser;
  private page!: Page;
  private name: string;
  constructor(name: string) {
    this.name = name;
    this.userId = name;
  }

  login = async () => {
    await this.initPage();
    await this.page.goto('http://arkanis.de/projects/simple-chat/#demo');
  };

  sendMessage = async (to: string, message: string) => {
    await this.page.fill('input[name="content"]', message);
    await this.page.fill('input[name="name"]', this.name);
    await this.page.click('button[type="submit"]');
  };

  checkMessages = async (mask: string) => {
    const messages = await this.page.$$eval('ul[id=messages] li', (list) =>
      [...list].map((item) => `${item.childNodes[1].textContent}`),
    );
    return messages.filter((el) => el.includes(mask));
  };

  getUserId = async () => this.name;

  kill = async () => {
    await this.page.close();
    await this.browser.close();
  };

  private async initPage() {
    this.browser = await chromium.launch({
      headless: false,
    });
    this.page = await this.browser.newPage();
  }
}
