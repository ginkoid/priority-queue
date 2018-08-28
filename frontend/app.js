import 'promise-polyfill/src/polyfill'
import 'unfetch/polyfill'
import 'regenerator-runtime/runtime'
import netlifyIdentity from 'netlify-identity-widget'

netlifyIdentity.init()

const escapeHtmlReplace = new Map([
  ['&', '&#38;'],
  ['"', '&#34;'],
  ['\'', '&#39;'],
  ['<', '&#60;'],
  ['>', '&#62;'],
])

const escapeHtml = str => str.replace(/[&"<>']/g, c => escapeHtmlReplace.get(c))

let currentQueue = []

const markDirty = () => {
  document.getElementById('s').hidden = false
  renderCurrentQueue()
}

const markFlying = () => {
  document.getElementById('i').disabled = true
  document.getElementById('s').disabled = true
  document.querySelectorAll('.x').forEach(el => el.disabled = true)
}

const markLanded = () => {
  document.getElementById('i').disabled = false
  document.getElementById('s').disabled = false
  document.querySelectorAll('.x').forEach(el => el.disabled = false)    
}

const renderCurrentQueue = () => {
  document.getElementById('r').innerHTML = currentQueue.map((item, idx) => {
    return `<tr>
      <td>${escapeHtml(item.name)}</td>
      <td><em>${escapeHtml(String(item.priority))}</em></td>
      <td><button class="x" id="x${idx}">x</button></td>
    </tr>`
  }).join('')
  currentQueue.forEach((_, idx) => {
    document.getElementById(`x${idx}`).addEventListener('click', async () => {
      currentQueue.splice(idx, 1)
      markDirty()
    })
  })
}

const fetchCurrentQueue = async () => {
  markFlying()
  currentQueue = await (await fetch('/.netlify/functions/queue-get', {
    headers: {
      authorization: `Bearer ${await netlifyIdentity.currentUser().jwt()}`,
    },
  })).json()
  markLanded()
  renderCurrentQueue()
}

document.getElementById('s').addEventListener('click', async () => {
  markFlying()
  await fetch('/.netlify/functions/queue-set', {
    method: 'PATCH',
    headers: {
      authorization: `Bearer ${await netlifyIdentity.currentUser().jwt()}`,
      'content-type': 'application/json',
    },
    body: JSON.stringify(currentQueue)
  })
  markLanded()
  document.getElementById('s').hidden = true
})

document.getElementById('f').addEventListener('submit', async (evt) => {
  evt.preventDefault()
  currentQueue.push({
    name: document.getElementById('n').value,
    priority: parseFloat(document.getElementById('p').value),
  })
  document.getElementById('n').value = ''
  document.getElementById('p').value = ''
  currentQueue.sort((a, b) => b.priority - a.priority)
  markDirty()
})

const handleUserLogin = async (user) => {
  if (user === null) {
    return
  }
  document.getElementById('r').hidden = false
  document.getElementById('f').hidden = false
  await fetchCurrentQueue()
}

netlifyIdentity.on('login', handleUserLogin)
netlifyIdentity.on('logout', () => {
  currentQueue = []
  renderCurrentQueue()
  document.getElementById('s').hidden = true
  document.getElementById('r').hidden = true
  document.getElementById('f').hidden = true
})
