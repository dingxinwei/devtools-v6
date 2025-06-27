const fs = require('fs')
const path = require('path')
const zlib = require('zlib')
const hookContent = fs.readFileSync(path.join(__dirname, '.././build/hook.js'), 'utf8')
const backendContent = fs.readFileSync(path.join(__dirname, '.././build/backend.js'), 'utf8')

fs.writeFileSync((path.join(__dirname, '.././build/target.js')), [hookContent, backendContent].join('\n'))
fs.rmSync(path.join(__dirname, '.././build/hook.js'))
fs.rmSync(path.join(__dirname, '.././build/backend.js'))

const gzip = zlib.createGzip()
const inp = fs.createReadStream(path.join(__dirname, '.././build/target.js'))
const out = fs.createWriteStream(path.join(__dirname, '.././build/target.js.gz'))
inp.pipe(gzip).pipe(out)

fs.rmSync(path.join(__dirname, '.././build/hook.js.gz'))
fs.rmSync(path.join(__dirname, '.././build/backend.js.gz'))
