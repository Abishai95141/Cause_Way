import { createBrowserRouter, RouterProvider, Navigate } from "react-router-dom";
import { AppLayout } from "@/components/layout/app-layout";
import { DashboardPage } from "@/pages/dashboard";
import { DocumentsPage } from "@/pages/documents";
import { WorldModelBuilderPage } from "@/pages/world-model-builder";
import { ModelExplorerPage } from "@/pages/model-explorer";
import { DecisionSupportPage } from "@/pages/decision-support";
import { ApprovalReviewPage } from "@/pages/approval-review";
import { SettingsPage } from "@/pages/settings";

const router = createBrowserRouter([
  {
    path: "/",
    element: <AppLayout />,
    children: [
      { index: true, element: <DashboardPage /> },
      { path: "documents", element: <DocumentsPage /> },
      { path: "builder", element: <WorldModelBuilderPage /> },
      { path: "explorer", element: <ModelExplorerPage /> },
      { path: "decisions", element: <DecisionSupportPage /> },
      { path: "approval", element: <ApprovalReviewPage /> },
      { path: "settings", element: <SettingsPage /> },
    ],
  },
  { path: "*", element: <Navigate to="/" replace /> },
], { basename: "/app" });

export function Router() {
  return <RouterProvider router={router} />;
}
