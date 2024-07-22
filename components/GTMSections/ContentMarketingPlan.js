import { useState, useEffect } from 'react';

export default function ContentMarketingPlan({ strategyId }) {
  const [contentMarketingPlan, setContentMarketingPlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchContentMarketingPlan = async () => {
      try {
        setLoading(true);
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
  if (!contentMarketingPlan || contentMarketingPlan.length === 0) return <div>No content marketing plan available.</div>;

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Content Marketing Plan</h2>
      {contentMarketingPlan.map((item, index) => (
        <div key={index} className="mb-4">
          <h3 className="text-xl font-semibold mb-2">{item.contentType}</h3>
          <p><strong>Target Audience:</strong> {item.targetAudience}</p>
          <p><strong>Expected Outcome:</strong> {item.expectedOutcome}</p>
        </div>
      ))}
    </div>
  );
}