/**
 * GmailController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */

const fs = require('fs')
const { pipeWith, identity, prop, map, tap } = require('ramda')
const { google } = require('googleapis')
const jwt = require('jsonwebtoken')
const createCsvWriter = require('csv-writer').createObjectCsvWriter

const CLIENT_ID =
  '446413710217-kdqp9rt4h7c47dd9a8nlvc89e0vec8sa.apps.googleusercontent.com'
const CLIENT_SECRET = '4uBeQUNZZEDiAOsNM8wgI-Vy'
const REDIRECT = 'http://localhost:1337/api/auth/callback'

const JWT_SECRET = 'ssssshhhhhh'

const scopes = ['https://mail.google.com/']

const verifyJWT = (req, res) => {
  try {
    const jwToken =
      (req.headers.authorization && req.headers.authorization.substring(7)) ||
      (req.cookies && req.cookies.jwt)
    if (!jwToken) {
      throw new Error('Unauthorised: No JWT passed in Authorization header')
    }

    const verifiedToken = jwt.verify(jwToken, JWT_SECRET)
    if (verifiedToken) {
      const decodedJWT = jwt.decode(jwToken, { complete: true })
      return decodedJWT && decodedJWT.payload && decodedJWT.payload.data
    } else {
      throw new Error(`Invalid JWT token: ${jwToken}`)
    }
  } catch (authError) {
    res.status(401).json({
      error: authError.message,
      debug: JSON.stringify(authError)
    })
    return false
  }
}

