import * as absensiService from "./absensi";
import * as authService from "./auth";
import * as divisiService from "./divisi";
import * as dokumenService from "./dokumen";
import * as instansiService from "./instansi";
import * as jurnalService from "./jurnal";
import * as penilaianService from "./penilaian";
import * as pesertaMagangService from "./peserta-magang";
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
  jurnal: jurnalService,
  penilaian: penilaianService,
  dokumen: dokumenService,
};
