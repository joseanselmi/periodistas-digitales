/**
 * guardar-imagen-drive.mjs — pasa una imagen de Google Drive al repo, sin que el binario
 * pase por el contexto de Claude.
 *
 * POR QUÉ EXISTE (20/08/2026). Jose trabaja en remoto desde la tablet y necesitaba subir la foto
 * de un testimonio. OneDrive —que sería lo natural, porque el repo vive adentro— está lleno. Y una
 * imagen pegada en el chat se ve pero no se puede escribir al disco.
 *
 * La vía que sí funciona: él la sube a Google Drive y Claude la baja con el MCP. El MCP devuelve
 * base64 y eso NO entra en el contexto (una foto de 200 KB son ~260.000 caracteres), pero el
 * resultado queda guardado en un archivo. Este script lee ese archivo y escribe la imagen.
 *
 * Uso:
 *   node herramientas/guardar-imagen-drive.mjs <archivo-del-resultado.txt> <destino>
 *
 * El <archivo-del-resultado> es el .txt que menciona el mensaje "exceeds maximum allowed tokens".
 */

import { readFileSync, writeFileSync, statSync } from 'fs'
import { resolve } from 'path'

const [entrada, destino] = process.argv.slice(2)
if (!entrada || !destino) {
  console.error('Uso: node herramientas/guardar-imagen-drive.mjs <resultado.txt> <destino.jpg>')
  process.exit(1)
}

const crudo = readFileSync(resolve(entrada), 'utf-8')
const json = JSON.parse(crudo)

if (!json.content) {
  console.error('❌ El archivo no tiene campo `content`. ¿Es el resultado de download_file_content?')
  process.exit(1)
}

// El MCP a veces devuelve un data: URI y a veces base64 pelado. Se contemplan los dos.
const base64 = json.content.replace(/^data:[^;]+;base64,/, '')
const bytes = Buffer.from(base64, 'base64')

// Verificar que sea una imagen de verdad, por la FIRMA del archivo y no por la extensión:
// un base64 cortado a la mitad se escribe sin error y da un archivo roto que parece sano.
const firmas = {
  'image/jpeg': [0xff, 0xd8, 0xff],
  'image/png': [0x89, 0x50, 0x4e, 0x47],
  'image/gif': [0x47, 0x49, 0x46],
  'image/webp': [0x52, 0x49, 0x46, 0x46],
}
const tipo = Object.entries(firmas).find(([, f]) => f.every((b, i) => bytes[i] === b))

if (!tipo) {
  console.error(`❌ Lo decodificado NO es una imagen conocida (primeros bytes: ${[...bytes.slice(0, 4)].map(b => b.toString(16)).join(' ')}).`)
  console.error('   No se escribe nada: un archivo roto se ve igual que uno sano hasta que alguien lo abre.')
  process.exit(1)
}

writeFileSync(resolve(destino), bytes)
const kb = Math.round(statSync(resolve(destino)).size / 1024)
console.log(`✅ ${json.title || '(sin título)'} → ${destino}`)
console.log(`   ${tipo[0]} · ${kb} KB · firma verificada`)
