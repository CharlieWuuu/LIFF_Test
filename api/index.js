// api/index.js
import { Client } from '@line/bot-sdk';
import 'dotenv/config';

console.log('CHANNEL_ACCESS_TOKEN:', process.env.CHANNEL_ACCESS_TOKEN);

const config = {
    channelAccessToken: process.env.CHANNEL_ACCESS_TOKEN,
    channelSecret: process.env.CHANNEL_SECRET,
};
const client = new Client(config);

async function handleEvent(event) {
    if (event.type === 'message' && event.message.type === 'text') {
        const userId = event.source.userId;
        console.log('User ID:', userId);

        const msg = event.message.text;

        if (msg.includes('查詢報告')) {
            return client.replyMessage(event.replyToken, {
                type: 'text',
                text: '這是最近報告 PDF：https://example.com/report.pdf',
            });
        }

        return client.replyMessage(event.replyToken, {
            type: 'text',
            text: '可以輸入「查詢報告」查看最新 PDF。',
        });
    }
    return Promise.resolve(null);
}

export default async (req, res) => {
    if (req.method === 'POST') {
        try {
            const events = req.body.events || [];
            await Promise.all(events.map(handleEvent));
            return res.status(200).send('OK');
        } catch (error) {
            console.error(error);
            return res.status(500).send('Error');
        }
    }

    // 新增一個 GET 路徑來觸發推播
    if (req.method === 'GET' && req.query.push === 'true') {
        const userId = 'Uxxxxxxxxxxxx'; // 替換為實際的 userId
        try {
            await pushOilAlert(userId);
            return res.status(200).send('Push Message Sent');
        } catch (error) {
            console.error(error);
            return res.status(500).send('Error in Push');
        }
    }

    return res.status(404).send('Not Found');
};

export async function pushOilAlert(userId) {
    await client.pushMessage(userId, {
        type: 'text',
        text: '油污事件警報，請立即查看！',
    });
}
