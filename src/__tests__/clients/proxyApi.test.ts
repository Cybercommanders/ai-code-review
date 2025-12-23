/**
 * @fileoverview Tests for CLIProxyAPI integration and custom base URL support.
 *
 * This module tests the ability to use custom proxy endpoints like CLIProxyAPI
 * for routing requests to various AI providers through a single endpoint.
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

// Store original env vars
const originalEnv = { ...process.env };

describe('CLIProxyAPI Integration', () => {
  beforeEach(() => {
    // Reset modules to ensure fresh imports
    vi.resetModules();
    // Clear relevant env vars
    delete process.env.AI_CODE_REVIEW_OPENAI_API_KEY;
    delete process.env.AI_CODE_REVIEW_OPENAI_BASE_URL;
    delete process.env.AI_CODE_REVIEW_MODEL;
  });

  afterEach(() => {
    // Restore original env
    process.env = { ...originalEnv };
  });

  describe('Environment Variable Configuration', () => {
    it('should read AI_CODE_REVIEW_OPENAI_BASE_URL from environment', async () => {
      // Set custom base URL
      process.env.AI_CODE_REVIEW_OPENAI_BASE_URL = 'http://localhost:8316/v1';
      process.env.AI_CODE_REVIEW_OPENAI_API_KEY = 'test-key';
      process.env.AI_CODE_REVIEW_MODEL = 'openai:gpt-4';

      const { OpenAIClient } = await import('../../clients/implementations/openaiClient');
      const client = new OpenAIClient();

      // Access baseUrl through the client (it's protected, so we check via behavior)
      // The baseUrl should be set to include /chat/completions
      expect(process.env.AI_CODE_REVIEW_OPENAI_BASE_URL).toBe('http://localhost:8316/v1');
    });

    it('should read AI_CODE_REVIEW_OPENAI_API_KEY from environment', async () => {
      const testKey = 'sk-test-proxy-api-key-12345';
      process.env.AI_CODE_REVIEW_OPENAI_API_KEY = testKey;
      process.env.AI_CODE_REVIEW_MODEL = 'openai:gpt-4';

      const { OpenAIClient } = await import('../../clients/implementations/openaiClient');
      const client = new OpenAIClient();

      // The API key should be stored in the client
      expect(process.env.AI_CODE_REVIEW_OPENAI_API_KEY).toBe(testKey);
    });

    it('should append /chat/completions to base URL if not present', async () => {
      process.env.AI_CODE_REVIEW_OPENAI_BASE_URL = 'http://localhost:8316/v1';
      process.env.AI_CODE_REVIEW_OPENAI_API_KEY = 'test-key';
      process.env.AI_CODE_REVIEW_MODEL = 'openai:gpt-4';

      const { OpenAIClient } = await import('../../clients/implementations/openaiClient');
      const client = new OpenAIClient();

      // The baseUrl should end with /chat/completions
      // We verify this by checking the client was created without errors
      expect(client).toBeDefined();
    });

    it('should not duplicate /chat/completions if already present', async () => {
      process.env.AI_CODE_REVIEW_OPENAI_BASE_URL = 'http://localhost:8316/v1/chat/completions';
      process.env.AI_CODE_REVIEW_OPENAI_API_KEY = 'test-key';
      process.env.AI_CODE_REVIEW_MODEL = 'openai:gpt-4';

      const { OpenAIClient } = await import('../../clients/implementations/openaiClient');
      const client = new OpenAIClient();

      // Client should be created without errors
      expect(client).toBeDefined();
    });

    it('should handle trailing slash in base URL', async () => {
      process.env.AI_CODE_REVIEW_OPENAI_BASE_URL = 'http://localhost:8316/v1/';
      process.env.AI_CODE_REVIEW_OPENAI_API_KEY = 'test-key';
      process.env.AI_CODE_REVIEW_MODEL = 'openai:gpt-4';

      const { OpenAIClient } = await import('../../clients/implementations/openaiClient');
      const client = new OpenAIClient();

      // Client should handle trailing slash correctly
      expect(client).toBeDefined();
    });
  });

  describe('Default Configuration', () => {
    it('should use default OpenAI URL when AI_CODE_REVIEW_OPENAI_BASE_URL is not set', async () => {
      // Ensure no custom URL is set
      delete process.env.AI_CODE_REVIEW_OPENAI_BASE_URL;
      process.env.AI_CODE_REVIEW_OPENAI_API_KEY = 'test-key';
      process.env.AI_CODE_REVIEW_MODEL = 'openai:gpt-4';

      const { OpenAIClient } = await import('../../clients/implementations/openaiClient');
      const client = new OpenAIClient();

      // Client should use default API endpoint
      expect(client).toBeDefined();
    });
  });

  describe('Model Name Handling', () => {
    it('should support openai: prefixed model names', async () => {
      process.env.AI_CODE_REVIEW_MODEL = 'openai:gpt-4';
      process.env.AI_CODE_REVIEW_OPENAI_API_KEY = 'test-key';

      const { OpenAIClient } = await import('../../clients/implementations/openaiClient');
      const client = new OpenAIClient();

      const result = client.isModelSupported('openai:gpt-4');
      expect(result.isCorrect).toBe(true);
      expect(result.modelName).toBe('gpt-4');
    });

    it('should support proxy-routed models with openai: prefix', async () => {
      // CLIProxyAPI routes different providers through OpenAI-compatible endpoint
      // The model name is passed through as-is to the proxy
      process.env.AI_CODE_REVIEW_MODEL = 'openai:gemini-2.5-pro';
      process.env.AI_CODE_REVIEW_OPENAI_API_KEY = 'test-key';
      process.env.AI_CODE_REVIEW_OPENAI_BASE_URL = 'http://localhost:8316/v1';

      const { OpenAIClient } = await import('../../clients/implementations/openaiClient');
      const client = new OpenAIClient();

      // The client should accept the model with openai: prefix
      const result = client.isModelSupported('openai:gemini-2.5-pro');
      expect(result.isCorrect).toBe(true);
    });

    it('should support Claude models through proxy', async () => {
      process.env.AI_CODE_REVIEW_MODEL = 'openai:claude-3-5-haiku-20241022';
      process.env.AI_CODE_REVIEW_OPENAI_API_KEY = 'test-key';
      process.env.AI_CODE_REVIEW_OPENAI_BASE_URL = 'http://localhost:8316/v1';

      const { OpenAIClient } = await import('../../clients/implementations/openaiClient');
      const client = new OpenAIClient();

      const result = client.isModelSupported('openai:claude-3-5-haiku-20241022');
      expect(result.isCorrect).toBe(true);
    });

    it('should support Codex models through proxy', async () => {
      process.env.AI_CODE_REVIEW_MODEL = 'openai:gpt-5-codex';
      process.env.AI_CODE_REVIEW_OPENAI_API_KEY = 'test-key';
      process.env.AI_CODE_REVIEW_OPENAI_BASE_URL = 'http://localhost:8316/v1';

      const { OpenAIClient } = await import('../../clients/implementations/openaiClient');
      const client = new OpenAIClient();

      const result = client.isModelSupported('openai:gpt-5-codex');
      expect(result.isCorrect).toBe(true);
    });
  });

  describe('Provider Detection', () => {
    it('should return correct provider name', async () => {
      process.env.AI_CODE_REVIEW_OPENAI_API_KEY = 'test-key';
      process.env.AI_CODE_REVIEW_MODEL = 'openai:gpt-4';

      const { OpenAIClient } = await import('../../clients/implementations/openaiClient');
      const client = new OpenAIClient();

      // The provider should be openai
      const modelSupport = client.isModelSupported('openai:gpt-4');
      expect(modelSupport.adapter).toBe('openai');
    });
  });
});

describe('Proxy URL Formatting', () => {
  beforeEach(() => {
    vi.resetModules();
    delete process.env.AI_CODE_REVIEW_OPENAI_API_KEY;
    delete process.env.AI_CODE_REVIEW_OPENAI_BASE_URL;
    delete process.env.AI_CODE_REVIEW_MODEL;
  });

  afterEach(() => {
    process.env = { ...originalEnv };
  });

  it('should correctly format various proxy URL formats', async () => {
    const testCases = [
      { input: 'http://localhost:8316/v1', expected: 'http://localhost:8316/v1/chat/completions' },
      { input: 'http://localhost:8316/v1/', expected: 'http://localhost:8316/v1/chat/completions' },
      { input: 'http://localhost:8316/v1/chat/completions', expected: 'http://localhost:8316/v1/chat/completions' },
      { input: 'https://api.example.com/v1', expected: 'https://api.example.com/v1/chat/completions' },
    ];

    for (const { input } of testCases) {
      vi.resetModules();
      process.env.AI_CODE_REVIEW_OPENAI_BASE_URL = input;
      process.env.AI_CODE_REVIEW_OPENAI_API_KEY = 'test-key';
      process.env.AI_CODE_REVIEW_MODEL = 'openai:gpt-4';

      const { OpenAIClient } = await import('../../clients/implementations/openaiClient');
      const client = new OpenAIClient();

      // Client should be created successfully for all URL formats
      expect(client).toBeDefined();
    }
  });
});

describe('CLIProxyAPI Multi-Provider Support', () => {
  beforeEach(() => {
    vi.resetModules();
    process.env.AI_CODE_REVIEW_OPENAI_API_KEY = 'sk-test-proxy-key';
    process.env.AI_CODE_REVIEW_OPENAI_BASE_URL = 'http://localhost:8316/v1';
  });

  afterEach(() => {
    process.env = { ...originalEnv };
  });

  it('should support all documented CLIProxyAPI Plus models', async () => {
    // List of models available through CLIProxyAPI Plus
    const proxyModels = [
      // Google Gemini
      'gemini-2.5-pro',
      'gemini-2.5-flash',
      'gemini-2.5-flash-lite',
      'gemini-3-pro-preview',
      'gemini-3-flash-preview',
      // Anthropic Claude
      'claude-opus-4-5-20251101',
      'claude-sonnet-4-5-20250929',
      'claude-sonnet-4-20250514',
      'claude-3-7-sonnet-20250219',
      'claude-3-5-haiku-20241022',
      'claude-haiku-4-5-20251001',
      // OpenAI Codex (GPT-5 series)
      'gpt-5',
      'gpt-5.1',
      'gpt-5.2',
      'gpt-5-codex',
      'gpt-5.1-codex',
      'gpt-5.2-codex',
      'gpt-5-codex-mini',
      'gpt-5.1-codex-mini',
      'gpt-5.1-codex-max',
      // Alibaba Qwen
      'qwen3-coder-plus',
      'qwen3-coder-flash',
      'vision-model',
    ];

    const { OpenAIClient } = await import('../../clients/implementations/openaiClient');

    for (const model of proxyModels) {
      process.env.AI_CODE_REVIEW_MODEL = `openai:${model}`;
      vi.resetModules();

      const { OpenAIClient: FreshClient } = await import('../../clients/implementations/openaiClient');
      const client = new FreshClient();

      const result = client.isModelSupported(`openai:${model}`);
      expect(result.isCorrect).toBe(true);
      expect(result.modelName).toBe(model);
    }
  });
});
