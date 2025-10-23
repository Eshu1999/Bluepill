
'use server';

import { getAdminDb, getAdminAuth } from '@/lib/firebase-admin';
import { AdherenceLog, Chat, StoredMedicineInput, UserProfile, UserProfileInput, FriendRequest, MedicationRequest, AuthUser } from '@/types';
import { collection, doc, getDoc, runTransaction, where, query, getDocs, writeBatch, addDoc, serverTimestamp, arrayUnion, setDoc, updateDoc, deleteDoc, Timestamp } from 'firebase/firestore';
import { v4 as uuidv4 } from 'uuid';
import { adminInitializationPromise } from '@/lib/firebase-admin-init';
import type { DecodedIdToken } from 'firebase-admin/auth';
import { cookies } from 'next/headers';

async function getVerifiedUser(idToken: string): Promise<DecodedIdToken> {
    await adminInitializationPromise;
    try {
        const auth = getAdminAuth();
        const decodedToken = await auth.verifyIdToken(idToken);
        return decodedToken;
    } catch (error: any) {
        console.error("Firebase ID token verification failed:", error.code, error.message);
        throw new Error(`Authentication failed. Server could not verify your session. Reason: ${error.message}`);
    }
}

export async function createAdminSession(accountType: 'normal' | 'doctor') {
    try {
        await adminInitializationPromise;
        const auth = getAdminAuth();
        const db = getAdminDb();
        const tempId = uuidv4();
        
        // Create a temporary user with the Admin SDK
        const userRecord = await auth.createUser({
            uid: `admin_${tempId}`,
            displayName: accountType === 'doctor' ? `Dr. Admin` : `Admin User`,
            email: `admin_${tempId}@example.com`,
        });

        const user = userRecord;

        // Create a corresponding profile
        const tempUsername = `${accountType}_${uuidv4().substring(0, 8)}`;
        const profileData: UserProfileInput = {
            userId: user.uid,
            name: user.displayName || 'Admin',
            username: tempUsername,
            accountType: accountType,
            email: user.email || '',
            emailVerified: true,
            pictureUrl: '',
            allergies: '',
            emergencyContact: '',
            phoneVerified: false,
        };

        await setDoc(doc(db, 'profiles', user.uid), profileData);
        
        // Create a custom token for the new user
        const customToken = await auth.createCustomToken(user.uid);

        return { success: true, token: customToken, user: { uid: user.uid, displayName: user.displayName, email: user.email } };

    } catch (error: any) {
        console.error('Error creating admin session:', error);
        return { success: false, error: error.message };
    }
}


export async function getUserProfile(userId: string): Promise<UserProfile | null> {
    await adminInitializationPromise;
    const db = getAdminDb();
    const profileRef = doc(db, 'profiles', userId);
    const profileSnap = await getDoc(profileRef);

    if (profileSnap.exists()) {
        const data = profileSnap.data();
        return { 
            id: profileSnap.id,
            ...data,
            userId: data.userId || profileSnap.id
        } as UserProfile;
    }
    return null;
}

export async function sendMedicationRequest(idToken: string, doctorId: string) {
    let user;
    try {
        user = await getVerifiedUser(idToken);
    } catch(error) {
        const message = error instanceof Error ? error.message : "An unknown authentication error occurred.";
        return { success: false, error: message };
    }
    
    try {
        await adminInitializationPromise;
        const db = getAdminDb();
        const requestId = uuidv4();
        const requestData: Omit<MedicationRequest, 'id'> = {
            customerId: user.uid,
            customerName: user.name || 'A Customer',
            status: 'pending',
            requestedAt: new Date().toISOString(),
        }

        const requestDocRef = doc(db, 'requests', doctorId, 'medicationRequests', requestId);
        await setDoc(requestDocRef, requestData);

        return { success: true };
    } catch (error) {
        console.error('Error sending medication request:', error);
        const message = error instanceof Error ? error.message : "An unknown error occurred.";
        return { success: false, error: message };
    }
}


export async function addFamilyMember(idToken: string, otherUserId: string) {
    let currentUserAuth;
    try {
        currentUserAuth = await getVerifiedUser(idToken);
    } catch(error) {
        const message = error instanceof Error ? error.message : "An unknown authentication error occurred.";
        return { success: false, error: message };
    }

    try {
        await adminInitializationPromise;
        const db = getAdminDb();
        const batch = writeBatch(db);

        const currentUserRef = doc(db, 'profiles', currentUserAuth.uid);
        const otherUserRef = doc(db, 'profiles', otherUserId);

        const [currentUserSnap, otherUserSnap] = await Promise.all([
            getDoc(currentUserRef),
            getDoc(otherUserRef)
        ]);

        if (!currentUserSnap.exists()) {
            return { success: false, error: 'Your user profile could not be found.' };
        }
        if (!otherUserSnap.exists()) {
            return { success: false, error: 'The other user could not be found.' };
        }
        
        const otherUser = otherUserSnap.data() as UserProfile;
        
        if (otherUser.accountType === 'doctor') {
            return { success: false, error: 'Cannot add a doctor as a family member.' };
        }

        batch.update(currentUserRef, { family: arrayUnion(otherUserId) });
        batch.update(otherUserRef, { family: arrayUnion(currentUserAuth.uid) });

        await batch.commit();

        return { success: true, message: `You are now connected with ${otherUser.name}.` };
    } catch (error) {
        console.error('Error adding family member:', error);
        return { success: false, error: 'An unexpected server error occurred.' };
    }
}


