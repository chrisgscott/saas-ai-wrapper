import { useState } from 'react';

export default function EmailCapture({ onSubmit }) {
  const [email, setEmail] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(email);
  };

  return (
    <div className="my-8 p-6 bg-gray-100 rounded-lg">
      <h2 className="text-2xl font-bold mb-4">Unlock Full Go-to-Market Strategy</h2>
      <p className="mb-4">Enter your email to access the complete strategy.</p>
      <form onSubmit={handleSubmit} className="flex">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter your email"
          required
          className="flex-grow px-4 py-2 rounded-l-md border-t border-b border-l border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
        <button
          type="submit"
          className="px-6 py-2 bg-indigo-500 text-white font-semibold rounded-r-md hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-50"
        >
          Access
        </button>
      </form>
    </div>
  );
}