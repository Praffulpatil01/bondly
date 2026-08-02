import { db, auth } from '@/config/firebase';
import { doc, setDoc, onSnapshot, deleteDoc, serverTimestamp } from 'firebase/firestore';

export type MatchState = 'searching' | 'found' | 'failed' | 'network-error';

export interface MatchResult {
  userId: string;
  nickname: string;
  avatarUrl: string;
  sharedInterests: string[];
  chatId?: string;
}

const STATUS_MESSAGES = [
  'Searching nearby users...',
  'Looking for shared interests...',
  'Finding someone online...',
  'Creating secure connection...',
  'Almost there...',
];

const FUN_FACTS = [
  'Over 12,000 friendships started on Bondly.',
  "You'll stay anonymous until both users decide otherwise.",
  'Kind conversations create lasting friendships.',
  'Bondly connects people from over 50 countries.',
  'The average Bondly conversation lasts 15 minutes.',
];

export const MatchmakingService = {
  getStatusMessages(): string[] {
    return STATUS_MESSAGES;
  },

  getFunFacts(): string[] {
    return FUN_FACTS;
  },

  /**
   * Enters the matchmaking queue and listens for a match.
   */
  async simulateSearch(
    durationMs: number = 60000 // Increase duration for real matching
  ): Promise<{ state: MatchState; result?: MatchResult }> {
    return new Promise(async (resolve) => {
      const user = auth.currentUser;
      if (!user) {
        resolve({ state: 'network-error' });
        return;
      }

      const queueRef = doc(db, 'matchmaking_queue', user.uid);
      
      try {
        await setDoc(queueRef, {
          status: 'searching',
          timestamp: serverTimestamp(),
          // we could pass interests/filters here
        });

        // Listen for cloud function updates
        const unsubscribe = onSnapshot(queueRef, async (docSnap) => {
          if (docSnap.exists()) {
            const data = docSnap.data();
            if (data.status === 'matched' && data.matchedWith) {
              unsubscribe();
              // In a real app we'd fetch the matched user's public info.
              resolve({
                state: 'found',
                result: {
                  userId: data.matchedWith,
                  nickname: 'Anonymous', // Keep them anonymous
                  avatarUrl: '',
                  sharedInterests: ['Bondly'],
                  chatId: data.chatId,
                }
              });
              
              // Clean up queue
              await deleteDoc(queueRef).catch(() => {});
            }
          }
        }, (error) => {
          console.error("Matchmaking listener error:", error);
          unsubscribe();
          resolve({ state: 'network-error' });
        });

        // Timeout fallback
        setTimeout(async () => {
          unsubscribe();
          await deleteDoc(queueRef).catch(() => {});
          resolve({ state: 'failed' });
        }, durationMs);

      } catch (error) {
        console.error("Matchmaking error:", error);
        resolve({ state: 'network-error' });
      }
    });
  },
};
