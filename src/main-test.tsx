// Minimal test to see if React can render anything at all
import React from 'react'
import ReactDOM from 'react-dom/client'

function MinimalApp() {
  return (
    <div style={{
      backgroundColor: 'red',
      color: 'white',
      padding: '50px',
      fontSize: '30px',
      fontWeight: 'bold'
    }}>
      MINIMAL TEST - IF YOU SEE THIS, REACT WORKS!
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<MinimalApp />);
