import { createBrowserRouter } from "react-router";
import Home from "./pages/Home";
import MissionDetail from "./pages/MissionDetail";
import Guestbook from "./pages/Guestbook";
import BgmRequest from "./pages/BgmRequest";
import Tickets from "./pages/Tickets";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Home,
  },
  {
    path: "/mission/:id",
    Component: MissionDetail,
  },
  {
    path: "/guestbook",
    Component: Guestbook,
  },
  {
    path: "/bgm",
    Component: BgmRequest,
  },
  {
    path: "/tickets",
    Component: Tickets,
  },
]);
