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
            setStrategy(data.data);
            if (data.data.email) {
              setEmail(data.data.email);
            }
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

  const handleEmailSubmit = async (submittedEmail) => {
    try {
      const response = await fetch('/api/update-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ strategyId: id, email: submittedEmail }),
      });

      if (!response.ok) {
        throw new Error('Failed to update email');
      }

      setEmail(submittedEmail);
    } catch (error) {
      console.error('Error updating email:', error);
      setError(error.message);
    }
  };

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
      {!email && <EmailCapture onSubmit={handleEmailSubmit} strategyId={id} />}
      {email && <GTMTabs strategyId={id} />}
    </div>
  );
}