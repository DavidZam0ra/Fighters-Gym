// Datos reales de Fighters Gym (verificados con Rafa) — ver memoria de proyecto
// "fighters-gym-overview" y "fighters-gym-precios".
export const CONTACTO = {
  direccion: "Carrer Comtes de Parcent 19, 46132 Almàssera (Valencia)",
  telefono: "667 09 55 99",
  telefonoInternacional: "34667095599",
  email: "fightersgym.vlc@gmail.com",
  instagram: "https://www.instagram.com/fightersgymclub/",
  facebook: "https://www.facebook.com/fightersgymclub/",
  tiktok: "https://www.tiktok.com/@fightersgymclub",
  tienda: "https://fightersgym.myspreadshop.es",
  // Coordenadas reales de la ficha de Google Maps del gimnasio (confirmadas
  // por el enlace que compartió Rafa), no las del centro del mapa al hacer
  // zoom — esas se mueven según el nivel de zoom, el pin no.
  googleMapsUrl:
    "https://www.google.com/maps/place/FIGHTERS+GYM+(Club+de+Boxeo+y+Lucha)/@39.5104471,-0.3599846,838m/data=!3m2!1e3!4b1!4m6!3m5!1s0xd6047dd99a9011d:0x4cd8cf4599cfcdf6!8m2!3d39.510443!4d-0.3574097!16s%2Fg%2F11m_j9ptmr",
  googleMapsEmbedSrc: "https://www.google.com/maps?q=39.510443,-0.3574097&z=17&output=embed",
};

export const WHATSAPP_CTA = `https://wa.me/${CONTACTO.telefonoInternacional}?text=${encodeURIComponent(
  "Hola, me gustaría probar una clase en Fighters Gym"
)}`;

export const DISCIPLINAS = [
  {
    nombre: "Boxeo",
    descripcion: "La base de la casa: técnica, saco y sparring controlado.",
  },
  {
    nombre: "Kickboxing & Muay Thai",
    descripcion: "Piernas, codos y rodillas — el arte de las ocho extremidades.",
  },
  {
    nombre: "MMA & Grappling",
    descripcion: "Golpeo y suelo combinados, para quien quiere el cuadro completo.",
  },
  {
    nombre: "Jiu-Jitsu",
    descripcion: "Trabajo de guardia, control y sumisión, a tu ritmo de cinturón.",
  },
  {
    nombre: "Krav Maga & Defensa Personal",
    descripcion: "Recursos reales para situaciones reales, con cabeza fría.",
  },
  {
    nombre: "Boxeo & Krav Maga Infantil",
    descripcion: "Iniciación para los más peques, con la misma exigencia técnica y mucha paciencia.",
  },
] as const;

export const TARIFAS_INDIVIDUALES = [
  { nombre: "Boxeo", precio: 50 },
  { nombre: "Kickboxing / Muay Thai", precio: 45 },
  { nombre: "MMA / Grappling", precio: 45 },
  { nombre: "Jiu-Jitsu", precio: 45 },
  { nombre: "Krav Maga / Defensa Personal", precio: 45 },
  { nombre: "Infantil (Boxeo / Krav Maga)", precio: 45 },
] as const;

export const TARIFAS_PLANAS = [
  { nombre: "2 modalidades a elegir", precio: 60 },
  { nombre: "Todas las modalidades", precio: 75 },
  { nombre: "Boxeo Competición", precio: 70, destacado: true },
] as const;
