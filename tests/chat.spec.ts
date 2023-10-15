import { ChatUserObjectModel, ChatUserObjectModelConstructor } from '../userObjectModels/ChatUserObjectModel';
import { test } from '@playwright/test';
import { DummyChatUserObjectModel } from '../userObjectModels/DummyChatUserObjectModel';
import { RumbletalkAPIObject } from '../userObjectModels/RumbletalkAPIObject';

function runChatTests(ActorModel1: ChatUserObjectModelConstructor, ActorModel2: ChatUserObjectModelConstructor) {
  let bobName: string;
  let aliceName: string;
  let bob: ChatUserObjectModel;
  let alice: ChatUserObjectModel;

  test.beforeEach(async ({ page }) => {
    bobName = `victor`;
    aliceName = `olga`;

    test.step(`Generate user names (${bobName}, ${aliceName})\n`, () => {});

    await test.step('Create actors', () => {
      bob = new ActorModel1(bobName);
      alice = new ActorModel2(aliceName);
    });
  });

  test.afterEach(async () => await Promise.all([bob.kill(), alice.kill()]));

  test.describe(`Chat Testing with ${ActorModel1.name} as Bob and ${ActorModel2.name} as Alice`, () => {
    test('Bob sends a message, and Alice receives it', async () => {
      await test.step('Bob logins', async () => await bob.login());
      await test.step('Alice logins', async () => await alice.login());

      await test.step('Bob sends message', async () =>
        await bob.sendMessage(await alice.getUserId(), 'Hello from Bob'));
      await test.step('Alice checks message', async () => {
        const messages = await alice.checkMessages('Hello from Bob');
        test.expect(messages).toContain('Hello from Bob');
      });
    });

    test('Alice sends a message, and Bob receives it', async () => {
      await test.step('Bob logins', async () => await bob.login());
      await test.step('Alice logins', async () => await alice.login());

      await test.step('Alice sends message', async () =>
        await alice.sendMessage(await bob.getUserId(), 'Hello from Alice'));
      await test.step('Bob checks message', async () => {
        const messages = await bob.checkMessages('Hello from Alice');
        test.expect(messages).toContain('Hello from Alice');
      });
    });
  });
}

(
  [
    [DummyChatUserObjectModel, DummyChatUserObjectModel],
    [RumbletalkAPIObject, RumbletalkAPIObject],
  ] as [ChatUserObjectModelConstructor, ChatUserObjectModelConstructor][]
).forEach((pair) => runChatTests(...pair));
