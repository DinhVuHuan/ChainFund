import React, { useState } from 'react';
import Hero from '../components/Hero';
import Projects from '../components/Projects';
import { useProjectContext } from '../context/ProjectContext';

const Home = () => {
  const [filter, setFilter] = useState('All')
  const { projects } = useProjectContext()

  return (
    <main className="pt-20">
      {/* pt-20 để tránh Header xuyên thấu che mất phần trên */}
      <Hero />

      {/* Quick stats (removed total backers as requested) */}

      {/* Home-level filter bar (mirrors Projects filters) */}
      <div className="flex justify-center gap-4 mb-6 mt-6">
        {["All", "Active", "Expired", "Completed"].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-full font-semibold transition duration-300 ${filter === f ? 'bg-green-600 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-green-100 dark:hover:bg-gray-600 hover:text-green-700'}`}>
            {f}
          </button>
        ))}
      </div>

      <Projects externalFilter={filter} showFilter={false} />
    </main>
  );
};

export default Home;