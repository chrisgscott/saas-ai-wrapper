export default function Results({ strategy }) {
  if (!strategy) {
    return <div>No strategy data available.</div>;
  }

  const renderList = (items) => {
    if (Array.isArray(items)) {
      return (
        <ul className="list-disc pl-6">
          {items.map((item, index) => (
            <li key={index} className="mb-1">{item}</li>
          ))}
        </ul>
      );
    } else if (typeof items === 'string') {
      return <p>{items}</p>;
    } else if (typeof items === 'object') {
      return (
        <ul className="list-disc pl-6">
          {Object.entries(items).map(([key, value], index) => (
            <li key={index} className="mb-1">
              <strong>{key}:</strong> {value}
            </li>
          ))}
        </ul>
      );
    }
    return null;
  };

  const renderSection = (title, content) => {
    if (!content) return null;
    return (
      <>
        <h2 className="text-2xl font-bold mb-4">{title}</h2>
        <div className="mb-8">
          {renderList(content)}
        </div>
      </>
    );
  };

  return (
    <div className="max-w-4xl mx-auto">
      {strategy.MVPFeatures && (
        <>
          <h2 className="text-2xl font-bold mb-4">MVP Features</h2>
          <div className="mb-8">
            {strategy.MVPFeatures.CoreFeatures && (
              <>
                <h3 className="text-xl font-semibold mb-2">Core Features</h3>
                {renderList(strategy.MVPFeatures.CoreFeatures)}
              </>
            )}
            {strategy.MVPFeatures.UserFeedbackTools && (
              <>
                <h3 className="text-xl font-semibold mt-4 mb-2">User Feedback Tools</h3>
                {renderList(strategy.MVPFeatures.UserFeedbackTools)}
              </>
            )}
          </div>
        </>
      )}

      {strategy.IdealClient && (
        <>
          <h2 className="text-2xl font-bold mb-4">Ideal Client</h2>
          <div className="mb-8">
            {strategy.IdealClient.CustomerPersonas && strategy.IdealClient.CustomerPersonas.map((persona, index) => (
              <div key={index} className="mb-4">
                <h3 className="text-xl font-semibold mb-2">{persona.Name}</h3>
                {persona.Demographics && renderList(persona.Demographics)}
                {persona.Behaviors && (
                  <>
                    <h4 className="font-semibold mt-2 mb-1">Behaviors</h4>
                    {renderList(persona.Behaviors)}
                  </>
                )}
                {persona.PainPoints && (
                  <>
                    <h4 className="font-semibold mt-2 mb-1">Pain Points</h4>
                    {renderList(persona.PainPoints)}
                  </>
                )}
              </div>
            ))}
            {strategy.IdealClient.Insights && (
              <>
                <h3 className="text-xl font-semibold mt-4 mb-2">Insights</h3>
                {renderList(strategy.IdealClient.Insights)}
              </>
            )}
          </div>
        </>
      )}

      {renderSection("Positioning Statements", strategy.PositioningStatements)}
      {renderSection("Potential Partners", strategy.PotentialPartners)}
      {renderSection("Tools for Building MVP", strategy.ToolsForBuildingMVP)}
      {renderSection("Launch Strategies", strategy.LaunchStrategies)}
      {renderSection("Content Marketing Plan", strategy.ContentMarketingPlan)}
      {renderSection("Post-Launch Strategies", strategy.PostLaunchStrategies)}
    </div>
  );
}