import { lazy } from 'react';

// Lazy load pages
const Dashboard = lazy(() => import('../pages/Dashboard'));
const Watchlist = lazy(() => import('../pages/Watchlist'));
const Portfolio = lazy(() => import('../pages/Portfolio'));
const EarningsCalendar = lazy(() => import('../pages/Earnings'));
const SignUp = lazy(() => import('../pages/SignUp/index'));
const SignIn = lazy(() => import('../pages/SignIn/index'));
const StockDetail = lazy(() => import('../pages/StockDetail/index')); 
import TradingIntelligence from '../pages/Intelligence';

export interface RouteConfig {
  path: string;
  element: React.LazyExoticComponent<React.FC> | React.FC;
  title: string;
  showInNav?: boolean;
  protected?: boolean;
}

// Public routes
export const publicRoutes: RouteConfig[] = [
  {
    path: '/',
    element: Dashboard,
    title: 'Dashboard',
    showInNav: true,
  },
  {
    path: '/earnings-calendar',
    element: EarningsCalendar,
    title: 'Earnings Calendar',
    showInNav: true,
  },
  {
    path: '/trading-intelligence',
    element: TradingIntelligence,
    title: 'Trading Intelligence',
    showInNav: true,
  },
  {
    path: '/stock/:symbol',  // NEW: Stock Detail Page
    element: StockDetail,
    title: 'Stock Detail',
    showInNav: false,
  },
];

// Protected routes (require authentication)
export const protectedRoutes: RouteConfig[] = [
  {
    path: '/watchlist',
    element: Watchlist,
    title: 'Watchlist',
    showInNav: true,
  },
  {
    path: '/portfolio',
    element: Portfolio,
    title: 'Portfolio',
    showInNav: true,
  },
];

// Auth routes
export const authRoutes: RouteConfig[] = [
  {
    path: '/auth/signup',
    element: SignUp,
    title: 'Sign Up',
    showInNav: false,
  },
  {
    path: '/auth/signin',
    element: SignIn,
    title: 'Sign In',
    showInNav: false,
  },
];

export const getAllRoutes = (): RouteConfig[] => {
  return [...publicRoutes, ...authRoutes, ...protectedRoutes];
};

export const getNavigationRoutes = (): RouteConfig[] => {
  return publicRoutes.filter(route => route.showInNav);
};

export const ROUTES = {
  HOME: '/',
  DASHBOARD: '/',
  WATCHLIST: '/watchlist',
  PORTFOLIO: '/portfolio',
  EARNINGS_CALENDAR: '/earnings-calendar',
  STOCK_DETAIL: '/stock/:symbol',
  STOCK_BY_SYMBOL: (symbol: string) => `/stock/${symbol}`,
  SIGN_UP: '/auth/signup',
  SIGN_IN: '/auth/signin',
  TRADING_INTELLIGENCE: '/trading-intelligence',
} as const;