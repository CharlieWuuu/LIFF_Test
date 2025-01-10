// api/index.js
import { Client } from '@line/bot-sdk';
import 'dotenv/config';

// ✅ 使用環境變數設定
const config = {
    channelAccessToken: process.env.CHANNEL_ACCESS_TOKEN,
    channelSecret: process.env.CHANNEL_SECRET,
};
const client = new Client(config);

// ✅ 處理收到的訊息事件 (Webhook Handler)
async function handleEvent(event) {
    try {
        if (event.type !== 'message' || event.message.type !== 'text') {
            return Promise.resolve(null);
        }

        // ✅ 每次事件處理時，動態取得 userId
        const userId = event.source.userId;
        const msg = event.message.text;
        console.log(`收到訊息 | User ID: ${userId} | Message: ${msg}`);

        // ✅ 功能 1: 查詢報告
        if (msg.includes('查詢報告')) {
            return client.replyMessage(event.replyToken, {
                type: 'text',
                text: '這是最近報告 PDF：https://example.com/report.pdf',
            });
        }

        // ✅ 功能 2: 警報介紹
        if (msg.includes('警報介紹')) {
            return client.replyMessage(event.replyToken, {
                type: 'text',
                text: '我們利用衛星影像監測海上油汙，為您提供即時警報服務！',
            });
        }

        // ✅ 其他訊息回應
        return client.replyMessage(event.replyToken, {
            type: 'text',
            text: '請輸入「查詢報告」或「警報介紹」進行互動。',
        });
    } catch (error) {
        console.error('❌ 錯誤處理事件: ', error);
        return Promise.reject(error);
    }
}

// ✅ 主動推播函式 (動態從 Query String 讀取 userId)
export async function pushOilAlert(userId) {
    const alertTime = new Date().toLocaleString('zh-TW', { timeZone: 'Asia/Taipei' });
    try {
        await client.pushMessage(userId, {
            type: 'text',
            text: `${alertTime} 發生油污事件警報，請立即查看！`,
        });
        console.log(`✅ 推播成功給用戶: ${userId}`);
    } catch (error) {
        console.error('❌ 推播失敗:', error);
        throw error;
    }
}

// ✅ Serverless Function 入口 (處理 Webhook 與手動推播)
export default async (req, res) => {
    if (req.method === 'POST') {
        try {
            const events = req.body.events || [];
            await Promise.all(events.map(handleEvent));
            res.status(200).send('Webhook Processed');
        } catch (error) {
            console.error('❌ Webhook Error: ', error);
            res.status(500).send('Webhook Error');
        }
    }

    // ✅ 主動推播路徑 (需要提供 userId)
    else if (req.method === 'GET' && req.query.push === 'true') {
        const userId = req.query.userId; // ✅ 動態取得 userId
        if (!userId) {
            return res.status(400).send('❌ Error: userId is required' + req.query);
        }
        try {
            await pushOilAlert(userId);
            res.status(200).send(`✅ 推播訊息已成功送給用戶 ${userId}`);
        } catch (error) {
            console.error('❌ 推播失敗: ', error);
            res.status(500).send('推播失敗');
        }
    }

    // 其他無效路徑處理
    else {
        res.status(404).send('Not Found');
    }
};
