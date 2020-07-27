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
      // prompt: 'consent',
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
    const jwToken = jwt.sign({
      exp: tokens.expiry_date,
      data: tokens
    }, JWT_SECRET)

    res.cookie('jwt', jwToken, {
      expires: new Date(Date.now() + 3600000),
      // domain: '.example.com',
      path: '/',
      secure: false,
      httpOnly: false
    })

    return res.view('pages/authCallback', {
      jwt: jwToken
    })
  },

  refreshAccessToken: async (req, res) => {
    const tokens = req.body.tokens
    if (!tokens) {
      throw new Error('No token object available to refresh')
    }

    const gmailOAuth2Client = new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT)
    gmailOAuth2Client.setCredentials(tokens)

    const newTokens = await gmailOAuth2Client.refreshAccessToken()
    if (newTokens && newTokens.credentials) {
      return res.json({
        ...newTokens.credentials
      })
    } else {
      throw new Error('Cannot refresh token - no credentials returned')
    }
  },

  requestLabels: async (req, res) => {
    let credentials
    try {
      const jwToken = req.headers.authorization && req.headers.authorization.substring(7)
      if (!jwToken) {
        throw new Error('Unauthorised: No JWT passed in Authorization header')
      }

      const verifiedToken = jwt.verify(jwToken, JWT_SECRET)
      if (verifiedToken) {
        const decodedJWT = jwt.decode(jwToken, { complete: true })
        credentials = decodedJWT && decodedJWT.payload && decodedJWT.payload.data
      } else {
        throw new Error(`Invalid JWT token: ${jwToken}`)
      }
    } catch (authError) {
      return res.status(401).json({
        error: authError.message,
        debug: JSON.stringify(authError)
      })
    }

    try {
      const gmailOAuth2Client = new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT)
      gmailOAuth2Client.setCredentials(credentials)
      const gmail = google.gmail({
        version: 'v1',
        auth: gmailOAuth2Client
      })

      const options = { userId: 'me' }
      const { data: { labels } } = await gmail.users.labels.list(options)
      return res.status(200).json({
        status: 200,
        data: labels
      })
    } catch (error) {
      return res.status(400).json({
        error: error.message,
        debug: JSON.stringify(error)
      })
    }
  }
}
