export type NoteCategory = 'thought' | 'admiration' | 'confession' | 'memory' | 'general';

export interface DiaryNote {
  id: string;
  title: string;
  content: string;
  date?: string;
  isPinned: boolean;
  isShared: boolean; // true = shared with Ekta in "Notes to Share", false = strictly Private Diary
  createdAt: number;
  updatedAt: number;
  category: NoteCategory;
}

export const STORAGE_KEY = 'for_ekta_romantic_diary_notes_v1';
export const OWNER_PASSKEY_KEY = 'for_ekta_diary_passcode_v1';
export const LITTLE_THINGS_STORAGE_KEY = 'for_ekta_little_things_v1';
