(() => {
  const params = new URLSearchParams(window.location.search)
  const provider = params.get('provider')
  const id = params.get('id')
  const validProvider = provider === 'modrinth' || provider === 'curseforge'
  const validId = id !== null && /^[a-zA-Z0-9]{1,32}$/.test(id)
  const validCurseForgeId = provider !== 'curseforge' || (id !== null && /^[1-9][0-9]*$/.test(id) && Number.isSafeInteger(Number(id)))

  if (params.size !== 2 || !validProvider || !validId || !validCurseForgeId) {
    document.getElementById('heading').textContent = 'This mod link is invalid'
    document.getElementById('description').textContent = 'Ask the sender to copy a new link from Hyperix.'
    return
  }

  document.getElementById('identity').textContent = `${provider === 'modrinth' ? 'Modrinth' : 'CurseForge'} · ${id}`
  document.getElementById('identity').hidden = false
  const button = document.getElementById('open-button')
  button.href = `hyperix://mod/${provider}/${id}`
  button.hidden = false
})()
