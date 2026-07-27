/**
 * scripts/optimize-images.js
 *
 * One-time (or pre-deploy) script that compresses all JPEG/PNG images in
 * attached_assets/ in-place using Sharp.  Safe to run repeatedly — already-
 * optimised files are skipped if they are small enough.
 *
 * Usage:
 *   node scripts/optimize-images.js
 *
 * Or via npm:
 *   npm run optimize-images
 *
 * Requires:  sharp  (npm install --save-dev sharp)
 * Needs Node ≥ 18.
 */

import sharp from 'sharp'
import { readdir, stat, rename } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ASSETS_DIR = path.join(__dirname, '..', 'attached_assets')

// Thresholds
const MAX_WIDTH  = 800    // px — wider images are resized
const MAX_HEIGHT = 800    // px
const JPEG_QUALITY = 82   // 80-85 is visually lossless for print previews
const PNG_QUALITY  = 85
const SKIP_BELOW_KB = 100 // Skip files under 100KB to prevent over-compressing

const EXT_MAP = {
  '.jpg':  'jpeg',
  '.jpeg': 'jpeg',
  '.png':  'png',
  '.webp': 'webp',
}

async function optimise(filePath) {
  const ext    = path.extname(filePath).toLowerCase()
  if (!EXT_MAP[ext]) return { skipped: true, reason: 'unsupported extension' }

  const { size } = await stat(filePath)
  if (size < SKIP_BELOW_KB * 1024) return { skipped: true, reason: `under ${SKIP_BELOW_KB}KB` }

  const newPath = filePath.substring(0, filePath.length - ext.length) + '.webp'
  const tmp = newPath + '.tmp'
  
  try {
    const fs = await import('node:fs/promises');
    const inputBuffer = await fs.readFile(filePath);
    const pipeline = sharp(inputBuffer).rotate() // auto-rotate from EXIF

    const meta = await sharp(inputBuffer).metadata()
    if ((meta.width || 0) > MAX_WIDTH || (meta.height || 0) > MAX_HEIGHT) {
      pipeline.resize(MAX_WIDTH, MAX_HEIGHT, { fit: 'inside', withoutEnlargement: true })
    }

    pipeline.webp({ quality: 75, effort: 6, smartSubsample: true })

    await pipeline.toFile(tmp)

    const { size: newSize } = await stat(tmp)
    const saved = size - newSize
    const pct   = ((saved / size) * 100).toFixed(1)

    // Replace original with WebP
    await rename(tmp, newPath)
    
    // Delete original file since we changed the extension
    try {
      if (filePath !== newPath) {
        const fs = await import('node:fs/promises');
        await fs.unlink(filePath)
      }
    } catch (e) {
      console.error(`Failed to delete original file ${filePath}`, e)
    }

    return { optimised: true, before: size, after: newSize, savedKB: Math.round(saved / 1024), pct }
  } catch (err) {
    // Clean up temp file if it exists
    if (existsSync(tmp)) {
      try { await rename(tmp, tmp + '.err') } catch { /* ignore */ }
    }
    throw err
  }
}

async function main() {
  const files = (await readdir(ASSETS_DIR)).filter(f => EXT_MAP[path.extname(f).toLowerCase()])
  console.log(`\n📸  Found ${files.length} image(s) in attached_assets/\n`)

  let totalSavedKB = 0
  let optimisedCount = 0
  let skippedCount = 0
  let errorCount = 0

  for (const file of files) {
    const full = path.join(ASSETS_DIR, file)
    process.stdout.write(`  ${file.padEnd(60)}`)
    try {
      const result = await optimise(full)
      if (result.optimised) {
        console.log(`✅  ${result.before ? Math.round(result.before / 1024) : '?'} KB → ${result.after ? Math.round(result.after / 1024) : '?'} KB  (−${result.savedKB} KB, ${result.pct}%)`)
        totalSavedKB += result.savedKB || 0
        optimisedCount++
      } else {
        console.log(`⏭   Skipped — ${result.reason}`)
        skippedCount++
      }
    } catch (err) {
      console.log(`❌  Error: ${err.message}`)
      errorCount++
    }
  }

  console.log(`\n${'─'.repeat(70)}`)
  console.log(`✅  Optimised : ${optimisedCount} file(s)`)
  console.log(`⏭   Skipped   : ${skippedCount} file(s)`)
  if (errorCount) console.log(`❌  Errors    : ${errorCount} file(s)`)
  console.log(`💾  Total saved: ${totalSavedKB.toLocaleString()} KB (${(totalSavedKB / 1024).toFixed(1)} MB)\n`)
}

main().catch(err => { console.error(err); process.exit(1) })
