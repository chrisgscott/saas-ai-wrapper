import { useState, useEffect } from 'react';

export default function PotentialPartners({ strategyId }) {
  const [potentialPartners, setPotentialPartners] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPotentialPartners = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/gtm/potential-partners?strategyId=${strategyId}`);
        if (!response.ok) {
          throw new Error('Failed to fetch potential partners');
        }
        const data = await response.json();
        setPotentialPartners(data.potentialPartners);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchPotentialPartners();
  }, [strategyId]);

  if (loading) return <div>Loading potential partners...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!potentialPartners || potentialPartners.length === 0) return <div>No potential partners available.</div>;

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Potential Partners</h2>
      {potentialPartners.map((partner, index) => (
        <div key={index} className="mb-4">
          <h3 className="text-xl font-semibold mb-2">{partner.name}</h3>
          <p>{partner.explanation}</p>
        </div>
      ))}
    </div>
  );
}