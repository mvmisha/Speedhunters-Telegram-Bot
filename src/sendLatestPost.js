const axios = require('axios');
const cheerio = require('cheerio');
require('dotenv').config();

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;

const sendLatestPost = async () => {
    try {
        // 1. Fetch the Speedhunters homepage
        const { data } = await axios.get('https://www.speedhunters.com/');
        const $ = cheerio.load(data);

        // 2. Locate the latest post
        const latestPost = $('.featured-stories').first();

        // 3. Extract post details
        const title = latestPost.find('.homepage-entry-title').text();
        const url = latestPost.find('a').attr('href');
        const imageUrl = latestPost.find('img').attr('src');

        if (!title || !url || !imageUrl) {
            console.log('❌ Could not extract post info');
            return;
        }

        console.log(`✅ Sending post: ${title}`);

        // 4. Prepare the message for Telegram
        const message = title + " " + url;
        const telegramUrl = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendPhoto`;

        // 5. Send the message to Telegram
        const response = await axios.post(telegramUrl, {
            chat_id: TELEGRAM_CHAT_ID,
            caption: message,
            photo: imageUrl,
        });

        console.log('✅ Message sent! Telegram response:', response.data);
    } catch (error) {
        console.error('❌ Error:', error.response?.data || error.message);
    }
};

sendLatestPost();
