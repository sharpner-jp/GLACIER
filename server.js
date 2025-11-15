const express = require('express');
const axios = require('axios');
const crypto = require('crypto');
const path = require('path');

const app = express();
const PORT = 3000;

// 静的ファイルの提供
app.use(express.static('public'));

// HTMLフェッチエンドポイント（ハッシュからURLを復元して取得）
app.get('/fetch', async (req, res) => {
  const hash = req.query.h;
  
  if (!hash) {
    return res.status(400).json({ error: 'Hash is required' });
  }

  try {
    // Base64デコード
    let originalUrl;
    try {
      originalUrl = Buffer.from(decodeURIComponent(hash), 'base64').toString('utf-8');
      console.log('Decoded URL:', originalUrl);
    } catch (decodeError) {
      console.error('Decode error:', decodeError);
      return res.status(400).json({ error: 'Invalid encoded URL' });
    }

    // URLの妥当性チェック
    if (!originalUrl.startsWith('http://') && !originalUrl.startsWith('https://')) {
      return res.status(400).json({ error: 'Invalid URL format' });
    }

    // URLからHTMLを取得
    const response = await axios.get(originalUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      },
      timeout: 10000
    });

    // HTMLを返す
    res.json({
      html: response.data,
      url: originalUrl,
      status: response.status
    });

  } catch (error) {
    console.error('Fetch error:', error.message);
    res.status(500).json({
      error: 'Failed to fetch URL',
      message: error.message
    });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});