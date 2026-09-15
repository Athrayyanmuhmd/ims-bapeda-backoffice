"use client";

import { useAuth } from "@/stores/auth";
import AttendanceSummary from "./partials/attendance-summary";
import CtaBanner from "./partials/cta-banner";
import EndingSoon from "./partials/ending-soon";
import MiniStats from "./partials/mini-stats";
import TodayHighlight from "./partials/today-highlight";
import TableAttendance from "./table";

export default function Container() {
  const { user } = useAuth();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <p className="text-muted-foreground text-sm">
          Selamat datang kembali, <span className="font-medium">{user?.fullName ?? "User"}</span>
        </p>
        <h1 className="font-display text-2xl font-semibold tracking-tight sm:text-3xl">
          Dashboard
        </h1>
      </div>

      <div className="grid min-w-0 gap-6 lg:grid-cols-3 lg:items-stretch">
        <div className="flex h-full min-w-0 flex-col lg:col-span-2">
          <TodayHighlight />
        </div>
        <AttendanceSummary />
      </div>

      <div className="grid min-w-0 gap-6 lg:grid-cols-3 lg:items-stretch">
        <div className="flex h-full min-w-0 flex-col lg:col-span-2">
          <TableAttendance />
        </div>
        <div className="flex h-full flex-col gap-6">
          <MiniStats />
          <EndingSoon />
          <div className="mt-auto">
            <CtaBanner />
          </div>
        </div>
      </div>
    </div>
  );
}
