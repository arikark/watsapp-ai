import {
  index,
  layout,
  type RouteConfig,
  route,
} from '@react-router/dev/routes';

export default [
  layout('layouts/master-layout.tsx', [
    layout('layouts/authenticated-layout.tsx', [
      index('routes/authenticated/home.tsx'),
    ]),
    layout('layouts/unauthenticated-layout.tsx', [
      index('routes/home.tsx'),
      // index('routes/unauthenticated/landing.tsx'),
      // route('auth/:pathname', 'routes/unauthenticated/auth.tsx'),
    ]),
  ]),
] satisfies RouteConfig;
