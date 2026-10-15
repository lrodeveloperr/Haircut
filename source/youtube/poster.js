/* Static loading backdrop only. No player snapshots, storage reads or GPU readbacks. */
(function (HSC) {
  'use strict';
  HSC.poster = {
    show(loading) { loading?.classList.add('has-poster'); },
    start() {},
  };
})(globalThis.HSC || (globalThis.HSC = {}));
