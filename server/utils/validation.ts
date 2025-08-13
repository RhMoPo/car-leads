import { z } from "zod";

export const conditionSchema = z.object({
  conditions: z.array(z.string()).optional(),
});

export function validateConditions(conditions: string[] = []): { valid: boolean; errors: string[] } {
  const majorIssues = ['engine_knock', 'gearbox_failure', 'severe_rust', 'accident_damage'];
  const foundMajorIssues = conditions.filter(condition => majorIssues.includes(condition));
  
  if (foundMajorIssues.length > 0) {
    return {
      valid: false,
      errors: [`Major issues detected: ${foundMajorIssues.join(', ')}. These cannot be accepted.`],
    };
  }

  return { valid: true, errors: [] };
}

// Honeypot validation
export function validateHoneypot(honeypotValue: string): boolean {
  return !honeypotValue || honeypotValue.trim() === '';
}
