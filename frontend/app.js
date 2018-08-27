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
  const renderCurrentList = () => {
    document.getElementById('r').innerHTML = currentQueue.map((item, idx) => {
      return `<li>
        <span>${escapeHtml(item.name)}</span>
        <span><em>${escapeHtml(String(item.priority))}</em></span>
        <span style="cursor:pointer;" id="x${idx}"><strong>x</strong></span>
      </li>`
    }).join('')
    currentQueue.forEach((_, idx) => {
      document.getElementById(`x${idx}`).addEventListener('click', async () => {
        currentQueue.splice(idx, 1)
        await updateCurrentList()
      })
    })
  }

  const fetchCurrentList = async () => {
    currentQueue = await (await fetch('/.netlify/functions/queue-get', {
      headers: {
        authorization: `Bearer ${accessToken}`,
      },
    })).json()
    renderCurrentList()
  }

  const updateCurrentList = async () => {
    await fetch('/.netlify/functions/queue-set', {
      method: 'PATCH',
      headers: {
        authorization: `Bearer ${accessToken}`,
        'content-type': 'application/json',
      },
      body: JSON.stringify(currentQueue)
    })
    await fetchCurrentList()
  }

  document.getElementById('f').addEventListener('submit', async (evt) => {
    evt.preventDefault()
    currentQueue.push({
      name: document.getElementById('n').value,
      priority: parseFloat(document.getElementById('p').value),
    })
    currentQueue.sort((a, b) => b.priority - a.priority)
    await updateCurrentList()
  })

  const handleUserLogin = async (user) => {
    if (user === null) {
      return
    }
    document.getElementById('r').hidden = false
    document.getElementById('f').hidden = false
    accessToken = await user.jwt()
    await fetchCurrentList()
  }

  netlifyIdentity.on('login', handleUserLogin)
  netlifyIdentity.on('logout', () => {
    currentQueue = []
    accessToken = ''
    renderCurrentList()
    document.getElementById('r').hidden = true
    document.getElementById('f').hidden = true
  })
})()
