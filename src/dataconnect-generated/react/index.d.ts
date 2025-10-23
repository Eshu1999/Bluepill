import { CreateNewUserData, ListAllMedicationsData, UpdateMedicationDosageData, UpdateMedicationDosageVariables, GetMedicationRemindersData, GetMedicationRemindersVariables } from '../';
import { UseDataConnectQueryResult, useDataConnectQueryOptions, UseDataConnectMutationResult, useDataConnectMutationOptions} from '@tanstack-query-firebase/react/data-connect';
import { UseQueryResult, UseMutationResult} from '@tanstack/react-query';
import { DataConnect } from 'firebase/data-connect';
import { FirebaseError } from 'firebase/app';


export function useCreateNewUser(options?: useDataConnectMutationOptions<CreateNewUserData, FirebaseError, void>): UseDataConnectMutationResult<CreateNewUserData, undefined>;
export function useCreateNewUser(dc: DataConnect, options?: useDataConnectMutationOptions<CreateNewUserData, FirebaseError, void>): UseDataConnectMutationResult<CreateNewUserData, undefined>;

export function useListAllMedications(options?: useDataConnectQueryOptions<ListAllMedicationsData>): UseDataConnectQueryResult<ListAllMedicationsData, undefined>;
export function useListAllMedications(dc: DataConnect, options?: useDataConnectQueryOptions<ListAllMedicationsData>): UseDataConnectQueryResult<ListAllMedicationsData, undefined>;

export function useUpdateMedicationDosage(options?: useDataConnectMutationOptions<UpdateMedicationDosageData, FirebaseError, UpdateMedicationDosageVariables>): UseDataConnectMutationResult<UpdateMedicationDosageData, UpdateMedicationDosageVariables>;
export function useUpdateMedicationDosage(dc: DataConnect, options?: useDataConnectMutationOptions<UpdateMedicationDosageData, FirebaseError, UpdateMedicationDosageVariables>): UseDataConnectMutationResult<UpdateMedicationDosageData, UpdateMedicationDosageVariables>;

export function useGetMedicationReminders(vars: GetMedicationRemindersVariables, options?: useDataConnectQueryOptions<GetMedicationRemindersData>): UseDataConnectQueryResult<GetMedicationRemindersData, GetMedicationRemindersVariables>;
export function useGetMedicationReminders(dc: DataConnect, vars: GetMedicationRemindersVariables, options?: useDataConnectQueryOptions<GetMedicationRemindersData>): UseDataConnectQueryResult<GetMedicationRemindersData, GetMedicationRemindersVariables>;
