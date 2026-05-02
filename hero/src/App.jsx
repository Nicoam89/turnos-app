import Navbar from './components/Navbar/Navbar'
import Hero from './components/Hero/Hero'
import Features from './components/Features/Features'
import Pricing from './components/Pricing/Pricing'
import './index.css'

function App() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <Features />
        <Pricing />
      </main>
    </>
  )
}

export default App