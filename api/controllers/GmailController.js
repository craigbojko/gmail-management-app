/**
 * GmailController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */

const { google } = require('googleapis')
const jwt = require('jsonwebtoken')

const CLIENT_ID = '446413710217-kdqp9rt4h7c47dd9a8nlvc89e0vec8sa.apps.googleusercontent.com'
const CLIENT_SECRET = '4uBeQUNZZEDiAOsNM8wgI-Vy'
const REDIRECT = 'http://localhost:1337/api/auth/callback'

const JWT_SECRET = 'ssssshhhhhh'

const scopes = [
  'https://mail.google.com/'
]

module.exports = {
  authenticate: (req, res) => {
    const gmailOAuth2Client = new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT)
    const authUrl = gmailOAuth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: scopes
    })

    return res.json({
      authUrl
    })
  },

  authenticateCallback: async (req, res) => {
    const code = req.query.code
    if (!code) {
      throw new Error('AuthenticateCallback: No code provided')
    }

    const gmailOAuth2Client = new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT)
    const { tokens } = await gmailOAuth2Client.getToken(code)
    const jwToken = jwt.sign({ ...tokens }, JWT_SECRET)

    res.cookie('gmail_jwt', jwToken, {
      expires: new Date(Date.now() + 3600000),
      // domain: '.example.com',
      path: '/',
      secure: false,
      httpOnly: false
    })

    return res.view('pages/authCallback', {
      ...tokens
    })
  }
}
