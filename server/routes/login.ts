import crypto from 'crypto';
import express from 'express';
import querystring from 'qs';
import axios from 'axios';
import FormData from 'form-data';

const password = String(process.env.PASSWORD);
const key = crypto.scryptSync(password, 'salt', 24);
const iv = crypto.randomBytes(16);

export const loginRouter = express.Router();

const base64URLEncode = (bytes: Buffer): string => {
  return bytes.toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
}

const sha256 = (buffer: string): Buffer => {
  return crypto.createHash('sha256')
    .update(buffer)
    .digest();
}

const encrypt = (value: string): string => {
  const cipher = crypto.createCipheriv('aes-192-cbc', key, iv);
  let encrypted = cipher.update(value, 'utf-8', 'hex');
  encrypted += cipher.final('hex');
  return encrypted + ':' + iv.toString('hex');
}

const decrypt = (value: string) => {
  const parts = value.split(':');
  const cipherText = parts[0];
  const iv = Buffer.from(parts[1], 'hex');
  const decipher = crypto.createDecipheriv('aes-192-cbc', key, iv);
  let decrypted = decipher.update(cipherText, 'hex', 'utf-8');
  decrypted += decipher.final('utf-8');
  return decrypted;
}

const createState = (res: any): string => {
  const state = base64URLEncode(crypto.randomBytes(64));
  res.cookie('oauth_state', encrypt(state), { httpOnly: true });
  return state;
}

const createCodeChallenge = (res: any): string => {
  const verifier = base64URLEncode(crypto.randomBytes(64));
  res.cookie('oauth_code_verifier', encrypt(verifier), { httpOnly: true });
  return base64URLEncode(sha256(verifier));
}

const restoreState = (req: any, res: any): string => {
  const value = decrypt(req.cookies.oauth_state);
  res.clearCookie('oauth_state');
  return value;
}

const restoreCodeVerifier = (req: any, res: any): string => {
  const value = decrypt(req.cookies.oauth_code_verifier);
  res.clearCookie('oauth_code_verifier');
  return value;
}

loginRouter.get('/login', (req, res, next) => {

  const state = createState(res);
  const challenge = createCodeChallenge(res);
  const scope = 'user-top-read user-read-recently-played user-read-currently-playing';

  res.redirect('https://accounts.spotify.com/authorize?' +
    querystring.stringify({
      response_type: 'code',
      client_id: process.env.CLIENT_ID,
      scope: scope,
      redirect_uri: process.env.REDIRECT_URI,
      state: state,
      code_challenge_method: 'S256',
      code_challenge: challenge
    }));
});

loginRouter.get('/oauth-callback', (req, res, next) => {
  const reqState = req.query.state;
  const state = restoreState(req, res);

  if (reqState !== state) {
    console.log('State does not match! Redirecting back to start');
    
    res.redirect('http://localhost:3000?' +
      querystring.stringify({
        error: 'state_mismatch'
      }));
    return;
  }

  const code = req.query.code;
  const codeVerifier = restoreCodeVerifier(req, res);
  
  const form = {
    code: code,
    redirect_uri: process.env.REDIRECT_URI,
    grant_type: 'authorization_code',
    code_verifier: codeVerifier
  }

  const header = {
    'Authorization': 'Basic ' + Buffer.from(process.env.CLIENT_ID + ':' + process.env.CLIENT_SECRET).toString('base64'),
    'Content-Type': 'application/x-www-form-urlencoded'
  }

  axios.post('https://accounts.spotify.com/api/token', form, { headers: header })
    .then(response => {
      const token = response.data.access_token;
      const refresh = response.data.refresh_token;

      const header = {
        'Authorization': 'Bearer ' + token
      }

      res.redirect('http://localhost:3000/#' + 
        querystring.stringify({
          access_token: token,
          refresh_token: refresh
        }));
    })
    .catch(e => console.error(e));
});