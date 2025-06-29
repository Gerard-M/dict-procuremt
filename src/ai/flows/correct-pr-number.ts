'use server';

/**
 * @fileOverview A Genkit flow for correcting PR numbers to the expected format (YYYY-NN-NN).
 *
 * - correctPrNumber - A function that corrects a PR number using GenAI.
 * - CorrectPrNumberInput - The input type for the correctPrNumber function.
 * - CorrectPrNumberOutput - The return type for the correctPrNumber function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const CorrectPrNumberInputSchema = z.object({
  prNumber: z
    .string()
    .describe('The PR number to correct, which may be in an invalid format.'),
  existingPrNumbers: z
    .array(z.string())
    .describe('An array of existing PR numbers in the correct format.'),
});
export type CorrectPrNumberInput = z.infer<typeof CorrectPrNumberInputSchema>;

const CorrectPrNumberOutputSchema = z.object({
  correctedPrNumber: z
    .string()
    .describe('The corrected PR number in YYYY-NN-NN format, if possible.'),
  confidence: z
    .number()
    .describe('A confidence score (0-1) indicating the likelihood of the correction being accurate.'),
});
export type CorrectPrNumberOutput = z.infer<typeof CorrectPrNumberOutputSchema>;

export async function correctPrNumber(input: CorrectPrNumberInput): Promise<CorrectPrNumberOutput> {
  return correctPrNumberFlow(input);
}

const correctPrNumberPrompt = ai.definePrompt({
  name: 'correctPrNumberPrompt',
  input: {schema: CorrectPrNumberInputSchema},
  output: {schema: CorrectPrNumberOutputSchema},
  prompt: `You are a helpful assistant that corrects PR numbers to the format YYYY-NN-NN.

You are given a PR number that is not in the correct format and a list of existing PR numbers.

Based on the provided PR number and the existing PR numbers, determine the most likely correct PR number.
If there is no clear correction, return the original PR number and a low confidence score.

Invalid PR Number: {{{prNumber}}}
Existing PR Numbers: {{#each existingPrNumbers}}{{{this}}}{{#unless @last}}, {{/unless}}{{/each}}

Output should contain the corrected PR number and a confidence score between 0 and 1. The confidence score indicates how confident you are that the corrected PR number is correct.
`,
});

const correctPrNumberFlow = ai.defineFlow(
  {
    name: 'correctPrNumberFlow',
    inputSchema: CorrectPrNumberInputSchema,
    outputSchema: CorrectPrNumberOutputSchema,
  },
  async input => {
    const {output} = await correctPrNumberPrompt(input);
    return output!;
  }
);
