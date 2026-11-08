// Inserted at the existing bundle entry point. Read every save before creating the controller,
// which may schedule saves. A retry reloads the page, including a failed CDN script, cleanly.
async function hC() {
  const root = document.querySelector('#game');
  if (!root) throw new Error('Game shell is incomplete');
  let client, game, unmount;
  try {
    client = await Gu();
    document.documentElement.lang = String(client.language || 'en').replace(/_/g, '-');
    const [session, audio, wardrobe] = await Promise.all([
      client.loadProgress(Fl, Ei()),
      client.loadProgress(Ll, true),
      client.loadProgress('skin-fade-studio-rewards-v4', null),
      HSC.initDetail && HSC.initDetail(client),
      HSC.metaInit && HSC.metaInit(client),
    ]);
    game = Pu({root, client, savedSession: session, savedAudio: audio});
    client.bindGame({root, setPaused: game.setPaused, setAudioEnabled: game.setPlatformAudio});
    unmount = Ad({root, game});
    if (HSC.wardrobeInit) await HSC.wardrobeInit({client, game, savedData: wardrobe});
    game.renderFirstPlayableFrame();
    await client.gameReady();
    globalThis.addEventListener('pagehide', () => { unmount(); game.destroy(); client.destroy(); }, {once: true});
    globalThis.skinFadeStudio = Object.freeze({
      selectGuard: game.selectGuard, turn: game.turn, toggleClipper: game.toggleClipper,
      setAudioEnabled: game.setUserAudio, finish: game.finish, next: game.next,
      getView: game.getView, getState: game.getState, replay: game.replay, restore: game.restore, skip: game.skip,
    });
  } catch (error) {
    if (unmount) unmount();
    if (game) game.destroy();
    if (client) client.destroy();
    throw error;
  }
}
function showBootError(error) {
  console.error(error);
  document.documentElement.dataset.bootError = 'true';
  const panel = document.createElement('section');
  panel.className = 'boot-error';
  panel.setAttribute('role', 'alert');
  const title = document.createElement('h1');
  // in the chosen language when the labels loaded (customers.js runs first); English otherwise
  const say = (k, en) => { try { return (globalThis.HSC && HSC.t && HSC.t(k)) || en; } catch (_) { return en; } };
  const tooNew = error && error.code === 'SAVE_TOO_NEW';
  title.textContent = tooNew ? say('boot_new_title', 'A newer game version is needed') : say('boot_fail_title', 'The game could not load');
  const message = document.createElement('p');
  message.textContent = tooNew
    ? say('boot_new_msg', 'Your progress is safe. Refresh to try the latest game version.')
    : say('boot_fail_msg', 'Your saved progress has been kept. Check your connection and try again.');
  if (globalThis.HSC && HSC.rtl) try { panel.dir = HSC.rtl() ? 'rtl' : 'ltr'; } catch (_) {}
  const retry = document.createElement('button');
  retry.type = 'button';
  retry.textContent = say('retry', 'Retry');
  retry.addEventListener('click', () => { retry.disabled = true; globalThis.location.reload(); });
  panel.append(title, message, retry);
  document.body.appendChild(panel);
  retry.focus();
}
hC().catch(showBootError);
