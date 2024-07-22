import dbConnect from '../../lib/mongodb';
import Strategy from '../../models/Strategy';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      console.log('Connecting to database...');
      await dbConnect();
      console.log('Connected to database');

      const { id } = req.query;
      console.log('Fetching strategy with ID:', id);

      const strategy = await Strategy.findById(id);
      console.log('Strategy found:', strategy);

      if (!strategy) {
        console.log('Strategy not found');
        return res.status(404).json({ success: false, error: 'Strategy not found' });
      }

      res.status(200).json({ success: true, strategy });
    } catch (error) {
      console.error('Error fetching strategy:', error);
      res.status(500).json({ success: false, error: 'Failed to fetch strategy', details: error.message });
    }
  } else {
    res.status(405).json({ success: false, error: 'Method not allowed' });
  }
}