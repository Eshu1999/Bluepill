
// This file is used to load environment variables in development mode
// and to import flows so they are registered with Genkit.
if (process.env.NODE_ENV === 'development') {
    // Next.js automatically loads .env files. No need for dotenv here.
}

import '@/lib/firebase-admin-init'; // Ensure admin SDK is initialized before Genkit.
import './genkit';

// Import your flows here
import '@/ai/flows/analyze-inventory-document.ts';
import '@/ai/flows/analyze-user-medicine-document.ts';
