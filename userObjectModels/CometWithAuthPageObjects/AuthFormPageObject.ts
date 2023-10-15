import type { Page } from 'playwright';

export class AuthFormPageObject {
  constructor(private page: Page) {}

  async open() {
    await this.page.goto('https://comet-server.com/doc/example/5/');
  }

  async fillLogin(login: string) {
    await this.page.fill('input[name=login]', login);
  }

  async fillPassword(password: string = 'qwerty') {
    await this.page.fill('input[name=pass]', password);
  }

  async submit() {
    await this.page.click('input[type=submit]');
  }

  async goToChat() {
    await this.page.click('a[href*="https://comet-server.com/doc/"]');
    await this.page.waitForURL((url) => !url.search.includes('login'));
  }
}
