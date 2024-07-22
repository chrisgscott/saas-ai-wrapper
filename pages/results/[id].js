import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import MVPFeatures from '../../components/MVPFeatures';
import EmailCapture from '../../components/EmailCapture';
import GTMTabs from '../../components/GTMTabs';

export default function ResultsPage() {
  const router = useRouter();
  const { id } = router.query;
  const [strategy, setStrategy] = useState(null);
  const [error, setError] = useState(null);
  const [email, setEmail] = useState(null);

  useEffect(() => {
    if (id) {
      fetch(`/api/strategy/${id}`)
        .then(response => {
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          return response.json();
        })
        .then(data => {
          if (data.success) {
            console.log('Fetched strategy:', data.data);  // Keep this log
            setStrategy(data.data);
          } else {
            throw new Error(data.error || 'Failed to fetch strategy');
          }
        })
        .catch(error => {
          console.error('Error fetching strategy:', error);
          setError(error.message);
        });
    }
  }, [id]);

  if (error) {
    return <div className="container mx-auto px-4 py-8">Error: {error}</div>;
  }

  if (!strategy) {
    return <div className="container mx-auto px-4 py-8">Loading...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8 text-center">Your Go-to-Market Strategy</h1>
      <MVPFeatures features={strategy.strategy?.mvpFeatures} />
      {!email && <EmailCapture onSubmit={setEmail} strategyId={id} />}
      {email && <GTMTabs strategyId={id} />}
    </div>
  );
}