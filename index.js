import { spawn } from 'child_process'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const serverPath = path.join(__dirname, 'sleekblue', 'server.js')

const child = spawn(process.execPath, [serverPath], {
  cwd: __dirname,
  env: { ...process.env, PORT: process.env.PORT || '3001' },
  stdio: 'inherit',
})

child.on('exit', (code, signal) => {
  if (signal) {
    process.kill(process.pid, signal)
  } else {
    process.exit(code ?? 0)
  }
})
