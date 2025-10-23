import { queryRef, executeQuery, mutationRef, executeMutation, validateArgs } from 'firebase/data-connect';

export const connectorConfig = {
  connector: 'example',
  service: 'studio',
  location: 'us-central1'
};

export const createNewUserRef = (dc) => {
  const { dc: dcInstance} = validateArgs(connectorConfig, dc, undefined);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'CreateNewUser');
}
createNewUserRef.operationName = 'CreateNewUser';

export function createNewUser(dc) {
  return executeMutation(createNewUserRef(dc));
}

export const listAllMedicationsRef = (dc) => {
  const { dc: dcInstance} = validateArgs(connectorConfig, dc, undefined);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'ListAllMedications');
}
listAllMedicationsRef.operationName = 'ListAllMedications';

export function listAllMedications(dc) {
  return executeQuery(listAllMedicationsRef(dc));
}

export const updateMedicationDosageRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'UpdateMedicationDosage', inputVars);
}
updateMedicationDosageRef.operationName = 'UpdateMedicationDosage';

export function updateMedicationDosage(dcOrVars, vars) {
  return executeMutation(updateMedicationDosageRef(dcOrVars, vars));
}

export const getMedicationRemindersRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'GetMedicationReminders', inputVars);
}
getMedicationRemindersRef.operationName = 'GetMedicationReminders';

export function getMedicationReminders(dcOrVars, vars) {
  return executeQuery(getMedicationRemindersRef(dcOrVars, vars));
}

