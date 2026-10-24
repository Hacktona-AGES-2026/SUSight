type RingOptions = {
  /** Fração preenchida, de 0 a 1. */
  progress: number;
  size: number;
  strokeWidth: number;
  track: string;
  fill: string;
};

/** Anel da posição em SVG, começando no topo e seguindo no sentido horário. */
export function ringSvg({ progress, size, strokeWidth, track, fill }: RingOptions): string {
  const center = size / 2;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const filled = circumference * Math.min(Math.max(progress, 0), 1);
  const circle = `cx="${center}" cy="${center}" r="${radius}" fill="none" stroke-width="${strokeWidth}"`;
  return [
    `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">`,
    `<circle ${circle} stroke="${track}"/>`,
    `<circle ${circle} stroke="${fill}" stroke-dasharray="${filled.toFixed(2)} ${circumference.toFixed(2)}" transform="rotate(-90 ${center} ${center})"/>`,
    `</svg>`,
  ].join("");
}
