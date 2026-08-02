import * as admin from 'firebase-admin';
import * as functions from 'firebase-functions';

const db = admin.firestore();

/**
 * Triggered when a new user joins the matchmaking queue.
 * Document path: `matchmaking_queue/{uid}`
 */
export const onUserJoinQueue = functions.firestore
  .document('matchmaking_queue/{uid}')
  .onCreate(async (snap, context) => {
    const newEntry = snap.data();
    const newUserId = context.params.uid;

    try {
      // Find another user in the queue
      const queueRef = db.collection('matchmaking_queue');
      
      // Perform inside a transaction to prevent race conditions
      await db.runTransaction(async (transaction) => {
        // Query for available users (limit to 1 to find a match)
        const querySnapshot = await transaction.get(
          queueRef
            .where('status', '==', 'searching')
            .orderBy('timestamp', 'asc')
            .limit(2) // Get up to 2 to ensure we don't just match ourselves instantly
        );

        let matchDoc = null;
        for (const doc of querySnapshot.docs) {
          if (doc.id !== newUserId) {
            matchDoc = doc;
            break;
          }
        }

        if (matchDoc) {
          const matchId = matchDoc.id;
          
          // Create a new Chat Room
          const chatRoomRef = db.collection('chats').doc();
          const startedAt = admin.firestore.FieldValue.serverTimestamp();
          // Expires in 10 minutes (handled on client side or by a cleanup cron job)
          
          const chatData = {
            id: chatRoomRef.id,
            status: 'active',
            startedAt,
            participants: [newUserId, matchId],
          };

          transaction.set(chatRoomRef, chatData);

          // Update both queue entries to point to the new chat
          transaction.update(snap.ref, {
            status: 'matched',
            chatId: chatRoomRef.id,
            matchedWith: matchId,
          });

          transaction.update(matchDoc.ref, {
            status: 'matched',
            chatId: chatRoomRef.id,
            matchedWith: newUserId,
          });
          
          console.log(`Matched ${newUserId} with ${matchId} in chat ${chatRoomRef.id}`);
        }
      });
    } catch (error) {
      console.error('Matchmaking error:', error);
    }
  });
