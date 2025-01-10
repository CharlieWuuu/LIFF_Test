import { MongoClient } from 'mongodb';

const mongoClient = new MongoClient(process.env.MONGODB_URI);

export default async function handler(req, res) {
    if (req.method === 'POST') {
        const { userId } = req.body;
        try {
            await mongoClient.connect();
            const db = mongoClient.db('line-bot');
            const collection = db.collection('users');
            const existingUser = await collection.findOne({ userId });

            if (!existingUser) {
                await collection.insertOne({ userId, region: '未分類' });
                res.status(200).json({ message: '✅ UserId 已儲存' });
            } else {
                res.status(200).json({ message: '✅ UserId 已存在' });
            }
        } catch (error) {
            console.error('❌ 儲存失敗:', error);
            res.status(500).send('❌ 儲存失敗');
        } finally {
            await mongoClient.close();
        }
    } else {
        res.status(405).send('Method Not Allowed');
    }
}
