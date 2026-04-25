import { createBrowserRouter } from "react-router-dom";
import AppShell from "./AppShell";
import DashboardPage from "../pages/DashboardPage";
import WorkoutPage from "../pages/WorkoutPage";
import DailyMetricsPage from "../pages/DailyMetricsPage";
import WeeklyCheckinPage from "../pages/WeeklyCheckinPage";
import PhotosPage from "../pages/PhotosPage";
import WeeklyExportPage from "../pages/WeeklyExportPage";
import ProgramViewerPage from "../pages/ProgramViewerPage";
import SettingsPage from "../pages/SettingsPage";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <AppShell />,
    children: [
      { index: true, element: <DashboardPage /> },
      { path: "workout", element: <WorkoutPage /> },
      { path: "daily-metrics", element: <DailyMetricsPage /> },
      { path: "weekly-checkin", element: <WeeklyCheckinPage /> },
      { path: "photos", element: <PhotosPage /> },
      { path: "weekly-export", element: <WeeklyExportPage /> },
      { path: "program-viewer", element: <ProgramViewerPage /> },
      { path: "settings", element: <SettingsPage /> },
    ],
  },
]);
