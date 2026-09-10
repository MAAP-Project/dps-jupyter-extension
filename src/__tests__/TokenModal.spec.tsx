import React from 'react';
import { afterEach, describe, expect, it, jest } from '@jest/globals';
import { MaapProvider } from '../MaapContext';
import { TokenModal } from '../components/TokenModal/TokenModal';
import {
  actAsync,
  cleanup,
  createTestSettings,
  getButton,
  pressEnter,
  render,
  typeInto,
} from './testUtils';

const SAVED_TOKEN = 'jwt:saved-token';

function getTokenInput(): HTMLInputElement {
  return document.querySelector<HTMLInputElement>('input[type="password"]');
}

async function renderModal() {
  const testSettings = await createTestSettings({
    maapApiUrl: 'https://api.maap-project.org/',
    maapToken: SAVED_TOKEN,
  });
  const onSubmit = jest.fn<() => void>();
  const onClose = jest.fn<() => void>();

  const modal = (open: boolean) => (
    <MaapProvider settings={testSettings.settings}>
      <TokenModal
        open={open}
        message="A token is required."
        onClose={onClose}
        onSubmit={onSubmit}
      />
    </MaapProvider>
  );

  const rerender = render(modal(true));
  // Let the modal finish reading the settings when it opens
  await actAsync();

  const setOpen = async (open: boolean) => {
    rerender(modal(open));
    await actAsync();
  };

  return { ...testSettings, onSubmit, onClose, setOpen };
}

describe('TokenModal', () => {
  afterEach(cleanup);

  it('saves the entered token when Set Token is clicked', async () => {
    const { settings, saveCount, onSubmit, onClose } = await renderModal();
    let tokenWhenSubmitted: unknown;
    onSubmit.mockImplementation(() => {
      tokenWhenSubmitted = settings.user.maapToken;
    });

    typeInto(getTokenInput(), 'jwt:new-token');
    await actAsync(() => getButton('Set Token').click());

    expect(saveCount()).toBe(1);
    expect(settings.user.maapToken).toBe('jwt:new-token');
    // Saved before onSubmit runs, so the reloaded jobs use the new token
    expect(tokenWhenSubmitted).toBe('jwt:new-token');
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('saves the entered token when Enter is pressed', async () => {
    const { settings, saveCount, onSubmit } = await renderModal();

    typeInto(getTokenInput(), 'jwt:new-token');
    await actAsync(() => pressEnter(getTokenInput()));

    expect(saveCount()).toBe(1);
    expect(settings.user.maapToken).toBe('jwt:new-token');
    expect(onSubmit).toHaveBeenCalledTimes(1);
  });

  it('does not save anything while the token is being typed', async () => {
    const { settings, saveCount } = await renderModal();

    typeInto(getTokenInput(), 'jwt:part');
    typeInto(getTokenInput(), '');
    await actAsync();

    expect(saveCount()).toBe(0);
    expect(settings.user.maapToken).toBe(SAVED_TOKEN);
  });

  it('keeps the saved token when the dialog is cancelled', async () => {
    const { settings, saveCount, onSubmit, onClose } = await renderModal();

    typeInto(getTokenInput(), 'jwt:discarded');
    await actAsync(() => getButton('Cancel').click());

    expect(saveCount()).toBe(0);
    expect(settings.user.maapToken).toBe(SAVED_TOKEN);
    expect(onSubmit).not.toHaveBeenCalled();
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('does not submit an empty token', async () => {
    const { settings, saveCount, onSubmit, onClose } = await renderModal();

    expect(getButton('Set Token').disabled).toBe(true);
    typeInto(getTokenInput(), '   ');
    expect(getButton('Set Token').disabled).toBe(true);

    await actAsync(() => pressEnter(getTokenInput()));

    expect(saveCount()).toBe(0);
    expect(settings.user.maapToken).toBe(SAVED_TOKEN);
    expect(onSubmit).not.toHaveBeenCalled();
    expect(onClose).not.toHaveBeenCalled();
  });

  it('clears a previously typed token when reopened', async () => {
    const { saveCount, setOpen } = await renderModal();

    typeInto(getTokenInput(), 'jwt:discarded');
    await setOpen(false);
    await setOpen(true);

    expect(getTokenInput().value).toBe('');
    expect(getButton('Set Token').disabled).toBe(true);
    expect(saveCount()).toBe(0);
  });
});
