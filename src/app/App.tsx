import { Component, Suspense, lazy, type ReactNode } from "react";
import { createHashRouter, RouterProvider } from "react-router-dom";
import { Shell } from "./Shell";
const Dashboard = lazy(() =>
  import("../features/dashboard/Dashboard").then((m) => ({
    default: m.Dashboard,
  })),
);
const Catalog = lazy(() =>
  import("../features/catalog/Catalog").then((m) => ({ default: m.Catalog })),
);
const CaseDetails = lazy(() =>
  import("../features/catalog/Catalog").then((m) => ({
    default: m.CaseDetails,
  })),
);
const Methods = lazy(() =>
  import("../features/catalog/Catalog").then((m) => ({ default: m.Methods })),
);
const SourcePage = lazy(() =>
  import("../features/catalog/Catalog").then((m) => ({
    default: m.SourcePage,
  })),
);
const Session = lazy(() =>
  import("../features/session/Session").then((m) => ({ default: m.Session })),
);
const Progress = lazy(() =>
  import("../features/progress/Progress").then((m) => ({
    default: m.Progress,
  })),
);
const Results = lazy(() =>
  import("../features/progress/Progress").then((m) => ({ default: m.Results })),
);
const ReviewShell = lazy(() =>
  import("../features/review/ReviewWorkspace").then((m) => ({
    default: m.ReviewShell,
  })),
);
const ReviewList = lazy(() =>
  import("../features/review/ReviewWorkspace").then((m) => ({
    default: m.ReviewList,
  })),
);
const ReviewCaseRoute = lazy(() =>
  import("../features/review/ReviewWorkspace").then((m) => ({
    default: m.ReviewCaseRoute,
  })),
);
const Games = lazy(() =>
  import("../features/games/Games").then((m) => ({ default: m.Games })),
);
const FizyoTabu = lazy(() =>
  import("../features/games/Games").then((m) => ({ default: m.FizyoTabu })),
);
class ErrorBoundary extends Component<
  { children: ReactNode },
  { error: boolean }
> {
  state = { error: false };
  static getDerivedStateFromError() {
    return { error: true };
  }
  render() {
    return this.state.error ? (
      <div className="startup-error">
        <h1>Bu ekran yüklenemedi.</h1>
        <p>İlerleme kaydını silmeden sayfayı yeniden yükleyebilirsin.</p>
        <button onClick={() => location.reload()}>Sayfayı yenile</button>
      </div>
    ) : (
      this.props.children
    );
  }
}
function RouteErrorView() {
  return (
    <div className="startup-error">
      <h1>Bu ekran açılamadı.</h1>
      <p>
        Tarayıcı kayıtlarını silmeden yeniden yüklemeyi deneyebilirsin. İnceleme
        yedeğini varsa sakla.
      </p>
      <button onClick={() => location.reload()}>Yeniden yükle</button>
    </div>
  );
}
const router = createHashRouter([
  {
    element: <Shell />,
    errorElement: <RouteErrorView />,
    children: [
      { index: true, element: <Dashboard /> },
      { path: "cases", element: <Catalog /> },
      { path: "cases/:id", element: <CaseDetails /> },
      { path: "methods", element: <Methods /> },
      { path: "play", element: <Session /> },
      { path: "results", element: <Results /> },
      { path: "progress", element: <Progress /> },
      { path: "sources", element: <SourcePage /> },
      { path: "games", element: <Games /> },
      { path: "games/fizyotabu", element: <FizyoTabu /> },
      { path: "*", element: <Dashboard /> },
    ],
  },
  {
    path: "review",
    element: <ReviewShell />,
    errorElement: <RouteErrorView />,
    children: [
      { index: true, element: <ReviewList /> },
      { path: ":id", element: <ReviewCaseRoute /> },
    ],
  },
]);
export function App() {
  return (
    <ErrorBoundary>
      <Suspense
        fallback={
          <div className="loading-screen" role="status">
            <span />
            <strong>Çalışma alanın hazırlanıyor…</strong>
          </div>
        }
      >
        <RouterProvider router={router} />
      </Suspense>
    </ErrorBoundary>
  );
}
