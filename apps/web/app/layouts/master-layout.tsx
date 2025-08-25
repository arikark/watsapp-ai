import { Outlet } from 'react-router';
import type { Route } from '../+types/root';
// export function ErrorBoundary({ error }: { error: Error }) {
//   return (
//     <div className="flex h-screen w-screen items-center justify-center">
//       <div className="flex flex-col items-center justify-center">
//         <div className="text-2xl font-bold">Uh oh! Something went wrong.</div>
//         <div className="text-sm text-gray-500">
//           Send through an email to{' '}
//           <a
//             href={`mailto:theintroapp101@gmail.com?subject=Error%20in%20theintroapp%20app&body=${encodeURIComponent(
//               `Error: ${error.message}\n\nStack: ${error.stack}`
//             )}`}
//             className="text-blue-500"
//             target="_blank"
//             rel="noopener noreferrer"
//           >
//             theintroapp101@gmail.com
//           </a>
//         </div>
//         <div className="text-sm text-gray-500 mt-6">
//           <pre>{error.message}</pre>
//         </div>
//       </div>
//     </div>
//   );
// }

// export async function loader({ context, request }: Route.LoaderArgs) {
//   // Master layout doesn't need to handle auth redirects
//   // Authentication is handled by the specific layout routes
//   return null;
// }

export default function MasterLayout() {
  return <Outlet />;
}
