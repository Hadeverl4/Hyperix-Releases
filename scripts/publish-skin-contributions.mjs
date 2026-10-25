import fs from 'node:fs'
import path from 'node:path'
import {createHash} from 'node:crypto'
import {execFileSync} from 'node:child_process'
import {fileURLToPath} from 'node:url'
import {validatePng,uuid} from '../services/skin-contributions/validation.mjs'
import {mergeCatalog} from './import-hyperix-catalog.mjs'
const digest=bytes=>createHash('sha256').update(bytes).digest('hex')
function target(root,...parts){const file=path.resolve(root,...parts);if(!file.startsWith(path.resolve(root)+path.sep))throw new Error('Invalid publish path');for(let current=file;;){try{if(fs.lstatSync(current).isSymbolicLink())throw new Error('Linked publish path')}catch(error){if(error.code!=='ENOENT')throw error}const parent=path.dirname(current);if(parent===current)break;current=parent}return file}
export async function preparePublication({root,call}){
  const catalogPath=target(root,'skin-directory.json')
  let current={schemaVersion:1,skins:[]}
  if(fs.existsSync(catalogPath)){if(fs.statSync(catalogPath).size>256*1024)throw new Error('Catalog too large');current=JSON.parse(fs.readFileSync(catalogPath,'utf8'))}
  const approved=await call('export')
  if(!Array.isArray(approved)||approved.length>256)throw new Error('Invalid approved list')
  const entries=[],ids=new Set(),writes=[]
  for(const row of approved){
    if(!uuid(row.id)||ids.has(row.id)||!['default','slim'].includes(row.model_type)||typeof row.title!=='string'||!/^[a-f0-9]{64}$/.test(row.sha256))throw new Error('Invalid approved metadata')
    ids.add(row.id)
    const filename=`community-${row.id}.png`,file=target(root,'skins',filename)
    entries.push({id:`community-${row.id}`,name:row.title,modelType:row.model_type,skinUrl:`https://raw.githubusercontent.com/Hadeverl4/Hyperix-Releases/main/skins/${filename}`})
    if(fs.existsSync(file)){if(fs.statSync(file).size>65536||digest(fs.readFileSync(file))!==row.sha256)throw new Error('Existing skin conflicts with approved bytes');continue}
    const result=await call('asset',{id:row.id})
    if(typeof result.skinDataUrl!=='string'||!/^data:image\/png;base64,[A-Za-z0-9+/=]+$/.test(result.skinDataUrl)||result.skinDataUrl.length>90000)throw new Error('Invalid approved asset')
    const bytes=Buffer.from(result.skinDataUrl.slice(22),'base64');await validatePng(bytes)
    if(digest(bytes)!==row.sha256)throw new Error('Approved asset hash mismatch')
    writes.push({filename,bytes})
  }
  const next=mergeCatalog('skin',current,{schemaVersion:1,skins:entries})
  fs.mkdirSync(target(root,'skins'),{recursive:true})
  for(const {filename,bytes} of writes)fs.writeFileSync(target(root,'skins',filename),bytes,{flag:'wx'})
  fs.writeFileSync(catalogPath,JSON.stringify(next,null,2)+'\n')
  fs.writeFileSync(target(root,'.hyperix-publish.json'),JSON.stringify([...ids]))
  return {count:ids.size}
}
async function workerCall(endpoint,key,action,data={}){
  const url=new URL(endpoint)
  if(url.protocol!=='https:'||url.pathname!=='/api/skins'||url.username||url.password||url.search||url.hash||key.length<32)throw new Error('Publisher configuration invalid')
  const response=await fetch(url,{method:'POST',headers:{authorization:`Bearer ${key}`,'content-type':'application/json'},body:JSON.stringify({action,...data}),redirect:'error',signal:AbortSignal.timeout(20000)})
  const reader=response.body.getReader(),chunks=[];let size=0
  while(true){const {done,value}=await reader.read();if(done)break;size+=value.length;if(size>256*1024){await reader.cancel();throw new Error('Publisher response too large')}chunks.push(value)}
  if(!response.ok)throw new Error('Publisher request failed')
  return JSON.parse(Buffer.concat(chunks).toString('utf8')).data
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
  const root=process.cwd(),endpoint=process.env.HYPERIX_SKIN_PUBLIC_ENDPOINT||'',key=process.env.HYPERIX_SKIN_PUBLISH_KEY||''
  const call=(action,data)=>workerCall(endpoint,key,action,data)
  if(process.argv.includes('--ack')){
    const file=target(root,'.hyperix-publish.json');if(fs.statSync(file).size>16384)throw new Error('Invalid publication receipt')
    const ids=JSON.parse(fs.readFileSync(file,'utf8'));if(!Array.isArray(ids)||ids.length>256||!ids.every(uuid))throw new Error('Invalid receipt')
    const commit=execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim()
    await call('published',{ids,commit});console.log('Publication receipt acknowledged.')
  }else{await call('cleanup');const result=await preparePublication({root,call});console.log(`Prepared ${result.count} approved skins. Commit and push before acknowledging.`)}
}
