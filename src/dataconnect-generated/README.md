# Generated TypeScript README
This README will guide you through the process of using the generated JavaScript SDK package for the connector `example`. It will also provide examples on how to use your generated SDK to call your Data Connect queries and mutations.

**If you're looking for the `React README`, you can find it at [`dataconnect-generated/react/README.md`](./react/README.md)**

***NOTE:** This README is generated alongside the generated SDK. If you make changes to this file, they will be overwritten when the SDK is regenerated.*

# Table of Contents
- [**Overview**](#generated-javascript-readme)
- [**Accessing the connector**](#accessing-the-connector)
  - [*Connecting to the local Emulator*](#connecting-to-the-local-emulator)
- [**Queries**](#queries)
  - [*ListAllMedications*](#listallmedications)
  - [*GetMedicationReminders*](#getmedicationreminders)
- [**Mutations**](#mutations)
  - [*CreateNewUser*](#createnewuser)
  - [*UpdateMedicationDosage*](#updatemedicationdosage)

# Accessing the connector
A connector is a collection of Queries and Mutations. One SDK is generated for each connector - this SDK is generated for the connector `example`. You can find more information about connectors in the [Data Connect documentation](https://firebase.google.com/docs/data-connect#how-does).

You can use this generated SDK by importing from the package `@dataconnect/generated` as shown below. Both CommonJS and ESM imports are supported.

You can also follow the instructions from the [Data Connect documentation](https://firebase.google.com/docs/data-connect/web-sdk#set-client).

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig } from '@dataconnect/generated';

const dataConnect = getDataConnect(connectorConfig);
```

## Connecting to the local Emulator
By default, the connector will connect to the production service.

To connect to the emulator, you can use the following code.
You can also follow the emulator instructions from the [Data Connect documentation](https://firebase.google.com/docs/data-connect/web-sdk#instrument-clients).

```typescript
import { connectDataConnectEmulator, getDataConnect } from 'firebase/data-connect';
import { connectorConfig } from '@dataconnect/generated';

const dataConnect = getDataConnect(connectorConfig);
connectDataConnectEmulator(dataConnect, 'localhost', 9399);
```

After it's initialized, you can call your Data Connect [queries](#queries) and [mutations](#mutations) from your generated SDK.

# Queries

There are two ways to execute a Data Connect Query using the generated Web SDK:
- Using a Query Reference function, which returns a `QueryRef`
  - The `QueryRef` can be used as an argument to `executeQuery()`, which will execute the Query and return a `QueryPromise`
- Using an action shortcut function, which returns a `QueryPromise`
  - Calling the action shortcut function will execute the Query and return a `QueryPromise`

The following is true for both the action shortcut function and the `QueryRef` function:
- The `QueryPromise` returned will resolve to the result of the Query once it has finished executing
- If the Query accepts arguments, both the action shortcut function and the `QueryRef` function accept a single argument: an object that contains all the required variables (and the optional variables) for the Query
- Both functions can be called with or without passing in a `DataConnect` instance as an argument. If no `DataConnect` argument is passed in, then the generated SDK will call `getDataConnect(connectorConfig)` behind the scenes for you.

Below are examples of how to use the `example` connector's generated functions to execute each query. You can also follow the examples from the [Data Connect documentation](https://firebase.google.com/docs/data-connect/web-sdk#using-queries).

## ListAllMedications
You can execute the `ListAllMedications` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
listAllMedications(): QueryPromise<ListAllMedicationsData, undefined>;

interface ListAllMedicationsRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (): QueryRef<ListAllMedicationsData, undefined>;
}
export const listAllMedicationsRef: ListAllMedicationsRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
listAllMedications(dc: DataConnect): QueryPromise<ListAllMedicationsData, undefined>;

interface ListAllMedicationsRef {
  ...
  (dc: DataConnect): QueryRef<ListAllMedicationsData, undefined>;
}
export const listAllMedicationsRef: ListAllMedicationsRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the listAllMedicationsRef:
```typescript
const name = listAllMedicationsRef.operationName;
console.log(name);
```

### Variables
The `ListAllMedications` query has no variables.
### Return Type
Recall that executing the `ListAllMedications` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `ListAllMedicationsData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface ListAllMedicationsData {
  medications: ({
    id: UUIDString;
    name: string;
    dosage: string;
    frequency: string;
  } & Medication_Key)[];
}
```
### Using `ListAllMedications`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, listAllMedications } from '@dataconnect/generated';


// Call the `listAllMedications()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await listAllMedications();

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await listAllMedications(dataConnect);

console.log(data.medications);

// Or, you can use the `Promise` API.
listAllMedications().then((response) => {
  const data = response.data;
  console.log(data.medications);
});
```

### Using `ListAllMedications`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, listAllMedicationsRef } from '@dataconnect/generated';


// Call the `listAllMedicationsRef()` function to get a reference to the query.
const ref = listAllMedicationsRef();

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = listAllMedicationsRef(dataConnect);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.medications);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.medications);
});
```

## GetMedicationReminders
You can execute the `GetMedicationReminders` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
getMedicationReminders(vars: GetMedicationRemindersVariables): QueryPromise<GetMedicationRemindersData, GetMedicationRemindersVariables>;

interface GetMedicationRemindersRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: GetMedicationRemindersVariables): QueryRef<GetMedicationRemindersData, GetMedicationRemindersVariables>;
}
export const getMedicationRemindersRef: GetMedicationRemindersRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
getMedicationReminders(dc: DataConnect, vars: GetMedicationRemindersVariables): QueryPromise<GetMedicationRemindersData, GetMedicationRemindersVariables>;

interface GetMedicationRemindersRef {
  ...
  (dc: DataConnect, vars: GetMedicationRemindersVariables): QueryRef<GetMedicationRemindersData, GetMedicationRemindersVariables>;
}
export const getMedicationRemindersRef: GetMedicationRemindersRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the getMedicationRemindersRef:
```typescript
const name = getMedicationRemindersRef.operationName;
console.log(name);
```

### Variables
The `GetMedicationReminders` query requires an argument of type `GetMedicationRemindersVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface GetMedicationRemindersVariables {
  medicationId: UUIDString;
}
```
### Return Type
Recall that executing the `GetMedicationReminders` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `GetMedicationRemindersData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface GetMedicationRemindersData {
  reminders: ({
    id: UUIDString;
    time: string;
    dayOfWeek: string;
    type: string;
  } & Reminder_Key)[];
}
```
### Using `GetMedicationReminders`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, getMedicationReminders, GetMedicationRemindersVariables } from '@dataconnect/generated';

// The `GetMedicationReminders` query requires an argument of type `GetMedicationRemindersVariables`:
const getMedicationRemindersVars: GetMedicationRemindersVariables = {
  medicationId: ..., 
};

// Call the `getMedicationReminders()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await getMedicationReminders(getMedicationRemindersVars);
// Variables can be defined inline as well.
const { data } = await getMedicationReminders({ medicationId: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await getMedicationReminders(dataConnect, getMedicationRemindersVars);

console.log(data.reminders);

// Or, you can use the `Promise` API.
getMedicationReminders(getMedicationRemindersVars).then((response) => {
  const data = response.data;
  console.log(data.reminders);
});
```

### Using `GetMedicationReminders`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, getMedicationRemindersRef, GetMedicationRemindersVariables } from '@dataconnect/generated';

// The `GetMedicationReminders` query requires an argument of type `GetMedicationRemindersVariables`:
const getMedicationRemindersVars: GetMedicationRemindersVariables = {
  medicationId: ..., 
};

// Call the `getMedicationRemindersRef()` function to get a reference to the query.
const ref = getMedicationRemindersRef(getMedicationRemindersVars);
// Variables can be defined inline as well.
const ref = getMedicationRemindersRef({ medicationId: ..., });

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = getMedicationRemindersRef(dataConnect, getMedicationRemindersVars);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.reminders);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.reminders);
});
```

# Mutations

There are two ways to execute a Data Connect Mutation using the generated Web SDK:
- Using a Mutation Reference function, which returns a `MutationRef`
  - The `MutationRef` can be used as an argument to `executeMutation()`, which will execute the Mutation and return a `MutationPromise`
- Using an action shortcut function, which returns a `MutationPromise`
  - Calling the action shortcut function will execute the Mutation and return a `MutationPromise`

The following is true for both the action shortcut function and the `MutationRef` function:
- The `MutationPromise` returned will resolve to the result of the Mutation once it has finished executing
- If the Mutation accepts arguments, both the action shortcut function and the `MutationRef` function accept a single argument: an object that contains all the required variables (and the optional variables) for the Mutation
- Both functions can be called with or without passing in a `DataConnect` instance as an argument. If no `DataConnect` argument is passed in, then the generated SDK will call `getDataConnect(connectorConfig)` behind the scenes for you.

Below are examples of how to use the `example` connector's generated functions to execute each mutation. You can also follow the examples from the [Data Connect documentation](https://firebase.google.com/docs/data-connect/web-sdk#using-mutations).

## CreateNewUser
You can execute the `CreateNewUser` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
createNewUser(): MutationPromise<CreateNewUserData, undefined>;

interface CreateNewUserRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (): MutationRef<CreateNewUserData, undefined>;
}
export const createNewUserRef: CreateNewUserRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
createNewUser(dc: DataConnect): MutationPromise<CreateNewUserData, undefined>;

interface CreateNewUserRef {
  ...
  (dc: DataConnect): MutationRef<CreateNewUserData, undefined>;
}
export const createNewUserRef: CreateNewUserRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the createNewUserRef:
```typescript
const name = createNewUserRef.operationName;
console.log(name);
```

### Variables
The `CreateNewUser` mutation has no variables.
### Return Type
Recall that executing the `CreateNewUser` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `CreateNewUserData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface CreateNewUserData {
  user_insert: User_Key;
}
```
### Using `CreateNewUser`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, createNewUser } from '@dataconnect/generated';


// Call the `createNewUser()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await createNewUser();

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await createNewUser(dataConnect);

console.log(data.user_insert);

// Or, you can use the `Promise` API.
createNewUser().then((response) => {
  const data = response.data;
  console.log(data.user_insert);
});
```

### Using `CreateNewUser`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, createNewUserRef } from '@dataconnect/generated';


// Call the `createNewUserRef()` function to get a reference to the mutation.
const ref = createNewUserRef();

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = createNewUserRef(dataConnect);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.user_insert);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.user_insert);
});
```

## UpdateMedicationDosage
You can execute the `UpdateMedicationDosage` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
updateMedicationDosage(vars: UpdateMedicationDosageVariables): MutationPromise<UpdateMedicationDosageData, UpdateMedicationDosageVariables>;

interface UpdateMedicationDosageRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: UpdateMedicationDosageVariables): MutationRef<UpdateMedicationDosageData, UpdateMedicationDosageVariables>;
}
export const updateMedicationDosageRef: UpdateMedicationDosageRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
updateMedicationDosage(dc: DataConnect, vars: UpdateMedicationDosageVariables): MutationPromise<UpdateMedicationDosageData, UpdateMedicationDosageVariables>;

interface UpdateMedicationDosageRef {
  ...
  (dc: DataConnect, vars: UpdateMedicationDosageVariables): MutationRef<UpdateMedicationDosageData, UpdateMedicationDosageVariables>;
}
export const updateMedicationDosageRef: UpdateMedicationDosageRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the updateMedicationDosageRef:
```typescript
const name = updateMedicationDosageRef.operationName;
console.log(name);
```

### Variables
The `UpdateMedicationDosage` mutation requires an argument of type `UpdateMedicationDosageVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface UpdateMedicationDosageVariables {
  id: UUIDString;
  dosage: string;
}
```
### Return Type
Recall that executing the `UpdateMedicationDosage` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `UpdateMedicationDosageData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface UpdateMedicationDosageData {
  medication_update?: Medication_Key | null;
}
```
### Using `UpdateMedicationDosage`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, updateMedicationDosage, UpdateMedicationDosageVariables } from '@dataconnect/generated';

// The `UpdateMedicationDosage` mutation requires an argument of type `UpdateMedicationDosageVariables`:
const updateMedicationDosageVars: UpdateMedicationDosageVariables = {
  id: ..., 
  dosage: ..., 
};

// Call the `updateMedicationDosage()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await updateMedicationDosage(updateMedicationDosageVars);
// Variables can be defined inline as well.
const { data } = await updateMedicationDosage({ id: ..., dosage: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await updateMedicationDosage(dataConnect, updateMedicationDosageVars);

console.log(data.medication_update);

// Or, you can use the `Promise` API.
updateMedicationDosage(updateMedicationDosageVars).then((response) => {
  const data = response.data;
  console.log(data.medication_update);
});
```

### Using `UpdateMedicationDosage`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, updateMedicationDosageRef, UpdateMedicationDosageVariables } from '@dataconnect/generated';

// The `UpdateMedicationDosage` mutation requires an argument of type `UpdateMedicationDosageVariables`:
const updateMedicationDosageVars: UpdateMedicationDosageVariables = {
  id: ..., 
  dosage: ..., 
};

// Call the `updateMedicationDosageRef()` function to get a reference to the mutation.
const ref = updateMedicationDosageRef(updateMedicationDosageVars);
// Variables can be defined inline as well.
const ref = updateMedicationDosageRef({ id: ..., dosage: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = updateMedicationDosageRef(dataConnect, updateMedicationDosageVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.medication_update);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.medication_update);
});
```

