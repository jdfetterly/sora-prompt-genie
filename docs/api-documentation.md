# API Documentation

This document provides comprehensive API documentation for SoraPromptGenie.

## Base URL

- **Development**: `http://localhost:5000`
- **Production**: `https://your-domain.com` (configure via `SITE_URL` environment variable)

## Authentication

Currently, the API does not require authentication. Rate limiting is applied to prevent abuse.

## Rate Limits

- **General API endpoints**: 100 requests per 15 minutes
- **AI-powered endpoints**: 20 requests per 15 minutes
  - `/api/enhance-prompt`
  - `/api/generate-suggestions`
  - `/api/auto-generate-prompt`
  - `/api/structure-prompt`

Rate limit headers are included in responses:
- `X-RateLimit-Limit`: Maximum number of requests allowed
- `X-RateLimit-Remaining`: Number of requests remaining
- `X-RateLimit-Reset`: Timestamp when the rate limit resets

## Endpoints

### Health Check

#### `GET /api/health`

Check the health status of the API server.

**Response:** `200 OK`

```json
{
  "status": "ok",
  "timestamp": "2024-01-01T12:00:00.000Z",
  "uptime": 3600.5,
  "environment": "production"
}
```

**Response Fields:**
- `status` (string): Always "ok" if the server is running
- `timestamp` (string): Current server time in ISO 8601 format
- `uptime` (number): Server uptime in seconds
- `environment` (string): Current environment (development, production, etc.)

---

### Enhance Prompt

#### `POST /api/enhance-prompt`

Enhance a video prompt with a selected enhancement (camera angle, lighting, style, etc.).

**Rate Limit:** 20 requests per 15 minutes

**Request Body:**

```json
{
  "currentPrompt": "A cat walking in a garden",
  "enhancement": {
    "title": "Low Angle Shot",
    "description": "Shot from a low angle looking up",
    "category": "Camera Angles"
  }
}
```

**Request Schema:**
- `currentPrompt` (string, required): The current video prompt to enhance
- `enhancement` (object, required):
  - `title` (string, required): Title of the enhancement
  - `description` (string, required): Description of the enhancement
  - `category` (string, required): Category of the enhancement

**Response:** `200 OK`

```json
{
  "enhancedPrompt": "A cat walking in a garden, shot from a low angle looking up, creating a sense of grandeur and scale..."
}
```

**Response Schema:**
- `enhancedPrompt` (string): The AI-enhanced prompt

**Error Responses:**

- `400 Bad Request`: Invalid request body or validation error
  ```json
  {
    "error": "Validation failed"
  }
  ```

- `429 Too Many Requests`: Rate limit exceeded
  ```json
  {
    "error": "Too many requests, please try again later"
  }
  ```

- `500 Internal Server Error`: Server error
  ```json
  {
    "error": "Failed to enhance prompt"
  }
  ```

---

### Generate Suggestions

#### `POST /api/generate-suggestions`

Generate contextual AI-powered suggestions for a specific enhancement category.

**Rate Limit:** 20 requests per 15 minutes

**Request Body:**

```json
{
  "category": "Camera Angles",
  "count": 8,
  "currentPrompt": "A cat walking in a garden"
}
```

**Request Schema:**
- `category` (string, required): The enhancement category (e.g., "Camera Angles", "Lighting", "Style")
- `count` (number, optional): Number of suggestions to generate (1-20, default: 8)
- `currentPrompt` (string, optional): Current prompt for contextual suggestions

**Response:** `200 OK`

```json
{
  "suggestions": [
    {
      "id": "suggestion-1",
      "title": "Low Angle Shot",
      "description": "Shot from a low angle looking up, creating a sense of grandeur",
      "category": "Camera Angles"
    },
    {
      "id": "suggestion-2",
      "title": "Bird's Eye View",
      "description": "Shot from directly above, providing a unique perspective",
      "category": "Camera Angles"
    }
  ]
}
```

