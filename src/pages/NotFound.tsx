import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const NotFound: React.FC = () => {
  const { pathname } = useLocation();
  const isPortfolio = pathname.startsWith('/portfolio');

  return (
    <div className="min-h-screen bg-[#070a13] flex items-center justify-center px-6">
      <div className="text-center max-w-lg">
        <div className="text-6xl font-black gradient-text mb-4">404</div>
        <h1 className="text-3xl font-bold text-white mb-3">Page Not Found</h1>
        <p className="text-slate-400 mb-8 leading-relaxed">
          The page <span className="font-mono text-slate-500 break-all">{pathname}</span>{' '}
          doesn't exist or has moved.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link to="/haritech" className="btn-primary px-8 py-3">
            {isPortfolio ? 'Haritech Home' : 'Go to Home'}
          </Link>
          <Link to="/portfolio" className="btn-secondary px-8 py-3">
            Visit Portfolio
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
