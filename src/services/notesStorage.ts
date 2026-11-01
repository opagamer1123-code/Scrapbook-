import { DiaryNote, STORAGE_KEY, LITTLE_THINGS_STORAGE_KEY } from '../types/notes';
import { proposalConfig, LittleThingCard } from '../config/proposalConfig';

/**
 * Loads notes safely from browser localStorage.
 * If none exist, initializes with starter sample notes.
 */
export function loadNotesFromStorage(): { notes: DiaryNote[]; error: string | null } {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      // Initialize with starter notes
      const initialNotes: DiaryNote[] = proposalConfig.starterNotes.map((n, idx) => ({
        id: n.id,
        title: n.title,
        content: n.content,
        date: n.date,
        isPinned: n.isPinned,
        isShared: n.isShared,
        createdAt: Date.now() - idx * 86400000 * 2,
        updatedAt: Date.now() - idx * 86400000 * 2,
        category: n.category || 'general',
      }));
      saveNotesToStorage(initialNotes);
      return { notes: initialNotes, error: null };
    }

    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      throw new Error('Stored data format is invalid');
    }

    // Validate structure of each note
    const validNotes: DiaryNote[] = parsed.filter((item) => {
      return (
        item &&
        typeof item.id === 'string' &&
        typeof item.title === 'string' &&
        typeof item.content === 'string'
      );
    }).map(n => ({
      ...n,
      category: n.category || 'general',
    }));

    return { notes: validNotes, error: null };
  } catch (err) {
    console.warn('Could not read notes from localStorage:', err);
    return {
      notes: [],
      error: 'Unable to access your browser local storage. Your changes may not persist if storage is disabled.',
    };
  }
}

/**
 * Saves notes to localStorage with error handling
 */
export function saveNotesToStorage(notes: DiaryNote[]): { success: boolean; error: string | null } {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
    return { success: true, error: null };
  } catch (err) {
    console.error('Failed to save notes to localStorage:', err);
    return {
      success: false,
      error: 'Storage quota exceeded or storage disabled in your browser settings.',
    };
  }
}

/**
 * Sorts notes: pinned notes first, then sorted by most recently updated
 */
export function sortNotes(notes: DiaryNote[]): DiaryNote[] {
  return [...notes].sort((a, b) => {
    if (a.isPinned && !b.isPinned) return -1;
    if (!a.isPinned && b.isPinned) return 1;
    return b.updatedAt - a.updatedAt;
  });
}

/**
 * Filters notes based on a search query across title, content, and category
 */
export function searchNotes(notes: DiaryNote[], query: string, categoryFilter?: string): DiaryNote[] {
  let list = notes;
  if (categoryFilter && categoryFilter !== 'all') {
    list = list.filter((n) => n.category === categoryFilter);
  }

  const clean = query.trim().toLowerCase();
  if (!clean) return list;

  return list.filter(
    (n) =>
      n.title.toLowerCase().includes(clean) ||
      n.content.toLowerCase().includes(clean) ||
      n.category.toLowerCase().includes(clean)
  );
}

/**
 * Loads Little Things I Admire cards from localStorage, fallback to config
 */
export function loadLittleThings(): LittleThingCard[] {
  try {
    const raw = localStorage.getItem(LITTLE_THINGS_STORAGE_KEY);
    if (!raw) return proposalConfig.littleThings.cards;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : proposalConfig.littleThings.cards;
  } catch {
    return proposalConfig.littleThings.cards;
  }
}

/**
 * Saves Little Things I Admire cards to localStorage
 */
export function saveLittleThings(cards: LittleThingCard[]) {
  try {
    localStorage.setItem(LITTLE_THINGS_STORAGE_KEY, JSON.stringify(cards));
  } catch (e) {
    console.warn('Failed to save little things cards:', e);
  }
}
