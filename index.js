const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');
const { Firestore, Timestamp } = require('@google-cloud/firestore');
require('dotenv').config();

const firestore = new Firestore();
const COLLECTION_NAME = 'published_posts';

const app = express();


app.get('/', async (req, res) => {
  try {
    // 1. Scrape Speedhunters
    const { data } = await axios.get('https://www.speedhunters.com/');
    const $ = cheerio.load(data);
    const latestPost = $('.featured-stories').first();

    const title = latestPost.find('.homepage-entry-title').text().trim();
    const url = latestPost.find('a').attr('href');
    const imageUrl = latestPost.find('img').attr('src');

    if (!title || !url || !imageUrl) {
      console.log('❌ Could not extract post info');
      return res.status(200).send('No new post found.');
    }

    // 2. Firestore check
    const docRef = firestore.collection(COLLECTION_NAME).doc('latest');
    const doc = await docRef.get();
    if (doc.exists && doc.data().url === url) {
      console.log('🔁 Post already published, skipping.');
      return res.status(200).send('Already sent');
    }

    // 3. Send to Telegram
    const message = `<b>${title}</b>\n<a href="${url}">Read more</a>`;
    const telegramUrl = `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendPhoto`;

    await axios.post(telegramUrl, {
      chat_id: process.env.TELEGRAM_CHAT_ID,
      photo: imageUrl,
      caption: message,
      parse_mode: 'HTML'
    });

    // 4. Mark as published
    await docRef.set({
      url,
      timestamp: Timestamp.now()
    });

    console.log('✅ Post published successfully!');
    res.status(200).send('Posted to Telegram');
  } catch (err) {
    console.error('❌ Error:', err.stack || err.message || err);
    res.status(500).send('Failed');
  }
});

module.exports = app;