import dbConnect from '../../lib/mongodb';
import Strategy from '../../models/Strategy';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      await dbConnect();

      const { id } = req.query;
      const strategy = await Strategy.findById(id);

      if (!strategy) {
        return res.status(404).json({ success: false, error: 'Strategy not found' });
      }

      res.status(200).json({ success: true, strategy });
    } catch (error) {
      console.error('Error fetching strategy:', error);
      res.status(500).json({ success: false, error: 'Failed to fetch strategy' });
    }
  } else {
    res.status(405).json({ success: false, error: 'Method not allowed' });
  }
}