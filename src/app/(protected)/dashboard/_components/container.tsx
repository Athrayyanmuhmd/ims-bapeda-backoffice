"use client";

import { PageHeader } from "@/components/page-header";
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
    <div className="flex flex-col gap-5">
      <PageHeader
        eyebrow="Ringkasan"
        title="Dashboard"
        description={`Selamat datang kembali, ${user?.fullName ?? "User"}`}
        icon="material-symbols:dashboard-outline"
      />

      <div className="grid min-w-0 gap-5 lg:grid-cols-3 lg:items-stretch">
        <div className="flex h-full min-w-0 flex-col lg:col-span-2">
          <TodayHighlight />
        </div>
        <AttendanceSummary />
      </div>

      <div className="grid min-w-0 gap-5 lg:grid-cols-3 lg:items-stretch">
        <div className="flex h-full min-w-0 flex-col lg:col-span-2">
          <TableAttendance />
        </div>
        <div className="flex h-full flex-col gap-5">
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
