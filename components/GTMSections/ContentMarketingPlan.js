import { useState, useEffect } from 'react';

export default function ContentMarketingPlan({ strategyId }) {
  const [contentMarketingPlan, setContentMarketingPlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchContentMarketingPlan = async () => {
      try {
        const response = await fetch(`/api/gtm/content-marketing-plan?strategyId=${strategyId}`);
        if (!response.ok) {
          throw new Error('Failed to fetch content marketing plan');
        }
        const data = await response.json();
        setContentMarketingPlan(data.contentMarketingPlan);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchContentMarketingPlan();
  }, [strategyId]);

  if (loading) return <div>Loading content marketing plan...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!contentMarketingPlan) return <div>No content marketing plan available.</div>;

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Content Marketing Plan</h2>
      <ul className="list-disc pl-6">
        {contentMarketingPlan.map((item, index) => (
          <li key={index} className="mb-2">{item}</li>
        ))}
      </ul>
    </div>
  );
}