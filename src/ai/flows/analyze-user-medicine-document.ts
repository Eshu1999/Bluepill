
'use server';

/**
 * @fileOverview Analyzes a user's document (image, PDF) and extracts their medicine details for storage.
 *
 * - analyzeUserMedicineDocument - A function that analyzes the document.
 * - AnalyzeUserMedicineDocumentInput - The input type for the function.
 * - AnalyzeUserMedicineDocumentOutput - The return type for the function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { format } from 'date-fns';

const AnalyzeUserMedicineDocumentInputSchema = z.object({
  documentDataUri: z
    .string()
    .describe(
      "A document (e.g., image, PDF) of a prescription or medicine list, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type AnalyzeUserMedicineDocumentInput = z.infer<typeof AnalyzeUserMedicineDocumentInputSchema>;


const StoredMedicineSchema = z.object({
    name: z.string().describe('The full name of the medication, including strength (e.g., Paracetamol 500mg).'),
    quantity: z.number().int().describe('The total quantity of the medicine (e.g., number of tablets). Default to 1 if not specified.'),
    expiryDate: z.string().describe("The expiry date in YYYY-MM-DD format. If not found, use today's date plus one year."),
});

const AnalyzeUserMedicineDocumentOutputSchema = z.object({
  medicines: z
    .array(StoredMedicineSchema)
    .describe('A list of all medicines found in the document.'),
});

export type AnalyzeUserMedicineDocumentOutput = z.infer<typeof AnalyzeUserMedicineDocumentOutputSchema>;

export async function analyzeUserMedicineDocument(input: AnalyzeUserMedicineDocumentInput): Promise<AnalyzeUserMedicineDocumentOutput> {
  return analyzeUserMedicineDocumentFlow(input);
}

const prompt = ai.definePrompt({
  name: 'analyzeUserMedicineDocumentPrompt',
  input: {schema: AnalyzeUserMedicineDocumentInputSchema},
  output: {schema: AnalyzeUserMedicineDocumentOutputSchema},
  prompt: `You are an expert AI for helping users digitize their personal medication lists.
  Your task is to analyze the provided document (which is likely a photo of a prescription or a list of medicines) and extract a list of all medications.

  Document: {{media url=documentDataUri}}

  For each medication you find, extract the following information:
  - name: The full name of the medication, including its strength (e.g., "Paracetamol 500mg").
  - quantity: The total quantity of individual pills/tablets/units. Default to 1 if not specified.
  - expiryDate: The expiry date of the medication. It MUST be in YYYY-MM-DD format. If the document does not specify an expiry date, calculate it as one year from today's date, which is ${format(new Date(), 'yyyy-MM-dd')}.

  Return the data as a structured list of medicines. If no medications are found, return an empty list.
  `,
});

const analyzeUserMedicineDocumentFlow = ai.defineFlow(
  {
    name: 'analyzeUserMedicineDocumentFlow',
    inputSchema: AnalyzeUserMedicineDocumentInputSchema,
    outputSchema: AnalyzeUserMedicineDocumentOutputSchema,
  },
  async (input) => {
    const {output} = await prompt(input);
    return output!;
  }
);

    