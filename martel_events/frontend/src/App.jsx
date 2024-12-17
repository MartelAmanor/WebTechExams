import { 
  RouterProvider, 
  createBrowserRouter,
  createRoutesFromElements,
  Route 
} from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import Events from './pages/Events';
import Calendar from './pages/Calendar';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import CreateEvent from './pages/CreateEvent';

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route element={<Layout />}>
      <Route path="/" element={<Home />} />
      <Route path="events" element={<Events />} />
      <Route path="calendar" element={<Calendar />} />
      <Route path="login" element={<Login />} />
      <Route path="register" element={<Register />} />
      <Route path="dashboard" element={<Dashboard />} />
      <Route path="profile" element={<Profile />} />
      <Route path="create-event" element={<CreateEvent />} />
    </Route>
  )
);

function App() {
  return (
    <RouterProvider 
      router={router} 
      future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true,
        v7_normalizeFormMethod: true,
        v7_partialHydration: true,
        v7_skipActionErrorBoundary: true
      }} 
    />
  );
}

export default App;
