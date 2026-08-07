import fs from "fs";
const p = "./tts-scripts.json";
const j = JSON.parse(fs.readFileSync(p, "utf8"));

// 3.4 — Transparencia: mostrar tu proceso. Estructura: mostrar-el-proceso. Hero: la nota con su caja. CIERRE M3.
j.f34 = [
  // — Gancho —
  "Podés hacer todo el trabajo de verificación perfecto. Rastrear la imagen, triangular el dato, llegar a la fuente primaria. Y si el lector no ve nada de eso, para él es como si no lo hubieras hecho.",
  "Porque la confianza no se construye solo con acertar: se construye con que se note que sos cuidadoso. Y eso no se adivina: se muestra. Hoy, en la clase que cierra el módulo, vas a aprender a hacer visible tu trabajo, que es lo que lo convierte en confianza.",

  // — Puente —
  "En las clases anteriores conseguiste las herramientas para verificar: la búsqueda de origen para las imágenes, la triangulación y la fuente primaria para los datos. Ya sabés averiguar la verdad. Queda la última pieza: mostrar ese trabajo. Porque de puertas para adentro ya sos confiable; ahora falta que se vea de puertas para afuera.",

  // — Idea central —
  "La idea que cierra el módulo es esta: la transparencia es la firma moderna. Antes, la confianza venía del sello: lo dice tal medio, entonces es cierto. Ese sello todavía existe, pero pesa cada vez menos, porque la gente aprendió a desconfiar hasta de los sellos. Lo que pesa hoy es otra cosa: mostrar cómo sabés lo que decís. No creeme, sino mirá, acá está de dónde lo saqué. Ese cambio es la mejor herramienta que tenés para ganar confianza rápido, incluso empezando de cero.",

  // — Bloque 1 · por qué funciona —
  "Detengámonos un segundo en por qué esto convence tanto. Cuando alguien afirma algo sin más, te pide un acto de fe: creele porque sí. Y hoy la gente da poco crédito así. En cambio, cuando alguien te muestra el camino, esto lo dijo esta persona, acá está el video; este dato es de este informe, acá está el link, ya no te está pidiendo que le creas: te está dando con qué comprobarlo vos mismo.",
  "Y, paradójicamente, cuando podés comprobarlo, casi nunca necesitás hacerlo: con que se note que está ahí, alcanza para confiar. Mostrar el proceso hace dos cosas a la vez. Le da al lector la prueba, y le manda una señal más profunda: esta persona trabaja así, con las cartas sobre la mesa. Y esa señal, repetida, te construye la fama de confiable de la que hablamos en la primera clase.",

  // — Bloque 2 · cómo se muestra —
  "Bajemos esto a cosas concretas que podés hacer en cualquier publicación. Son simples, y elegís según el caso. Enseñá la fuente: cuando afirmás un dato, decí de dónde sale, según el informe de tal organismo. Poné la cita en su contexto: si alguien dijo algo, mostrá el fragmento real, no una versión de segunda mano. Contá el chequeo, en una línea: verificamos que esta imagen es de dos mil veintiuno, no de ahora. Una frase que muestra que te tomaste el trabajo cambia cómo se lee todo lo demás.",
  "Y hay un recurso que rinde muchísimo y casi nadie usa: una pequeña caja al pie, tipo cómo lo verificamos, donde en dos o tres renglones contás los pasos que diste. Para el lector es una prueba de seriedad; para vos, es tu firma de calidad. Cuando alguien ve esa caja, aunque no la lea entera, ya sabe con qué clase de trabajo se está encontrando.",

  // — Bloque 3 · decir lo que no sabés —
  "Y ahora, una jugada que parece al revés y funciona: mostrar también lo que no sabés. Cuando una historia está en desarrollo y hay algo sin confirmar, la tentación es rellenar el hueco o hacer como que sabés. Hacé lo contrario: decilo. Esto todavía no está confirmado por fuentes oficiales. Buscamos la versión de la otra parte y aún no respondió.",
  "Lejos de debilitarte, eso te fortalece, porque le muestra al lector dónde termina lo seguro y dónde empieza lo probable. La gente perdona no saberlo todo; lo que no perdona es que le vendan una certeza que después se cae. Decir hasta acá sé, esto todavía no es de las cosas que más confianza generan, justamente porque casi nadie se anima. En un mar de gente que afirma de todo con seguridad, el que marca sus propios límites se vuelve el creíble.",

  // — Bloque 4 · corregir a la vista —
  "Un caso especial de transparencia: qué hacés cuando te equivocás. Ya lo dijimos en la primera clase: equivocarse alguna vez le pasa a cualquiera, y no es lo que rompe la confianza. Lo que la cuida, o la rompe, es cómo corregís. Corregir a la vista significa no borrar el error en silencio como si nunca hubiera pasado, sino avisar: corregimos este dato, decía esto y en realidad es esto otro. Suena a que te expone, y es al revés: le muestra a tu lector que preferís quedar bien con la verdad antes que con tu orgullo. Un error corregido así, con la cara, muchas veces suma más confianza que si nunca te hubieras equivocado.",

  // — Bloque 5 · el tono justo —
  "Una aclaración para no irte al otro extremo. Transparencia no es llenar cada nota de advertencias que asustan, ni de tecnicismos, ni de tantas aclaraciones que el lector se pierda. Es contar con naturalidad cómo sabés lo que sabés, en el lenguaje simple de siempre. Y va de la mano con algo de las clases anteriores: no exagerar la certeza. Es mejor un honesto según tal fuente que un rotundo esto es así cuando en realidad te apoyás en un solo dato.",

  // — Ejemplo trabajado —
  "Veámoslo armado. Supongamos que escribís una nota corta sobre un corte de calle que hubo hoy, con una foto y un dato de cuánta gente participó. Primero verificaste: pasaste la foto por la búsqueda inversa y confirmaste que es de hoy; el número lo tomaste del parte oficial, no de la cifra inflada que circulaba; y pediste la versión de la otra parte, que hasta el cierre no respondió.",
  "Ahora, lo mostrás. Al pie de la nota ponés una cajita, cómo lo verificamos, con tres renglones. Uno: la foto es de hoy, chequeada con búsqueda inversa. Dos: la cifra es la del parte oficial; la que circulaba no tenía fuente. Tres: pedimos la otra versión y, hasta el cierre, no respondió. Esa caja de tres líneas son, exactamente, las tres herramientas del módulo puestas a la vista. El lector ya no tiene que creerte porque sí: ve el trabajo.",

  // — Recuerdo —
  "Lo que pusimos hoy. Primera: ¿por qué no alcanza con verificar en silencio? Porque si el lector no ve el trabajo, para él es como si no existiera. Segunda: nombrá dos maneras de mostrar el proceso. Enseñar la fuente, poner la cita en contexto, contar el chequeo, una caja de cómo lo verificamos, o decir lo que todavía no sabés. Tercera: ¿qué hacés cuando te equivocás? Corregís a la vista, avisando, porque un error bien corregido suma confianza.",

  // — Tarea —
  "Tu tarea junta todo el módulo en una sola acción. Agarrá una noticia cualquiera, propia o ajena, y escribile a mano su caja de cómo lo verificaría. Anotá qué chequearías y cómo: para las imágenes, la búsqueda de origen; para los datos, la fuente primaria y la triangulación; y una línea de qué mostrarías al lector para que se note. No tenés que verificar nada de verdad todavía: el ejercicio es diseñar el proceso y pensar cómo se vería contado.",

  // — Cierre del módulo —
  "Y con esto cerramos el módulo de la verificación, que es el que le pone el sello de periodista a todo lo demás. Recorrimos el camino entero: entendiste que tu credibilidad es tu capital; aprendiste a verificar imágenes con la búsqueda de origen; a chequear datos y declaraciones triangulando hasta la fuente primaria; y hoy, a mostrar todo ese trabajo para que se convierta en confianza a la vista.",
  "Fijate lo que tenés ahora en las manos: sabés dirigir a la inteligencia artificial, y sabés verificar lo que produce y lo que circula. Esas dos cosas juntas, potencia y criterio, son exactamente lo que te vuelve un periodista de esta época, y no un repetidor más. Con los cimientos puestos, lo que viene es empezar a darle forma a tu proyecto. En el próximo módulo arrancamos por algo lindo: el nombre y la marca de tu medio. Te espero en la próxima etapa.",
];

fs.writeFileSync(p, JSON.stringify(j, null, 2));
const w = j.f34.join(" ").split(/\s+/).length;
console.log("escenas:", j.f34.length, "· palabras:", w, "· ~min con Chris (143 ppm):", (w / 143).toFixed(1));
