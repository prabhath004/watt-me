/**
 * User Dashboard - Redirects to live dashboard
 */

import { Navigate } from "react-router-dom";

export default function UserApp() {
  // Redirect to live dashboard
  return <Navigate to="/app/live" replace />;
}
