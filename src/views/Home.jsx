import Hero from '../components/Hero';
import Projects from '../components/Projects';

const Home = () => {
  return (
    <main className="pt-20">
      {/* pt-20 để tránh Header xuyên thấu che mất phần trên */}
      <Hero />
      <Projects />
    </main>
  );
};

export default Home;