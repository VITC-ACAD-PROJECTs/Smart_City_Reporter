// -- Save as middlewares/authenticate.js -- //
const axios = require('axios');
const { OAuth2Client } = require('google-auth-library');
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

async function authenticateUser(req, res, next) {
  // Dev shortcut: allow requests with the dev API key to act as a dev user
  const devApiKeyHeader = req.headers['x-api-key'] || req.headers['X-Api-Key'];
  if (devApiKeyHeader && String(devApiKeyHeader) === 'dev-key') {
    req.user = { id: 'dev', email: 'dev@local', name: 'Developer (dev-key)' };
    console.debug('authenticate: dev-key bypass active, setting dev user');
    return next();
  }

  const authHeader = req.headers['authorization'] || req.headers['Authorization'];
  if (!authHeader) return res.status(401).json({ error: 'Authorization header missing' });
  const token = authHeader.replace(/^Bearer\s+/i, '').trim();

  // First try verifying as an ID token (JWT)
  try {
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();
    req.user = {
      id: payload.sub,        // Google user ID
      email: payload.email,
      name: payload.name,
    };
    return next();
  } catch (idErr) {
    // If ID token verification fails, try using the token as an OAuth access token
    try {
      const resp = await axios.get('https://www.googleapis.com/oauth2/v3/userinfo', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const payload = resp.data;
      req.user = {
        id: payload.sub || payload.user_id,
        email: payload.email,
        name: payload.name,
      };
      return next();
    } catch (accessErr) {
      console.error('Token verification failed (idErr, accessErr):', idErr, accessErr);
      return res.status(401).json({ error: 'Invalid token' });
    }
  }
}

module.exports = authenticateUser;
