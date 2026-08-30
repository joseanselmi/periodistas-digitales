import puppeteer from 'puppeteer'
import { pathToFileURL } from 'url'

const SRC = process.argv[2]
const OUT = process.argv[3]
const W = Number(process.argv[4] || 2400)
const H = Number(process.argv[5] || 1350)

const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox', '--font-render-hinting=none'] })
const page = await browser.newPage()
await page.setViewport({ width: W, height: H, deviceScaleFactor: 1 })
await page.goto(pathToFileURL(SRC).href, { waitUntil: 'networkidle0', timeout: 90000 })
await page.evaluate(() => document.fonts ? document.fonts.ready : null)
await new Promise(r => setTimeout(r, 1200))

const el = await page.$('.canvas')
if (!el) { console.error('no encontré .canvas'); process.exit(1) }
await el.screenshot({ path: OUT, type: 'png' })
console.log('OK →', OUT)
await browser.close()
