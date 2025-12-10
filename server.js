const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { Pool } = require('pg');
const fs = require('fs').promises;
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(bodyParser.json({ limit: '50mb' }));
app.use(express.static('.'));

if (!process.env.ADMIN_PASSWORD) {
  console.warn('WARNING: ADMIN_PASSWORD environment variable not set. Admin features will be inaccessible.');
}
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

function adminAuth(req, res, next) {
  const authHeader = req.headers['x-admin-password'];
  if (!authHeader || authHeader !== ADMIN_PASSWORD) {
    return res.status(401).json({ error: 'Unauthorized - Admin password required' });
  }
  next();
}

app.use('/api/stories', (req, res, next) => {
  if (req.method === 'GET') return next();
  adminAuth(req, res, next);
});

app.use('/api/songs', (req, res, next) => {
  if (req.method === 'GET') return next();
  adminAuth(req, res, next);
});

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

async function initDatabase() {
  const client = await pool.connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS stories (
        id SERIAL PRIMARY KEY,
        filename VARCHAR(255) UNIQUE NOT NULL,
        story_id VARCHAR(255) NOT NULL,
        name VARCHAR(500) NOT NULL,
        location VARCHAR(500),
        writer VARCHAR(255),
        description TEXT,
        status VARCHAR(50) DEFAULT 'available',
        category VARCHAR(100),
        tags TEXT[],
        banner TEXT,
        reading TEXT,
        reading_time INTEGER DEFAULT 0,
        word_count INTEGER DEFAULT 0,
        is_public BOOLEAN DEFAULT true,
        display_order INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS app_settings (
        id SERIAL PRIMARY KEY,
        setting_key VARCHAR(255) UNIQUE NOT NULL,
        setting_value TEXT NOT NULL,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    const defaultSettings = [
      { key: 'autoplay_enabled', value: 'true' },
      { key: 'default_theme', value: 'dark' },
      { key: 'admin_password', value: ADMIN_PASSWORD },
      { key: 'default_font_size', value: '100' },
      { key: 'enable_animations', value: 'true' },
      { key: 'reading_time_tracking', value: 'true' }
    ];

    for (const setting of defaultSettings) {
      const exists = await client.query('SELECT * FROM app_settings WHERE setting_key = $1', [setting.key]);
      if (exists.rows.length === 0) {
        await client.query(`
          INSERT INTO app_settings (setting_key, setting_value)
          VALUES ($1, $2)
        `, [setting.key, setting.value]);
      }
    }

    await client.query(`
      ALTER TABLE stories ADD COLUMN IF NOT EXISTS display_order INTEGER DEFAULT 0
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS songs (
        id SERIAL PRIMARY KEY,
        title VARCHAR(500) NOT NULL,
        artist VARCHAR(255),
        url TEXT NOT NULL,
        duration VARCHAR(20),
        icon VARCHAR(100) DEFAULT 'fas fa-music',
        is_public BOOLEAN DEFAULT true,
        display_order INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await client.query(`
      ALTER TABLE songs ADD COLUMN IF NOT EXISTS display_order INTEGER DEFAULT 0
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS story_content (
        id SERIAL PRIMARY KEY,
        filename VARCHAR(255) UNIQUE NOT NULL,
        content TEXT NOT NULL,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    const storyCount = await client.query('SELECT COUNT(*) FROM stories');
    if (parseInt(storyCount.rows[0].count) === 0) {
      await syncStoriesFromJson(client);
    }

    const songCount = await client.query('SELECT COUNT(*) FROM songs');
    if (parseInt(songCount.rows[0].count) === 0) {
      await syncSongsFromJson(client);
    }

    console.log('Database initialized successfully');
  } finally {
    client.release();
  }
}

async function syncStoriesFromJson(client) {
  try {
    const storiesData = await fs.readFile('stories.json', 'utf8');
    const stories = JSON.parse(storiesData);
    
    for (const [filename, story] of Object.entries(stories)) {
      await client.query(`
        INSERT INTO stories (filename, story_id, name, location, writer, description, status, category, tags, banner, reading, reading_time, word_count)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
        ON CONFLICT (filename) DO NOTHING
      `, [
        filename,
        story.id || '',
        story.name || '',
        story.location || '',
        story.writer || '',
        story.description || '',
        story.status || 'available',
        story.category || '',
        story.tags || [],
        story.banner || '',
        story.reading || '',
        story.readingTime || 0,
        story.wordCount || 0
      ]);

      try {
        const storyPath = path.join('stories', filename);
        const content = await fs.readFile(storyPath, 'utf8');
        await client.query(`
          INSERT INTO story_content (filename, content)
          VALUES ($1, $2)
          ON CONFLICT (filename) DO NOTHING
        `, [filename, content]);
      } catch (e) {
        console.log(`Story content file not found: ${filename}`);
      }
    }
    console.log('Stories synced from JSON');
  } catch (error) {
    console.error('Error syncing stories:', error);
  }
}

async function syncSongsFromJson(client) {
  try {
    const songsData = await fs.readFile('songs.json', 'utf8');
    const songs = JSON.parse(songsData);
    
    for (const song of songs) {
      await client.query(`
        INSERT INTO songs (title, artist, url, duration, icon)
        VALUES ($1, $2, $3, $4, $5)
      `, [
        song.title || '',
        song.artist || '',
        song.url || '',
        song.duration || '',
        song.icon || 'fas fa-music'
      ]);
    }
    console.log('Songs synced from JSON');
  } catch (error) {
    console.error('Error syncing songs:', error);
  }
}

app.get('/api/stories', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM stories ORDER BY display_order ASC, created_at DESC');
    const stories = {};
    for (const row of result.rows) {
      stories[row.filename] = {
        id: row.story_id,
        name: row.name,
        location: row.location,
        writer: row.writer,
        description: row.description,
        status: row.status,
        category: row.category,
        tags: row.tags || [],
        banner: row.banner,
        reading: row.reading,
        readingTime: row.reading_time,
        wordCount: row.word_count,
        isPublic: row.is_public
      };
    }
    res.json(stories);
  } catch (error) {
    console.error('Error fetching stories:', error);
    res.status(500).json({ error: 'Failed to fetch stories' });
  }
});

app.get('/api/stories/public', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM stories WHERE is_public = true ORDER BY display_order ASC, created_at DESC');
    const stories = {};
    for (const row of result.rows) {
      stories[row.filename] = {
        id: row.story_id,
        name: row.name,
        location: row.location,
        writer: row.writer,
        description: row.description,
        status: row.status,
        category: row.category,
        tags: row.tags || [],
        banner: row.banner,
        reading: row.reading,
        readingTime: row.reading_time,
        wordCount: row.word_count
      };
    }
    res.json(stories);
  } catch (error) {
    console.error('Error fetching public stories:', error);
    res.status(500).json({ error: 'Failed to fetch stories' });
  }
});

