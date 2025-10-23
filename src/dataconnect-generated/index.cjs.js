const { queryRef, executeQuery, mutationRef, executeMutation, validateArgs } = require('firebase/data-connect');

const connectorConfig = {
  connector: 'example',
  service: 'studio',
  location: 'us-central1'
};
exports.connectorConfig = connectorConfig;

const createNewUserRef = (dc) => {
  const { dc: dcInstance} = validateArgs(connectorConfig, dc, undefined);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'CreateNewUser');
}
createNewUserRef.operationName = 'CreateNewUser';
exports.createNewUserRef = createNewUserRef;

exports.createNewUser = function createNewUser(dc) {
  return executeMutation(createNewUserRef(dc));
};

const listAllMedicationsRef = (dc) => {
  const { dc: dcInstance} = validateArgs(connectorConfig, dc, undefined);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'ListAllMedications');
}
listAllMedicationsRef.operationName = 'ListAllMedications';
exports.listAllMedicationsRef = listAllMedicationsRef;

exports.listAllMedications = function listAllMedications(dc) {
  return executeQuery(listAllMedicationsRef(dc));
};

const updateMedicationDosageRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'UpdateMedicationDosage', inputVars);
}
updateMedicationDosageRef.operationName = 'UpdateMedicationDosage';
exports.updateMedicationDosageRef = updateMedicationDosageRef;

exports.updateMedicationDosage = function updateMedicationDosage(dcOrVars, vars) {
  return executeMutation(updateMedicationDosageRef(dcOrVars, vars));
};

const getMedicationRemindersRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'GetMedicationReminders', inputVars);
}
getMedicationRemindersRef.operationName = 'GetMedicationReminders';
exports.getMedicationRemindersRef = getMedicationRemindersRef;

exports.getMedicationReminders = function getMedicationReminders(dcOrVars, vars) {
  return executeQuery(getMedicationRemindersRef(dcOrVars, vars));
};
