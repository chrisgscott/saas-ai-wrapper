import dbConnect from '../../../lib/mongodb';
import Strategy from '../../../models/Strategy';

export default async function handler(req, res) {
  const {
    query: { id },
    method,
  } = req;

  await dbConnect();

  switch (method) {
    case 'GET':
      try {
        console.log('Fetching strategy with ID:', id);
        const strategy = await Strategy.findById(id);
        if (!strategy) {
          console.log('Strategy not found');
          return res.status(404).json({ success: false, error: 'Strategy not found' });
        }
        console.log('Strategy found:', JSON.stringify(strategy, null, 2));
        res.status(200).json({ success: true, data: strategy });
      } catch (error) {
        console.error('Error fetching strategy:', error);
        res.status(400).json({ success: false, error: error.message });
      }
      break;
    default:
      res.status(400).json({ success: false, error: 'Invalid method' });
      break;
  }
}