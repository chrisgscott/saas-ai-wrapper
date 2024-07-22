import { useState, useEffect } from 'react';

export default function LaunchStrategies({ strategyId }) {
  const [launchStrategies, setLaunchStrategies] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchLaunchStrategies = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/gtm/launch-strategies?strategyId=${strategyId}`);
        if (!response.ok) {
          throw new Error('Failed to fetch launch strategies');
        }
        const data = await response.json();
        setLaunchStrategies(data.launchStrategies);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchLaunchStrategies();
  }, [strategyId]);

  if (loading) return <div>Loading launch strategies...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!launchStrategies || launchStrategies.length === 0) return <div>No launch strategies available.</div>;

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Launch Strategies</h2>
      {launchStrategies.map((strategy, index) => (
        <div key={index} className="mb-4">
          <h3 className="text-xl font-semibold mb-2">{strategy.strategy}</h3>
          <p>{strategy.explanation}</p>
        </div>
      ))}
    </div>
  );
}