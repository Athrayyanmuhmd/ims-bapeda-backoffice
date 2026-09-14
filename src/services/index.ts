import * as absensiService from "./absensi";
import * as authService from "./auth";
import * as divisiService from "./divisi";
import * as dokumenService from "./dokumen";
import * as instansiService from "./instansi";
import * as logbookService from "./logbook";
import * as notificationsService from "./notifications";
import * as penilaianService from "./penilaian";
import * as pesertaMagangService from "./peserta-magang";
import * as portalService from "./portal";
import * as roleService from "./role";
import * as userService from "./user";

export const services = {
  auth: authService,
  user: userService,
  divisi: divisiService,
  role: roleService,
  pesertaMagang: pesertaMagangService,
  absensi: absensiService,
  instansi: instansiService,
  logbook: logbookService,
  penilaian: penilaianService,
  dokumen: dokumenService,
  portal: portalService,
  notifications: notificationsService,
};