module.exports = {
  authenticate: (req, res) => {
    const gmailOAuth2Client = new google.auth.OAuth2(
      CLIENT_ID,
      CLIENT_SECRET,
      REDIRECT
    )
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

    const gmailOAuth2Client = new google.auth.OAuth2(
      CLIENT_ID,
      CLIENT_SECRET,
      REDIRECT
    )
    const { tokens } = await gmailOAuth2Client.getToken(code)
    const jwToken = jwt.sign(
      {
        exp: tokens.expiry_date,
        data: tokens
      },
      JWT_SECRET
    )

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

    const gmailOAuth2Client = new google.auth.OAuth2(
      CLIENT_ID,
      CLIENT_SECRET,
      REDIRECT
    )
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

  requestLabels: async (req, res, next) => {
    const credentials = verifyJWT(req, res)
    if (!credentials) {
      return next()
    }

    try {
      const gmailOAuth2Client = new google.auth.OAuth2(
        CLIENT_ID,
        CLIENT_SECRET,
        REDIRECT
      )
      gmailOAuth2Client.setCredentials(credentials)
      const gmail = google.gmail({
        version: 'v1',
        auth: gmailOAuth2Client
      })

      const options = { userId: 'me' }
      const {
        data: { labels }
      } = await gmail.users.labels.list(options)
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
  },

  exportEmails: async (req, res) => {
    const credentials = verifyJWT(req, res)
    if (!credentials) {
      return res.serverError()
    }

    try {
      const gmailOAuth2Client = new google.auth.OAuth2(
        CLIENT_ID,
        CLIENT_SECRET,
        REDIRECT
      )
      gmailOAuth2Client.setCredentials(credentials)
      const gmail = google.gmail({
        version: 'v1',
        auth: gmailOAuth2Client
      })

      const gmailListOptions = { userId: 'me' }
      const filename = `gmail-export.csv`
      const file = `./static/gmail-csv.csv`
      const csvWriter = createCsvWriter({
        path: file,
        header: [
          { id: 'id', title: 'id' },
          { id: 'historyId', title: 'historyId' },
          { id: 'threadId', title: 'threadId' },
          { id: 'partId', title: 'partId' },
          { id: 'internalDate', title: 'date' },
          { id: 'labels', title: 'labels' },
          { id: 'size', title: 'size' },
          { id: 'mimeType', title: 'mimeType' },
          { id: 'snippet', title: 'snippet' } // ,
          // { id: 'body', title: 'body' }
        ]
      })

      // const fetchList = async (options, limit = 100) => {
      //   sails.log.debug(`[FetchList]: start`)
      //   let messageCount = 0
      //   const lists = []

      //   while (messageCount < limit) {
      //     const { data } = await gmail.users.messages.list(options)
      //     sails.log.debug(`[FetchList]: length: ${data.messages.length}`)
      //     messageCount += data.messages.length
      //     lists.push(data.messages)
      //   }

      //   return flatten(lists)
      // }
      const fetchList = async (options) => {
        sails.log.debug(`[FetchList]: start`, options)

        const { data, nextPageToken } = await gmail.users.messages.list(options)
        sails.log.debug(`[FetchList]: length: ${data.messages.length}`)

        return {
          data,
          nextPageToken
        }
      }

      const fetchMessage = async (message) => {
        sails.log.debug(`[FetchMessage]: id: ${message.id}`)

        const { data } = await gmail.users.messages.get({
          userId: 'me',
          id: message.id
        })

        return data
      }

      const conditionMessage = (message) => ({
        id: message.id || '',
        partId: (message.payload && message.payload.partId) || '',
        threadId: message.threadId || '',
        historyId: message.historyId || '',
        internalDate: message.internalDate || '',
        labels: message.labelIds || '',
        snippet: message.snippet || '',
        mimeType: (message.payload && message.payload.mimeType) || '',
        size:
          (message.payload &&
            message.payload.body &&
            message.payload.body.size) ||
          ''
        // body:
        //   (message.payload &&
        //     message.payload.body &&
        //     message.payload.body.data) ||
        //   '',
      })

      const writeMessagesToCSV = async (messages) => {
        sails.log.debug(`[WriteMessages]: length: ${messages.length}`)
        await csvWriter.writeRecords(messages)
        return messages.length
      }

      const pipeWithPromise = (...args) => {
        sails.log.debug(`CREATING PIPELINE...`)
        sails.log.debug(args)

        return pipeWith((f, val) => {
          sails.log.debug(`PIPING WITH...`, f, val)
          if (val && val.then) {
            sails.log.debug(`VAL has then`)
            return val.then(f)
          }
          if (Array.isArray(val) && val.length && val[0] && val[0].then) {
            sails.log.debug(`VAL is array`)
            return Promise.all(val).then(f)
          }
          sails.log.debug(`VAL is sync`)
          return f(val)
        })(args)
      }

      let limit = req.query.limit || 100
      let messageCount = 0
      let iterations = 0
      let nextPageToken = {}

      const runPipeline = pipeWithPromise(
        fetchList,
        tap(({ nextPageToken: npt }) => {
          nextPageToken = {
            nextPageToken: npt
          }
        }),
        prop('data'),
        prop('messages'),
        map((message) => fetchMessage(message)),
        Promise.all.bind(Promise),
        map((message) => conditionMessage(message)),
        writeMessagesToCSV
      )

      // Hard limit of 50 iterations (5000 messages)
      while (messageCount < limit && iterations < 50) {
        sails.log.debug(`Running pipe: ${(iterations += 1)}...`)
        const written = await runPipeline({
          ...gmailListOptions,
          ...nextPageToken
        })
        sails.log.debug(`Pipe: ${iterations} (${written} messages)`)
        messageCount += written
      }
      sails.log.debug(
        `Pipe done. Iterations: ${iterations} Count: ${messageCount}`
      )

      const fd = fs.createReadStream(file, { encoding: 'utf-8' })
      fd.on('open', () => {
        res.status(200).attachment(filename)
        return fd.pipe(res)
      })
      fd.on('error', (err) => res.status(500).end(err))

      // return res.status(200).json({
      //   status: 200,
      //   data: JSON.stringify(messages)
      // })
    } catch (error) {
      return res.status(400).json({
        error: error.message,
        debug: JSON.stringify(error)
      })
    }
  }
}
