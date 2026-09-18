import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { AppRoutes } from './routes';

export function App() {
  console.log('✓ App component rendering');
  
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
}

export default App;
