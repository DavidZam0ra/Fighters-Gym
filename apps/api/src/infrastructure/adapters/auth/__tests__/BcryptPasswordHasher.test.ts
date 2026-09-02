import { describe, expect, it } from "vitest";
import { BcryptPasswordHasher } from "../BcryptPasswordHasher.js";

describe("BcryptPasswordHasher", () => {
  it("verifica correctamente una contraseña frente a su propio hash", async () => {
    const hasher = new BcryptPasswordHasher();
    const hash = await hasher.hash("clave-de-rafa-123");

    expect(await hasher.verificar("clave-de-rafa-123", hash)).toBe(true);
    expect(await hasher.verificar("otra-clave", hash)).toBe(false);
  });

  it("genera hashes distintos para la misma contraseña (salt aleatorio)", async () => {
    const hasher = new BcryptPasswordHasher();
    const hashA = await hasher.hash("misma-clave");
    const hashB = await hasher.hash("misma-clave");

    expect(hashA.toString()).not.toBe(hashB.toString());
  });
});
