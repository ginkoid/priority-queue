const https = require('https')

exports.handler = (evt, ctx, cb) => {
  if (evt.httpMethod !== 'PATCH') {
    cb(null, {
      statusCode: 405,
    })
    return
  }
  if (typeof evt.headers['content-type'] !== 'string' || !evt.headers['content-type'].includes('application/json')) {
    cb(null, {
      statusCode: 400,
    })
    return
  }
  if (ctx.clientContext.user === undefined) {
    cb(null, {
      statusCode: 403,
    })
    return
  }
  let githubRequest
  try {
    githubRequest = JSON.stringify({
      files: {
        pq: {
          content: JSON.stringify(JSON.parse(evt.body)),
        },
      },
    })
  } catch (e) {
    cb(null, {
      statusCall: 400,
    })
  }
  const req = https.request({
    host: 'api.github.com',
    port: 443,
    method: 'PATCH',
    path: `/gists/${process.env.GIST_ID}`,
    headers: {
      'user-agent': 'ginkoid/priority-queue',
      'authorization': `Bearer ${process.env.GH_SECRET}`,
      'content-type': 'application/json',
    },
  })
  req.on('response', (res) => {
    res.on('end', () => {
      cb(null, {
        statusCode: 200,
      })
    })
  })
  req.on('error', () => {
    cb(null, {
      statusCode: 500,
    })
  })
  req.end(githubRequest)
}
