import { useState } from 'react';

function App() {
  const [count, setCount] = useState(0);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Creative Match
        </h1>
        <p className="text-lg text-gray-600 mb-8">
          Plateforme de mise en relation créative avec IA
        </p>

        <div className="space-y-4">
          <button
            onClick={() => setCount((count) => count + 1)}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg transition-colors"
          >
            Count: {count}
          </button>

          <div className="text-sm text-gray-500">
            <p>Frontend: React + Vite + TypeScript + Tailwind ✓</p>
            <p>Backend: Node.js + Express + Prisma + PostgreSQL ✓</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
