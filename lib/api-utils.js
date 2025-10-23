
import { z, ZodError } from 'zod';

const API_KEY = process.env.API_KEY;

export async function requireApiKey(request) {
  if (!API_KEY) {
    return new Response(JSON.stringify({ error: 'Server not configured: API_KEY missing' }), { status: 500 });
  }
  const key = request.headers.get('x-api-key') || request.headers.get('X-Api-Key');
  if (!key || key !== API_KEY) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
  }
  return null; // Authorized
}

export async function authenticateUser(request) {
  // Dev shortcut: allow requests with the dev API key to act as a dev user
  const devApiKeyHeader = request.headers.get('x-api-key') || request.headers.get('X-Api-Key');
  if (devApiKeyHeader && String(devApiKeyHeader) === 'dev-key') {
    request.user = { id: 'dev', email: 'dev@local', name: 'Developer (dev-key)' };
    console.debug('authenticate: dev-key bypass active, setting dev user');
    return null;
  }

  const authHeader = request.headers.get('authorization') || request.headers.get('Authorization');
  if (!authHeader) {
    return new Response(JSON.stringify({ error: 'Authorization header missing' }), { status: 401 });
  }
  const token = authHeader.replace(/^Bearer\s+/i, '').trim();

  try {
    // Use the access token to fetch user info from Google's userinfo endpoint
    const response = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      console.error('Google userinfo API error:', response.status);
      return new Response(JSON.stringify({ error: 'Invalid token' }), { status: 401 });
    }

    const userInfo = await response.json();
    request.user = {
      id: userInfo.sub,
      email: userInfo.email,
      name: userInfo.name,
    };
    return null;
  } catch (err) {
    console.error('Token verification failed:', err);
    return new Response(JSON.stringify({ error: 'Invalid token' }), { status: 401 });
  }
}

export function validate(schema) {
  return async (request) => {
    try {
      // Check if body was already parsed
      if (request.parsedBody) {
        console.log('Body already parsed, reusing:', request.parsedBody);
        schema.parse(request.parsedBody);
        return null;
      }
      
      const body = await request.json();
      console.log('Parsed request body:', body);
      schema.parse(body);
      // Attach parsed body to request for reuse
      request.parsedBody = body;
      return null; // Validation successful
    } catch (error) {
      console.error('Validation error details:', {
        name: error.name,
        message: error.message,
        isZodError: error instanceof ZodError,
        issues: error.issues
      });
      
      if (error instanceof ZodError) {
        // Use error.issues instead of error.errors for newer Zod versions
        const details = (error.issues || error.errors || []).map(e => ({
          path: Array.isArray(e.path) ? e.path.join('.') : '',
          message: e.message || 'Invalid input'
        }));
        return new Response(JSON.stringify({ error: 'Invalid payload', details }), { status: 400 });
      }
      // Handle JSON parsing errors or other errors
      return new Response(JSON.stringify({ 
        error: 'Invalid request', 
        details: error.message || 'Failed to parse request body' 
      }), { status: 400 });
    }
  };
}

export const IssueCreateSchema = z.object({
  title: z.string().min(3).max(100),
  description: z.string().min(1).max(1000),
  category: z.string().min(2).max(50),
  lat: z.number().min(-90).max(90).optional(),
  lng: z.number().min(-180).max(180).optional(),
  photo: z.string().optional(), // Can be base64 data or URL
  userId: z.string().optional(),
  priority: z.enum(['low', 'medium', 'high']).optional(),
});

export const StatusSchema = z.object({
  status: z.enum(['open','in_progress','resolved']).optional(),
  assignedTo: z.string().min(2).max(100).optional(),
  statusChangeReason: z.string().min(5).max(1000),
}).refine(d => d.status || d.assignedTo, { message: 'Provide status or assignedTo' });

export const CommentSchema = z.object({
  user: z.string().min(2).max(50),
  text: z.string().min(1).max(1000)
});

export const FlagSchema = z.object({
  user: z.string().min(2).max(50),
  reason: z.string().min(3).max(300)
});

export const FeedbackSchema = z.object({
  rating: z.number().min(1).max(5),
  comment: z.string().min(1).max(500)
});
