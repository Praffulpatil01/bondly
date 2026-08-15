import { db, auth } from '@/config/firebase';
import { doc, setDoc, onSnapshot, deleteDoc, serverTimestamp, runTransaction, collection, query, where, getDocs, limit } from 'firebase/firestore';

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
  'Over 12,000 friendships started on Ryple.',
  "You'll stay anonymous until both users decide otherwise.",
  'Kind conversations create lasting friendships.',
  'Ryple connects people from over 50 countries.',
  'The average Ryple conversation lasts 15 minutes.',
];

export const MatchmakingService = {
  getStatusMessages(): string[] {
    return STATUS_MESSAGES;
  },

  getFunFacts(): string[] {
    return FUN_FACTS;
  },

  /**
   * Enters the matchmaking queue and attempts peer-to-peer matching.
   */
  async simulateSearch(
    durationMs: number = 60000 
  ): Promise<{ state: MatchState; result?: MatchResult }> {
    return new Promise(async (resolve) => {
      const user = auth.currentUser;
      if (!user) {
        resolve({ state: 'network-error' });
        return;
      }

      const queueRef = doc(db, 'matchmaking_queue', user.uid);
      let isResolved = false;
      
      try {
        await setDoc(queueRef, {
          status: 'searching',
          timestamp: serverTimestamp(),
        });

        // 1. Listen for someone else matching with us
        const unsubscribe = onSnapshot(queueRef, async (docSnap) => {
          if (docSnap.exists() && !isResolved) {
            const data = docSnap.data();
            if (data.status === 'matched' && data.chatId) {
              isResolved = true;
              unsubscribe();
              resolve({
                state: 'found',
                result: {
                  userId: data.matchedWith,
                  nickname: 'Anonymous', 
                  avatarUrl: '',
                  sharedInterests: ['Ryple'],
                  chatId: data.chatId,
                }
              });
              await deleteDoc(queueRef).catch(() => {});
            }
          }
        }, (error) => {
          console.error("Matchmaking listener error:", error);
          if (!isResolved) {
            isResolved = true;
            unsubscribe();
            resolve({ state: 'network-error' });
          }
        });

        // 2. Wait a moment so we don't immediately try to match and collide
        await new Promise(r => setTimeout(r, 2000));

        // 3. Actively try to find a match and run a transaction
        if (!isResolved) {
          try {
            const q = query(
              collection(db, 'matchmaking_queue'), 
              where('status', '==', 'searching'), 
              limit(2)
            );
            const querySnap = await getDocs(q);
            
            let matchDocRef = null;
            let matchId = null;
            for (const docSnap of querySnap.docs) {
              if (docSnap.id !== user.uid) {
                matchDocRef = docSnap.ref;
                matchId = docSnap.id;
                break;
              }
            }

            if (matchDocRef && matchId) {
              // We found someone! Let's try to secure the match via transaction
              await runTransaction(db, async (transaction) => {
                const myQueueDoc = await transaction.get(queueRef);
                const theirQueueDoc = await transaction.get(matchDocRef);
                
                if (myQueueDoc.data()?.status !== 'searching' || theirQueueDoc.data()?.status !== 'searching') {
                  throw new Error("One of the users is no longer searching.");
                }

                // Create the chat room
                const chatRef = doc(collection(db, 'chats'));
                transaction.set(chatRef, {
                  id: chatRef.id,
                  status: 'active',
                  startedAt: serverTimestamp(),
                  participants: [user.uid, matchId]
                });

                // Update both users to matched
                transaction.update(queueRef, {
                  status: 'matched',
                  matchedWith: matchId,
                  chatId: chatRef.id
                });

                transaction.update(matchDocRef, {
                  status: 'matched',
                  matchedWith: user.uid,
                  chatId: chatRef.id
                });
              });
              // If transaction succeeds, our onSnapshot will fire and resolve
            }
          } catch (e) {
            console.log("Transaction failed, waiting to be matched passively...", e);
            // It's okay, we'll just wait for someone else to match with us
          }
        }

        // Timeout fallback
        setTimeout(async () => {
          if (!isResolved) {
            isResolved = true;
            unsubscribe();
            await deleteDoc(queueRef).catch(() => {});
            resolve({ state: 'failed' });
          }
        }, durationMs);

      } catch (error) {
        console.error("Matchmaking error:", error);
        if (!isResolved) {
          isResolved = true;
          resolve({ state: 'network-error' });
        }
      }
    });
  },
};
