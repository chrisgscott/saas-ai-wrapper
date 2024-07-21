import { useState, useEffect } from 'react';

export default function PositioningStatements({ strategyId }) {
  const [positioningStatements, setPositioningStatements] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPositioningStatements = async () => {
      try {
        const response = await fetch(`/api/gtm/positioning-statements?strategyId=${strategyId}`);
        if (!response.ok) {
          throw new Error('Failed to fetch positioning statements');
        }
        const data = await response.json();
        setPositioningStatements(data.positioningStatements);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchPositioningStatements();
  }, [strategyId]);

  if (loading) return <div>Loading positioning statements...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!positioningStatements || positioningStatements.length === 0) return <div>No positioning statements available.</div>;

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Positioning Statements</h2>
      <ul className="list-disc pl-6">
        {positioningStatements.map((statement, index) => (
          <li key={index} className="mb-2">{statement}</li>
        ))}
      </ul>
    </div>
  );
}