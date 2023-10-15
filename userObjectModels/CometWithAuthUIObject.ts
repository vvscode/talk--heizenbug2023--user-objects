import { ChatUserObjectModel } from './ChatUserObjectModel';
import { Browser, Page, chromium } from 'playwright';
import { AuthFormPageObject } from './CometWithAuthPageObjects/AuthFormPageObject';
import { ChatPageObject } from './CometWithAuthPageObjects/ChatPageObject';
import { sleep } from '../utils/sleep';

export class CometWithAuthUIObject implements ChatUserObjectModel {
  userId: string;

  private browser?: Browser;
  private page?: Page;
  private chatPageObject?: ChatPageObject;

  private name: string;
  constructor(name: string) {
    this.name = name;
    this.userId = name;
  }

  login = async () => {
    const page = await this.getPage();
    const authPage = new AuthFormPageObject(page);
    await authPage.open();
    await authPage.fillLogin(this.name);
    await authPage.fillPassword();
    await authPage.submit();
    await authPage.goToChat();
    this.chatPageObject = new ChatPageObject(page);
    await this.chatPageObject.open();
  };

  sendMessage = async (to: string, message: string) => {
    if (!this.chatPageObject) {
      throw new Error('Login first');
    }
    await this.chatPageObject.fillMessage(message);
    await this.chatPageObject.sendMessage();
  };

  checkMessages = async (mask: string) => {
    if (!this.chatPageObject) {
      throw new Error('Login first');
    }
    await sleep();
    const chatHistory = await this.chatPageObject.getMessages();
    return chatHistory.map((el) => el.message);
  };

  getUserId = async () => this.name;

  kill = async () => {
    this.page?.close();
    this.browser?.close();
  };

  private async getPage() {
    if (this.page) {
      return this.page;
    }
    const browser = await chromium.launch({
      headless: false,
      executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    });
    this.page = await browser.newPage();
    return this.page;
  }
}
