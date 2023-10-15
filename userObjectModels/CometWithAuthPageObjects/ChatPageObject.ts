import type { Page } from 'playwright';

export class ChatPageObject {
  constructor(private page: Page) {}

  async open() {
    await this.page.goto('https://comet-server.com/doc/example/5/');
    await this.page.reload();
  }

  async fillMessage(message: string) {
    await this.page.fill('textarea[id="WebChatTextID"]', message);
  }

  async sendMessage() {
    await this.page.click('input[type="button"]');
  }

  async getMessages(): Promise<{ from: string; message: string }[]> {
    return await this.page.$$eval('div[id="WebChatFormForm"] p', (pList) =>
      [...pList].map((p) => ({
        from: p.childNodes[0].textContent!.replace(': ', ''),
        message: `${p.childNodes[1].textContent}`,
      })),
    );
  }
}
