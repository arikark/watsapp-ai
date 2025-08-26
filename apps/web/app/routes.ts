import type { RouteConfig } from '@react-router/dev/routes';
import { index, layout, route } from '@react-router/dev/routes';

export default [
  index('routes/landing.tsx'),
  route('api/auth/*', 'routes/auth.ts'),
  layout('routes/authenticated/layout.tsx', [
    route('dashboard', 'routes/authenticated/dashboard.tsx'),
  ]),
] satisfies RouteConfig;
