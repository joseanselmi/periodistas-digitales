import { Composition } from "remotion";
import { ClaseBienvenida, TOTAL_FRAMES, FPS } from "./ClaseBienvenida";
import { ClaseTransformacion, TOTAL_FRAMES_T } from "./ClaseTransformacion";
import { DemoDinamismo, DEMO_FRAMES } from "./DemoDinamismo";
import { ClaseAprovechar, TOTAL_FRAMES_A } from "./ClaseAprovechar";
import { ClaseFundamentos1, TOTAL_FRAMES_F1 } from "./ClaseFundamentos1";
import { ClaseComunidad, TOTAL_FRAMES_C } from "./ClaseComunidad";
import { ClaseLeadr, TOTAL_FRAMES_L } from "./ClaseLeadr";
import { ClaseLograr, TOTAL_FRAMES_L07 } from "./ClaseLograr";
import { Portada } from "./Portada";
import { DemoEditorial, DEMO_ED_FRAMES } from "./DemoEditorial";
import { ClaseFundamentos2, TOTAL_FRAMES_F2 } from "./ClaseFundamentos2";
import { ClaseFundamentos3, TOTAL_FRAMES_F3 } from "./ClaseFundamentos3";
import { ClaseFundamentos4, TOTAL_FRAMES_F4 } from "./ClaseFundamentos4";
import { ClaseFundamentos5, TOTAL_FRAMES_F5 } from "./ClaseFundamentos5";
import { ClaseFundamentos6, TOTAL_FRAMES_F6 } from "./ClaseFundamentos6";
import { ClaseFundamentos7, TOTAL_FRAMES_F7 } from "./ClaseFundamentos7";
import { ClaseIA1, TOTAL_FRAMES_IA1 } from "./ClaseIA1";
import { ClaseIA2, TOTAL_FRAMES_IA2 } from "./ClaseIA2";
import { ClaseIA3, TOTAL_FRAMES_IA3 } from "./ClaseIA3";
import { ClaseIA4, TOTAL_FRAMES_IA4 } from "./ClaseIA4";
import { ClaseIA5, TOTAL_FRAMES_IA5 } from "./ClaseIA5";
import { ClaseVerif1, TOTAL_FRAMES_V1 } from "./ClaseVerif1";
import { ClaseVerif2, TOTAL_FRAMES_V2 } from "./ClaseVerif2";
import { ClaseVerif3, TOTAL_FRAMES_V3 } from "./ClaseVerif3";
import { ClaseVerif4, TOTAL_FRAMES_V4 } from "./ClaseVerif4";
import { ClaseNicho1, TOTAL_FRAMES_N1 } from "./ClaseNicho1";
import { ClaseNicho2, TOTAL_FRAMES_N2 } from "./ClaseNicho2";
import { ClaseNicho3, TOTAL_FRAMES_N3 } from "./ClaseNicho3";
import { ClaseNicho4, TOTAL_FRAMES_N4 } from "./ClaseNicho4";
import { ClaseNicho5, TOTAL_FRAMES_N5 } from "./ClaseNicho5";
import { ClaseNicho6, TOTAL_FRAMES_N6 } from "./ClaseNicho6";
import { ClaseMarca1, TOTAL_FRAMES_M1 } from "./ClaseMarca1";
import { ClaseMarca2, TOTAL_FRAMES_M2 } from "./ClaseMarca2";
import { ClaseMarca3, TOTAL_FRAMES_M3 } from "./ClaseMarca3";
import { ClaseMarca4, TOTAL_FRAMES_M4 } from "./ClaseMarca4";
import { ClaseMarca5, TOTAL_FRAMES_M5 } from "./ClaseMarca5";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition id="DemoDinamismo" component={DemoDinamismo} durationInFrames={DEMO_FRAMES} fps={FPS} width={1920} height={1080} />
      <Composition id="ClaseAprovechar" component={ClaseAprovechar} durationInFrames={TOTAL_FRAMES_A} fps={FPS} width={1920} height={1080} />
      <Composition id="ClaseFundamentos1" component={ClaseFundamentos1} durationInFrames={TOTAL_FRAMES_F1} fps={FPS} width={1920} height={1080} />
      <Composition id="ClaseComunidad" component={ClaseComunidad} durationInFrames={TOTAL_FRAMES_C} fps={FPS} width={1920} height={1080} />
      <Composition id="ClaseLeadr" component={ClaseLeadr} durationInFrames={TOTAL_FRAMES_L} fps={FPS} width={1920} height={1080} />
      <Composition id="ClaseLograr" component={ClaseLograr} durationInFrames={TOTAL_FRAMES_L07} fps={FPS} width={1920} height={1080} />
      <Composition id="ClaseFundamentos2" component={ClaseFundamentos2} durationInFrames={TOTAL_FRAMES_F2} fps={FPS} width={1920} height={1080} />
      <Composition id="ClaseFundamentos3" component={ClaseFundamentos3} durationInFrames={TOTAL_FRAMES_F3} fps={FPS} width={1920} height={1080} />
      <Composition id="ClaseFundamentos4" component={ClaseFundamentos4} durationInFrames={TOTAL_FRAMES_F4} fps={FPS} width={1920} height={1080} />
      <Composition id="ClaseFundamentos5" component={ClaseFundamentos5} durationInFrames={TOTAL_FRAMES_F5} fps={FPS} width={1920} height={1080} />
      <Composition id="ClaseFundamentos6" component={ClaseFundamentos6} durationInFrames={TOTAL_FRAMES_F6} fps={FPS} width={1920} height={1080} />
      <Composition id="ClaseFundamentos7" component={ClaseFundamentos7} durationInFrames={TOTAL_FRAMES_F7} fps={FPS} width={1920} height={1080} />
      <Composition id="ClaseIA1" component={ClaseIA1} durationInFrames={TOTAL_FRAMES_IA1} fps={FPS} width={1920} height={1080} />
      <Composition id="ClaseIA2" component={ClaseIA2} durationInFrames={TOTAL_FRAMES_IA2} fps={FPS} width={1920} height={1080} />
      <Composition id="ClaseIA3" component={ClaseIA3} durationInFrames={TOTAL_FRAMES_IA3} fps={FPS} width={1920} height={1080} />
      <Composition id="ClaseIA4" component={ClaseIA4} durationInFrames={TOTAL_FRAMES_IA4} fps={FPS} width={1920} height={1080} />
      <Composition id="ClaseIA5" component={ClaseIA5} durationInFrames={TOTAL_FRAMES_IA5} fps={FPS} width={1920} height={1080} />
      <Composition id="ClaseVerif1" component={ClaseVerif1} durationInFrames={TOTAL_FRAMES_V1} fps={FPS} width={1920} height={1080} />
      <Composition id="ClaseVerif2" component={ClaseVerif2} durationInFrames={TOTAL_FRAMES_V2} fps={FPS} width={1920} height={1080} />
      <Composition id="ClaseVerif3" component={ClaseVerif3} durationInFrames={TOTAL_FRAMES_V3} fps={FPS} width={1920} height={1080} />
      <Composition id="ClaseVerif4" component={ClaseVerif4} durationInFrames={TOTAL_FRAMES_V4} fps={FPS} width={1920} height={1080} />
      <Composition id="ClaseNicho1" component={ClaseNicho1} durationInFrames={TOTAL_FRAMES_N1} fps={FPS} width={1920} height={1080} />
      <Composition id="ClaseNicho2" component={ClaseNicho2} durationInFrames={TOTAL_FRAMES_N2} fps={FPS} width={1920} height={1080} />
      <Composition id="ClaseNicho3" component={ClaseNicho3} durationInFrames={TOTAL_FRAMES_N3} fps={FPS} width={1920} height={1080} />
      <Composition id="ClaseNicho4" component={ClaseNicho4} durationInFrames={TOTAL_FRAMES_N4} fps={FPS} width={1920} height={1080} />
      <Composition id="ClaseNicho5" component={ClaseNicho5} durationInFrames={TOTAL_FRAMES_N5} fps={FPS} width={1920} height={1080} />
      <Composition id="ClaseNicho6" component={ClaseNicho6} durationInFrames={TOTAL_FRAMES_N6} fps={FPS} width={1920} height={1080} />
      <Composition id="ClaseMarca1" component={ClaseMarca1} durationInFrames={TOTAL_FRAMES_M1} fps={FPS} width={1920} height={1080} />
      <Composition id="ClaseMarca2" component={ClaseMarca2} durationInFrames={TOTAL_FRAMES_M2} fps={FPS} width={1920} height={1080} />
      <Composition id="ClaseMarca3" component={ClaseMarca3} durationInFrames={TOTAL_FRAMES_M3} fps={FPS} width={1920} height={1080} />
      <Composition id="ClaseMarca4" component={ClaseMarca4} durationInFrames={TOTAL_FRAMES_M4} fps={FPS} width={1920} height={1080} />
      <Composition id="ClaseMarca5" component={ClaseMarca5} durationInFrames={TOTAL_FRAMES_M5} fps={FPS} width={1920} height={1080} />
      <Composition id="DemoEditorial" component={DemoEditorial} durationInFrames={DEMO_ED_FRAMES} fps={FPS} width={1920} height={1080} />
      <Composition id="Portada" component={Portada} durationInFrames={30} fps={FPS} width={1920} height={1080} defaultProps={{ tag: "MÓDULO 0", title: "Bienvenida", sub: "Tu punto de partida como periodista independiente.", icon: "rocket", color: "#22d3ee", titleSize: 150 }} />
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
