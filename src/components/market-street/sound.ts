type Note = { frequency: number; at: number; length: number; type?: OscillatorType; volume?: number };

export type Sound = {
  unlock: () => void;
  setMuted: (muted: boolean) => void;
  coin: () => void;
  buy: () => void;
  sell: () => void;
  good: () => void;
  bad: () => void;
  fastForward: () => void;
};

export function createSound(): Sound {
  let context: AudioContext | null = null;
  let muted = false;

  const play = (notes: Note[]) => {
    if (muted || !context) return;
    const start = context.currentTime;
    for (const note of notes) {
      const oscillator = context.createOscillator();
      const gain = context.createGain();
      oscillator.type = note.type ?? "triangle";
      oscillator.frequency.value = note.frequency;
      const begin = start + note.at;
      gain.gain.setValueAtTime(0.0001, begin);
      gain.gain.exponentialRampToValueAtTime(note.volume ?? 0.07, begin + 0.012);
      gain.gain.exponentialRampToValueAtTime(0.0001, begin + note.length);
      oscillator.connect(gain).connect(context.destination);
      oscillator.start(begin);
      oscillator.stop(begin + note.length + 0.02);
    }
  };

  return {
    unlock() {
      context ??= new AudioContext();
      void context.resume();
    },
    setMuted(value) {
      muted = value;
    },
    coin: () =>
      play([
        { frequency: 988, at: 0, length: 0.08, type: "square", volume: 0.035 },
        { frequency: 1319, at: 0.07, length: 0.2, type: "square", volume: 0.035 },
      ]),
    buy: () =>
      play([
        { frequency: 523, at: 0, length: 0.1 },
        { frequency: 784, at: 0.06, length: 0.16 },
      ]),
    sell: () =>
      play([
        { frequency: 784, at: 0, length: 0.1 },
        { frequency: 523, at: 0.06, length: 0.16 },
      ]),
    good: () =>
      play(
        [523, 659, 784, 1047].map((frequency, index) => ({
          frequency,
          at: index * 0.09,
          length: 0.3,
        })),
      ),
    fastForward: () =>
      play(
        Array.from({ length: 12 }, (_, index) => ({
          frequency: index % 2 ? 1250 : 940,
          at: index * 0.085,
          length: 0.035,
          type: "square" as const,
          volume: 0.018,
        })),
      ),
    bad: () =>
      play(
        [392, 330, 262].map((frequency, index) => ({
          frequency,
          at: index * 0.12,
          length: 0.35,
          type: "sine" as const,
        })),
      ),
  };
}
