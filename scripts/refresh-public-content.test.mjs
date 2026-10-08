import test from 'node:test'
import assert from 'node:assert/strict'
import { mkdtempSync, readFileSync, readdirSync, rmSync } from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { spawnSync } from 'node:child_process'
import Database from 'better-sqlite3'

const legacy = JSON.parse(readFileSync(new URL('./previous-public-defaults.json', import.meta.url), 'utf8'))

test('public refresh: dry run, backup, preservation and repeat application', () => {
  const dir = mkdtempSync(path.join(os.tmpdir(), 'yongo-refresh-test-'))
  const filename = path.join(dir, 'test.sqlite')
  const db = new Database(filename)
  try {
    db.exec(`CREATE TABLE contents (id TEXT PRIMARY KEY, slug TEXT UNIQUE, title TEXT, excerpt TEXT, body TEXT, cover TEXT, cover_alt TEXT, channel TEXT, type TEXT, status TEXT, featured INTEGER, kicker TEXT, tags_json TEXT, updated_at TEXT)`)
    const insert = db.prepare('INSERT INTO contents VALUES (@id,@slug,@title,@excerpt,@body,@cover,@cover_alt,@channel,@type,@status,@featured,@kicker,@tags_json,@updated_at)')
    for (const [items, channel, type] of [[legacy.services,'shop','service'],[legacy.pages,'public','page']]) {
      for (const item of items) insert.run({id:item.slug,slug:item.slug,title:item.title,excerpt:item.excerpt,body:item.body,cover:item.cover,cover_alt:item.coverAlt,channel,type,status:'published',featured:Number(Boolean(item.featured)),kicker:item.kicker,tags_json:JSON.stringify(item.tags),updated_at:'original'})
    }
    db.prepare("UPDATE contents SET title='Авторская услуга' WHERE slug='backend-apis'").run()
    db.prepare("UPDATE contents SET status='draft' WHERE slug='about'").run()
    db.prepare("INSERT INTO contents (id,slug,body,channel,type,status) VALUES ('private','private','confidential','internal','briefing','published')").run()
    const snapshot = () => db.prepare('SELECT * FROM contents ORDER BY id').all()
    const before = snapshot()
    const run = (apply) => {
      const result = spawnSync(process.execPath, ['--experimental-strip-types',new URL('./refresh-public-content.mjs',import.meta.url).pathname,...(apply?['--apply']:[])],{env:{...process.env,YONGO_CONTENT_DB:filename},encoding:'utf8'})
      assert.equal(result.status,0,result.stderr)
    }
    run(false)
    assert.deepEqual(snapshot(),before)
    run(true)
    assert.equal(db.prepare("SELECT status FROM contents WHERE slug='ue5-realtime'").get().status,'archived')
    assert.equal(db.prepare("SELECT title FROM contents WHERE slug='web-systems'").get().title,'Доработка сайтов и форм заявок')
    for (const slug of ['backend-apis','about','private']) assert.deepEqual(db.prepare('SELECT * FROM contents WHERE slug=?').get(slug),before.find((row)=>row.slug===slug))
    const backupFiles = readdirSync(path.join(dir,'backups'))
    assert.equal(backupFiles.length,1)
    const backup = new Database(path.join(dir,'backups',backupFiles[0]),{readonly:true})
    assert.deepEqual(backup.prepare('SELECT * FROM contents ORDER BY id').all(),before)
    backup.close()
    const after = snapshot()
    run(true)
    assert.deepEqual(snapshot(),after)
    assert.equal(readdirSync(path.join(dir,'backups')).length,1)
  } finally { db.close(); rmSync(dir,{recursive:true,force:true}) }
})
