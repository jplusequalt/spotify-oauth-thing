"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.loginRouter = void 0;
const crypto_1 = __importDefault(require("crypto"));
const express_1 = __importDefault(require("express"));
const qs_1 = __importDefault(require("qs"));
const axios_1 = __importDefault(require("axios"));
const password = String(process.env.PASSWORD);
const key = crypto_1.default.scryptSync(password, 'salt', 24);
const iv = crypto_1.default.randomBytes(16);
exports.loginRouter = express_1.default.Router();
const base64URLEncode = (bytes) => {
    return bytes.toString('base64')
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=/g, '');
};
const sha256 = (buffer) => {
    return crypto_1.default.createHash('sha256')
        .update(buffer)
        .digest();
};
const encrypt = (value) => {
    const cipher = crypto_1.default.createCipheriv('aes-192-cbc', key, iv);
    let encrypted = cipher.update(value, 'utf-8', 'hex');
    encrypted += cipher.final('hex');
    return encrypted + ':' + iv.toString('hex');
};
const decrypt = (value) => {
    const parts = value.split(':');
    const cipherText = parts[0];
    const iv = Buffer.from(parts[1], 'hex');
    const decipher = crypto_1.default.createDecipheriv('aes-192-cbc', key, iv);
    let decrypted = decipher.update(cipherText, 'hex', 'utf-8');
    decrypted += decipher.final('utf-8');
    return decrypted;
};
const createState = (res) => {
    const state = base64URLEncode(crypto_1.default.randomBytes(64));
    res.cookie('oauth_state', encrypt(state), { httpOnly: true });
    return state;
};
const createCodeChallenge = (res) => {
    const verifier = base64URLEncode(crypto_1.default.randomBytes(64));
    res.cookie('oauth_code_verifier', encrypt(verifier), { httpOnly: true });
    return base64URLEncode(sha256(verifier));
};
const restoreState = (req, res) => {
    const value = decrypt(req.cookies.oauth_state);
    res.clearCookie('oauth_state');
    return value;
};
const restoreCodeVerifier = (req, res) => {
    const value = decrypt(req.cookies.oauth_code_verifier);
    res.clearCookie('oauth_code_verifier');
    return value;
};
exports.loginRouter.get('/login', (req, res, next) => {
    const state = createState(res);
    const challenge = createCodeChallenge(res);
    const scope = 'user-top-read user-read-recently-played user-read-currently-playing';
    res.redirect('https://accounts.spotify.com/authorize?' +
        qs_1.default.stringify({
            response_type: 'code',
            client_id: process.env.CLIENT_ID,
            scope: scope,
            redirect_uri: process.env.REDIRECT_URI,
            state: state,
            code_challenge_method: 'S256',
            code_challenge: challenge
        }));
});
exports.loginRouter.get('/oauth-callback', (req, res, next) => {
    const reqState = req.query.state;
    const state = restoreState(req, res);
    if (reqState !== state) {
        console.log('State does not match! Redirecting back to start');
        res.redirect('http://localhost:3000?' +
            qs_1.default.stringify({
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
    };
    const header = {
        'Authorization': 'Basic ' + Buffer.from(process.env.CLIENT_ID + ':' + process.env.CLIENT_SECRET).toString('base64'),
        'Content-Type': 'application/x-www-form-urlencoded'
    };
    axios_1.default.post('https://accounts.spotify.com/api/token', form, { headers: header })
        .then(response => {
        const token = response.data.access_token;
        const refresh = response.data.refresh_token;
        const header = {
            'Authorization': 'Bearer ' + token
        };
        res.redirect('http://localhost:3000/#' +
            qs_1.default.stringify({
                access_token: token,
                refresh_token: refresh
            }));
    })
        .catch(e => console.error(e));
});
