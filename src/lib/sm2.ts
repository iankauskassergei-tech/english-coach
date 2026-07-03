export interface SM2Result {
  interval: number;
  repetitions: number;
  easeFactor: number;
  state: 'new' | 'learning' | 'review' | 'mastered';
}

export function sm2(
  quality: number,
  repetitions: number,
  easeFactor: number,
  interval: number
): SM2Result {
  let newEF = easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
  newEF = Math.max(1.3, newEF);

  let newInterval: number;
  let newReps: number;
  let state: SM2Result['state'];

  if (quality < 3) {
    newReps = 0;
    newInterval = 1;
    state = 'learning';
  } else {
    newReps = repetitions + 1;
    if (repetitions === 0) {
      newInterval = 1;
      state = 'learning';
    } else if (repetitions === 1) {
      newInterval = 6;
      state = 'review';
    } else {
      newInterval = Math.round(interval * newEF);
      state = newInterval >= 21 && newEF >= 2.3 ? 'mastered' : 'review';
    }
  }

  return { interval: newInterval, repetitions: newReps, easeFactor: newEF, state };
}
