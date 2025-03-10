import { spawn } from 'child_process'
import { resolve } from 'path'
import axios from 'axios' // To check if the server is already running

let serverProcess: any | null = null

async function isServerRunning (): Promise<boolean> {
  try {
    await axios.get('http://localhost:8080/health') // Use an actual health check route
    return true
  } catch {
    return false
  }
}

/**
 * Starts the MessageBoxServer as a separate process if not already running.
 */
export async function startTestServer (): Promise<void> {
  if (await isServerRunning()) {
    console.log('Test server already running.')
    return
  }

  console.log('Starting test server...')
  serverProcess = spawn('npm', ['run', 'dev'], {
    cwd: resolve(__dirname, '../../../MessageBoxServer'),
    stdio: 'inherit',
    shell: true
  })

  await new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      reject(new Error('Test server startup timed out'))
    }, 10000)

    serverProcess.on('error', (err) => {
      console.error('Test server failed to start:', err)
      clearTimeout(timeout)
      reject(err)
    })

    setTimeout(() => {
      console.log('Test server started.')
      clearTimeout(timeout)
      resolve(undefined)
    }, 3000)
  })
}

/**
 * Stops the MessageBoxServer process after tests.
 */
export async function stopTestServer (): Promise<void> {
  if (serverProcess === null) {
    console.warn('Test server process is already stopped or undefined.')
    return
  }

  console.log('Stopping test server...')
  try {
    serverProcess.kill()
    console.log('Test server stopped.')
  } catch (error) {
    console.error('Error stopping test server:', error)
  }

  serverProcess = null
}
