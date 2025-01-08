import { Client } from '@line/bot-sdk';
import 'dotenv/config';
// 如果是 CommonJS 可用： require('dotenv').config();

// 1) 使用環境變數讀取金鑰
const config = {
    channelAccessToken: process.env.CHANNEL_ACCESS_TOKEN,
    channelSecret: process.env.CHANNEL_SECRET,
};
const client = new Client(config);

// 2) 處理事件的函式
async function handleEvent(event) {
    // 如果是文字訊息
    if (event.type === 'message' && event.message.type === 'text') {
        const msg = event.message.text;

        // 功能 2: 用戶輸入「查詢報告」→ 回傳 PDF
        if (msg.includes('查詢報告')) {
            return client.replyMessage(event.replyToken, {
                type: 'text',
                text: '這是最近報告 PDF：https://example.com/report.pdf',
            });
        }
        // 其餘文字 → 回覆提示
        return client.replyMessage(event.replyToken, {
            type: 'text',
            text: '可以輸入「查詢報告」查看最新 PDF。',
        });
    }
    return Promise.resolve(null);
}

// 3) Serverless Function 入口
export default async (req, res) => {
    if (req.method === 'POST') {
        try {
            const events = req.body.events;
            await Promise.all(events.map(handleEvent));
            return res.status(200).send('OK');
        } catch (error) {
            console.error(error);
            return res.status(500).send('Error');
        }
    }
    return res.status(404).send('Not Found');
};

// 4) (選擇性) 主動推播函式示範
export async function pushOilAlert(userId) {
    await client.pushMessage(userId, {
        type: 'text',
        text: '油污事件警報，請立即查看！',
    });
}
