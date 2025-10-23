
import type { Timestamp, FieldValue } from "firebase/firestore";
export * from './auth';

export type Medication = {
  id: string;
  name: string;
  dosage: string;
  times: string[]; // Stored as HH:mm strings
  userId?: string; // Optional userId
  expiryDate?: string; // Stored as YYYY-MM-DD
  quantity?: number; // Total number of pills/units
  quantityUnit?: string; // e.g., 'tablets', 'ml'
};

// Type for creating/updating a medication, userId is not included here
// as it will be handled separately if needed.
export type MedicationInput = Omit<Medication, 'id'> & { userId: string };

export type AdherenceLog = {
    id: string;
    userId: string;
    medicationId: string;
    medicationName: string;
    scheduledTime: string; // The time it was supposed to be taken (e.g., "09:00 AM")
    action: 'taken' | 'skipped';
    loggedAt: Timestamp | Date; // The time the action was recorded
}

export type UserProfile = {
    id: string;
    name: string;
    username?: string;
    email: string;
    emailVerified: boolean;
    phoneNumber?: string;
    phoneVerified?: boolean;
    allergies: string;
    emergencyContact: string;
    pictureUrl?: string;
    userId: string;
    accountType?: 'normal' | 'doctor';
    chats?: string[];
    family?: string[];
}

export type UserProfileInput = Partial<Omit<UserProfile, 'id' | 'emailVerified' | 'phoneVerified'>> & {
    userId: string;
};


export type InventoryItem = {
    id: string;
    name: string;
    boxes: number;
    unitsPerBox: number;
    medicinesPerUnit: number;
    expiryDate: string; // Stored as YYYY-MM-DD
    userId: string;
}

export type InventoryItemInput = Omit<InventoryItem, 'id' | 'userId'>;

export type FriendRequest = {
    id: string;
    from: string; // user ID
    fromName: string;
    fromPictureUrl?: string;
    to: string; // user ID
    status: 'pending' | 'accepted' | 'declined';
    type: 'family';
    createdAt: Timestamp | FieldValue;
}

export type SharedMedicationRequest = {
    id: string; // The request ID (same as the document ID)
    medicationDetails: {
        name: string;
        dosage: string;
        times: string[];
        expiryDate?: string;
    };
    sharedBy: string; // Chemist's UID
    chemistName: string; // Chemist's display name
    sharedAt: string; // ISO date string
    status: 'pending' | 'accepted' | 'declined';
};

export type MedicationRequest = {
    id: string;
    customerId: string;
    customerName: string;
    status: 'pending' | 'completed' | 'declined';
    requestedAt: string; // ISO string
};

export type StoredMedicine = {
    id: string;
    name: string;
    expiryDate: string; // Stored as YYYY-MM-DD
    userId: string;
    photoUrl?: string;
    quantity?: number;
}

export type StoredMedicineInput = Omit<StoredMedicine, 'id' | 'userId'>;

export type Message = {
    id: string;
    senderId: string;
    text: string;
    timestamp: Timestamp | Date;
    isRead: boolean;
};

export type MessageInput = Omit<Message, 'id' | 'timestamp'>;

export type ChatMember = {
    id: string, 
    name: string,
    pictureUrl?: string,
}

export type Chat = {
    id: string;
    members: string[]; // array of user IDs
    memberDetails: ChatMember[];
    lastMessage: Message | null;
    lastUpdatedAt: string; // ISO string
}
