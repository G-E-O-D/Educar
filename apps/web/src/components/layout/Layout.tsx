import { Outlet, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { Header } from './Header';
import { Footer } from './Footer';

export function Layout() {
  const { pathname } = useLocation();

  // Scroll to top on route change and move focus to main
  useEffect(() => {
    window.scrollTo(0, 0);
    document.getElementById('main-content')?.focus({ preventScroll: true });
  }, [pathname]);

  return (
    <div className="min-h-screen flex flex-col bg-surface-bg">
      <a href="#main-content" className="skip-link">
        Saltar al contenido principal
      </a>
      <Header />
      <main id="main-content" className="flex-1 outline-none" tabIndex={-1}>
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
