const fs = require('fs')
const path = require('path')

let _fetch = global.fetch
if (typeof _fetch !== 'function') {
  try {
    _fetch = require('node-fetch')
  } catch (e) {
    _fetch = null
  }
}

async function clearSupabase(supabaseUrl, supabaseKey) {
  if (!_fetch) {
    console.error('No fetch available. Install node-fetch or use Node 18+.')
    process.exit(1)
  }

  const restBase = `${supabaseUrl.replace(/\/$/, '')}/rest/v1`
  const tables = ['donations', 'campaigns']

  for (const t of tables) {
    const url = `${restBase}/${t}?id=gt.0`
    console.log(`Clearing table ${t} via ${url}`)
    const res = await _fetch(url, {
      method: 'DELETE',
      headers: {
        apikey: supabaseKey,
        Authorization: `Bearer ${supabaseKey}`,
        Prefer: 'return=representation'
      }
    })

    if (!res.ok) {
      const txt = await res.text().catch(() => '')
      console.error(`Failed to clear ${t}:`, res.status, txt)
    } else {
      console.log(`Cleared ${t}`)
    }
  }
}

async function main() {
  const force = process.argv.includes('--force') || process.env.CONFIRM_CLEAN_DB === 'true' || process.env.CLEAR_DB === 'true'
  if (!force) {
    console.error('Refusing to run. To proceed set CONFIRM_CLEAN_DB=true or pass --force')
    process.exit(1)
  }

  const svcPath = path.resolve(__dirname, '..', 'src', 'services', 'supabaseClients.js')
  if (!fs.existsSync(svcPath)) {
    console.error('Could not find src/services/supabaseClients.js')
    process.exit(1)
  }

  const content = fs.readFileSync(svcPath, 'utf8')
  const urlMatch = content.match(/const supabaseUrl\s*=\s*['"]([^'"]+)['"]/) || []
  const keyMatch = content.match(/const supabaseKey\s*=\s*['"]([^'"]+)['"]/) || []
  const supabaseUrl = urlMatch[1]
  const supabaseKey = keyMatch[1]

  if (!supabaseUrl || !supabaseKey) {
    console.error('Supabase URL or Key not found in supabaseClients.js')
    process.exit(1)
  }

  console.log('About to delete data from Supabase tables: donations, campaigns')
  await clearSupabase(supabaseUrl, supabaseKey)
  console.log('Done.')
}

main().catch((e) => {
  console.error('Error during cleanup:', e)
  process.exit(1)
})