export async function respondToFriendRequest(idToken: string, requestId: string, response: 'accepted' | 'declined') {
    let currentUserAuth;
    try {
        currentUserAuth = await getVerifiedUser(idToken);
    } catch(error) {
        const message = error instanceof Error ? error.message : "An unknown authentication error occurred.";
        return { success: false, error: message };
    }

    try {
        await adminInitializationPromise;
        const db = getAdminDb();
        const requestRef = doc(db, 'friendRequests', requestId);

        const result = await runTransaction(db, async (transaction) => {
            const requestSnap = await transaction.get(requestRef);
            if (!requestSnap.exists() || requestSnap.data().to !== currentUserAuth.uid) {
                throw new Error("Request not found or you are not authorized to respond.");
            }

            const request = requestSnap.data() as FriendRequest;
            const otherUserId = request.from;

            if (response === 'accepted') {
                const currentUserRef = doc(db, 'profiles', currentUserAuth.uid);
                const otherUserRef = doc(db, 'profiles', otherUserId);
                
                const otherUserSnap = await transaction.get(otherUserRef);
                if (!otherUserSnap.exists()) {
                    throw new Error("The other user's profile could not be found.");
                }
                
                transaction.update(currentUserRef, { family: arrayUnion(otherUserId) });
                transaction.update(otherUserRef, { family: arrayUnion(currentUserAuth.uid) });
            }
            
            transaction.update(requestRef, { status: response });
            
            return { otherUserName: request.fromName };
        });

        return { success: true, otherUserName: result.otherUserName };
    } catch (error) {
        console.error('Error responding to request:', error);
        const message = error instanceof Error ? error.message : "An unknown error occurred.";
        return { success: false, error: message };
    }
}


export async function fulfillMedicationRequest(
    idToken: string,
    requestId: string,
    inventoryItemId: string,
    customerId: string,
    quantity: number
) {
    let userAuth;
    try {
        userAuth = await getVerifiedUser(idToken);
    } catch(error) {
        const message = error instanceof Error ? error.message : "An unknown authentication error occurred.";
        return { success: false, error: message };
    }
    
    try {
        await adminInitializationPromise;
        const db = getAdminDb();
        const doctorId = userAuth.uid;
        const inventoryRef = doc(db, 'inventory', inventoryItemId);
        const requestRef = doc(db, 'requests', doctorId, 'medicationRequests', requestId);

        const inventoryItem = await runTransaction(db, async (transaction) => {
            const inventoryDoc = await transaction.get(inventoryRef);

            if (!inventoryDoc.exists()) {
                throw new Error('Inventory item not found!');
            }

            const inventoryItem = inventoryDoc.data();
            
            if (inventoryItem.userId !== doctorId) {
                throw new Error('Inventory item does not belong to this doctor.');
            }
            
            const totalStock = inventoryItem.boxes * inventoryItem.unitsPerBox * inventoryItem.medicinesPerUnit;
            if (totalStock < quantity) {
                throw new Error('Not enough stock to fulfill this quantity.');
            }
            
            const newTotalStock = totalStock - quantity;
            
            const unitsInOneBox = inventoryItem.unitsPerBox * inventoryItem.medicinesPerUnit;
            const newBoxes = unitsInOneBox > 0 ? newTotalStock / unitsInOneBox : 0;


            transaction.update(inventoryRef, {
                boxes: newBoxes,
            });

            transaction.update(requestRef, {
                status: 'completed',
            });
            
            return inventoryDoc.data();
        });

        const customerStorageRef = collection(db, 'medicine-storage');
        const storedItemData: StoredMedicineInput & { userId: string } = {
            name: inventoryItem.name,
            expiryDate: inventoryItem.expiryDate,
            quantity: quantity,
            photoUrl: '',
            userId: customerId,
        };
        await addDoc(customerStorageRef, storedItemData);


        return { success: true };
    } catch (e) {
        console.error('Fulfillment transaction failed: ', e);
        const message = e instanceof Error ? e.message : 'An unknown error occurred.';
        return { success: false, error: message };
    }
}

