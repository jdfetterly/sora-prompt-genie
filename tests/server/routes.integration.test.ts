import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import request from 'supertest';
import express, { type Express } from 'express';
import { registerRoutes } from '../../server/routes';
import * as openrouterModule from '../../server/lib/openrouter';
import * as suggestionAgentModule from '../../server/agents/suggestionAgent';

// Mock OpenRouter and suggestion agent
vi.mock('../../server/lib/openrouter', () => ({
  enhancePromptWithAI: vi.fn(),
  autoGeneratePrompt: vi.fn(),
  structurePromptWithAI: vi.fn(),
}));

vi.mock('../../server/agents/suggestionAgent', () => ({
  generateSuggestionsAgent: vi.fn(),
}));

describe('API Routes Integration Tests', () => {
  let app: Express;
  let server: any;

  beforeEach(async () => {
    app = express();
    app.use(express.json());
    
    // Mock logger to avoid console output during tests
    vi.mock('../../server/utils/logger', () => ({
      logger: {
        debug: vi.fn(),
        info: vi.fn(),
        warn: vi.fn(),
        error: vi.fn(),
      },
    }));

    server = await registerRoutes(app);
  });

  afterEach(() => {
    vi.clearAllMocks();
    if (server) {
      server.close();
    }
  });

  describe('GET /api/health', () => {
    it('should return health status', async () => {
      const response = await request(app).get('/api/health');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('status', 'ok');
      expect(response.body).toHaveProperty('timestamp');
      expect(response.body).toHaveProperty('uptime');
      expect(response.body).toHaveProperty('environment');
      expect(typeof response.body.timestamp).toBe('string');
      expect(typeof response.body.uptime).toBe('number');
    });

    it('should not be rate limited', async () => {
      // Make multiple requests quickly
      const responses = await Promise.all([
        request(app).get('/api/health'),
        request(app).get('/api/health'),
        request(app).get('/api/health'),
      ]);

      responses.forEach((response) => {
        expect(response.status).toBe(200);
      });
    });
  });

  describe('POST /api/enhance-prompt', () => {
    it('should enhance a prompt successfully', async () => {
      const mockEnhancedPrompt = 'Enhanced prompt with golden hour lighting';
      vi.mocked(openrouterModule.enhancePromptWithAI).mockResolvedValue(mockEnhancedPrompt);

      const requestBody = {
        currentPrompt: 'A beautiful sunset',
        enhancement: {
          title: 'Golden Hour',
          description: 'Warm golden lighting',
          category: 'lighting',
        },
      };

      const response = await request(app)
        .post('/api/enhance-prompt')
        .send(requestBody);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('enhancedPrompt', mockEnhancedPrompt);
      expect(openrouterModule.enhancePromptWithAI).toHaveBeenCalledWith(requestBody);
    });

    it('should reject invalid request body', async () => {
      const invalidBody = {
        currentPrompt: 'A beautiful sunset',
        // Missing enhancement
      };

      const response = await request(app)
        .post('/api/enhance-prompt')
        .send(invalidBody);

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });

    it('should handle OpenRouter API errors', async () => {
      const apiError = new Error('OpenRouter API error');
      vi.mocked(openrouterModule.enhancePromptWithAI).mockRejectedValue(apiError);

      const requestBody = {
        currentPrompt: 'A beautiful sunset',
        enhancement: {
          title: 'Golden Hour',
          description: 'Warm golden lighting',
          category: 'lighting',
        },
      };

      const response = await request(app)
        .post('/api/enhance-prompt')
        .send(requestBody);

      expect(response.status).toBe(500);
      expect(response.body).toHaveProperty('error');
    });

    it('should validate enhancement structure', async () => {
      const invalidBody = {
        currentPrompt: 'A beautiful sunset',
        enhancement: {
          title: 'Golden Hour',
          // Missing description and category
        },
      };

      const response = await request(app)
        .post('/api/enhance-prompt')
        .send(invalidBody);

      expect(response.status).toBe(400);
    });
  });

  describe('POST /api/generate-suggestions', () => {
    it('should generate suggestions successfully', async () => {
      const mockSuggestions = [
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
      ];

      vi.mocked(suggestionAgentModule.generateSuggestionsAgent).mockResolvedValue(mockSuggestions);

      const requestBody = {
        category: 'lighting',
        count: 2,
        currentPrompt: 'A beautiful sunset',
      };

      const response = await request(app)
        .post('/api/generate-suggestions')
        .send(requestBody);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('suggestions');
      expect(response.body.suggestions).toHaveLength(2);
      expect(response.body.suggestions[0]).toHaveProperty('id');
      expect(response.body.suggestions[0]).toHaveProperty('title');
      expect(response.body.suggestions[0]).toHaveProperty('description');
      expect(response.body.suggestions[0]).toHaveProperty('category');
      expect(suggestionAgentModule.generateSuggestionsAgent).toHaveBeenCalledWith({
        category: 'lighting',
        count: 2,
        currentPrompt: 'A beautiful sunset',
      });
    });

    it('should use default count when not provided', async () => {
      const mockSuggestions = Array(8).fill(null).map((_, i) => ({
        id: `suggestion-${i}`,
        title: `Suggestion ${i}`,
        description: `Description ${i}`,
        category: 'lighting',
      }));

      vi.mocked(suggestionAgentModule.generateSuggestionsAgent).mockResolvedValue(mockSuggestions);

      const requestBody = {
        category: 'lighting',
      };

      const response = await request(app)
        .post('/api/generate-suggestions')
        .send(requestBody);

      expect(response.status).toBe(200);
      expect(suggestionAgentModule.generateSuggestionsAgent).toHaveBeenCalledWith({
        category: 'lighting',
        count: 8, // Default value
        currentPrompt: undefined,
      });
    });

    it('should reject invalid category', async () => {
      const invalidBody = {
        count: 5,
        // Missing category
      };

      const response = await request(app)
        .post('/api/generate-suggestions')
        .send(invalidBody);

      expect(response.status).toBe(400);
    });

    it('should reject count outside valid range', async () => {
      const invalidBody = {
        category: 'lighting',
        count: 25, // Exceeds max of 20
      };

      const response = await request(app)
        .post('/api/generate-suggestions')
        .send(invalidBody);

      expect(response.status).toBe(400);
    });

    it('should handle agent errors', async () => {
      const apiError = new Error('Agent error');
      vi.mocked(suggestionAgentModule.generateSuggestionsAgent).mockRejectedValue(apiError);

      const requestBody = {
        category: 'lighting',
        count: 5,
      };

      const response = await request(app)
        .post('/api/generate-suggestions')
        .send(requestBody);

      expect(response.status).toBe(500);
      expect(response.body).toHaveProperty('error');
    });
  });

  describe('POST /api/auto-generate-prompt', () => {
    it('should auto-generate a prompt successfully', async () => {
      const mockGeneratedPrompt = 'A detailed cinematic prompt about a cat playing piano in space';
      vi.mocked(openrouterModule.autoGeneratePrompt).mockResolvedValue(mockGeneratedPrompt);

      const requestBody = {
        basicPrompt: 'A cat playing piano in space',
      };

      const response = await request(app)
        .post('/api/auto-generate-prompt')
        .send(requestBody);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('generatedPrompt', mockGeneratedPrompt);
      expect(openrouterModule.autoGeneratePrompt).toHaveBeenCalledWith('A cat playing piano in space');
    });

    it('should reject empty basic prompt', async () => {
      const invalidBody = {
        basicPrompt: '',
      };

      const response = await request(app)
        .post('/api/auto-generate-prompt')
        .send(invalidBody);

      expect(response.status).toBe(400);
    });

    it('should reject basic prompt with less than 3 words', async () => {
      const invalidBody = {
        basicPrompt: 'cat piano',
      };

      const response = await request(app)
        .post('/api/auto-generate-prompt')
        .send(invalidBody);

      expect(response.status).toBe(400);
    });

    it('should handle OpenRouter API errors', async () => {
      const apiError = new Error('OpenRouter API error');
      vi.mocked(openrouterModule.autoGeneratePrompt).mockRejectedValue(apiError);

      const requestBody = {
        basicPrompt: 'A cat playing piano in space',
      };

      const response = await request(app)
        .post('/api/auto-generate-prompt')
        .send(requestBody);

      expect(response.status).toBe(500);
      expect(response.body).toHaveProperty('error');
    });
  });

  describe('POST /api/structure-prompt', () => {
    it('should structure a prompt successfully', async () => {
      const mockStructuredPrompt = 'A structured prompt following the Sora guide format';
      vi.mocked(openrouterModule.structurePromptWithAI).mockResolvedValue(mockStructuredPrompt);

      const requestBody = {
        currentPrompt: 'A beautiful sunset over mountains',
      };

      const response = await request(app)
        .post('/api/structure-prompt')
        .send(requestBody);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('structuredPrompt', mockStructuredPrompt);
      expect(openrouterModule.structurePromptWithAI).toHaveBeenCalledWith(requestBody);
    });

    it('should reject missing currentPrompt', async () => {
      const invalidBody = {};

      const response = await request(app)
        .post('/api/structure-prompt')
        .send(invalidBody);

      expect(response.status).toBe(400);
    });

    it('should handle OpenRouter API errors', async () => {
      const apiError = new Error('OpenRouter API error');
      vi.mocked(openrouterModule.structurePromptWithAI).mockRejectedValue(apiError);

      const requestBody = {
        currentPrompt: 'A beautiful sunset',
      };

      const response = await request(app)
        .post('/api/structure-prompt')
        .send(requestBody);

      expect(response.status).toBe(500);
      expect(response.body).toHaveProperty('error');
    });
  });

  describe('Rate Limiting', () => {
    it('should apply rate limiting to AI endpoints', async () => {
      // Note: This test may be flaky due to timing, but it verifies the middleware is applied
      const mockResponse = 'Test response';
      vi.mocked(openrouterModule.enhancePromptWithAI).mockResolvedValue(mockResponse);

      const requestBody = {
        currentPrompt: 'Test',
        enhancement: {
          title: 'Test',
          description: 'Test',
          category: 'lighting',
        },
      };

      // Make a request - should succeed
      const response = await request(app)
        .post('/api/enhance-prompt')
        .send(requestBody);

      expect(response.status).toBe(200);
      
      // Verify rate limit headers are present
      expect(response.headers['ratelimit-limit']).toBeDefined();
    });
  });
});

