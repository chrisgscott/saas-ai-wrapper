import mongoose from 'mongoose';

const StrategySchema = new mongoose.Schema({
  industry: String,
  ideaDescription: String,
  targetMarket: String,
  problemDescription: String,
  email: String,
  strategy: {
    mvpFeatures: {
      coreFeatures: [String],
      userFeedbackTools: [String]
    },
    idealClient: {
      CustomerPersonas: [{
        Name: String,
        Demographics: {
          Age: String,
          Occupation: String
        },
        Behaviors: [String],
        PainPoints: [String]
      }],
      Insights: [String]
    },
    positioningStatements: [String],
    potentialPartners: [{
      name: String,
      explanation: String
    }],
    launchStrategies: [{
      strategy: String,
      explanation: String
    }],
    contentMarketingPlan: [{
      contentType: String,
      targetAudience: String,
      expectedOutcome: String
    }],
    postLaunchStrategies: [{
      strategy: String,
      explanation: String
    }]
  }
}, { timestamps: true });

export default mongoose.models.Strategy || mongoose.model('Strategy', StrategySchema);