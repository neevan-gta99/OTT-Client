import './App.css'
import './custom.css'
import AppRoutes from './Routes'
import SessionProtectedRoute from './SessionProtectedRoute';

function App() {
  return ( 
    <SessionProtectedRoute> 
      <AppRoutes /> 
    </SessionProtectedRoute> 
  );
}

export default App;