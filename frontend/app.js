(() => {
  const escapeReplaceDict = new Map([
    ['&', '&#38;'],
    ['"', '&#34;'],
    ['\'', '&#39;'],
    ['<', '&#60;'],
    ['>', '&#62;'],
  ])

  const escapeHtml = str => str.replace(/[&"<>']/g, c => escapeReplaceDict.get(c))

  let accessToken = ''
  let currentList = []
  const renderCurrentList = () => {
    document.getElementById('r').innerHTML = currentList.map((item, idx) => {
      return `<li>
        <span>${escapeHtml(item.name)}</span>
        <span><em>${escapeHtml(item.priority)}</em></span>
        <span id="x${idx}"><strong>x</strong></span>
      </li>`
    }).join('')
    currentList.forEach((_, idx) => {
      document.getElementById(`x${idx}`).addEventListener('click', async () => {
        await fetch('/.netlify/functions/queue-delete', {
          method: 'DELETE',
          headers: {
            authorization: `Bearer ${accessToken}`,
          },
        })
        await fetchCurrentList()
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

  document.getElementById('f').addEventListener('submit', async (evt) => {
    evt.preventDefault()
    await fetch('/.netlify/functions/queue-add', {
      method: 'POST',
      headers: {
        authorization: `Bearer ${accessToken}`,
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        name: document.getElementById('n').value,
        priority: document.getElementById('p').value,
      })
    })
    await fetchCurrentList()
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

  netlifyIdentity.on('init', handleUserLogin)
  netlifyIdentity.on('login', handleUserLogin)
})()
