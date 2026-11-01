import { NoteCategory } from '../types/notes';

export interface LittleThingCard {
  id: string;
  title: string;
  content: string;
  revealedInitially: boolean;
  iconType: 'sparkle' | 'smile' | 'heart' | 'conversation';
}

export interface ProposalConfig {
  recipientName: string;
  senderName: string;
  siteTitle: string;
  welcome: {
    heading: string;
    subheading: string;
    buttonLabel: string;
  };
  letter: {
    salutation: string;
    paragraphs: string[];
    closing: string;
    signature: string;
    continueButton: string;
  };
  littleThings: {
    title: string;
    subtitle: string;
    cards: LittleThingCard[];
  };
  proposal: {
    leadIn: string;
    question: string;
    options: {
      yes: {
        label: string;
        responseTitle: string;
        responseMessage: string;
      };
      time: {
        label: string;
        responseTitle: string;
        responseMessage: string;
      };
      friend: {
        label: string;
        responseTitle: string;
        responseMessage: string;
      };
    };
  };
  starterNotes: Array<{
    id: string;
    title: string;
    content: string;
    date: string;
    isPinned: boolean;
    isShared: boolean;
    category: NoteCategory;
  }>;
}

export const proposalConfig: ProposalConfig = {
  recipientName: "Ekta",
  senderName: "Someone who thinks you are pretty special",
  siteTitle: "For Ekta, With Love ♡",
  welcome: {
    heading: "Ekta, this little corner of the internet is just for you.",
    subheading: "There is something I have been wanting to tell you...",
    buttonLabel: "Open my heart ♡",
  },
  letter: {
    salutation: "My Love, Ekta,",
    paragraphs: [
      "If someone ever asks me, “What is your biggest dream or what are you manifesting in life?” I think I’ll smile a little and say, “It’s her. It has always been her.”",
      "Because, my love, I don’t know how to explain it, but when I imagine my future, I don’t see just a beautiful house, a successful career, or a life full of happiness. I see you in it. I see you standing beside me when life gets difficult, holding my hand when I feel lost, laughing with me over the smallest things, and falling asleep in my arms after a long day.",
      "I want to be the person you choose, not just when you're happy, but when you're broken, tired, scared, and when the whole world feels against you. I want to know every little thing about you, your fears, your dreams, your insecurities, and all those parts of yourself that you think are too difficult to love. I want to love you in the ways you never even knew you needed.",
      "And honestly, I'm not asking for a perfect life with you. I'm asking for a real one. A life where we have arguments but never stop choosing each other, where we face problems together instead of walking away, where we grow older but never stop looking at each other with the same love we had in the beginning.",
      "I want to marry you someday. I want to stand in front of you, look into your eyes, and remember how once you were just a wish I made silently in my heart. I want to hold your hand and promise you that, as long as I can, you'll never have to face this world feeling like you're alone.",
      "Maybe I can't promise you that I'll give you everything you ever dream of, but I can promise that I'll keep trying. I'll celebrate your smallest achievements as if they're my biggest victories. I'll be proud of you when you succeed, comfort you when you fail, and remind you of your worth on the days you forget it yourself.",
      "And if God ever asks me what one thing I want from this life, I won't ask for wealth, fame, or a life without struggles. I'll ask for you. I'll ask for the privilege of loving you, the chance to grow with you, and the blessing of spending my life beside you.",
      "So, my love, if I could ask you for just one thing, it would be this: give me the chance to turn all these dreams into our reality. Let me love you, choose you, and build a home with you, not just a place made of walls, but a place where both our hearts feel safe.",
      "I don't know what tomorrow holds for us, but I know what I wish for it. I wish that one day, when someone asks me whether my biggest dream came true, I'll look at you, hold your hand a little tighter, and say with tears of happiness in my eyes,",
      "“Yes. She's right here beside me. The girl I once prayed for, the woman I fell in love with, and the person I get to call my wife. She was never just a part of my dream. She was the dream itself.”",
      "And if you ask me whether I'd choose you again, in another life, in another world, with a thousand different beginnings, my answer would still be you.",
      "It's you I want, it's you I pray for, it's you I see in my future, and it's you I want to come home to for the rest of my life. Will you let me love you forever?"
    ],
    closing: "Forever and always,",
    signature: "Yours ♡",
    continueButton: "Next: Notes to Share ♡",
  },
  littleThings: {
    title: "Little Things I Admire",
    subtitle: "The quiet, genuine details that make you so uniquely wonderful.",
    cards: [
      {
        id: "lt-1",
        title: "A little thing I admire about you",
        content:
          "The effortless warmth you bring into conversations. Even on ordinary days, the way you speak with kindness and sincerity makes everyone around you feel valued and at ease.",
        revealedInitially: true,
        iconType: "heart",
      },
      {
        id: "lt-2",
        title: "Something that makes me smile",
        content:
          "The genuine spark in your expression when you talk about the passions, stories, and ideas that truly excite you. Your enthusiasm is delightfully contagious.",
        revealedInitially: true,
        iconType: "smile",
      },
      {
        id: "lt-3",
        title: "Something I would love to know about you",
        content:
          "The little personal traditions that bring you comfort, your favorite songs for rainy afternoons, and the quiet dreams you keep close to your heart.",
        revealedInitially: false,
        iconType: "sparkle",
      },
      {
        id: "lt-4",
        title: "One thing I wish I could tell you in person",
        content:
          "That you never need to pretend or be anything other than exactly who you are. The real, authentic Ekta is more than wonderful enough.",
        revealedInitially: false,
        iconType: "conversation",
      },
    ],
  },
  proposal: {
    leadIn: "And there is one little thing I have been wanting to ask you...",
    question:
      "Ekta, you've become really special to me, and I'd love to see where things could go between us. I don't know what the future holds, but I'd be happy to figure it out together. Would you give us a chance? ♡",
    options: {
      yes: {
        label: "Yes, let's give our story a beautiful beginning ❤️",
        responseTitle: "Ekta ❤️",
        responseMessage:
          "Ekta, you have no idea how happy you've made me. ❤️ After all these feelings I've carried in my heart, getting this chance with you means more to me than words can explain. I don't promise that every day will be perfect, but I promise to care for you, respect you, stand beside you, and keep choosing you through every little moment of life. Maybe this is the beginning of the most beautiful chapter of our lives. Thank you for giving my heart a chance. I hope one day we look back at this moment and smile, knowing this was where our story began. ♡",
      },
      time: {
        label: "I need a little more time 🌷",
        responseTitle: "Take your time, Ekta 🌷",
        responseMessage:
          "Take your time, Ekta. You don't have to figure everything out today. Your feelings matter to me, and I'd rather have an honest answer when you're ready than a rushed one today. ♡",
      },
      friend: {
        label: "I'm sorry, I don't feel the same",
        responseTitle: "Thank you for your honesty ♡",
        responseMessage:
          "Thank you for being honest with me, Ekta. Maybe our hearts dream of different things, and that hurts, but I'll respect your decision. I genuinely hope life brings you all the happiness you deserve. Take care of yourself. ♡",
      },
    },
  },
  starterNotes: [
    {
      id: "starter-1",
      title: "A Thought of You",
      content:
        "[Example note: you can edit or delete this]\n\nSometimes in the middle of a quiet moment, a simple thought of your smile crosses my mind and makes the entire day feel a little lighter and more peaceful.",
      date: "October 14",
      isPinned: true,
      isShared: true, // Example note revealed to Ekta
      category: "thought",
    },
    {
      id: "starter-2",
      title: "Little Things I Admire",
      content:
        "[Example note: you can edit or delete this]\n\nThe natural grace you carry, the thoughtful attention you pay when listening to others, and the quiet goodness in how you carry yourself.",
      date: "October 19",
      isPinned: false,
      isShared: true, // Example note revealed to Ekta
      category: "admiration",
    },
    {
      id: "starter-3",
      title: "Words I Could Not Say",
      content:
        "[Example note: you can edit or delete this]\n\nI was nervous about expressing what was in my heart because I value your peace of mind above everything. But being honest with you felt like the truest thing to do.",
      date: "October 24",
      isPinned: false,
      isShared: false, // Private diary note
      category: "confession",
    },
    {
      id: "starter-4",
      title: "A Memory to Keep",
      content:
        "[Example note: you can edit or delete this]\n\nThat conversation where we shared our thoughts freely and time seemed to gently pause. It reminded me how rare and comforting genuine connection truly is.",
      date: "October 27",
      isPinned: false,
      isShared: false, // Private diary note
      category: "memory",
    },
  ],
};
