
import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';
import '@/lib/firebase-admin-init'; // Ensure admin SDK is initialized before plugins.

export const ai = genkit({
  plugins: [
    googleAI({
      apiKey: process.env.GENKIT_API_KEY || 'optional-key',
    }),
  ],
});
