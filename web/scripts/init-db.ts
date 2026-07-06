import { loadEnvConfig } from '@next/env'
loadEnvConfig(process.cwd())  

import fs from 'fs'
import path from 'path'
import { db } from '../database/configureDatabase'

const schemaSql = fs.readFileSync(path.join(process.cwd(), 'database/schema.sql'), 'utf8')
db.exec(schemaSql)

const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all()
console.log('Schema applied — tables:', tables)
db.close()
