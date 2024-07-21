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
        const strategy = await Strategy.findById(id);
        if (!strategy) {
          return res.status(404).json({ success: false, error: 'Strategy not found' });
        }
        res.status(200).json({ success: true, data: strategy });
      } catch (error) {
        res.status(400).json({ success: false, error: error.message });
      }
      break;
    default:
      res.status(400).json({ success: false, error: 'Invalid method' });
      break;
  }
}