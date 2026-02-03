import { onDocumentCreated } from "firebase-functions/v2/firestore";
import * as admin from "firebase-admin";

admin.initializeApp();

interface Message {
  text: string;
  senderId: string;
  // ... any other fields
}

interface Announcement {
  title: string;
  content: string;
}

// ----------------------------------------------------------------------------
// 1. Chat Notifications
// ----------------------------------------------------------------------------
export const sendChatNotification = onDocumentCreated(
  "unions/{unionId}/groups/{groupId}/messages/{messageId}",
  async (event) => {
    const snapshot = event.data;
    if (!snapshot) {
      console.log("No data associated with the event");
      return;
    }

    const message = snapshot.data() as Message;
    const { unionId, groupId } = event.params;
    const senderId = message.senderId;

    // 1. Get Group Info (optional, for title)
    // You could fetch the group doc to get a group name if you have one.
    // const groupDoc = await admin.firestore().doc(`unions/${unionId}/groups/${groupId}`).get();
    // const groupName = groupDoc.data()?.name || "New Message";

    // 2. Get Group Members
    // This assumes you have a way to know who is in the group.
    // If 'groups' collection has a 'members' array, fetch it.
    // For now, let's assume ALL users in the 'unions' are candidates, or
    // IF you have a specific subcollection for members, fetch that.
    // Scenario A: Everyone in union -> potentially too generic.
    // Scenario B: 'members' array on group document.
    // Let's assume Scenario B for efficient targeting, falling back to query if needed.

    // NOTE: If you don't have a 'members' list on the group, you might need to query
    // a 'members' subcollection or similar.
    // FOR THIS IMPLEMENTATION: I will assume there's a 'members' array on the group doc
    // OR we query a hypothetical 'group_members' collection.
    // If your app is public-write-public-read per union, maybe notify ALL union members?
    // Let's stick to a safe approach: Query "users" who have this groupId in their profile?
    // Or easier: Just iterate all users in the union.

    // Let's try to find users for this union.
    // (Adjust this query based on your actual data model)
    // If you don't have a direct 'members' field, we can't easily filter by group.
    // I'll fetch ALL users who have an FCM token and filter/check permission if possible.
    // For now: Notify valid tokens.

    // Better approach matching standard chat apps:
    // Read the group document to get members.
    const groupRef = admin
      .firestore()
      .doc(`unions/${unionId}/groups/${groupId}`);
    const groupSnap = await groupRef.get();

    if (!groupSnap.exists) {
      console.log(`Group ${groupId} does not exist.`);
      return;
    }

    const groupData = groupSnap.data();
    // If you have a members array: const members = groupData?.members || [];
    // If you don't store members on the group, you might need to rethink data model for efficiency.
    // FALLBACK: If NO members array, we might process usage based on recent messages? No.
    // Lets assume you want to notify "active" participants or all union members if groups are open.

    // Let's assume we want to notify other users in the UNION for now if groups are open,
    // or just fetch all users and check if they belong.

    // Strategy: Fetch ALL tokens from 'users' collection (this might be expensive at scale).
    // REFINED STRATEGY:
    // 1. We ideally want: collection(db, "unions", unionId, "members")
    //    or collection(db, "users") where unionId in user.unions
    // 2. Get their FCM tokens.
    // 3. Send.

    // Let's assume we query users where `unionId` matches or they are part of the union.
    // Since I don't know your exact User schema for Union membership,
    // I will write a function that gets tokens from `users/{userId}/fcmTokens` subcollection.

    // TEMPORARY: Query all users. In production you MUST filter by union/group membership.
    const usersQuery = await admin.firestore().collection("users").get(); // potentially large

    const tokens: string[] = [];

    // Gather tokens
    for (const userDoc of usersQuery.docs) {
      if (userDoc.id === senderId) continue; // Don't notify sender

      // Check membership (pseudo-code, please adapt)
      // const userData = userDoc.data();
      // if (userData.unionId !== unionId) continue;

      const tokensSnap = await userDoc.ref.collection("fcmTokens").get();
      tokensSnap.forEach((t) => {
        if (t.data().token) tokens.push(t.data().token);
      });
    }

    if (tokens.length === 0) {
      console.log("No devices to notify.");
      return;
    }

    // Deduplicate
    const uniqueTokens = [...new Set(tokens)];

    const payload = {
      data: {
        title: groupData?.name || "New Message",
        body: message.text || "You have a new photo message",
        unionId: unionId,
        groupId: groupId,
        messageId: event.params.messageId,
        url: `/unions/${unionId}/groups/${groupId}`,
        tag: `group-${groupId}`, // Grouping key
      },
    };

    // Send multicast
    if (uniqueTokens.length > 0) {
      await admin.messaging().sendEachForMulticast({
        tokens: uniqueTokens,
        data: payload.data as any, // Cast to any to avoid TS issues with custom keys if strict
      });
      console.log(`Sent to ${uniqueTokens.length} devices.`);
    }
  },
);

// ----------------------------------------------------------------------------
// 2. Announcement Notifications
// ----------------------------------------------------------------------------
export const sendAnnouncementNotification = onDocumentCreated(
  "unions/{unionId}/announcements/{announcementId}",
  async (event) => {
    const snapshot = event.data;
    if (!snapshot) return;

    const announcement = snapshot.data() as Announcement;
    const { unionId, announcementId } = event.params;

    // Similar logic: Get all users in the union
    const usersQuery = await admin.firestore().collection("users").get();
    const tokens: string[] = [];

    for (const userDoc of usersQuery.docs) {
      // Filter by union membership if applicable
      const tokensSnap = await userDoc.ref.collection("fcmTokens").get();
      tokensSnap.forEach((t) => tokens.push(t.data().token));
    }

    const uniqueTokens = [...new Set(tokens)];

    if (uniqueTokens.length === 0) return;

    const payload = {
      data: {
        title: "New Announcement: " + announcement.title,
        body: announcement.content,
        unionId: unionId,
        announcementId: announcementId,
        url: `/`, // Opens home page
        tag: `announcement-${announcementId}`, // Grouping key
      },
    };

    await admin.messaging().sendEachForMulticast({
      tokens: uniqueTokens,
      data: payload.data as any,
    });

    console.log(`Announcement sent to ${uniqueTokens.length} devices.`);
  },
);
