import type { ChatMessage, LocalNote, LocalTask, Provider, ProviderSettings, UserProfile } from '../types';
const PREFIX = 'jarvis:v1';
const key = (user: UserProfile, section: string) => `${PREFIX}:${encodeURIComponent(user.sub)}:${section}`;
function read<T>(name: string, fallback: T): T { try { const value = localStorage.getItem(name); return value ? JSON.parse(value) as T : fallback; } catch { return fallback; } }
function write<T>(name: string, value: T) { localStorage.setItem(name, JSON.stringify(value)); }
export const storage = {
  getMessages: (user: UserProfile): ChatMessage[] => read(key(user, 'history'), []),
  saveMessages: (user: UserProfile, messages: ChatMessage[]) => write(key(user, 'history'), messages.slice(-150)),
  getTasks: (user: UserProfile): LocalTask[] => read(key(user, 'tasks'), []),
  saveTasks: (user: UserProfile, tasks: LocalTask[]) => write(key(user, 'tasks'), tasks),
  getNotes: (user: UserProfile): LocalNote[] => read(key(user, 'notes'), []),
  saveNotes: (user: UserProfile, notes: LocalNote[]) => write(key(user, 'notes'), notes),
  getProviderSettings: (user: UserProfile): Partial<Record<Provider, ProviderSettings>> => read(key(user, 'providers'), {}),
  saveProviderSettings: (user: UserProfile, settings: Partial<Record<Provider, ProviderSettings>>) => write(key(user, 'providers'), settings),
  getActiveProvider: (user: UserProfile): Provider => read(key(user, 'active-provider'), 'openai'),
  setActiveProvider: (user: UserProfile, provider: Provider) => write(key(user, 'active-provider'), provider),
  getMemoryEnabled: (user: UserProfile): boolean => read(key(user, 'memory-enabled'), true),
  setMemoryEnabled: (user: UserProfile, enabled: boolean) => write(key(user, 'memory-enabled'), enabled),
  clearUserData(user: UserProfile) {
    const prefix = `${PREFIX}:${encodeURIComponent(user.sub)}:`;
    for (let i = localStorage.length - 1; i >= 0; i--) { const item = localStorage.key(i); if (item?.startsWith(prefix)) localStorage.removeItem(item); }
  }
};