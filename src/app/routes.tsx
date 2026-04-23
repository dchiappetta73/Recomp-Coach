import { createBrowserRouter } from "react-router-dom";
import AppShell from "./AppShell";
import DashboardPage from "../pages/DashboardPage";
import ProgramPage from "../pages/ProgramPage";
import WorkoutPage from "../pages/WorkoutPage";
import DailyMetricsPage from "../pages/DailyMetricsPage";
import WeeklyCheckinPage from "../pages/WeeklyCheckinPage";
import ProgressHubPage from "../pages/ProgressHubPage";
import AnalysisPage from "../pages/AnalysisPage";
import IntegrationsPage from "../pages/IntegrationsPage";
import SettingsPage from "../pages/SettingsPage";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <AppShell />,
    children: [
      { index: true, element: <DashboardPage /> },
      { path: "program", element: <ProgramPage /> },
      { path: "workout", element: <WorkoutPage /> },
      { path: "daily-metrics", element: <DailyMetricsPage /> },
      { path: "weekly-checkin", element: <WeeklyCheckinPage /> },
      { path: "progress-hub", element: <ProgressHubPage /> },
      { path: "analysis", element: <AnalysisPage /> },
      { path: "integrations", element: <IntegrationsPage /> },
      { path: "settings", element: <SettingsPage /> },
    ],
  },
]);