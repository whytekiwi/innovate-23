import React from 'react';
import ReactDOM from 'react-dom/client';
import {createBrowserRouter, RouterProvider} from "react-router-dom";
import Welcome from "./pages/welcome/welcome";
import AttendeesPage from "./pages/attendees/attendeesPage";
import EditAttendeesPage from "./pages/attendees/editAttendeesPage";
import 'bootstrap/dist/css/bootstrap.min.css';
import './index.css';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

const router = createBrowserRouter([
  {
    path: "/",
    element: <Welcome/>
  },
  {
    path: "/attendees",
    element: <AttendeesPage/>
  },
  {
    path: "/attendees/edit",
    element: <EditAttendeesPage/>
  }
]);

root.render(
  <React.StrictMode>
    <RouterProvider router={router}/>
  </React.StrictMode>
);
