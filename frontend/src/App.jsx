import React from 'react';
import AppRoutes from './routes/AppRoutes';
import { AuthProvider } from './context/AuthContext';
import { CallProvider } from './context/CallContext';

import './index.css';

function App() {
  return (
    <AuthProvider>
      <CallProvider>
        <AppRoutes />     {/* 📄 your pages */}
      </CallProvider>
    </AuthProvider>
  );
}

export default App;
