/**
 * Reveals the looping tori mark video only where the browser really paints its
 * transparency. The video is VP9 WebM with an alpha channel: Chrome draws it
 * transparent, but Safari and every iOS browser paint the transparent areas
 * opaque (a black box), and iOS may block autoplay and show a play button.
 * Everywhere else the static mark underneath stays visible.
 *
 * Once the video plays, its transparent top-left pixel is read through a
 * canvas: transparent -> add "is-playing" (CSS shows the video); opaque ->
 * pause it and keep the static mark. Returns a cleanup function.
 */
export function watchMarkVideo(video) {
  if (!video) return () => {};

  const probe = () => {
    const canvas = document.createElement("canvas");
    canvas.width = 1;
    canvas.height = 1;
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    ctx.drawImage(video, 0, 0, 1, 1, 0, 0, 1, 1);
    const alpha = ctx.getImageData(0, 0, 1, 1).data[3];
    if (alpha < 250) video.classList.add("is-playing");
    else video.pause();
  };
  const check = () => requestAnimationFrame(probe);

  if (!video.paused && video.readyState > 2) {
    check();
    return () => {};
  }
  video.addEventListener("playing", check, { once: true });
  return () => video.removeEventListener("playing", check);
}
