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
      getView: game.getView, getState: game.getState, replay: game.replay,
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
  title.textContent = error && error.code === 'SAVE_TOO_NEW' ? 'A newer game version is needed' : 'The game could not load';
  const message = document.createElement('p');
  message.textContent = error && error.code === 'SAVE_TOO_NEW'
    ? 'Your progress is safe. Refresh to try the latest game version.'
    : 'Your saved progress has been kept. Check your connection and try again.';
  const retry = document.createElement('button');
  retry.type = 'button';
  retry.textContent = 'Retry';
  retry.addEventListener('click', () => { retry.disabled = true; globalThis.location.reload(); });
  panel.append(title, message, retry);
  document.body.appendChild(panel);
  retry.focus();
}
hC().catch(showBootError);
