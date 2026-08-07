import fs from "fs";
const p = "./tts-scripts.json";
const j = JSON.parse(fs.readFileSync(p, "utf8"));

j.f13 = [
  // — Gancho —
  "Hay una pregunta que se hace todo el que empieza, y que casi nunca se responde bien. La pregunta es: ¿por qué a algunos los ve muchísima gente, y a otros, que publican cosas igual de buenas o mejores, casi no los ve nadie?",
  "La respuesta fácil es que tienen suerte, o que el algoritmo los ayuda. Y esa respuesta tiene un problema: te deja afuera. Te deja esperando que un día te toque a vos, como si fuera una rifa.",
  "Pero no es una rifa. Detrás de que a alguien lo vea gente nueva hay una lógica, y es una lógica que podés entender y usar a tu favor. De eso se trata esta clase.",
  "En la clase pasada vimos las cinco etapas de tu máquina. Y dijimos que la primera de todas, la boca de entrada, era el alcance: cuánta gente nueva ve lo que publicás.",
  "Hoy abrimos esa primera etapa y la miramos por dentro. Porque el alcance es la etapa que más se malinterpreta de las cinco, y entenderla bien te cambia por completo la manera de trabajar.",

  // — Idea central —
  "Voy a darte la idea de toda la clase en una sola frase, y después la desarmamos con calma. La frase es esta: la plataforma te muestra a gente nueva cuando tu contenido le retiene a la gente que ya tiene.",
  "Leída así, rápido, parece un trabalenguas. Pero tiene varias piezas, y cuando las veas por separado se entiende sola. Así que vamos despacio.",

  // — Bloque 1 · qué es el alcance —
  "Arranquemos por definirlo bien, porque casi todo el mundo lo confunde con otra cosa. El alcance es la cantidad de personas nuevas que ven lo que publicaste. La palabra importante ahí es nuevas.",
  "No es cuántas veces se mostró tu contenido, ni cuántos de tus seguidores lo vieron. Es cuánta gente que todavía no te conocía se cruzó con vos por primera vez.",
  "Por eso decimos que es la boca de entrada de la máquina. Es la etapa que trae desconocidos. Todas las demás etapas trabajan sobre gente que ya entró; esta es la única que va a buscar afuera.",
  "Y acá viene la primera cosa que conviene aceptar temprano, porque te va a ahorrar mucha frustración: el alcance no lo decidís vos. Vos publicás, y después es la plataforma la que decide a cuánta gente nueva se lo muestra. Puede ser a cincuenta personas, o a cinco mil, sin que vos hayas cambiado nada de tu lado.",
  "Ahora bien, que no lo decidas vos no significa que no lo influyas. Lo influís muchísimo, y en un minuto vemos cómo. Pero el gatillo final lo aprieta la plataforma. Entender esa repartición de roles es el primer paso para dejar de tomártelo como algo personal.",
  "Y una aclaración que te va a servir: esta lógica es la misma en todas las plataformas. Cambian los nombres y los detalles, pero el principio de fondo vale igual en una red social, en un buscador o donde publiques. Así que lo que vemos hoy no es el truco de una aplicación: es cómo funciona la distribución en general.",

  // — 4b · Alcance no es audiencia —
  "Y antes de seguir, quiero separar dos cosas que suenan parecidas y que conviene no confundir nunca, porque confundirlas lleva a trabajar para el lado equivocado.",
  "El alcance es prestado. Es espacio que la plataforma te presta hoy, y que mañana puede prestarte menos. Cambia de una semana a la otra sin que vos hayas hecho nada distinto. Es la parte volátil de tu trabajo. La audiencia, en cambio, es tuya: es la gente que ya decidió que quiere lo que hacés, y esa no se mueve cuando cambia una regla.",
  "Y acá está el punto que quiero que te lleves: el alcance no se acumula. Una nota que llegó a diez mil personas la semana pasada no te deja diez mil de arranque en la próxima. Volvés a empezar. Lo único que se acumula es lo que el alcance te dejó: los que se quedaron, los que te siguieron, los que te dieron su correo.",
  "Por eso el alcance es un río que pasa, y tu audiencia es lo que lograste juntar del río. El río sigue de largo igual. La pregunta útil no es cuánta agua pasó, sino cuánta lograste retener.",

  // — Bloque 2 · por qué te reparte —
  "Y para entenderla hace falta un cambio de lugar. Pongámonos por un segundo en el lugar de la plataforma.",
  "¿De qué vive esa plataforma? Vive de que la gente pase ahí adentro la mayor cantidad de tiempo posible. Cuanto más tiempo se queda la gente, más publicidad ve, y más gana. Ese es su negocio, en una línea.",
  "Entonces, ¿qué es lo más valioso que existe para ella? El contenido que hace que la gente se quede. El contenido que retiene.",
  "Y ahí es donde entrás vos. Si tu contenido logra que la gente se detenga, lo lea, se quede un rato, entonces te volvés útil para su negocio. Le estás dando exactamente lo que necesita: una razón para que su gente no se vaya.",
  "¿Y cómo te premia por eso? De la única manera que te sirve: mostrándote a más gente nueva. Te reparte. Porque para ella, mostrar tu contenido a un desconocido es una apuesta segura: ya vio que retenés, así que probablemente retengas también al que sigue.",
  "Dale la vuelta a la lógica y se entiende sola: la plataforma te reparte porque le conviene. Vos y ella quieren lo mismo: que a la gente le importe lo que hacés. Cuando entendés que están del mismo lado, dejás de pelearte con el alcance y empezás a trabajar con él.",

  // — Bloque 3 · las tres señales —
  "Bien, ya sabemos que te reparte si tu contenido retiene. La pregunta obvia es: ¿cómo se da cuenta de que retiene? ¿Qué mira exactamente? Mira señales. Pequeñas pistas que le dejamos sin darnos cuenta cada vez que consumimos algo.",
  "La primera es que la gente se detenga. Esta señal ya la conocés: es tu etapa de atención, la que trabajás con el título y la primera línea. Lo nuevo es entender qué hace la plataforma con ella: cada vez que alguien frena en tu contenido, ella toma nota y lo suma como un voto a favor de mostrarte más.",
  "La segunda es que la gente se quede. Que no solo frene, sino que consuma lo que hiciste hasta el final. Para la plataforma, eso es una señal más fuerte todavía, porque frenar puede ser un accidente, pero quedarse hasta el final es una elección. Le confirma que lo que ofreciste cumplió lo que prometía.",
  "Y la tercera, la más poderosa de todas, es que la gente haga algo con tu contenido. Que lo comparta, que se lo mande a alguien, que lo guarde para volver.",
  "Y esta es la señal reina, por una razón que vale la pena entender: cuando una persona comparte algo, está poniendo su propio nombre en juego frente a otro. Está diciendo: confío tanto en esto que te lo recomiendo. Para la plataforma no existe prueba más contundente de que tu contenido vale, porque a nadie le sobra reputación para regalar.",
  "Fijate el cambio de mirada que te propongo: en la clase pasada trabajamos estas señales desde tu lado, como cosas que provocás. Hoy las miramos desde el otro lado del mostrador, como cosas que la plataforma lee para decidir si te reparte. Es la misma moneda vista por su otra cara.",

  // — El ejemplo trabajado —
  "Veamos cómo se encadena todo esto, con un ejemplo. Y como siempre aclaro: los números son para entender la mecánica, no son una promesa.",
  "Imaginemos que subís una nota hoy mismo. La plataforma, que todavía no sabe si es buena, hace una prueba chica: se la muestra a un grupo reducido. Es su manera de tantear. Pongámosle que ese primer grupo son cien personas.",
  "Caso uno. De esas cien, muchas frenan, la leen entera, y unas cuantas la comparten. La plataforma lee esas señales y piensa: esto retiene. ¿Qué hace? Amplía la prueba. Se la muestra a otras quinientas, esta vez de gente que no te conoce.",
  "Si esas quinientas también responden bien, la vuelve a ampliar. Y así, escalón por escalón, tu nota termina llegando a miles de personas nuevas. Eso, visto de afuera, es lo que llamamos que se hizo viral. Pero por dentro no fue suerte: fue una cadena de pruebas que tu contenido fue pasando una tras otra.",
  "Caso dos. Misma nota inicial, mismas cien personas. Pero esta vez pocas frenan, casi nadie la termina, nadie la comparte. La plataforma lee esas señales y simplemente no invierte más en mostrarla. Deja de repartir, y la nota queda ahí, vista por poca gente.",
  "¿Ves la diferencia? En los dos casos vos hiciste lo mismo: publicar. Lo que cambió fue si tu contenido, en esa primera prueba chica, le dio a la plataforma motivos para seguir. El alcance grande no se pide: se gana en la prueba chica.",

  // — 7b · ¿Quiénes son esas cien personas? —
  "Y acá aparece la pregunta que hace toda la diferencia, la que casi nadie se hace: esas primeras cien personas, ¿quiénes son? ¿Las elige al azar? No. Y entender cómo las elige te cambia la manera de escribir.",
  "La plataforma arma ese primer grupo leyendo tu publicación. Mira de qué habla, qué palabras usás, qué lugares nombrás, a qué se parece lo que hiciste, y quiénes reaccionaron bien a cosas parecidas antes. Con todo eso arma una hipótesis: esto probablemente le interese a este tipo de persona. Y prueba ahí.",
  "O sea que la plataforma no adivina a quién mostrarte: lo deduce de lo que escribiste. Y solo puede deducir lo que esté ahí adentro.",
  "Pensemos en un caso. Si tu nota habla de un tema local, con nombres del lugar, con las palabras que usa esa comunidad y con referencias que ahí se entienden, la plataforma tiene con qué trabajar: arma un primer grupo de gente de esa zona, esa gente responde bien porque le habla a ella, y la cadena de pruebas arranca con el pie derecho.",
  "Ahora, la misma nota escrita en genérico, sin marcas de para quién es. La plataforma no tiene de dónde agarrarse, así que prueba con una mezcla al azar. A esa mezcla el tema le resulta tibio, casi nadie frena, y la cadena se corta en el primer escalón. Y fijate que la nota podía ser igual de buena: lo que faltó fue la señal de para quién era.",
  "De ahí sale algo muy útil: escribir para todos es la forma más rápida de que no te encuentre nadie. No porque te castiguen, sino porque le estás pidiendo a la plataforma que adivine.",
  "Y por eso saber exactamente para quién escribís deja de ser un ejercicio de marketing y pasa a ser una herramienta de distribución. Cuanto más claro tengas a tu lector, quién es, qué le importa, cómo habla, más señales vas a poner sin darte cuenta, y mejor va a poder la plataforma salir a buscarlo.",
  "Ese trabajo, el de definir con precisión a tu lector, tiene su propia clase más adelante y le vamos a dedicar el tiempo que merece. Hoy quedate con la mecánica: lo que escribís no solo tiene que gustarle a tu lector. Tiene que decirle a la plataforma quién es tu lector.",

  // — Pausa de recuerdo —
  "Cerremos un momento lo que vimos, con un ejercicio corto. Sin mirar hacia atrás, contestate esto en voz baja: ¿por qué una plataforma decide mostrarte a gente nueva?",
  "Ahí está. En tus propias palabras, sería algo así: porque tu contenido retiene a su gente, y eso a la plataforma le conviene. Si te salió parecido a eso, ya está: el resto son detalles que cuelgan de ahí.",

  // — 8b · De dónde sale el alcance —
  "Y ahora completemos el mapa, porque hasta acá hablamos del alcance como si viniera de un solo lugar. Y viene de cuatro. Conocerlos te sirve para no quedar colgado de uno solo.",
  "El primero son las redes sociales, que es del que venimos hablando: la plataforma le muestra tu contenido a gente que todavía no te sigue. Es el más rápido de todos, y también el más volátil.",
  "El segundo son los buscadores. Alguien tiene una pregunta, la escribe, y aparece algo que vos publicaste. Este es más lento de construir, pero tiene una cualidad que ninguno de los otros tiene: sigue trayendo gente meses o años después. Lo que escribiste una vez te trabaja mientras dormís.",
  "Y para un periodista esto es una mina de oro, porque lo que mejor sabés hacer, que es responder bien una pregunta que a la gente le importa, es exactamente lo que un buscador premia.",
  "El tercero es la recomendación de otros. Que alguien te comparta, que otro medio te cite, que te nombren. Es el alcance de mejor calidad de los cuatro, porque llega con confianza puesta: la persona no te descubre sola, te descubre recomendado por alguien en quien ya confía.",
  "Y el cuarto son los anuncios, que es alcance comprado. Los vemos con detalle mucho más adelante en el curso, así que hoy solo quiero que sepas dos cosas. Que existen. Y que son un acelerador, no un reemplazo: sirven para agrandar algo que ya funciona.",
  "Fijate una cosa linda de esta lista: los tres primeros son gratis, y los tres se ganan con oficio. El cuarto se paga, y llega después. Empezás con lo que ya tenés.",

  // — Ojo con esto —
  "Y ahora una advertencia sobre el error más común con el alcance. Es tan frecuente que quiero que lo veas venir de lejos. El error es enamorarse del número grande. Perseguir alcance por el alcance mismo, sin preguntarse qué pasa después.",
  "Y de ahí sale la regla: el alcance vale exactamente lo que vale la etapa que viene después. De nada sirve que te vean diez mil personas nuevas si ninguna se detiene, ninguna se queda, ninguna vuelve. Sería como abrir la puerta de un local a una multitud que pasa de largo sin mirar la vitrina.",
  "Por eso el alcance, solo, no es un objetivo. Es un combustible. Sirve cuando lo que viene después está preparado para aprovecharlo. Un alcance mediano que convierte bien vale muchísimo más que un alcance enorme que no convierte nada.",
  "Y eso significa que no necesitás volverte viral para que esto funcione. Necesitás que la gente que te ve, poca o mucha, encuentre algo que la haga quedarse. Y eso sí depende de vos.",

  // — Cierre y tarea —
  "Repasemos lo esencial. El alcance es la gente nueva que te ve, y es la boca de tu máquina. Lo reparte la plataforma, y lo reparte cuando tu contenido retiene a su gente. Lo hace leyendo señales, y esas señales las trabajás con tu oficio.",
  "Ahora te toca a vos, y son dos cosas cortas. La primera la podés hacer ahora mismo, con el teléfono en la mano. Abrí la aplicación donde más leés y buscá dos publicaciones de estos días: una que te haya hecho quedarte hasta el final, y otra que abandonaste a la mitad.",
  "Ahora mirá solo el principio de cada una: las primeras dos líneas, la imagen, el título. Y escribí una sola frase: qué hizo la primera en esos primeros segundos que la segunda no hizo. Eso que acabás de detectar es exactamente la señal que la plataforma está midiendo, vista desde el otro lado del mostrador.",
  "La segunda parte es de observación. Pensá en dónde publicás, o dónde vas a publicar, y anotá cuál va a ser tu boca de entrada principal: una red social, los buscadores, o que otros te recomienden. Esa es la boca que vamos a aprender a abrir.",
  "En la próxima clase seguimos el recorrido: ya sabemos cómo llega la gente nueva. Ahora vamos a ver qué pasa en su cabeza en los primeros segundos, y por qué decide seguirte o pasar de largo. Nos encontramos en la que viene.",
];

fs.writeFileSync(p, JSON.stringify(j, null, 2));
const w = j.f13.join(" ").split(/\s+/).length;
console.log("escenas:", j.f13.length, "· palabras:", w, "· ~min con Chris (143 ppm):", (w / 143).toFixed(1));
