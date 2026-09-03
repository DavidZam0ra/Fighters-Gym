export interface ClaseFranja {
  nombre: string;
  sparring?: boolean;
}

export interface FranjaHoraria {
  hora: string;
  dias: [ClaseFranja[], ClaseFranja[], ClaseFranja[], ClaseFranja[], ClaseFranja[]];
}

export const DIAS_SEMANA = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes"] as const;

const boxeo = (sparring = false): ClaseFranja[] => [{ nombre: "Boxeo", sparring }];
const libre = (): ClaseFranja[] => [];

// Horario real del gimnasio (mismo origen que design/Main.dc.html y el
// Calendario del panel — de las fotos de los flyers de Rafa).
export const HORARIO: FranjaHoraria[] = [
  { hora: "11:15 – 12:15", dias: [boxeo(), boxeo(), boxeo(), boxeo(), boxeo(true)] },
  { hora: "12:15 – 13:15", dias: [libre(), libre(), libre(), libre(), libre()] },
  { hora: "16:00 – 17:00", dias: [libre(), libre(), libre(), libre(), libre()] },
  { hora: "17:00 – 18:00", dias: [boxeo(), boxeo(), boxeo(), boxeo(), boxeo(true)] },
  {
    hora: "18:00 – 19:00",
    dias: [
      [{ nombre: "Boxeo infantil" }, { nombre: "Kickboxing / Muay Thai" }],
      [{ nombre: "Krav Maga infantil" }, { nombre: "Krav Maga" }],
      [{ nombre: "Boxeo infantil" }, { nombre: "Kickboxing / Muay Thai" }],
      [{ nombre: "Krav Maga infantil" }, { nombre: "Krav Maga" }],
      [{ nombre: "Boxeo infantil" }, { nombre: "Kickboxing / Muay Thai", sparring: true }],
    ],
  },
  {
    hora: "19:00 – 20:00",
    dias: [
      [{ nombre: "MMA / Grappling" }],
      [{ nombre: "Jiu-Jitsu" }],
      [{ nombre: "MMA / Grappling" }],
      [{ nombre: "Jiu-Jitsu" }],
      [
        { nombre: "MMA / Grappling", sparring: true },
        { nombre: "Jiu-Jitsu", sparring: true },
      ],
    ],
  },
  { hora: "20:00 – 21:00", dias: [boxeo(), boxeo(), boxeo(), boxeo(), boxeo(true)] },
];
