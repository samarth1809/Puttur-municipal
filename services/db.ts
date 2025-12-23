
import { Report, User, Announcement } from '../types.ts';

const DB_NAME = 'MuniServeDB';
const DB_VERSION = 3; 
const STORE_REPORTS = 'reports';
const STORE_AUTH = 'auth';
const STORE_ALL_USERS = 'all_users';
const STORE_ANNOUNCEMENTS = 'announcements';

export class PersistenceService {
  private db: IDBDatabase | null = null;

  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(STORE_REPORTS)) {
          db.createObjectStore(STORE_REPORTS, { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains(STORE_AUTH)) {
          db.createObjectStore(STORE_AUTH, { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains(STORE_ALL_USERS)) {
          db.createObjectStore(STORE_ALL_USERS, { keyPath: 'email' });
        }
        if (!db.objectStoreNames.contains(STORE_ANNOUNCEMENTS)) {
          db.createObjectStore(STORE_ANNOUNCEMENTS, { keyPath: 'id' });
        }
      };
    });
  }

  async getAllReports(): Promise<Report[]> {
    return this.performTransaction(STORE_REPORTS, 'readonly', (store) => store.getAll());
  }

  async saveReport(report: Report): Promise<void> {
    return this.performTransaction(STORE_REPORTS, 'readwrite', (store) => store.put(report));
  }

  async deleteReport(id: string): Promise<void> {
    return this.performTransaction(STORE_REPORTS, 'readwrite', (store) => store.delete(id));
  }

  // Auth Session Methods
  async saveUser(user: User): Promise<void> {
    const userData = { ...user, id: 'current_session' };
    return this.performTransaction(STORE_AUTH, 'readwrite', (store) => store.put(userData));
  }

  async getStoredUser(): Promise<User | null> {
    return this.performTransaction(STORE_AUTH, 'readonly', (store) => store.get('current_session'));
  }

  async clearUser(): Promise<void> {
    return this.performTransaction(STORE_AUTH, 'readwrite', (store) => store.delete('current_session'));
  }

  // User Registry Methods
  async registerUser(email: string, data: any): Promise<void> {
    // When registering or updating, we ensure we preserve existing structure
    const existing = await this.getRegisteredUser(email);
    return this.performTransaction(STORE_ALL_USERS, 'readwrite', (store) => store.put({ 
      ...existing, 
      email, 
      ...data 
    }));
  }

  async getRegisteredUser(email: string): Promise<any | null> {
    return this.performTransaction(STORE_ALL_USERS, 'readonly', (store) => store.get(email));
  }

  /**
   * Updates the global registry with the new session ID and invalidates others.
   */
  async updateActiveSession(email: string, sessionId: string): Promise<void> {
    const user = await this.getRegisteredUser(email);
    if (user) {
      user.activeSessionId = sessionId;
      await this.registerUser(email, user);
    }
  }

  // Announcement Methods
  async getAllAnnouncements(): Promise<Announcement[]> {
    return this.performTransaction(STORE_ANNOUNCEMENTS, 'readonly', (store) => store.getAll());
  }

  async saveAnnouncement(announcement: Announcement): Promise<void> {
    return this.performTransaction(STORE_ANNOUNCEMENTS, 'readwrite', (store) => store.put(announcement));
  }

  async deleteAnnouncement(id: string): Promise<void> {
    return this.performTransaction(STORE_ANNOUNCEMENTS, 'readwrite', (store) => store.delete(id));
  }

  private async performTransaction<T>(
    storeName: string,
    mode: IDBTransactionMode,
    operation: (store: IDBObjectStore) => IDBRequest
  ): Promise<T> {
    if (!this.db) await this.init();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(storeName, mode);
      const store = transaction.objectStore(storeName);
      const request = operation(store);

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }
}

export const dbService = new PersistenceService();
