import { describe, it, expect } from 'vitest';
import {
  enhancePromptSchema,
  generateSuggestionsSchema,
  autoGeneratePromptSchema,
  structurePromptSchema,
  enhancePromptResponseSchema,
  generateSuggestionsResponseSchema,
  autoGeneratePromptResponseSchema,
  structurePromptResponseSchema,
  suggestionSchema,
} from '@shared/schema';

describe('Zod Schema Validation', () => {
  describe('enhancePromptSchema', () => {
    it('should validate a valid enhance prompt request', () => {
      const validRequest = {
        currentPrompt: 'A beautiful sunset',
        enhancement: {
          title: 'Golden Hour',
          description: 'Warm golden lighting',
          category: 'lighting',
        },
      };

      const result = enhancePromptSchema.safeParse(validRequest);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.currentPrompt).toBe('A beautiful sunset');
        expect(result.data.enhancement.title).toBe('Golden Hour');
      }
    });

    it('should reject missing currentPrompt', () => {
      const invalidRequest = {
        enhancement: {
          title: 'Golden Hour',
          description: 'Warm golden lighting',
          category: 'lighting',
        },
      };

      const result = enhancePromptSchema.safeParse(invalidRequest);
      expect(result.success).toBe(false);
    });

    it('should reject missing enhancement', () => {
      const invalidRequest = {
        currentPrompt: 'A beautiful sunset',
      };

      const result = enhancePromptSchema.safeParse(invalidRequest);
      expect(result.success).toBe(false);
    });

    it('should reject invalid enhancement structure', () => {
      const invalidRequest = {
        currentPrompt: 'A beautiful sunset',
        enhancement: {
          title: 'Golden Hour',
          // Missing description and category
        },
      };

      const result = enhancePromptSchema.safeParse(invalidRequest);
      expect(result.success).toBe(false);
    });

    it('should accept empty currentPrompt string', () => {
      const validRequest = {
        currentPrompt: '',
        enhancement: {
          title: 'Golden Hour',
          description: 'Warm golden lighting',
          category: 'lighting',
        },
      };

      const result = enhancePromptSchema.safeParse(validRequest);
      expect(result.success).toBe(true);
    });
  });

  describe('generateSuggestionsSchema', () => {
    it('should validate a valid generate suggestions request', () => {
      const validRequest = {
        category: 'lighting',
        count: 5,
        currentPrompt: 'A beautiful sunset',
      };

      const result = generateSuggestionsSchema.safeParse(validRequest);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.category).toBe('lighting');
        expect(result.data.count).toBe(5);
        expect(result.data.currentPrompt).toBe('A beautiful sunset');
      }
    });

    it('should use default count of 8 when not provided', () => {
      const request = {
        category: 'lighting',
      };

      const result = generateSuggestionsSchema.safeParse(request);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.count).toBe(8);
      }
    });

    it('should reject count less than 1', () => {
      const invalidRequest = {
        category: 'lighting',
        count: 0,
      };

      const result = generateSuggestionsSchema.safeParse(invalidRequest);
      expect(result.success).toBe(false);
    });

    it('should reject count greater than 20', () => {
      const invalidRequest = {
        category: 'lighting',
        count: 21,
      };

      const result = generateSuggestionsSchema.safeParse(invalidRequest);
      expect(result.success).toBe(false);
    });

    it('should accept optional currentPrompt', () => {
      const validRequest = {
        category: 'lighting',
        count: 5,
      };

      const result = generateSuggestionsSchema.safeParse(validRequest);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.currentPrompt).toBeUndefined();
      }
    });

    it('should reject missing category', () => {
      const invalidRequest = {
        count: 5,
      };

      const result = generateSuggestionsSchema.safeParse(invalidRequest);
      expect(result.success).toBe(false);
    });
  });

  describe('autoGeneratePromptSchema', () => {
    it('should validate a valid auto-generate prompt request', () => {
      const validRequest = {
        basicPrompt: 'A cat playing piano in space',
      };

      const result = autoGeneratePromptSchema.safeParse(validRequest);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.basicPrompt).toBe('A cat playing piano in space');
      }
    });

    it('should reject empty string', () => {
      const invalidRequest = {
        basicPrompt: '',
      };

      const result = autoGeneratePromptSchema.safeParse(invalidRequest);
      expect(result.success).toBe(false);
    });

    it('should reject string with less than 3 words', () => {
      const invalidRequest = {
        basicPrompt: 'cat piano',
      };

      const result = autoGeneratePromptSchema.safeParse(invalidRequest);
      expect(result.success).toBe(false);
    });

    it('should accept string with exactly 3 words', () => {
      const validRequest = {
        basicPrompt: 'cat playing piano',
      };

      const result = autoGeneratePromptSchema.safeParse(validRequest);
      expect(result.success).toBe(true);
    });

    it('should accept string with multiple spaces between words', () => {
      const validRequest = {
        basicPrompt: 'cat    playing     piano',
      };

      const result = autoGeneratePromptSchema.safeParse(validRequest);
      expect(result.success).toBe(true);
    });

    it('should reject string with only whitespace', () => {
      const invalidRequest = {
        basicPrompt: '   ',
      };

      const result = autoGeneratePromptSchema.safeParse(invalidRequest);
      expect(result.success).toBe(false);
    });

    it('should reject missing basicPrompt', () => {
      const invalidRequest = {};

      const result = autoGeneratePromptSchema.safeParse(invalidRequest);
      expect(result.success).toBe(false);
    });
  });

  describe('structurePromptSchema', () => {
    it('should validate a valid structure prompt request', () => {
      const validRequest = {
        currentPrompt: 'A beautiful sunset over mountains',
      };

      const result = structurePromptSchema.safeParse(validRequest);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.currentPrompt).toBe('A beautiful sunset over mountains');
      }
    });

    it('should accept empty string', () => {
      const validRequest = {
        currentPrompt: '',
      };

      const result = structurePromptSchema.safeParse(validRequest);
      expect(result.success).toBe(true);
    });

    it('should reject missing currentPrompt', () => {
      const invalidRequest = {};

      const result = structurePromptSchema.safeParse(invalidRequest);
      expect(result.success).toBe(false);
    });
  });

  describe('Response Schemas', () => {
    describe('enhancePromptResponseSchema', () => {
      it('should validate a valid enhance prompt response', () => {
        const validResponse = {
          enhancedPrompt: 'An enhanced prompt with golden hour lighting',
        };

        const result = enhancePromptResponseSchema.safeParse(validResponse);
        expect(result.success).toBe(true);
      });

      it('should reject missing enhancedPrompt', () => {
        const invalidResponse = {};

        const result = enhancePromptResponseSchema.safeParse(invalidResponse);
        expect(result.success).toBe(false);
      });
    });

    describe('generateSuggestionsResponseSchema', () => {
      it('should validate a valid generate suggestions response', () => {
        const validResponse = {
          suggestions: [
            {
              id: 'suggestion-1',
              title: 'Golden Hour',
              description: 'Warm golden lighting',
              category: 'lighting',
            },
            {
              id: 'suggestion-2',
              title: 'Blue Hour',
              description: 'Cool blue lighting',
              category: 'lighting',
            },
          ],
        };

        const result = generateSuggestionsResponseSchema.safeParse(validResponse);
        expect(result.success).toBe(true);
      });

      it('should validate empty suggestions array', () => {
        const validResponse = {
          suggestions: [],
        };

        const result = generateSuggestionsResponseSchema.safeParse(validResponse);
        expect(result.success).toBe(true);
      });

      it('should reject invalid suggestion structure', () => {
        const invalidResponse = {
          suggestions: [
            {
              id: 'suggestion-1',
              title: 'Golden Hour',
              // Missing description and category
            },
          ],
        };

        const result = generateSuggestionsResponseSchema.safeParse(invalidResponse);
        expect(result.success).toBe(false);
      });

      it('should reject missing suggestions array', () => {
        const invalidResponse = {};

        const result = generateSuggestionsResponseSchema.safeParse(invalidResponse);
        expect(result.success).toBe(false);
      });
    });

    describe('suggestionSchema', () => {
      it('should validate a valid suggestion', () => {
        const validSuggestion = {
          id: 'suggestion-1',
          title: 'Golden Hour',
          description: 'Warm golden lighting',
          category: 'lighting',
        };

        const result = suggestionSchema.safeParse(validSuggestion);
        expect(result.success).toBe(true);
      });

      it('should reject missing required fields', () => {
        const invalidSuggestion = {
          id: 'suggestion-1',
          title: 'Golden Hour',
          // Missing description and category
        };

        const result = suggestionSchema.safeParse(invalidSuggestion);
        expect(result.success).toBe(false);
      });
    });

    describe('autoGeneratePromptResponseSchema', () => {
      it('should validate a valid auto-generate prompt response', () => {
        const validResponse = {
          generatedPrompt: 'A detailed cinematic prompt',
        };

        const result = autoGeneratePromptResponseSchema.safeParse(validResponse);
        expect(result.success).toBe(true);
      });

      it('should reject missing generatedPrompt', () => {
        const invalidResponse = {};

        const result = autoGeneratePromptResponseSchema.safeParse(invalidResponse);
        expect(result.success).toBe(false);
      });
    });

    describe('structurePromptResponseSchema', () => {
      it('should validate a valid structure prompt response', () => {
        const validResponse = {
          structuredPrompt: 'A structured prompt',
        };

        const result = structurePromptResponseSchema.safeParse(validResponse);
        expect(result.success).toBe(true);
      });

      it('should reject missing structuredPrompt', () => {
        const invalidResponse = {};

        const result = structurePromptResponseSchema.safeParse(invalidResponse);
        expect(result.success).toBe(false);
      });
    });
  });
});