**Response Schema:**
- `suggestions` (array): Array of suggestion objects
  - `id` (string): Unique identifier for the suggestion
  - `title` (string): Title of the suggestion
  - `description` (string): Description of the suggestion
  - `category` (string): Category of the suggestion

**Error Responses:**

- `400 Bad Request`: Invalid request body or validation error
- `429 Too Many Requests`: Rate limit exceeded
- `500 Internal Server Error`: Server error

---

### Auto Generate Prompt

#### `POST /api/auto-generate-prompt`

Automatically generate a complete, enhanced video prompt from a basic prompt.

**Rate Limit:** 20 requests per 15 minutes

**Request Body:**

```json
{
  "basicPrompt": "A cat walking in a garden"
}
```

**Request Schema:**
- `basicPrompt` (string, required): Basic prompt (minimum 3 words)

**Response:** `200 OK`

```json
{
  "generatedPrompt": "A graceful cat walking through a sun-dappled garden, shot with cinematic camera movements, golden hour lighting casting warm shadows, shallow depth of field focusing on the cat's movement, natural color grading with soft contrast..."
}
```

**Response Schema:**
- `generatedPrompt` (string): The AI-generated complete prompt

**Error Responses:**

- `400 Bad Request`: Invalid request body (e.g., less than 3 words)
  ```json
  {
    "error": "Basic prompt must contain at least 3 words"
  }
  ```

- `429 Too Many Requests`: Rate limit exceeded
- `500 Internal Server Error`: Server error

---

### Structure Prompt

#### `POST /api/structure-prompt`

Structure and refine an existing prompt for better clarity and organization.

**Rate Limit:** 20 requests per 15 minutes

**Request Body:**

```json
{
  "currentPrompt": "A cat walking in a garden with nice lighting and camera angles"
}
```

**Request Schema:**
- `currentPrompt` (string, required): The prompt to structure

**Response:** `200 OK`

```json
{
  "structuredPrompt": "A graceful cat walking through a lush garden. Shot with smooth camera movements and natural lighting. Composition emphasizes the cat's movement through the garden space."
}
```

**Response Schema:**
- `structuredPrompt` (string): The structured and refined prompt

**Error Responses:**

- `400 Bad Request`: Invalid request body
- `429 Too Many Requests`: Rate limit exceeded
- `500 Internal Server Error`: Server error

---

## Error Handling

All endpoints follow a consistent error response format:

**Error Response Schema:**
```json
{
  "error": "Error message describing what went wrong"
}
```

**HTTP Status Codes:**
- `200 OK`: Request successful
- `400 Bad Request`: Invalid request (validation error, malformed JSON)
- `429 Too Many Requests`: Rate limit exceeded
- `500 Internal Server Error`: Server error

**Error Messages:**
- In production, error messages are sanitized and do not expose internal details
- Stack traces are only included in development mode
- All errors are logged server-side for debugging

## Examples

### Example: Enhancing a Prompt

```bash
curl -X POST http://localhost:5000/api/enhance-prompt \
  -H "Content-Type: application/json" \
  -d '{
    "currentPrompt": "A cat walking in a garden",
    "enhancement": {
      "title": "Golden Hour Lighting",
      "description": "Warm, soft lighting during sunset",
      "category": "Lighting"
    }
  }'
```

### Example: Generating Suggestions

```bash
curl -X POST http://localhost:5000/api/generate-suggestions \
  -H "Content-Type: application/json" \
  -d '{
    "category": "Camera Angles",
    "count": 5,
    "currentPrompt": "A cat walking in a garden"
  }'
```

### Example: Auto-Generating a Prompt

```bash
curl -X POST http://localhost:5000/api/auto-generate-prompt \
  -H "Content-Type: application/json" \
  -d '{
    "basicPrompt": "A cat walking in a garden"
  }'
```

## OpenAPI Specification

For machine-readable API documentation, see `docs/openapi.yaml` (to be generated).

## Support

For issues or questions:
- Check the [Environment Variables Documentation](./environment-variables.md)
- Review the [Production Readiness Plan](./production-readiness-plan.md)
- Check server logs for detailed error information

