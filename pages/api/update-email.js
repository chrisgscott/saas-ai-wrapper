import dbConnect from '../../lib/mongodb';
import Strategy from '../../models/Strategy';
import { subscribeToMailerlite } from '../../lib/mailerlite';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    try {
      await dbConnect();

      const { strategyId, email } = req.body;

      let strategy = await Strategy.findById(strategyId);
      if (!strategy) {
        return res.status(404).json({ success: false, error: 'Strategy not found' });
      }

      strategy.email = email;
      await strategy.save();

      // Subscribe to Mailerlite
      await subscribeToMailerlite(email);

      res.status(200).json({ success: true, message: 'Email updated successfully' });
    } catch (error) {
      console.error('Error updating email:', error);
      res.status(500).json({ success: false, error: 'Failed to update email' });
    }
  } else {
    res.status(405).json({ success: false, error: 'Method not allowed' });
  }
}