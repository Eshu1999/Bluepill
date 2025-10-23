
'use server';

/**
 * @fileOverview Analyzes an inventory document (image, PDF, etc.) and extracts medicine details.
 *
 * - analyzeInventoryDocument - A function that analyzes the document.
 * - AnalyzeInventoryDocumentInput - The input type for the function.
 * - AnalyzeInventoryDocumentOutput - The return type for the function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { InventoryItemInput } from '@/types';
import { format } from 'date-fns';

const AnalyzeInventoryDocumentInputSchema = z.object({
  documentDataUri: z
    .string()
    .describe(
      "A document (e.g., image, PDF, spreadsheet) of an inventory list, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type AnalyzeInventoryDocumentInput = z.infer<typeof AnalyzeInventoryDocumentInputSchema>;


const InventoryItemSchema = z.object({
    name: z.string().describe('The full name of the medication.'),
    boxes: z.number().int().describe('The number of boxes for this medication.'),
    unitsPerBox: z.number().int().describe('The number of units (e.g., strips, bottles) in each box.'),
    medicinesPerUnit: z.number().int().describe('The number of individual medicines (e.g., tablets, capsules) in each unit.'),
    expiryDate: z.string().describe("The expiry date in YYYY-MM-DD format. If not found, use today's date plus one year."),
});

const AnalyzeInventoryDocumentOutputSchema = z.object({
  inventory: z
    .array(InventoryItemSchema)
    .describe('A list of all inventory items found in the document.'),
});

export type AnalyzeInventoryDocumentOutput = z.infer<typeof AnalyzeInventoryDocumentOutputSchema>;

export async function analyzeInventoryDocument(input: AnalyzeInventoryDocumentInput): Promise<AnalyzeInventoryDocumentOutput> {
  return analyzeInventoryDocumentFlow(input);
}

const prompt = ai.definePrompt({
  name: 'analyzeInventoryDocumentPrompt',
  input: {schema: AnalyzeInventoryDocumentInputSchema},
  output: {schema: AnalyzeInventoryDocumentOutputSchema},
  prompt: `You are an expert AI for analyzing pharmaceutical documents.
  Your task is to analyze the provided document (which could be a handwritten prescription, a typed inventory list, a PDF, or a spreadsheet) and extract a list of all medications.

  Document: {{media url=documentDataUri}}

  For each medication you find, extract the following information:
  - name: The full name of the medication, including its strength (e.g., "Paracetamol 500mg").
  - boxes: The total number of boxes. Default to 1 if not specified.
  - unitsPerBox: The number of units per box (e.g., strips, bottles). Default to 1 if not specified.
  - medicinesPerUnit: The number of individual medicines per unit (e.g., tablets per strip). Default to 1 if not specified.
  - expiryDate: The expiry date of the medication. It MUST be in YYYY-MM-DD format. If the document does not specify an expiry date, calculate it as one year from today's date, which is ${format(new Date(), 'yyyy-MM-dd')}.

  Return the data as a structured list of inventory items. If no medications are found, return an empty list.
  `,
});

const analyzeInventoryDocumentFlow = ai.defineFlow(
  {
    name: 'analyzeInventoryDocumentFlow',
    inputSchema: AnalyzeInventoryDocumentInputSchema,
    outputSchema: AnalyzeInventoryDocumentOutputSchema,
  },
  async (input) => {
    const {output} = await prompt(input);
    return output!;
  }
);
