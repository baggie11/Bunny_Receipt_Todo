export type BunnyMood =
  | 'empty'
  | 'tired'
  | 'hopeful'
  | 'happy'
  | 'excited'
  | 'ecstatic'
  | 'celebration';

export interface BunnyStateResult {
  mood: BunnyMood;
  percentage: number;
  text: string;
  subtext?: string;
  isCelebrating: boolean;
  hasSpecialEasterEgg?: 'birthday' | 'early' | 'empty';
}

export function getBunnyState(
  completed: number,
  total: number,
  options?: {
    isEarly?: boolean;
    isBirthday?: boolean;
    hasRepeatedTasks?: boolean;
    leftoverCount?: number;
  }
): BunnyStateResult {
  if (total === 0) {
    const leftoverCount = options?.leftoverCount ?? 0;
    if (leftoverCount > 0) {
      return {
        mood: 'tired',
        percentage: 0,
        text: leftoverCount === 1
          ? "Yesterday we left 1 task unfinished."
          : `Yesterday we left ${leftoverCount} tasks unfinished.`,
        subtext: "That's okay. Want to carry them over?",
        isCelebrating: false,
      };
    }
    return {
      mood: 'empty',
      percentage: 0,
      text: options?.isBirthday
        ? "Happy birthday! Add a task to start celebrating."
        : "...we should probably write something.",
      subtext: "I'm waiting...",
      isCelebrating: false,
      hasSpecialEasterEgg: options?.isBirthday ? 'birthday' : 'empty'
    };
  }

  const percentage = Math.round((completed / total) * 100);

  if (options?.isBirthday && percentage === 100) {
    return {
      mood: 'celebration',
      percentage: 100,
      text: "WE DID IT! Happy Birthday!",
      subtext: "Birthday bonus unlocked. 🎂✨",
      isCelebrating: true,
      hasSpecialEasterEgg: 'birthday'
    };
  }

  if (percentage === 0) {
    return {
      mood: 'tired',
      percentage: 0,
      text: options?.hasRepeatedTasks ? "Back at it again. We can start with one." : "We can start with one.",
      subtext: "Your bunny believes in you.",
      isCelebrating: false
    };
  }

  if (percentage <= 25) {
    return {
      mood: 'hopeful',
      percentage,
      text: "Okay... we're getting somewhere.",
      subtext: "Step by step.",
      isCelebrating: false
    };
  }

  if (percentage <= 50) {
    return {
      mood: 'happy',
      percentage,
      text: "I knew you could do it.",
      subtext: "Halfway there!",
      isCelebrating: false
    };
  }

  if (percentage <= 75) {
    return {
      mood: 'excited',
      percentage,
      text: "Look at you go!",
      subtext: "Bunny is cheering for you!",
      isCelebrating: false
    };
  }

  if (percentage < 100) {
    return {
      mood: 'ecstatic',
      percentage,
      text: "Almost there!",
      subtext: "Just a little bit more!",
      isCelebrating: false
    };
  }

  // 100% Complete
  const isEarly = options?.isEarly ?? false;
  return {
    mood: 'celebration',
    percentage: 100,
    text: isEarly ? "Already?! WE DID IT." : "WE DID IT.",
    subtext: isEarly ? "Super speedy today! 🐰✨" : "All tasks complete! 🐰🎉",
    isCelebrating: true,
    hasSpecialEasterEgg: isEarly ? 'early' : undefined
  };
}
