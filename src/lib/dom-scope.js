/** Resources owned by one mounted screen. No global monkey patches. */
export function createDomScope() {
  const cleanups = [];
  const timers = new Set();
  const frames = new Set();
  let active = true;
  return {
    listen(target, type, callback, options) {
      target.addEventListener(type, callback, options);
      cleanups.push(() => target.removeEventListener(type, callback, options));
    },
    timeout(callback, delay) {
      const id = window.setTimeout(() => {
        timers.delete(id);
        if (active) callback();
      }, delay);
      timers.add(id);
      return id;
    },
    frame(callback) {
      const id = window.requestAnimationFrame((time) => {
        frames.delete(id);
        if (active) callback(time);
      });
      frames.add(id);
      return id;
    },
    observe(callback, options) {
      const observer = new IntersectionObserver(callback, options);
      cleanups.push(() => observer.disconnect());
      return observer;
    },
    cleanup(callback) {
      cleanups.push(callback);
    },
    dispose() {
      active = false;
      timers.forEach(window.clearTimeout);
      frames.forEach(window.cancelAnimationFrame);
      cleanups.reverse().forEach((cleanup) => cleanup());
    },
  };
}