app.post('/api/stories', async (req, res) => {
  const { id, name, location, writer, description, status, category, tags, banner, reading, content } = req.body;
  const filename = `${id}.txt`;

  try {
    const maxOrderResult = await pool.query('SELECT COALESCE(MAX(display_order), -1) + 1 as next_order FROM stories');
    const nextOrder = maxOrderResult.rows[0].next_order;
    
    await pool.query(`
      INSERT INTO stories (filename, story_id, name, location, writer, description, status, category, tags, banner, reading, display_order)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
    `, [filename, id, name, location || '', writer || '', description || '', status || 'available', category || '', tags || [], banner || '', reading || '', nextOrder]);

    if (content) {
      await pool.query(`
        INSERT INTO story_content (filename, content)
        VALUES ($1, $2)
      `, [filename, content]);

      await fs.mkdir('stories', { recursive: true });
      await fs.writeFile(path.join('stories', filename), content, 'utf8');
    }

    await updateStoriesJson();
    res.json({ success: true, message: 'Story created successfully' });
  } catch (error) {
    console.error('Error creating story:', error);
    res.status(500).json({ error: 'Failed to create story' });
  }
});

app.put('/api/stories/:filename', async (req, res) => {
  const { filename } = req.params;
  const { name, location, writer, description, status, category, tags, banner, reading, isPublic, content } = req.body;

  try {
    await pool.query(`
      UPDATE stories 
      SET name = COALESCE($1, name),
          location = COALESCE($2, location),
          writer = COALESCE($3, writer),
          description = COALESCE($4, description),
          status = COALESCE($5, status),
          category = COALESCE($6, category),
          tags = COALESCE($7, tags),
          banner = COALESCE($8, banner),
          reading = COALESCE($9, reading),
          is_public = COALESCE($10, is_public),
          updated_at = CURRENT_TIMESTAMP
      WHERE filename = $11
    `, [name, location, writer, description, status, category, tags, banner, reading, isPublic, filename]);

    if (content !== undefined) {
      await pool.query(`
        INSERT INTO story_content (filename, content, updated_at)
        VALUES ($1, $2, CURRENT_TIMESTAMP)
        ON CONFLICT (filename) DO UPDATE SET content = $2, updated_at = CURRENT_TIMESTAMP
      `, [filename, content]);

      await fs.mkdir('stories', { recursive: true });
      await fs.writeFile(path.join('stories', filename), content, 'utf8');
    }

    await updateStoriesJson();
    res.json({ success: true, message: 'Story updated successfully' });
  } catch (error) {
    console.error('Error updating story:', error);
    res.status(500).json({ error: 'Failed to update story' });
  }
});

