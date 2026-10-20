import { readFileSync, writeFileSync, mkdirSync, mkdtempSync, rmSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { tmpdir } from 'node:os'
import { spawnSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'

// Replays saved development stages; it does not overwrite the final source.
const root = fileURLToPath(new URL('../', import.meta.url))
const selection = process.argv[2]
const cases = ['T01', 'T02', 'T03', 'S01', 'S02', 'S03']
if (selection && !cases.includes(selection)) {
  console.error('Choose T01, T02, T03, S01, S02 or S03, or omit the argument for all cases.')
  process.exit(1)
}
const output = join(root, 'docs/tdd/replay-output')
mkdirSync(output, { recursive: true })
let failures = 0
for (const name of cases.filter((item) => !selection || item === selection)) {
  for (const phase of ['red', 'green']) {
    const stage = JSON.parse(readFileSync(join(root, 'docs/tdd/stages', `${name}-${phase}.json`), 'utf8'))
    const directory = mkdtempSync(join(tmpdir(), 'quickquiz-tdd-'))
    try {
      for (const [path, content] of Object.entries(stage.files)) {
        const destination = join(directory, path)
        mkdirSync(dirname(destination), { recursive: true })
        writeFileSync(destination, content)
      }
      const result = spawnSync(process.execPath, stage.command.slice(1), { cwd: directory, encoding: 'utf8' })
      const transcript = (result.stdout || '') + (result.stderr || '')
      console.log(`\n${name} ${phase.toUpperCase()} - saved development stage`)
      console.log(transcript)
      writeFileSync(join(output, `${name}-${phase}.txt`), transcript)
      const expected = phase === 'red' ? result.status !== 0 : result.status === 0
      if (!expected || result.error) failures += 1
      console.log(expected ? `Expected ${phase} result reproduced.` : 'Unexpected replay result.')
    } finally {
      rmSync(directory, { recursive: true, force: true })
    }
  }
}
console.log(`\nReplay finished. Unexpected stage results: ${failures}`)
process.exitCode = failures ? 1 : 0
