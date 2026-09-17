import { Routes, Route } from "react-router-dom";

import { AppShell } from "@/components/common/AppShell";
import { Home } from "@/pages/Home";
import { Notifications } from "@/pages/Notifications";
import { Email } from "@/pages/Email";
import { EmailDetail } from "@/pages/EmailDetail";
import { Garmin } from "@/pages/Garmin";
import { Today } from "@/pages/Today";
import { Places } from "@/pages/Places";

export function App() {
  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route index element={<Home />} />
        <Route path="notifications" element={<Notifications />} />
        <Route path="email" element={<Email />} />
        <Route path="email/:id" element={<EmailDetail />} />
        <Route path="garmin" element={<Garmin />} />
        <Route path="today" element={<Today />} />
        <Route path="places" element={<Places />} />
      </Route>
    </Routes>
  );
}
