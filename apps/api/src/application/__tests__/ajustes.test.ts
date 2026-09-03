import { describe, it, expect } from "vitest";
import { ObtenerConfiguracionGimnasioUseCase } from "../use-cases/ajustes/ObtenerConfiguracionGimnasioUseCase.js";
import { ActualizarConfiguracionGimnasioUseCase } from "../use-cases/ajustes/ActualizarConfiguracionGimnasioUseCase.js";
import { CambiarPasswordUseCase, PasswordActualIncorrectaError } from "../use-cases/auth/CambiarPasswordUseCase.js";
import { UsuarioNoEncontradoError } from "../use-cases/auth/ObtenerUsuarioActualUseCase.js";
import { Usuario } from "../../domain/usuario/Usuario.js";
import { ConfiguracionGimnasioRepositoryFake, PasswordHasherFake, UsuarioRepositoryFake } from "./fakes.js";

describe("ObtenerConfiguracionGimnasioUseCase / ActualizarConfiguracionGimnasioUseCase", () => {
  it("devuelve la configuración actual", async () => {
    const configuraciones = new ConfiguracionGimnasioRepositoryFake();
    const obtener = new ObtenerConfiguracionGimnasioUseCase(configuraciones);

    const configuracion = await obtener.ejecutar();

    expect(configuracion.nombre).toBe("Fighters Gym");
    expect(configuracion.escaneoFichasActivo).toBe(false);
  });

  it("actualiza los datos del gimnasio y los dos toggles", async () => {
    const configuraciones = new ConfiguracionGimnasioRepositoryFake();
    const actualizar = new ActualizarConfiguracionGimnasioUseCase(configuraciones);

    await actualizar.ejecutar({
      nombre: "Fighters Gym Almàssera",
      direccion: "Nueva dirección 1",
      telefono: "600000000",
      email: "nuevo@fightersgym.vlc",
      escaneoFichasActivo: true,
      notificacionesWhatsappActivo: true,
    });

    const configuracion = await configuraciones.obtener();
    expect(configuracion.nombre).toBe("Fighters Gym Almàssera");
    expect(configuracion.direccion).toBe("Nueva dirección 1");
    expect(configuracion.escaneoFichasActivo).toBe(true);
    expect(configuracion.notificacionesWhatsappActivo).toBe(true);
  });

  it("puede desactivar los toggles tras haberlos activado", async () => {
    const configuraciones = new ConfiguracionGimnasioRepositoryFake();
    const actualizar = new ActualizarConfiguracionGimnasioUseCase(configuraciones);
    const datosBase = {
      nombre: "Fighters Gym",
      direccion: "Dirección",
      telefono: "600000000",
      email: "info@fightersgym.vlc",
    };

    await actualizar.ejecutar({ ...datosBase, escaneoFichasActivo: true, notificacionesWhatsappActivo: true });
    await actualizar.ejecutar({ ...datosBase, escaneoFichasActivo: false, notificacionesWhatsappActivo: false });

    const configuracion = await configuraciones.obtener();
    expect(configuracion.escaneoFichasActivo).toBe(false);
    expect(configuracion.notificacionesWhatsappActivo).toBe(false);
  });
});

describe("CambiarPasswordUseCase", () => {
  async function crearUsuarioDePrueba(hasher: PasswordHasherFake): Promise<Usuario> {
    const passwordHash = await hasher.hash("clave-actual");
    return new Usuario({
      id: "usuario-1",
      nombre: "Rafa Ros",
      email: "rafa@fightersgym.vlc",
      passwordHash,
      rol: "admin",
    });
  }

  it("cambia la contraseña cuando la actual es correcta", async () => {
    const hasher = new PasswordHasherFake();
    const usuario = await crearUsuarioDePrueba(hasher);
    const usuarios = new UsuarioRepositoryFake([usuario]);
    const useCase = new CambiarPasswordUseCase(usuarios, hasher);

    await useCase.ejecutar({
      usuarioId: usuario.id,
      passwordActual: "clave-actual",
      passwordNueva: "clave-nueva-larga",
    });

    const actualizado = await usuarios.buscarPorId(usuario.id);
    expect(await hasher.verificar("clave-nueva-larga", actualizado!.passwordHash)).toBe(true);
    expect(await hasher.verificar("clave-actual", actualizado!.passwordHash)).toBe(false);
  });

  it("rechaza el cambio si la contraseña actual no coincide", async () => {
    const hasher = new PasswordHasherFake();
    const usuario = await crearUsuarioDePrueba(hasher);
    const usuarios = new UsuarioRepositoryFake([usuario]);
    const useCase = new CambiarPasswordUseCase(usuarios, hasher);

    await expect(
      useCase.ejecutar({ usuarioId: usuario.id, passwordActual: "incorrecta", passwordNueva: "clave-nueva-larga" })
    ).rejects.toThrow(PasswordActualIncorrectaError);
  });

  it("lanza UsuarioNoEncontradoError si el id no existe", async () => {
    const hasher = new PasswordHasherFake();
    const useCase = new CambiarPasswordUseCase(new UsuarioRepositoryFake(), hasher);

    await expect(
      useCase.ejecutar({ usuarioId: "no-existe", passwordActual: "x", passwordNueva: "clave-nueva-larga" })
    ).rejects.toThrow(UsuarioNoEncontradoError);
  });
});
