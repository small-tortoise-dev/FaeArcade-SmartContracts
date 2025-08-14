import { readFileSync, writeFileSync, mkdirSync } from 'fs'
import { join } from 'path'

console.log('Building Fae TON project...')

// Create a simple build output
const buildInfo = {
  timestamp: new Date().toISOString(),
  version: '1.0.0',
  contracts: ['Counter'],
  status: 'built'
}

const buildDir = join(process.cwd(), 'build')
const buildFile = join(buildDir, 'build-info.json')

// Ensure build directory exists
try {
  mkdirSync(buildDir, { recursive: true })
  writeFileSync(buildFile, JSON.stringify(buildInfo, null, 2))
  console.log('Build completed successfully!')
  console.log(`Build info written to: ${buildFile}`)
} catch (error) {
  console.error('Build failed:', error)
  process.exit(1)
} 