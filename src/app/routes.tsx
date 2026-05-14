import { createBrowserRouter } from "react-router";
import Home from "./pages/Home";
import MissionDetail from "./pages/MissionDetail";
import Guestbook from "./pages/Guestbook";
import BgmRequest from "./pages/BgmRequest";
import Tickets from "./pages/Tickets";
import Admin from "./pages/Admin";
import AdminBgm from "./pages/AdminBgm";
import Event from "./pages/Event";
import EventDraw from "./pages/EventDraw";
import EventFirstPrize from "./pages/EventFirstPrize";

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
  {
    path: "/admin",
    Component: Admin,
  },
  {
    path: "/admin/bgm",
    Component: AdminBgm,
  },
  {
    path: "/event",
    Component: Event,
  },
  {
    path: "/event/lottery",
    Component: EventDraw,
  },
  {
    path: "/event/first-prize",
    Component: EventFirstPrize,
  },
]);
