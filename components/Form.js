import { useState } from 'react';
import { useRouter } from 'next/router';

export default function Form() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    industry: '',
    ideaDescription: '',
    targetMarket: '',
    problemDescription: '',
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/submit-form', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await response.json();
      if (data.success) {
        router.push(`/results/${data.strategyId}`);
      } else {
        console.error('Error submitting form:', data.error);
      }
    } catch (error) {
      console.error('Error submitting form:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-lg mx-auto">
      <div className="mb-4">
        <label htmlFor="industry" className="block text-gray-700 font-bold mb-2">
          Industry
        </label>
        <input
          type="text"
          id="industry"
          name="industry"
          value={formData.industry}
          onChange={handleChange}
          required
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      <div className="mb-4">
        <label htmlFor="ideaDescription" className="block text-gray-700 font-bold mb-2">
          SaaS Idea Description
        </label>
        <textarea
          id="ideaDescription"
          name="ideaDescription"
          value={formData.ideaDescription}
          onChange={handleChange}
          required
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          rows="3"
        ></textarea>
      </div>
      <div className="mb-4">
        <label htmlFor="targetMarket" className="block text-gray-700 font-bold mb-2">
          Target Market
        </label>
        <input
          type="text"
          id="targetMarket"
          name="targetMarket"
          value={formData.targetMarket}
          onChange={handleChange}
          required
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      <div className="mb-4">
        <label htmlFor="problemDescription" className="block text-gray-700 font-bold mb-2">
          Problem Description
        </label>
        <textarea
          id="problemDescription"
          name="problemDescription"
          value={formData.problemDescription}
          onChange={handleChange}
          required
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          rows="3"
        ></textarea>
      </div>
      <button
        type="submit"
        className="w-full bg-blue-500 text-white font-bold py-2 px-4 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
      >
        Generate Strategy
      </button>
    </form>
  );
}