export function randomDelay(min = 1500, max = 3000) {
  return new Promise((resolve) =>
    setTimeout(resolve, Math.random() * (max - min) + min)
  );
}
