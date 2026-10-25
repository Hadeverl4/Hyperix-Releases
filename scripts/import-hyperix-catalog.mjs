import { readFile, writeFile } from 'node:fs/promises'
import { fileURLToPath, pathToFileURL } from 'node:url'
import path from 'node:path'
export function mergeCatalog(kind, current, incoming) {
  const field = kind === 'skin' ? 'skins' : kind === 'server' ? 'servers' : null
  if (!field || current.schemaVersion !== 1 || incoming.schemaVersion !== 1 || !Array.isArray(current[field]) || !Array.isArray(incoming[field])) throw new Error('Expected schemaVersion 1 catalog')
  const entries = new Map()
  for (const item of [...current[field], ...incoming[field]]) {
    if (!item || typeof item.id !== 'string' || !/^[a-zA-Z0-9_-]{1,64}$/.test(item.id) || typeof item.name !== 'string' || !item.name.trim() || item.name.length > 80 || /[\u0000-\u001f]/.test(item.name)) throw new Error('Invalid catalog identity')
    if (kind === 'skin') {
      if (!/^[a-zA-Z0-9-]{1,64}$/.test(item.id)) throw new Error('Invalid skin ID')
      if (Object.keys(item).some(key => !['id', 'name', 'skinUrl', 'modelType'].includes(key)) || !['default', 'slim'].includes(item.modelType)) throw new Error('Invalid skin metadata')
      const url = new URL(item.skinUrl)
      if (url.origin !== 'https://raw.githubusercontent.com' || url.search || url.hash || url.username || url.password || !/^\/Hadeverl4\/Hyperix-Releases\/main\/skins\/[a-zA-Z0-9_-][a-zA-Z0-9_.-]{0,95}\.png$/.test(url.pathname) || url.pathname.includes('..')) throw new Error('Skin must use the owner Releases skins directory')
    } else {
      if (typeof item.address !== 'string' || item.address.length > 253 || !/^[a-zA-Z0-9.-]+(?::[0-9]{1,5})?$/.test(item.address) || /^(localhost|127\.|10\.|192\.168\.|169\.254\.)/i.test(item.address)) throw new Error('Invalid public server address')
      for (const field of ['description', 'country', 'region']) if (typeof item[field] !== 'string' || item[field].length > 2000) throw new Error(`Invalid ${field}`)
      if (item.requiresOfficialAccount != null && typeof item.requiresOfficialAccount !== 'boolean') throw new Error('Invalid official account requirement')
    }
    entries.set(item.id, item)
  }
  if (entries.size > (kind === 'skin' ? 256 : 500)) throw new Error('Catalog item limit exceeded')
  const result = { schemaVersion: 1, [field]: [...entries.values()] }
  if (Buffer.byteLength(`${JSON.stringify(result, null, 2)}\n`) > (kind === 'skin' ? 256 : 512) * 1024) throw new Error('Catalog response byte limit exceeded')
  return result
}
if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  const [kind, input] = process.argv.slice(2)
  if (!['skin', 'server'].includes(kind) || !input) throw new Error('Usage: node scripts/import-hyperix-catalog.mjs skin|server incoming.json')
  const output = fileURLToPath(new URL(`../release/${kind}-directory.json`, import.meta.url))
  const result = mergeCatalog(kind, JSON.parse(await readFile(output, 'utf8')), JSON.parse(await readFile(input, 'utf8')))
  await writeFile(output, `${JSON.stringify(result, null, 2)}\n`)
  console.log(`Updated local catalog: ${output}. Review before publishing; nothing uploaded.`)
}
