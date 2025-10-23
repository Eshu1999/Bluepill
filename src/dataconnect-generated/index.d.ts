import { ConnectorConfig, DataConnect, QueryRef, QueryPromise, MutationRef, MutationPromise } from 'firebase/data-connect';

export const connectorConfig: ConnectorConfig;

export type TimestampString = string;
export type UUIDString = string;
export type Int64String = string;
export type DateString = string;




export interface CreateNewUserData {
  user_insert: User_Key;
}

export interface GetMedicationRemindersData {
  reminders: ({
    id: UUIDString;
    time: string;
    dayOfWeek: string;
    type: string;
  } & Reminder_Key)[];
}

export interface GetMedicationRemindersVariables {
  medicationId: UUIDString;
}

export interface HealthcareProvider_Key {
  id: UUIDString;
  __typename?: 'HealthcareProvider_Key';
}

export interface ListAllMedicationsData {
  medications: ({
    id: UUIDString;
    name: string;
    dosage: string;
    frequency: string;
  } & Medication_Key)[];
}

export interface LogEntry_Key {
  id: UUIDString;
  __typename?: 'LogEntry_Key';
}

export interface Medication_Key {
  id: UUIDString;
  __typename?: 'Medication_Key';
}

export interface Reminder_Key {
  id: UUIDString;
  __typename?: 'Reminder_Key';
}

export interface UpdateMedicationDosageData {
  medication_update?: Medication_Key | null;
}

export interface UpdateMedicationDosageVariables {
  id: UUIDString;
  dosage: string;
}

export interface User_Key {
  id: UUIDString;
  __typename?: 'User_Key';
}

interface CreateNewUserRef {
  /* Allow users to create refs without passing in DataConnect */
  (): MutationRef<CreateNewUserData, undefined>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect): MutationRef<CreateNewUserData, undefined>;
  operationName: string;
}
export const createNewUserRef: CreateNewUserRef;

export function createNewUser(): MutationPromise<CreateNewUserData, undefined>;
export function createNewUser(dc: DataConnect): MutationPromise<CreateNewUserData, undefined>;

interface ListAllMedicationsRef {
  /* Allow users to create refs without passing in DataConnect */
  (): QueryRef<ListAllMedicationsData, undefined>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect): QueryRef<ListAllMedicationsData, undefined>;
  operationName: string;
}
export const listAllMedicationsRef: ListAllMedicationsRef;

export function listAllMedications(): QueryPromise<ListAllMedicationsData, undefined>;
export function listAllMedications(dc: DataConnect): QueryPromise<ListAllMedicationsData, undefined>;

interface UpdateMedicationDosageRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: UpdateMedicationDosageVariables): MutationRef<UpdateMedicationDosageData, UpdateMedicationDosageVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: UpdateMedicationDosageVariables): MutationRef<UpdateMedicationDosageData, UpdateMedicationDosageVariables>;
  operationName: string;
}
export const updateMedicationDosageRef: UpdateMedicationDosageRef;

export function updateMedicationDosage(vars: UpdateMedicationDosageVariables): MutationPromise<UpdateMedicationDosageData, UpdateMedicationDosageVariables>;
export function updateMedicationDosage(dc: DataConnect, vars: UpdateMedicationDosageVariables): MutationPromise<UpdateMedicationDosageData, UpdateMedicationDosageVariables>;

interface GetMedicationRemindersRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: GetMedicationRemindersVariables): QueryRef<GetMedicationRemindersData, GetMedicationRemindersVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: GetMedicationRemindersVariables): QueryRef<GetMedicationRemindersData, GetMedicationRemindersVariables>;
  operationName: string;
}
export const getMedicationRemindersRef: GetMedicationRemindersRef;

export function getMedicationReminders(vars: GetMedicationRemindersVariables): QueryPromise<GetMedicationRemindersData, GetMedicationRemindersVariables>;
export function getMedicationReminders(dc: DataConnect, vars: GetMedicationRemindersVariables): QueryPromise<GetMedicationRemindersData, GetMedicationRemindersVariables>;

