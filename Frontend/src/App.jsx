import {
  createBrowserRouter,
  createRoutesFromElements,
  RouterProvider,
  Route,
} from "react-router";
import Layout from "./Layout";
import Home from "./components/Home";
import "./style.css";
import PredictForm, { action as predictAction } from "./components/PredictForm";
import Results from "./components/Results";

export default function App() {
  const router = createBrowserRouter(
    createRoutesFromElements(
      <>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route
            path="/predict"
            action={predictAction}
            element={<PredictForm />}
          />
          <Route path="/results" element={<Results />} />
        </Route>
      </>,
    ),
  );
  return <RouterProvider router={router} />;
}
