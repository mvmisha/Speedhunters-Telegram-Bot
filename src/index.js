const axios = require('axios');
const cheerio = require('cheerio');
const { Firestore, Timestamp } = require('@google-cloud/firestore');
require('dotenv').config();

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;
const firestore = new Firestore();
const COLLECTION_NAME = 'published_posts';

const sendLatestPost = async () => {
    try {
        const { data } = await axios.get('https://www.speedhunters.com/');
        const $ = cheerio.load(data);
        const latestPost = $('.featured-stories').first();

        const title = latestPost.find('.homepage-entry-title').text().trim();
        const url = latestPost.find('a').attr('href');
        const imageUrl = latestPost.find('img').attr('src');

        if (!title || !url || !imageUrl) {
            console.log('❌ Could not extract post info');
            return;
        }

        const docRef = firestore.collection(COLLECTION_NAME).doc('latest');
        let doc;
        try {
            doc = await docRef.get();
            if (doc.exists) {
                if (doc.data().url === url) {
                    console.log('🔁 Post already sent, skipping.');
                    return;
                }
            } else {
                console.log('📭 First post — creating Firestore doc');
            }
        } catch (firestoreError) {
            console.warn('⚠️ Firestore read error:', firestoreError.message);
        }

        const message = title + " " + url;
        const telegramUrl = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendPhoto`;

        const response = await axios.post(telegramUrl, {
            chat_id: TELEGRAM_CHAT_ID,
            caption: message,
            photo: imageUrl,
            parse_mode: 'HTML'
        });

        console.log('✅ Message sent! Telegram response:', response.data);

        try {
            await docRef.set({
                url,
                timestamp: Timestamp.now()
            });
        } catch (setErr) {
            console.error("❌ Failed to write to Firestore:");
            console.error(setErr.message);
            console.error(setErr.stack);
        }
    } catch (error) {
        console.error('❌ An error occurred!');
        console.error('▶ message:', error.message);
        if (error.code) console.error('▶ code:', error.code);
        if (error.response?.data) {
            console.error('▶ response data:', JSON.stringify(error.response.data, null, 2));
        }
        console.error('▶ stack trace:\n', error.stack);
    }
};

sendLatestPost();