app.patch('/api/stories/:filename/visibility', async (req, res) => {
  const { filename } = req.params;
  const { isPublic } = req.body;

  try {
    await pool.query(`
      UPDATE stories SET is_public = $1, updated_at = CURRENT_TIMESTAMP WHERE filename = $2
    `, [isPublic, filename]);

    await updateStoriesJson();
    res.json({ success: true, message: `Story ${isPublic ? 'published' : 'hidden'} successfully` });
  } catch (error) {
    console.error('Error updating visibility:', error);
    res.status(500).json({ error: 'Failed to update visibility' });
  }
});

app.delete('/api/stories/:filename', async (req, res) => {
  const { filename } = req.params;

  try {
    await pool.query('DELETE FROM stories WHERE filename = $1', [filename]);
    await pool.query('DELETE FROM story_content WHERE filename = $1', [filename]);

    try {
      await fs.unlink(path.join('stories', filename));
    } catch (e) {
      console.log('Story file not found or already deleted');
    }

    await updateStoriesJson();
    res.json({ success: true, message: 'Story deleted successfully' });
  } catch (error) {
    console.error('Error deleting story:', error);
    res.status(500).json({ error: 'Failed to delete story' });
  }
});

app.get('/api/stories/:filename/content', async (req, res) => {
  const { filename } = req.params;
  try {
    const result = await pool.query('SELECT content FROM story_content WHERE filename = $1', [filename]);
    if (result.rows.length > 0) {
      res.json({ content: result.rows[0].content });
    } else {
      try {
        const content = await fs.readFile(path.join('stories', filename), 'utf8');
        res.json({ content });
      } catch (e) {
        res.status(404).json({ error: 'Story content not found' });
      }
    }
  } catch (error) {
    console.error('Error fetching story content:', error);
    res.status(500).json({ error: 'Failed to fetch story content' });
  }
});

app.get('/api/songs', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM songs ORDER BY display_order ASC, id ASC');
    res.json(result.rows.map(row => ({
      id: row.id,
      title: row.title,
      artist: row.artist,
      url: row.url,
      duration: row.duration,
      icon: row.icon,
      isPublic: row.is_public
    })));
  } catch (error) {
    console.error('Error fetching songs:', error);
    res.status(500).json({ error: 'Failed to fetch songs' });
  }
});

app.get('/api/songs/public', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM songs WHERE is_public = true ORDER BY display_order ASC, id ASC');
    res.json(result.rows.map(row => ({
      title: row.title,
      artist: row.artist,
      url: row.url,
      duration: row.duration,
      icon: row.icon
    })));
  } catch (error) {
    console.error('Error fetching public songs:', error);
    res.status(500).json({ error: 'Failed to fetch songs' });
  }
});

app.post('/api/songs', async (req, res) => {
  const { title, artist, url, duration, icon } = req.body;

  try {
    const maxOrderResult = await pool.query('SELECT COALESCE(MAX(display_order), -1) + 1 as next_order FROM songs');
    const nextOrder = maxOrderResult.rows[0].next_order;
    
    const result = await pool.query(`
      INSERT INTO songs (title, artist, url, duration, icon, display_order)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING id
    `, [title, artist || '', url, duration || '', icon || 'fas fa-music', nextOrder]);

    await updateSongsJson();
    res.json({ success: true, id: result.rows[0].id, message: 'Song added successfully' });
  } catch (error) {
    console.error('Error creating song:', error);
    res.status(500).json({ error: 'Failed to create song' });
  }
});

