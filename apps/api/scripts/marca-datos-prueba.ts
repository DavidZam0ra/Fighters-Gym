// Constante compartida sin efectos secundarios — separada a propósito de
// seed-carga.ts, que SÍ ejecuta su main() al cargarse. Importar la marca
// directamente de seed-carga.ts (como se hacía antes) dispara esa siembra
// sin querer con solo importar la constante.
export const MARCA_DATOS_PRUEBA = "[DATOS DE PRUEBA — seed-carga.ts, borrar con seed:carga:limpiar]";
