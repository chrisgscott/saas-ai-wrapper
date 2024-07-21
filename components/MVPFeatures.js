export default function MVPFeatures({ features }) {
    if (!features) {
      return <div>No MVP features available.</div>;
    }
  
    return (
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-4">MVP Features</h2>
        {features.CoreFeatures && (
          <>
            <h3 className="text-xl font-semibold mb-2">Core Features</h3>
            <ul className="list-disc pl-6">
              {features.CoreFeatures.map((feature, index) => (
                <li key={index} className="mb-1">{feature}</li>
              ))}
            </ul>
          </>
        )}
        {features.UserFeedbackTools && (
          <>
            <h3 className="text-xl font-semibold mt-4 mb-2">User Feedback Tools</h3>
            <ul className="list-disc pl-6">
              {features.UserFeedbackTools.map((tool, index) => (
                <li key={index} className="mb-1">{tool}</li>
              ))}
            </ul>
          </>
        )}
      </div>
    );
  }