import { useState, useEffect } from 'react';

export default function PostLaunchStrategies({ strategyId }) {
  const [postLaunchStrategies, setPostLaunchStrategies] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPostLaunchStrategies = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/gtm/post-launch-strategies?strategyId=${strategyId}`);
        if (!response.ok) {
          throw new Error('Failed to fetch post-launch strategies');
        }
        const data = await response.json();
        setPostLaunchStrategies(data.postLaunchStrategies);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchPostLaunchStrategies();
  }, [strategyId]);

  if (loading) return <div>Loading post-launch strategies...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!postLaunchStrategies || postLaunchStrategies.length === 0) return <div>No post-launch strategies available.</div>;

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Post-Launch Strategies</h2>
      {postLaunchStrategies.map((strategy, index) => (
        <div key={index} className="mb-4">
          <h3 className="text-xl font-semibold mb-2">{strategy.strategy}</h3>
          <p>{strategy.explanation}</p>
        </div>
      ))}
    </div>
  );
}