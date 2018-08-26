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
  let currentList = []
  const renderCurrentList = () => {
    document.getElementById('r').innerHTML = currentList.map((item, idx) => {
      return `<li>
        <span>${escapeHtml(item.name)}</span>
        <span><em>${escapeHtml(String(item.priority))}</em></span>
        <span id="x${idx}"><strong>x</strong></span>
      </li>`
    }).join('')
    currentList.forEach((_, idx) => {
      document.getElementById(`x${idx}`).addEventListener('click', async () => {
        currentList.splice(idx, 1)
        await updateCurrentList()
      })
    })
  }

  const fetchCurrentList = async () => {
    currentList = await (await fetch('/.netlify/functions/queue-get', {
      headers: {
        authorization: `Bearer ${accessToken}`,
      },
    })).json()
    renderCurrentList()
  }

  const updateCurrentList = async () => {
    await fetch('/.netlify/functions/queue-set', {
      headers: {
        authorization: `Bearer ${accessToken}`,
        'content-type': 'application/json',
      },
      body: JSON.stringify(currentList)
    })
    await fetchCurrentList()
  }

  document.getElementById('f').addEventListener('submit', async (evt) => {
    evt.preventDefault()
    currentList.push({
      name: document.getElementById('n').value,
      priority: document.getElementById('p').value,
    })
    currentList.sort((a, b) => b.priority - a.priority)
    await updateCurrentList()
  })

  const handleUserLogin = async (user) => {
    if (user === null) {
      return
    }
    document.getElementById('r').hidden = false
    document.getElementById('f').hidden = false
    accessToken = user.token.access_token
    await fetchCurrentList()
  }

  netlifyIdentity.on('login', handleUserLogin)
  netlifyIdentity.on('logout', () => {
    currentList = []
    accessToken = ''
    renderCurrentList()
    document.getElementById('r').hidden = true
    document.getElementById('f').hidden = true
  })
})()
