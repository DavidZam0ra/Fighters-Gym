-- CreateEnum
CREATE TYPE "Rol" AS ENUM ('admin', 'profesor');

-- CreateEnum
CREATE TYPE "EstadoAlumno" AS ENUM ('activo', 'dado_de_baja');

-- CreateEnum
CREATE TYPE "Disciplina" AS ENUM ('boxeo', 'kickboxing', 'muay_thai', 'mma', 'jiu_jitsu', 'grappling', 'krav_maga', 'defensa_personal', 'boxeo_infantil', 'krav_maga_infantil', 'competicion');

-- CreateEnum
CREATE TYPE "MetodoPago" AS ENUM ('bizum', 'transferencia', 'efectivo');

-- CreateEnum
CREATE TYPE "EstadoAsistencia" AS ENUM ('asistio', 'justificada', 'sin_avisar');

-- CreateEnum
CREATE TYPE "DiaSemana" AS ENUM ('lunes', 'martes', 'miercoles', 'jueves', 'viernes');

-- CreateTable
CREATE TABLE "usuarios" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "rol" "Rol" NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "usuarios_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "alumnos" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "apellidos" TEXT NOT NULL,
    "telefono" TEXT NOT NULL,
    "email" TEXT,
    "dni_nie" TEXT NOT NULL,
    "fecha_nacimiento" DATE NOT NULL,
    "fecha_alta" DATE NOT NULL,
    "estado" "EstadoAlumno" NOT NULL,
    "cuota_mensual" DECIMAL(10,2) NOT NULL,
    "avatar_seed" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "alumnos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "alumno_disciplinas" (
    "alumno_id" TEXT NOT NULL,
    "disciplina" "Disciplina" NOT NULL,

    CONSTRAINT "alumno_disciplinas_pkey" PRIMARY KEY ("alumno_id","disciplina")
);

-- CreateTable
CREATE TABLE "cuotas" (
    "id" TEXT NOT NULL,
    "alumno_id" TEXT NOT NULL,
    "periodo" DATE NOT NULL,
    "importe" DECIMAL(10,2) NOT NULL,
    "metodo" "MetodoPago",
    "fecha_pago" TIMESTAMP(3),
    "confirmado_por" TEXT,

    CONSTRAINT "cuotas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "asistencias" (
    "id" TEXT NOT NULL,
    "alumno_id" TEXT NOT NULL,
    "fecha" DATE NOT NULL,
    "estado" "EstadoAsistencia" NOT NULL,

    CONSTRAINT "asistencias_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "clases" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "disciplina" "Disciplina" NOT NULL,
    "dia_semana" "DiaSemana" NOT NULL,
    "hora_inicio" TEXT NOT NULL,
    "hora_fin" TEXT NOT NULL,
    "es_infantil" BOOLEAN NOT NULL,
    "es_sparring" BOOLEAN NOT NULL,

    CONSTRAINT "clases_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "configuracion_gimnasio" (
    "id" INTEGER NOT NULL DEFAULT 1,
    "nombre" TEXT NOT NULL,
    "direccion" TEXT NOT NULL,
    "telefono" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "escaneo_fichas_activo" BOOLEAN NOT NULL,
    "notificaciones_whatsapp_activo" BOOLEAN NOT NULL,

    CONSTRAINT "configuracion_gimnasio_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "usuarios_email_key" ON "usuarios"("email");

-- CreateIndex
CREATE UNIQUE INDEX "cuotas_alumno_id_periodo_key" ON "cuotas"("alumno_id", "periodo");

-- CreateIndex
CREATE UNIQUE INDEX "asistencias_alumno_id_fecha_key" ON "asistencias"("alumno_id", "fecha");

-- AddForeignKey
ALTER TABLE "alumno_disciplinas" ADD CONSTRAINT "alumno_disciplinas_alumno_id_fkey" FOREIGN KEY ("alumno_id") REFERENCES "alumnos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cuotas" ADD CONSTRAINT "cuotas_alumno_id_fkey" FOREIGN KEY ("alumno_id") REFERENCES "alumnos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cuotas" ADD CONSTRAINT "cuotas_confirmado_por_fkey" FOREIGN KEY ("confirmado_por") REFERENCES "usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "asistencias" ADD CONSTRAINT "asistencias_alumno_id_fkey" FOREIGN KEY ("alumno_id") REFERENCES "alumnos"("id") ON DELETE CASCADE ON UPDATE CASCADE;