app.put('/api/songs/:id', async (req, res) => {
  const { id } = req.params;
  const { title, artist, url, duration, icon, isPublic } = req.body;

  try {
    await pool.query(`
      UPDATE songs 
      SET title = COALESCE($1, title),
          artist = COALESCE($2, artist),
          url = COALESCE($3, url),
          duration = COALESCE($4, duration),
          icon = COALESCE($5, icon),
          is_public = COALESCE($6, is_public),
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $7
    `, [title, artist, url, duration, icon, isPublic, id]);

    await updateSongsJson();
    res.json({ success: true, message: 'Song updated successfully' });
  } catch (error) {
    console.error('Error updating song:', error);
    res.status(500).json({ error: 'Failed to update song' });
  }
});

app.patch('/api/songs/:id/visibility', async (req, res) => {
  const { id } = req.params;
  const { isPublic } = req.body;

  try {
    await pool.query(`
      UPDATE songs SET is_public = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2
    `, [isPublic, id]);

    await updateSongsJson();
    res.json({ success: true, message: `Song ${isPublic ? 'published' : 'hidden'} successfully` });
  } catch (error) {
    console.error('Error updating visibility:', error);
    res.status(500).json({ error: 'Failed to update visibility' });
  }
});

app.delete('/api/songs/:id', async (req, res) => {
  const { id } = req.params;

  try {
    await pool.query('DELETE FROM songs WHERE id = $1', [id]);
    await updateSongsJson();
    res.json({ success: true, message: 'Song deleted successfully' });
  } catch (error) {
    console.error('Error deleting song:', error);
    res.status(500).json({ error: 'Failed to delete song' });
  }
});

app.patch('/api/stories/:filename/reorder', async (req, res) => {
  const { filename } = req.params;
  const { direction } = req.body;
  const client = await pool.connect();

  try {
    await client.query('BEGIN');
    
    const allStories = await client.query('SELECT filename FROM stories ORDER BY display_order ASC, created_at DESC');
    const stories = allStories.rows;
    const currentIndex = stories.findIndex(s => s.filename === filename);

    if (currentIndex === -1) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Story not found' });
    }

    let newOrder = [...stories];
    if (direction === 'up' && currentIndex > 0) {
      [newOrder[currentIndex - 1], newOrder[currentIndex]] = [newOrder[currentIndex], newOrder[currentIndex - 1]];
    } else if (direction === 'down' && currentIndex < stories.length - 1) {
      [newOrder[currentIndex], newOrder[currentIndex + 1]] = [newOrder[currentIndex + 1], newOrder[currentIndex]];
    }

    for (let i = 0; i < newOrder.length; i++) {
      await client.query('UPDATE stories SET display_order = $1 WHERE filename = $2', [i, newOrder[i].filename]);
    }

    await client.query('COMMIT');
    await updateStoriesJson();
    res.json({ success: true, message: 'Story reordered successfully' });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error reordering story:', error);
    res.status(500).json({ error: 'Failed to reorder story' });
  } finally {
    client.release();
  }
});

app.patch('/api/songs/:id/reorder', async (req, res) => {
  const { id } = req.params;
  const { direction } = req.body;
  const client = await pool.connect();

  try {
    await client.query('BEGIN');
    
    const allSongs = await client.query('SELECT id FROM songs ORDER BY display_order ASC, id ASC');
    const songs = allSongs.rows;
    const currentIndex = songs.findIndex(s => s.id === parseInt(id));

    if (currentIndex === -1) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Song not found' });
    }

    let newOrder = [...songs];
    if (direction === 'up' && currentIndex > 0) {
      [newOrder[currentIndex - 1], newOrder[currentIndex]] = [newOrder[currentIndex], newOrder[currentIndex - 1]];
    } else if (direction === 'down' && currentIndex < songs.length - 1) {
      [newOrder[currentIndex], newOrder[currentIndex + 1]] = [newOrder[currentIndex + 1], newOrder[currentIndex]];
    }

    for (let i = 0; i < newOrder.length; i++) {
      await client.query('UPDATE songs SET display_order = $1 WHERE id = $2', [i, newOrder[i].id]);
    }

    await client.query('COMMIT');
    await updateSongsJson();
    res.json({ success: true, message: 'Song reordered successfully' });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error reordering song:', error);
    res.status(500).json({ error: 'Failed to reorder song' });
  } finally {
    client.release();
  }
});

