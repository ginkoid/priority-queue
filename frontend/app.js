(() => {
  const escapeHtmlReplace = new Map([
    ['&', '&#38;'],
    ['"', '&#34;'],
    ['\'', '&#39;'],
    ['<', '&#60;'],
    ['>', '&#62;'],
  ])

  const escapeHtml = str => str.replace(/[&"<>']/g, c => escapeHtmlReplace.get(c))

  let accessToken = ''
  let currentQueue = []

  const markDirty = () => {
    document.getElementById('s').hidden = false
    renderCurrentQueue()
  }

  const renderCurrentQueue = () => {
    document.getElementById('r').innerHTML = currentQueue.map((item, idx) => {
      return `<li>
        <span>${escapeHtml(item.name)}</span>
        <span>| <em>${escapeHtml(String(item.priority))}</em></span>
        <span style="cursor:pointer;" id="x${idx}"><strong>x</strong></span>
      </li>`
    }).join('')
    currentQueue.forEach((_, idx) => {
      document.getElementById(`x${idx}`).addEventListener('click', async () => {
        currentQueue.splice(idx, 1)
        markDirty()
      })
    })
  }

  const fetchCurrentQueue = async () => {
    currentQueue = await (await fetch('/.netlify/functions/queue-get', {
      headers: {
        authorization: `Bearer ${accessToken}`,
      },
    })).json()
    renderCurrentQueue()
  }

  document.getElementById('s').addEventListener('click', async () => {
    await fetch('/.netlify/functions/queue-set', {
      method: 'PATCH',
      headers: {
        authorization: `Bearer ${accessToken}`,
        'content-type': 'application/json',
      },
      body: JSON.stringify(currentQueue)
    })
    document.getElementById('s').hidden = true
  })

  document.getElementById('f').addEventListener('submit', async (evt) => {
    evt.preventDefault()
    currentQueue.push({
      name: document.getElementById('n').value,
      priority: parseFloat(document.getElementById('p').value),
    })
    currentQueue.sort((a, b) => b.priority - a.priority)
    markDirty()
  })

  const handleUserLogin = async (user) => {
    if (user === null) {
      return
    }
    document.getElementById('r').hidden = false
    document.getElementById('f').hidden = false
    accessToken = await user.jwt()
    await fetchCurrentQueue()
  }

  netlifyIdentity.on('login', handleUserLogin)
  netlifyIdentity.on('logout', () => {
    currentQueue = []
    accessToken = ''
    renderCurrentQueue()
    document.getElementById('s').hidden = true
    document.getElementById('r').hidden = true
    document.getElementById('f').hidden = true
  })
})()
