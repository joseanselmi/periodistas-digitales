import React from "react";
import { MedioAIngresos, FPS_MK, TOTAL_FRAMES_MK } from "./lib/ingresos";

/**
 * Composición suelta del recurso `MedioAIngresos` (catálogo #89e).
 * El recurso vive en lib/ para que cualquier clase pueda usarlo; esto es
 * sólo su versión standalone, para exportar el MP4 de ads y de la landing.
 */
export { FPS_MK, TOTAL_FRAMES_MK };
export const MockupIngresos: React.FC = () => <MedioAIngresos />;
