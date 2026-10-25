export const MAX_PNG = 65536
export const uuid = value => typeof value === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value)
const crc32 = bytes => {
  let crc = 0xffffffff
  for (const byte of bytes) { crc ^= byte; for (let n=0;n<8;n++) crc = (crc>>>1) ^ (crc&1 ? 0xedb88320 : 0) }
  return (crc ^ 0xffffffff) >>> 0
}
export const sha256 = async bytes => Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',bytes)), byte=>byte.toString(16).padStart(2,'0')).join('')
export function strictFields(body, allowed) {
  if (!body || typeof body !== 'object' || Array.isArray(body) || Object.keys(body).some(key=>!allowed.includes(key))) throw new Error('SKIN_INVALID')
}
export async function validateSubmission(body) {
  strictFields(body,['action','requestId','title','modelType','skinDataUrl','rightsConfirmed'])
  if (!uuid(body.requestId) || typeof body.title!=='string' || !body.title.trim() || [...body.title].length>80 || /[\u0000-\u001f\u007f]/.test(body.title) || !['default','slim'].includes(body.modelType) || body.rightsConfirmed!==true) throw new Error('SKIN_INVALID')
  if (typeof body.skinDataUrl!=='string' || body.skinDataUrl.length>90000 || !/^data:image\/png;base64,[A-Za-z0-9+/]+={0,2}$/.test(body.skinDataUrl)) throw new Error('SKIN_INVALID_PNG')
  let bytes
  try { bytes = Uint8Array.from(atob(body.skinDataUrl.slice(22)), char=>char.charCodeAt(0)) } catch { throw new Error('SKIN_INVALID_PNG') }
  await validatePng(bytes)
  return {requestId:body.requestId,title:body.title.trim(),modelType:body.modelType,bytes,sha256:await sha256(bytes)}
}
export async function validatePng(bytes) {
  const invalid = () => { throw new Error('SKIN_INVALID_PNG') }
  if (bytes.length<57 || bytes.length>MAX_PNG || [137,80,78,71,13,10,26,10].some((byte,n)=>bytes[n]!==byte)) invalid()
  const view = new DataView(bytes.buffer,bytes.byteOffset,bytes.byteLength)
  let offset=8, height=0, header=false, ended=false
  const compressed=[]
  while (offset<bytes.length) {
    if (offset+12>bytes.length) invalid()
    const length=view.getUint32(offset), end=offset+12+length
    if (end>bytes.length || length>MAX_PNG) invalid()
    const type=String.fromCharCode(...bytes.subarray(offset+4,offset+8))
    if (crc32(bytes.subarray(offset+4,end-4))!==view.getUint32(end-4)) invalid()
    if (type==='IHDR') {
      if (header || offset!==8 || length!==13 || view.getUint32(offset+8)!==64) invalid()
      height=view.getUint32(offset+12)
      if (![32,64].includes(height) || bytes[offset+16]!==8 || bytes[offset+17]!==6 || bytes[offset+18]!==0 || bytes[offset+19]!==0 || bytes[offset+20]!==0) invalid()
      header=true
    } else if (type==='IDAT') { if (!header || ended) invalid(); compressed.push(bytes.subarray(offset+8,end-4)) }
    else if (type==='IEND') { if (!header || !compressed.length || length!==0 || end!==bytes.length) invalid(); ended=true }
    else invalid() // Canonical RGBA only: reject ancillary/APNG payloads and metadata.
    offset=end
  }
  if (!ended) invalid()
  const stream = new Blob(compressed).stream().pipeThrough(new DecompressionStream('deflate'))
  const reader=stream.getReader(), expected=height*257
  let raw=new Uint8Array(expected), count=0
  try {
    while (true) { const {done,value}=await reader.read(); if (done) break; if (count+value.length>expected) invalid(); raw.set(value,count); count+=value.length }
  } catch { await reader.cancel().catch(()=>{}); invalid() }
  if (count!==expected) invalid()
  for (let row=0;row<height;row++) if (raw[row*257]>4) invalid()
}
