import Image from "next/image";

export default function Illustrations() {
  return (
    <div className="col-span-2 hidden h-full lg:block">
      <div className="bg-primary relative h-full w-full overflow-hidden rounded-2xl">
        <div className="relative flex h-full flex-col justify-between p-10">
          <div className="flex size-11 items-center justify-center rounded-xl bg-white">
            <Image src="/logo.png" alt="Logo" width={240} height={240} className="h-6 w-auto" />
          </div>

          <div className="max-w-md">
            <h2 className="font-display text-primary-foreground text-4xl font-semibold tracking-tight text-balance">
              IMS Bapeda
            </h2>
            <p className="text-primary-foreground/80 mt-3 text-lg font-medium">
              Sistem Absensi Online Magang
            </p>
            <p className="text-primary-foreground/60 mt-2 text-sm leading-relaxed">
              Kelola kehadiran, jurnal kegiatan, dan penilaian peserta magang Bapeda dalam satu
              sistem.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
