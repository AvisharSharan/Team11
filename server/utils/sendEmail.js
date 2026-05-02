const https = require('https');

const GMAIL_TOKEN_ENDPOINT = 'https://oauth2.googleapis.com/token';
const GMAIL_SEND_ENDPOINT = 'https://gmail.googleapis.com/gmail/v1/users/me/messages/send';

const postRequest = (url, body, headers) =>
  new Promise((resolve, reject) => {
    const payload = typeof body === 'string' ? body : JSON.stringify(body);
    const requestUrl = new URL(url);

    const req = https.request(
      {
        method: 'POST',
        hostname: requestUrl.hostname,
        path: `${requestUrl.pathname}${requestUrl.search}`,
        headers: {
          'Content-Length': Buffer.byteLength(payload),
          ...headers,
        },
      },
      (res) => {
        let responseBody = '';

        res.on('data', (chunk) => {
          responseBody += chunk;
        });

        res.on('end', () => {
          let data = responseBody;
          try {
            data = responseBody ? JSON.parse(responseBody) : {};
          } catch {
            // Keep raw text for diagnostics if Google returns a non-JSON error.
          }

          if (res.statusCode >= 200 && res.statusCode < 300) {
            resolve(data);
            return;
          }

          const error = new Error(`Gmail API returned ${res.statusCode}`);
          error.statusCode = res.statusCode;
          error.response = data;
          reject(error);
        });
      }
    );

    req.on('error', reject);
    req.write(payload);
    req.end();
  });

const encodeHeader = (value) => {
  if (/^[\x00-\x7F]*$/.test(value)) return value;
  return `=?UTF-8?B?${Buffer.from(value, 'utf8').toString('base64')}?=`;
};

const escapeHtml = (value) =>
  String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

const base64UrlEncode = (value) =>
  Buffer.from(value, 'utf8').toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');

const createRawEmail = ({ fromEmail, fromName, to, subject, text, html }) => {
  const boundary = `syncsphere_${Date.now()}_${Math.random().toString(36).slice(2)}`;
  const safeText = text || '';
  const safeHtml = html || `<pre>${escapeHtml(safeText)}</pre>`;

  const message = [
    `From: ${encodeHeader(fromName)} <${fromEmail}>`,
    `To: ${to}`,
    `Subject: ${encodeHeader(subject)}`,
    'MIME-Version: 1.0',
    `Content-Type: multipart/alternative; boundary="${boundary}"`,
    '',
    `--${boundary}`,
    'Content-Type: text/plain; charset="UTF-8"',
    'Content-Transfer-Encoding: 7bit',
    '',
    safeText,
    '',
    `--${boundary}`,
    'Content-Type: text/html; charset="UTF-8"',
    'Content-Transfer-Encoding: 7bit',
    '',
    safeHtml,
    '',
    `--${boundary}--`,
  ].join('\r\n');

  return base64UrlEncode(message);
};

const getGmailAccessToken = async () => {
  const clientId = process.env.GMAIL_CLIENT_ID;
  const clientSecret = process.env.GMAIL_CLIENT_SECRET;
  const refreshToken = process.env.GMAIL_REFRESH_TOKEN;

  if (!clientId || !clientSecret || !refreshToken) {
    throw new Error('Gmail API OAuth credentials are not configured');
  }

  const params = new URLSearchParams({
    client_id: clientId,
    client_secret: clientSecret,
    refresh_token: refreshToken,
    grant_type: 'refresh_token',
  });

  const data = await postRequest(GMAIL_TOKEN_ENDPOINT, params.toString(), {
    'Content-Type': 'application/x-www-form-urlencoded',
  });

  if (!data.access_token) {
    throw new Error('Gmail API did not return an access token');
  }

  return data.access_token;
};

const sendEmail = async (options) => {
  const fromEmail = process.env.GMAIL_USER;
  const fromName = process.env.GMAIL_FROM_NAME || 'SyncSphere';

  if (!fromEmail) {
    throw new Error('GMAIL_USER is not configured');
  }

  const accessToken = await getGmailAccessToken();
  const raw = createRawEmail({
    fromEmail,
    fromName,
    to: options.email,
    subject: options.subject,
    text: options.message,
    html: options.html,
  });

  return postRequest(
    GMAIL_SEND_ENDPOINT,
    { raw },
    {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    }
  );
};

module.exports = sendEmail;
