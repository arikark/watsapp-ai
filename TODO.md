# To-Do List: Authentication & SSR Improvements

## 1. Move BE Auth Client and DB to Shared Package

### 1.1 Create Shared Package Structure
- [ ] Create new package `packages/shared-auth`
- [ ] Set up package.json with necessary dependencies
- [ ] Configure TypeScript configuration
- [ ] Update workspace configuration

### 1.2 Move Authentication Logic
- [ ] Move `better-auth` configuration from backend to shared package
- [ ] Move database connection logic to shared package
- [ ] Create server-side auth client for SSR
- [ ] Create client-side auth client for browser
- [ ] Export auth utilities and types

### 1.3 Update Dependencies
- [ ] Update backend to use shared auth package
- [ ] Update frontend to use shared auth package
- [ ] Remove duplicate auth code from individual apps
- [ ] Update import paths across the project

## 2. Configure Redirects Based on Auth Status

### 2.1 Implement Server-Side Auth Loading
- [ ] Create server-side auth loader utility
- [ ] Implement auth status checking in route loaders
- [ ] Add proper error handling for auth failures

### 2.2 Update Route Protection
- [ ] Update root route to check auth status server-side
- [ ] Implement proper redirects based on auth state
- [ ] Add loading states for auth checks
- [ ] Handle edge cases (expired sessions, etc.)

### 2.3 Route Structure Improvements
- [ ] Review and update route organization
- [ ] Ensure proper auth boundaries
- [ ] Add proper error boundaries for auth failures

## 3. Additional Improvements

### 3.1 Type Safety
- [ ] Ensure proper TypeScript types for auth state
- [ ] Add type guards for auth status checking
- [ ] Improve type safety in loaders and components

### 3.2 Performance
- [ ] Optimize auth checks to minimize server calls
- [ ] Implement proper caching strategies
- [ ] Add loading states for better UX

### 3.3 Security
- [ ] Review auth token handling
- [ ] Ensure proper session management
- [ ] Add security headers where needed

## Implementation Order

1. **Phase 1**: Create shared auth package structure
2. **Phase 2**: Move auth logic to shared package
3. **Phase 3**: Update apps to use shared package
4. **Phase 4**: Implement server-side auth loading
5. **Phase 5**: Configure redirects and route protection
6. **Phase 6**: Testing and optimization

## Notes

- Follow snake_case naming convention for files and directories
- Use functional components exclusively
- Avoid type assertions, use type narrowing functions instead
- Ensure proper error handling throughout the implementation
