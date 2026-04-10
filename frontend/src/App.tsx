// ============================================================================
// MAIN APP COMPONENT
// ============================================================================
// Main application component with React Router configuration
// Defines all routes and route protection logic

import { BrowserRouter } from 'react-router-dom';
import { AppRoutes } from './routes/routes-config';

// ============================================================================
// APP COMPONENT
// ============================================================================
// Main application with all routes configured
export const App = (): JSX.Element => {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
};

export default App;