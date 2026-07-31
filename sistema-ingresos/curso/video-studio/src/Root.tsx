import { Composition } from "remotion";
import { ClaseBienvenida, TOTAL_FRAMES, FPS } from "./ClaseBienvenida";
import { ClaseTransformacion, TOTAL_FRAMES_T } from "./ClaseTransformacion";
import { DemoDinamismo, DEMO_FRAMES } from "./DemoDinamismo";
import { ClaseAprovechar, TOTAL_FRAMES_A } from "./ClaseAprovechar";
import { ClaseFundamentos1, TOTAL_FRAMES_F1 } from "./ClaseFundamentos1";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition id="DemoDinamismo" component={DemoDinamismo} durationInFrames={DEMO_FRAMES} fps={FPS} width={1920} height={1080} />
      <Composition id="ClaseAprovechar" component={ClaseAprovechar} durationInFrames={TOTAL_FRAMES_A} fps={FPS} width={1920} height={1080} />
      <Composition id="ClaseFundamentos1" component={ClaseFundamentos1} durationInFrames={TOTAL_FRAMES_F1} fps={FPS} width={1920} height={1080} />
      <Composition
        id="ClaseBienvenida"
        component={ClaseBienvenida}
        durationInFrames={TOTAL_FRAMES}
        fps={FPS}
        width={1920}
        height={1080}
      />
      <Composition
        id="ClaseTransformacion"
        component={ClaseTransformacion}
        durationInFrames={TOTAL_FRAMES_T}
        fps={FPS}
        width={1920}
        height={1080}
      />
    </>
  );
};
