import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { Layout } from './components/layout/Layout';
import { LayoutApp } from './components/layout/LayoutApp';
import { LandingPage } from './pages/LandingPage';
import { DashboardPage } from './pages/DashboardPage';
import { LibraryPage } from './pages/LibraryPage';
import { ActivitiesPage } from './pages/ActivitiesPage';
import { StudentPage } from './pages/StudentPage';
import { TrackingPage } from './pages/TrackingPage';
import { ComponentsPage } from './pages/ComponentsPage';
import { NotFoundPage } from './pages/NotFoundPage';

const router = createBrowserRouter([
  {
    element: <Layout />,
    children: [
      { path: '/', element: <LandingPage /> },
      { path: '/alumno', element: <StudentPage /> },
      { path: '/demo', element: <ComponentsPage /> },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
  {
    element: <LayoutApp />,
    children: [
      { path: '/panel', element: <DashboardPage /> },
      { path: '/biblioteca', element: <LibraryPage /> },
      { path: '/actividades', element: <ActivitiesPage /> },
      { path: '/seguimiento', element: <TrackingPage /> },
    ],
  },
]);

export function App() {
  return <RouterProvider router={router} />;
}