async function updateStoriesJson() {
  try {
    const result = await pool.query('SELECT * FROM stories WHERE is_public = true ORDER BY display_order ASC, created_at DESC');
    const stories = {};
    for (const row of result.rows) {
      stories[row.filename] = {
        id: row.story_id,
        name: row.name,
        location: row.location,
        writer: row.writer,
        description: row.description,
        status: row.status,
        category: row.category,
        tags: row.tags || [],
        banner: row.banner,
        reading: row.reading,
        readingTime: row.reading_time,
        wordCount: row.word_count
      };
    }
    await fs.writeFile('stories.json', JSON.stringify(stories, null, 4), 'utf8');
  } catch (error) {
    console.error('Error updating stories.json:', error);
  }
}

async function updateSongsJson() {
  try {
    const result = await pool.query('SELECT * FROM songs WHERE is_public = true ORDER BY display_order ASC, id ASC');
    const songs = result.rows.map(row => ({
      title: row.title,
      artist: row.artist,
      url: row.url,
      duration: row.duration,
      icon: row.icon
    }));
    await fs.writeFile('songs.json', JSON.stringify(songs, null, 4), 'utf8');
  } catch (error) {
    console.error('Error updating songs.json:', error);
  }
}

app.get('/api/settings', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM app_settings WHERE setting_key != $1', ['admin_password']);
    const settings = {};
    result.rows.forEach(row => {
      if (row.setting_value === 'true') {
        settings[row.setting_key] = true;
      } else if (row.setting_value === 'false') {
        settings[row.setting_key] = false;
      } else if (!isNaN(row.setting_value)) {
        settings[row.setting_key] = parseInt(row.setting_value);
      } else {
        settings[row.setting_key] = row.setting_value;
      }
    });
    res.json(settings);
  } catch (error) {
    console.error('Error fetching settings:', error);
    res.status(500).json({ error: 'Failed to fetch settings' });
  }
});

app.patch('/api/settings/:key', adminAuth, async (req, res) => {
  const { key } = req.params;
  const { value } = req.body;

  try {
    const stringValue = typeof value === 'boolean' ? value.toString() : String(value);
    await pool.query(`
      INSERT INTO app_settings (setting_key, setting_value, updated_at)
      VALUES ($1, $2, CURRENT_TIMESTAMP)
      ON CONFLICT (setting_key) DO UPDATE SET setting_value = $2, updated_at = CURRENT_TIMESTAMP
    `, [key, stringValue]);

    res.json({ success: true, message: 'Setting updated successfully' });
  } catch (error) {
    console.error('Error updating setting:', error);
    res.status(500).json({ error: 'Failed to update setting' });
  }
});

app.post('/api/settings/password/change', adminAuth, async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  try {
    const result = await pool.query('SELECT setting_value FROM app_settings WHERE setting_key = $1', ['admin_password']);
    const storedPassword = result.rows[0]?.setting_value || ADMIN_PASSWORD;

    if (currentPassword !== storedPassword) {
      return res.status(401).json({ error: 'Current password is incorrect' });
    }

    await pool.query(`
      INSERT INTO app_settings (setting_key, setting_value, updated_at)
      VALUES ('admin_password', $1, CURRENT_TIMESTAMP)
      ON CONFLICT (setting_key) DO UPDATE SET setting_value = $1, updated_at = CURRENT_TIMESTAMP
    `, [newPassword]);

    res.json({ success: true, message: 'Password changed successfully' });
  } catch (error) {
    console.error('Error changing password:', error);
    res.status(500).json({ error: 'Failed to change password' });
  }
});

initDatabase().then(() => {
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}).catch(error => {
  console.error('Failed to initialize database:', error);
  process.exit(1);
});
