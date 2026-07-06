-- Enable foreign keys (also set via PRAGMA in configureDatabase.ts)
PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS participants (
  id TEXT PRIMARY KEY DEFAULT (
    lower(hex(randomblob(4)) || '-' || hex(randomblob(2)) || '-4' ||
      substr(hex(randomblob(2)), 2) || '-' ||
      substr('89ab', abs(random()) % 4 + 1, 1) ||
      substr(hex(randomblob(2)), 2) || '-' || hex(randomblob(6)))
  ),
  pid TEXT UNIQUE NOT NULL,
  condition TEXT NOT NULL CHECK (condition IN ('narrative-structures', 'narrative-techniques')),
  assigned_windows TEXT NOT NULL,                    -- JSON array (was text[])
  status TEXT NOT NULL DEFAULT 'troubles' CHECK (status IN (
    'troubles', 'qualities', 'quality_description',
    'pre_narrative', 'characters', 'motivations', 't1_meaning',
    'in_house', 'post_narrative', 't2_meaning', 'complete'
  )),
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS sessions (
  id TEXT PRIMARY KEY DEFAULT (
    lower(hex(randomblob(4)) || '-' || hex(randomblob(2)) || '-4' ||
      substr(hex(randomblob(2)), 2) || '-' ||
      substr('89ab', abs(random()) % 4 + 1, 1) ||
      substr(hex(randomblob(2)), 2) || '-' || hex(randomblob(6)))
  ),
  participant_id TEXT REFERENCES participants(id) ON DELETE CASCADE,
  trouble TEXT DEFAULT '[]',                          -- JSON array (was text[])
  qualities TEXT DEFAULT '[]',                        -- JSON array
  quality_description TEXT,
  t1_narrative TEXT,
  plot_summary TEXT,
  characters TEXT DEFAULT '[]',                       -- JSON (was jsonb)
  motivations TEXT DEFAULT '[]',                      -- JSON array
  motivation_description TEXT,
  t1_meaning_score INTEGER CHECK (t1_meaning_score BETWEEN 1 AND 7),
  participant_name TEXT,
  t2_narrative TEXT,
  t2_meaning_score INTEGER CHECK (t2_meaning_score BETWEEN 1 AND 7)
);

CREATE TABLE IF NOT EXISTS window_sessions (
  id TEXT PRIMARY KEY DEFAULT (
    lower(hex(randomblob(4)) || '-' || hex(randomblob(2)) || '-4' ||
      substr(hex(randomblob(2)), 2) || '-' ||
      substr('89ab', abs(random()) % 4 + 1, 1) ||
      substr(hex(randomblob(2)), 2) || '-' || hex(randomblob(6)))
  ),
  participant_id TEXT REFERENCES participants(id) ON DELETE CASCADE,
  window_name TEXT NOT NULL,
  window_category TEXT NOT NULL,
  order_in_session INTEGER NOT NULL CHECK (order_in_session IN (1, 2, 3)),
  status TEXT NOT NULL DEFAULT 'not_started' CHECK (status IN ('not_started', 'in_progress', 'complete')),
  llm_passages TEXT DEFAULT '[]',                     -- JSON (was jsonb)
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  completed_at TEXT
);

CREATE TABLE IF NOT EXISTS flavor_choices (
  id TEXT PRIMARY KEY DEFAULT (
    lower(hex(randomblob(4)) || '-' || hex(randomblob(2)) || '-4' ||
      substr(hex(randomblob(2)), 2) || '-' ||
      substr('89ab', abs(random()) % 4 + 1, 1) ||
      substr(hex(randomblob(2)), 2) || '-' || hex(randomblob(6)))
  ),
  participant_id TEXT REFERENCES participants(id) ON DELETE CASCADE,
  fork_id TEXT NOT NULL,
  choice TEXT NOT NULL,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS questionnaire_responses (
  id TEXT PRIMARY KEY DEFAULT (
    lower(hex(randomblob(4)) || '-' || hex(randomblob(2)) || '-4' ||
      substr(hex(randomblob(2)), 2) || '-' ||
      substr('89ab', abs(random()) % 4 + 1, 1) ||
      substr(hex(randomblob(2)), 2) || '-' || hex(randomblob(6)))
  ),
  participant_id TEXT REFERENCES participants(id) ON DELETE CASCADE,
  questionnaire TEXT NOT NULL CHECK (questionnaire IN ('MEMS', 'MLQ', 'PTGI', 'NISE')),
  timing TEXT NOT NULL CHECK (timing IN ('pre', 'post')),
  responses TEXT NOT NULL DEFAULT '{}',               -- JSON (was jsonb)
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for common lookups (SQLite requires index names)
CREATE INDEX IF NOT EXISTS idx_participants_pid ON participants(pid);
CREATE INDEX IF NOT EXISTS idx_sessions_participant ON sessions(participant_id);
CREATE INDEX IF NOT EXISTS idx_window_sessions_participant ON window_sessions(participant_id);
