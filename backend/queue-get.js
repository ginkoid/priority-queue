const https = require('https')

exports.handler = (evt, ctx, cb) => {
  if (ctx.clientContext.user === undefined) {
    cb(null, {
      statusCode: 403,
    })
    return
  }
  const res = https.request({
    host: 'api.github.com',
    port: 443,
    path: `/gists/${process.env.GIST_ID}`,
    method: 'GET',
  })
  const resBufs = []
  res.on('data', (chunk) => {
    resBufs.push(chunk)
  })
  res.on('end', () => {
    const reqResult = JSON.parse(Buffer.concat(resBufs))
    cb(null, {
      statusCode: 200,
      headers: {
        'content-type': 'application/json',
      },
      body: reqResult.files.pq.content,
    })
  })
  res.on('error', () => {
    cb(null, {
      statusCode: 500,
    })
  })
}
