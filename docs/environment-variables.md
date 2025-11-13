# Environment Variables Documentation

This document describes all environment variables used by SoraPromptGenie.

## Required Variables

### `OPENROUTER_API_KEY`
- **Required**: Yes
- **Description**: OpenRouter API key for AI-powered prompt generation
- **How to get**: Sign up at https://openrouter.ai/ and generate an API key
- **Example**: `sk-or-v1-...`

## Optional Variables

### Server Configuration

#### `PORT`
- **Required**: No
- **Default**: `5173`
- **Description**: Port number to run the server on
- **Example**: `5173`

#### `NODE_ENV`
- **Required**: No
- **Default**: `development`
- **Description**: Node.js environment mode
- **Options**: `development`, `production`, `test`
- **Example**: `production`

### CORS & Security

#### `SITE_URL`
- **Required**: No (recommended for production)
- **Default**: `http://localhost:5173` (development)
- **Description**: Your production site URL, used for CORS and API referrer headers
- **Example**: `https://sorapromptgenie.com`

#### `ALLOWED_ORIGINS`
- **Required**: No (recommended for production)
- **Default**: 
  - Development: `http://localhost:5173`
  - Production: `SITE_URL` or `https://sorapromptgenie.com`
- **Description**: Comma-separated list of allowed CORS origins
- **Example**: `https://sorapromptgenie.com,https://www.sorapromptgenie.com`

### OpenRouter Model Configuration

#### `OPENROUTER_MODEL`
- **Required**: No
- **Default**: `google/gemini-2.5-flash-lite`
- **Description**: The AI model to use for prompt generation
- **Options**:
  - `google/gemini-2.5-flash-lite` (current default, very cost-effective)
  - `anthropic/claude-3-haiku` (~$0.25/$1M input tokens)
  - `google/gemini-flash-1.5` (~$0.075/$1M input tokens)
  - `openai/gpt-3.5-turbo` (~$0.5/$1M input tokens)
  - `anthropic/claude-3.5-sonnet` (~$3/$1M input tokens) - Most capable but expensive
- **Example**: `google/gemini-2.5-flash-lite`

### Langflow Integration (Optional)

These variables are only needed if you're using Langflow for the suggestion agent. If not using Langflow, these can be omitted.

#### `LANGFLOW_BASE_URL`
- **Required**: No
- **Description**: Base URL for Langflow API
- **Example**: `https://api.langflow.com`

#### `LANGFLOW_API_KEY`
- **Required**: No
- **Description**: API key for Langflow
- **Example**: `your_langflow_api_key`

#### `LANGFLOW_SUGGESTION_FLOW_ID`
- **Required**: No
- **Description**: Flow ID for the suggestion generation flow
- **Example**: `flow-12345`

## Setup Instructions

1. Create a `.env` file in the project root (this file is gitignored and should not be committed)
2. Add the required variables:
   ```
   OPENROUTER_API_KEY=your_api_key_here
   ```
3. Add any optional variables you want to customize
4. For production, ensure you set:
   - `NODE_ENV=production`
   - `SITE_URL` to your production URL
   - `ALLOWED_ORIGINS` to your allowed origins

## Production Checklist

When deploying to production, make sure to configure:

- ✅ `OPENROUTER_API_KEY` (required)
- ✅ `NODE_ENV=production` (recommended)
- ✅ `SITE_URL` (recommended)
- ✅ `ALLOWED_ORIGINS` (recommended)

The application will validate required variables on startup and warn about missing recommended variables in production mode.

## Security Notes

- Never commit your `.env` file to version control
- Store production secrets securely (use your hosting platform's secret management)
- Rotate API keys regularly
- Use different API keys for development and production if possible

