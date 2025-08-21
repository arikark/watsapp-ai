import { layout, type RouteConfig, route } from '@react-router/dev/routes';

export default [
  layout('layouts/master-layout.tsx', [
    layout('layouts/unauthenticated-layout.tsx', [
      route('/', 'routes/unauthenticated/landing.tsx'),
      route('/auth/:pathname', 'routes/unauthenticated/auth.tsx'),
    ]),
    layout('layouts/authenticated-layout.tsx', [
      route('/home', 'routes/authenticated/home.tsx'),
    ]),
    route('*', 'routes/catchall.tsx'),
  ]),
] satisfies RouteConfig;
