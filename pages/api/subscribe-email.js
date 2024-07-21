import MailerLite from '@mailerlite/mailerlite-nodejs';
import dbConnect from '../../lib/mongodb';
import Strategy from '../../models/Strategy';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    try {
      await dbConnect();

      const { strategyId, email } = req.body;

      // Update strategy in database
      const strategy = await Strategy.findById(strategyId);
      if (!strategy) {
        return res.status(404).json({ success: false, error: 'Strategy not found' });
      }
      strategy.email = email;
      await strategy.save();

      // Initialize Mailerlite client
      const mailerlite = new MailerLite({
        api_key: process.env.MAILERLITE_API_KEY
      });

      // Subscribe to Mailerlite
      const params = {
        email: email,
        groups: ['127510645768718219'], // Replace with your actual group ID
        status: 'active'
      };

      const response = await mailerlite.subscribers.createOrUpdate(params);

      res.status(200).json({ success: true, message: 'Email subscribed successfully' });
    } catch (error) {
      console.error('Error subscribing email:', error);
      res.status(500).json({ success: false, error: error.message || 'An error occurred while subscribing the email.' });
    }
  } else {
    res.status(405).json({ success: false, error: 'Method not allowed' });
  }
}