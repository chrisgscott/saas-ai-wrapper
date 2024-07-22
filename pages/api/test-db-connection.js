import { testConnection } from '../../lib/mongodb';
import Strategy from '../../models/Strategy';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      await testConnection();

      const count = await Strategy.countDocuments();
      console.log('Number of strategies in database:', count);

      res.status(200).json({ success: true, message: 'Database connection successful', count });
    } catch (error) {
      console.error('Error in test-db-connection:', error);
      res.status(500).json({ success: false, error: 'Failed to connect to database', details: error.message });
    }
  } else {
    res.status(405).json({ success: false, error: 'Method not allowed' });
  }
}