export async function createOrGetChat(idToken: string, otherUserId: string): Promise<{chatId: string, error?: string}> {
    let userAuth;
    try {
        userAuth = await getVerifiedUser(idToken);
    } catch(error) {
        const message = error instanceof Error ? error.message : "An unknown authentication error occurred.";
        return { chatId: '', error: message };
    }

    const user = await getUserProfile(userAuth.uid);

    if (!user) {
        return { chatId: '', error: 'Could not find your user profile.' };
    }
    
    await adminInitializationPromise;
    const db = getAdminDb();
    const currentUserProfileRef = doc(db, 'profiles', user.id);
    const otherUserProfileRef = doc(db, 'profiles', otherUserId);

    const [currentUserProfileSnap, otherUserProfileSnap] = await Promise.all([
        getDoc(currentUserProfileRef),
        getDoc(otherUserProfileRef)
    ]);

    if (!currentUserProfileSnap.exists() || !otherUserProfileSnap.exists()) {
        return { chatId: '', error: 'One or both user profiles could not be found.' };
    }
    
    const currentUserProfile = currentUserProfileSnap.data() as UserProfile;
    
    const isFamily = currentUserProfile.family?.includes(otherUserId);

    if (!isFamily) {
        return { chatId: '', error: 'You can only start a chat with a family member.' };
    }

    const members = [user.id, otherUserId].sort();
    const chatId = members.join('_');
    const chatRef = doc(db, 'chats', chatId);
    const chatSnap = await getDoc(chatRef);

    if (chatSnap.exists()) {
        return { chatId };
    } else {
        const otherUserProfile = otherUserProfileSnap.data() as UserProfile;
        const batch = writeBatch(db);
        
        const newChat: Chat = {
            id: chatId,
            members: members,
            memberDetails: [
                { id: currentUserProfile.id, name: currentUserProfile.name, pictureUrl: currentUserProfile.pictureUrl || '' },
                { id: otherUserProfile.id, name: otherUserProfile.name, pictureUrl: otherUserProfile.pictureUrl || '' }
            ],
            lastMessage: null,
            lastUpdatedAt: new Date().toISOString()
        };
        batch.set(chatRef, newChat);
        
        const currentUserChats = currentUserProfile.chats || [];
        if (!currentUserChats.includes(chatId)) {
            batch.update(currentUserProfileRef, { chats: arrayUnion(chatId) });
        }

        const otherUserChats = otherUserProfile.chats || [];
        if (!otherUserChats.includes(chatId)) {
            batch.update(otherUserProfileRef, { chats: arrayUnion(chatId) });
        }

        await batch.commit();
        
        return { chatId };
    }
}

export async function logAdherence(idToken: string, log: Omit<AdherenceLog, 'id' | 'loggedAt' | 'userId'>) {
    let userAuth;
    try {
        userAuth = await getVerifiedUser(idToken);
    } catch(error) {
        const message = error instanceof Error ? error.message : "An unknown authentication error occurred.";
        return { success: false, error: message };
    }

    try {
        await adminInitializationPromise;
        const db = getAdminDb();
        await addDoc(collection(db, 'adherenceLogs'), {
            ...log,
            userId: userAuth.uid,
            loggedAt: serverTimestamp(),
        });
        return { success: true };
    } catch (error) {
        console.error("Error logging adherence:", error);
        return { success: false, error: "Failed to log adherence." };
    }
}


export async function sendFriendRequest(idToken: string, otherUserId: string) {
    let currentUserAuth;
    try {
        currentUserAuth = await getVerifiedUser(idToken);
    } catch(error) {
        const message = error instanceof Error ? error.message : "An unknown authentication error occurred.";
        return { success: false, error: message };
    }

    if (currentUserAuth.uid === otherUserId) {
        return { success: false, error: "You cannot send a request to yourself." };
    }

    try {
        await adminInitializationPromise;
        const db = getAdminDb();
        
        const otherUser = await getUserProfile(otherUserId);
         if (!otherUser) {
            return { success: false, error: 'The user you are trying to add does not exist.' };
        }
        
        if (otherUser.accountType === 'doctor') {
            return { success: false, error: 'You cannot add a doctor as a family member.' };
        }
        
        // Check if a request already exists
        const requestsRef = collection(db, 'friendRequests');
        const q1 = query(requestsRef, where('from', '==', currentUserAuth.uid), where('to', '==', otherUserId));
        const q2 = query(requestsRef, where('from', '==', otherUserId), where('to', '==', currentUserAuth.uid));

        const [snapshot1, snapshot2] = await Promise.all([getDocs(q1), getDocs(q2)]);
        
        if (!snapshot1.empty || !snapshot2.empty) {
            return { success: false, error: "A pending request between you and this user already exists." };
        }

        const newRequest: Omit<FriendRequest, 'id'> = {
            from: currentUserAuth.uid,
            fromName: currentUserAuth.name || 'New User',
            fromPictureUrl: currentUserAuth.picture || '',
            to: otherUserId,
            status: 'pending',
            type: 'family',
            createdAt: serverTimestamp(),
        };

        await addDoc(collection(db, 'friendRequests'), newRequest);
        
        return { success: true, message: `A family request has been sent to ${otherUser.name}.` };
    } catch (error) {
        console.error('Error sending friend request:', error);
        const message = error instanceof Error ? error.message : "An unknown error occurred.";
        return { success: false, error: message };
    }
}

export async function signOut() {
    // This function can be expanded if server-side cleanup is needed.
    // For now, clearing the client-side auth state is handled by the component.
}
    