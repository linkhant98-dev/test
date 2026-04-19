'use server';
/**
 * @fileOverview An AI agent that analyzes production order variances to detect anomalies and provide concise, actionable insights.
 *
 * - varianceInsightGenerator - A function that generates insights based on production order variance data.
 * - VarianceInsightGeneratorInput - The input type for the varianceInsightGenerator function.
 * - VarianceInsightGeneratorOutput - The return type for the varianceInsightGenerator function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const VarianceInsightGeneratorInputSchema = z.object({
  productionOrderId: z.string().describe('The unique identifier for the production order.'),
  finishedGoodName: z.string().describe('The name of the finished good produced.'),
  plannedQuantity: z.number().describe('The planned quantity of the finished good.'),
  actualQuantity: z.number().describe('The actual quantity produced of the finished good.'),
  yieldPercentage: z.number().describe('The actual yield percentage for the production order.'),
  plannedMaterialConsumption: z.array(z.object({
    materialName: z.string().describe('The name of the raw material.'),
    plannedQuantity: z.number().describe('The planned quantity of this raw material.'),
  })).describe('List of planned raw material consumption.'),
  actualMaterialConsumption: z.array(z.object({
    materialName: z.string().describe('The name of the raw material.'),
    actualQuantity: z.number().describe('The actual quantity consumed of this raw material.'),
  })).describe('List of actual raw material consumption.'),
  materialVariances: z.array(z.object({
    materialName: z.string().describe('The name of the raw material.'),
    quantityVariance: z.number().describe('The variance in quantity for this raw material (actual - planned). Positive means over-consumed, negative means under-consumed.'),
    costVariance: z.number().describe('The variance in cost for this raw material (actual cost - planned cost). Positive means over-spent, negative means under-spent.'),
  })).describe('List of material variances (quantity and cost).'),
  wasteReasons: z.array(z.object({
    reason: z.string().describe('The reason for the waste.'),
    quantity: z.number().describe('The quantity of material wasted for this reason.'),
  })).describe('List of waste reasons and quantities.'),
});
export type VarianceInsightGeneratorInput = z.infer<typeof VarianceInsightGeneratorInputSchema>;

const VarianceInsightGeneratorOutputSchema = z.object({
  summary: z.string().describe('A concise summary of significant deviations, potential root causes, and actionable insights for the production order.'),
});
export type VarianceInsightGeneratorOutput = z.infer<typeof VarianceInsightGeneratorOutputSchema>;

export async function varianceInsightGenerator(input: VarianceInsightGeneratorInput): Promise<VarianceInsightGeneratorOutput> {
  return varianceInsightGeneratorFlow(input);
}

const prompt = ai.definePrompt({
  name: 'varianceInsightGeneratorPrompt',
  input: {schema: VarianceInsightGeneratorInputSchema},
  output: {schema: VarianceInsightGeneratorOutputSchema},
  prompt: `You are an expert production analyst. Your task is to analyze production order variances and identify significant deviations, their potential root causes, and provide actionable insights.

Production Order ID: {{{productionOrderId}}}
Finished Good: {{{finishedGoodName}}}
Planned Quantity: {{{plannedQuantity}}}
Actual Quantity: {{{actualQuantity}}}
Yield Percentage: {{{yieldPercentage}}}%

Material Consumption:
{{#each plannedMaterialConsumption}}
  - Planned {{materialName}}: {{plannedQuantity}}
{{/each}}
{{#each actualMaterialConsumption}}
  - Actual {{materialName}}: {{actualQuantity}}
{{/each}}

Material Variances (positive indicates over-consumption/over-spending, negative indicates under-consumption/under-spending):
{{#each materialVariances}}
  - Material: {{materialName}}, Quantity Variance: {{quantityVariance}}, Cost Variance: {{costVariance}}
{{/each}}

Waste Reasons:
{{#each wasteReasons}}
  - Reason: {{reason}}, Quantity: {{quantity}}
{{/each}}

Based on the data above, provide a concise summary of the most significant deviations, potential root causes, and actionable insights. Highlight any critical issues for further investigation. Focus on deviations that are large in magnitude or indicate systemic problems.`,
});

const varianceInsightGeneratorFlow = ai.defineFlow(
  {
    name: 'varianceInsightGeneratorFlow',
    inputSchema: VarianceInsightGeneratorInputSchema,
    outputSchema: VarianceInsightGeneratorOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
