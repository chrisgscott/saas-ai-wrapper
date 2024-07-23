import { useState, useEffect } from 'react';

export default function IdealClient({ strategyId }) {
  const [idealClient, setIdealClient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchIdealClient = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/gtm/ideal-client?strategyId=${strategyId}`);
        if (!response.ok) {
          throw new Error('Failed to fetch ideal client data');
        }
        const data = await response.json();
        setIdealClient(data.idealClient);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchIdealClient();
  }, [strategyId]);

  if (loading) return <div>Loading ideal client data...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!idealClient || Object.keys(idealClient).length === 0) return <div>No ideal client data available.</div>;

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Ideal Client</h2>
      {idealClient.CustomerPersonas && idealClient.CustomerPersonas.map((persona, index) => (
        <div key={index} className="mb-6">
          <h3 className="text-xl font-semibold mb-2">{persona.Name}</h3>
          {persona.Demographics && (
            <div className="mb-2">
              <h4 className="font-semibold">Demographics:</h4>
              <p>Age: {persona.Demographics.Age}</p>
              <p>Occupation: {persona.Demographics.Occupation}</p>
            </div>
          )}
          {persona.Behaviors && persona.Behaviors.length > 0 && (
            <div className="mb-2">
              <h4 className="font-semibold">Behaviors:</h4>
              <ul className="list-disc pl-6">
                {persona.Behaviors.map((behavior, index) => (
                  <li key={index}>{behavior}</li>
                ))}
              </ul>
            </div>
          )}
          {persona.PainPoints && persona.PainPoints.length > 0 && (
            <div className="mb-2">
              <h4 className="font-semibold">Pain Points:</h4>
              <ul className="list-disc pl-6">
                {persona.PainPoints.map((painPoint, index) => (
                  <li key={index}>{painPoint}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      ))}
      {idealClient.Insights && idealClient.Insights.length > 0 && (
        <div>
          <h3 className="text-xl font-semibold mb-2">Insights</h3>
          <ul className="list-disc pl-6">
            {idealClient.Insights.map((insight, index) => (
              <li key={index}>{insight}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}