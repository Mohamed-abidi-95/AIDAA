// ============================================================================
// MAIN APP COMPONENT
// ============================================================================
// Main application component with React Router configuration
// Defines all routes and route protection logic

import { BrowserRouter } from 'react-router-dom';
import { AppRoutes } from './routes/routes-config';
import { AuthProvider } from './features/auth/context/AuthContext';

// ============================================================================
// APP COMPONENT
// ============================================================================
// Main application with all routes configured
export const App = (): JSX.Element => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;