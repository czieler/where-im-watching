import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from './assets/vite.svg'
import heroImg from './assets/hero.png'
import './App.css'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
    <div className="min-h-screen bg-slate-950 text-white">
      <section id="center">
        <div>
          <h1>Where I'm Watching</h1>
          <p>
            Track shows & movies across your streaming services.
          </p>
        </div>
      </section>
    </div>
      {/* 
      <section id="section-placeholder">
        <div id="div-placeholder">
          
        </div>
        
      </section>
      
      <section id="spacer"></section>
      */}
    </>
  )
}

export default App
