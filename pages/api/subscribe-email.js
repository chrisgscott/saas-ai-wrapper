import MailerLite from '@mailerlite/mailerlite-nodejs';
import dbConnect from '../../lib/mongodb';
import Strategy from '../../models/Strategy';
import config from '../../config';
import { ERROR_MESSAGES } from '../../constants';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    try {
      await dbConnect();

      const { strategyId, email } = req.body;

      // Update strategy in database
      let strategy = await Strategy.findById(strategyId);
      if (!strategy) {
        return res.status(404).json({ success: false, error: ERROR_MESSAGES.STRATEGY_NOT_FOUND });
      }

      strategy.email = email;
      strategy = await strategy.save();

      // Initialize Mailerlite client
      const mailerlite = new MailerLite({
        api_key: process.env.MAILERLITE_API_KEY
      });

      // Subscribe to Mailerlite
      const params = {
        email: email,
        groups: [config.mailerlite.groupId],
        status: 'active'
      };

      await mailerlite.subscribers.createOrUpdate(params);

      res.status(200).json({ success: true, message: 'Email subscribed successfully' });
    } catch (error) {
      console.error('Error in subscribe-email:', error);
      res.status(500).json({ success: false, error: ERROR_MESSAGES.EMAIL_SUBSCRIPTION_FAILED });
    }
  } else {
    res.status(405).json({ success: false, error: ERROR_MESSAGES.METHOD_NOT_ALLOWED });
  }
}