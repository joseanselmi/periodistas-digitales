import { NextResponse } from 'next/server'
import { createClient as createServerClient } from '@/lib/supabase/server'
import { createClient } from '@supabase/supabase-js'

export const maxDuration = 300

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const BREVO_URL = 'https://api.brevo.com/v3/smtp/email'
const SENDER = { name: 'José — Periodistas del Futuro IA', email: 'jose@sistemadeingresosdiariosia.com' }

// 243 compradores del curso Sistema de Ingresos Diarios
const COMPRADORES: { email: string; nombre: string }[] = [{"email":"manuel.cotapos@gmail.com","nombre":"Manuel Cotapos"},{"email":"nacevedob2020@gmail.com","nombre":"Nidia Acevedo"},{"email":"sugeypj@gmail.com","nombre":"María Sugey Patiño Jimenez"},{"email":"fjflores722@gmail.com","nombre":"Francisco Javier Flores Valdés"},{"email":"lorenzovalera2022@gmail.com","nombre":"Miguel Lorenzo Valera Valera"},{"email":"romarodriguezquintanilla@gmail.com","nombre":"Rosa Maria Rodriguez"},{"email":"luis.mendez0712@gmail.com","nombre":"Luis Mendez Urich"},{"email":"bettyflogon@hotmail.com","nombre":"Beatriz Flores González"},{"email":"bagual001@gmail.com","nombre":"Alejandro Avendaño López"},{"email":"olayahuerta@gmail.com","nombre":"Olaya Huerta Leon"},{"email":"correapovedamanuela@gmail.com","nombre":"Manuela Correa Poveda"},{"email":"karinaortegamor.marketing22@gmail.com","nombre":"Karina Ortega"},{"email":"lidianunezcota@gmail.com","nombre":"Lidia Nuñez Cota"},{"email":"valverdere1@gmail.com","nombre":"Eliecer Valverde R."},{"email":"danivi.93@gmail.com","nombre":"Dani Lund"},{"email":"grml66@gmail.com","nombre":"Gerardo Montenegro"},{"email":"parceparce894@gmail.com","nombre":"Ruben Leonardo Parra Cedeño"},{"email":"equi17@gmail.com","nombre":"Carlos Felipe Gonzalez"},{"email":"dmontesinoss@gmail.com","nombre":"Debora Montesinos Sanchez"},{"email":"ciriex@gmail.com","nombre":"Ricardo Cirio Morales"},{"email":"carlos.robledo49@yahoo.com","nombre":"Carlos Eduardo Robledo Esparza"},{"email":"luismixtico7@gmail.com","nombre":"Luis Ramírez"},{"email":"archivosolivas2025@gmail.com","nombre":"Norvin Olivas"},{"email":"aliciaacunagalleguillos@gmail.com","nombre":"Alicia Acuña"},{"email":"zizoamejia@hotmail.com","nombre":"Jorge Ancizar Mejia"},{"email":"jimmyjaviermiranda@gmail.com","nombre":"Jimmy Javier Miranda Rodriguez"},{"email":"gustavo0312@gmail.com","nombre":"Manuel Guanchez"},{"email":"josuevg2011@hotmail.com","nombre":"Josué Vásquez Guevara"},{"email":"adrianagabaldon14@gmail.com","nombre":"Adriana Gabaldon"},{"email":"paropua@gmail.com","nombre":"Patricio Rodríguez Púa"},{"email":"virgiliorojo@yahoo.com","nombre":"Virgilio Rojo"},{"email":"andreavarela30@gmail.com","nombre":"Andrea Varela"},{"email":"pinerojmeister@gmail.com","nombre":"Jorge Piñero"},{"email":"erlangarciapd@gmail.com","nombre":"Erlan Fernando Garcia Lozada"},{"email":"nicolasalvarez646@gmail.com","nombre":"Nicolas Ezequiel Alvarez"},{"email":"emmanuel.cabello@uteq.edu.mx","nombre":"Emmanuel Cabello"},{"email":"armandocastillo5673@gmail.com","nombre":"Armando Castillo Montejo"},{"email":"atovarzabaleta@gmail.com","nombre":"Andres Tovar"},{"email":"arturo.zacatepec@gmail.com","nombre":"Arturo Rodríguez Gutiérrez"},{"email":"edgarmarrero1@gmail.com","nombre":"Edgar Marrero"},{"email":"carrejm@hotmail.com","nombre":"Jose Manuel Carreño Maldonado"},{"email":"brothersainz@gmail.com","nombre":"Pablo Sáinz-Ferretti"},{"email":"alexisd_ups@hotmail.com","nombre":"Alexis Fernando Díaz Sánchez"},{"email":"reneruizs@gmail.com","nombre":"Jesus Rene Ruiz Sifuentes"},{"email":"juanmanuelarienti98@gmail.com","nombre":"Juan Manuel Arienti"},{"email":"luisxray@gmail.com","nombre":"Luis Castillo"},{"email":"danielvz22@gmail.com","nombre":"Daniel Villarreal"},{"email":"mramirezr@gmail.com","nombre":"Marcelo Ramirez"},{"email":"vicentedionicioatoyac@gmail.com","nombre":"Vicente Dionicio Zamora"},{"email":"santosyasoc@gmail.com","nombre":"Antonio Santos"},{"email":"litrosmvm@gmail.com","nombre":"Miguel Valenzuela"},{"email":"marielapisano@estudiopisano.com.ar","nombre":"Mariela Pisano"},{"email":"nubiazubia438@gmail.com","nombre":"Nubia Zubia Banda"},{"email":"ben.vega@gmail.com","nombre":"Benjamin Vega"},{"email":"gloriagarcedrodriguez@gmail.com","nombre":"Gloria Garced"},{"email":"robertgianola@gmail.com","nombre":"Robert Gianola"},{"email":"luisangelus85@gmail.com","nombre":"Luis Fernandez"},{"email":"14migueljimenez@gmail.com","nombre":"Miguel Jiménez"},{"email":"mauricio.castro.abarca@gmail.com","nombre":"Mauricio Rafael Castro Abarca"},{"email":"gabyr159@gmail.com","nombre":"Gabriel Rodriguez"},{"email":"abnersal16@yahoo.com","nombre":"Abner Francisco Salguero Lopez"},{"email":"robclawyer@gmail.com","nombre":"Roberto Contreras Salcedo"},{"email":"lhernandez24@icloud.com","nombre":"Luis Hernández"},{"email":"jepuello@yahoo.com","nombre":"Emilio Puello"},{"email":"pguzmanparedes@gmail.com","nombre":"Maria del Pilar Guzman Paredes"},{"email":"cesarcervera@hotmail.com","nombre":"Cesar Cervera"},{"email":"largher34@gmail.com","nombre":"Antonio Largher Sosa"},{"email":"jorgebragacabrera@gmail.com","nombre":"Jorge Braga"},{"email":"jmaolvera1951@gmail.com","nombre":"José Antonio Olvera"},{"email":"elizalde.urquiza@gmail.com","nombre":"Carlos Elizalde"},{"email":"seiragustavo@gmail.com","nombre":"Gustavo Alberto Seira"},{"email":"hijode_chilo@hotmail.com","nombre":"Andres Aguilar"},{"email":"mucio@hotmail.com","nombre":"Mucio Cardoso"},{"email":"semimori@hotmail.com","nombre":"Miguel Morilla Rodriguez"},{"email":"marioluisolivazeballos@gmail.com","nombre":"Mario Luis Oliva Zeballos"},{"email":"charo2102@gmail.com","nombre":"Rosario Romaní"},{"email":"santydelrio@gmail.com","nombre":"David Santiago"},{"email":"onemediossas@gmail.com","nombre":"Ruben Trejos"},{"email":"josmararamar@gmail.com","nombre":"Jose Araiza"},{"email":"javiergrana2@hotmail.com","nombre":"Javier Granados"},{"email":"cesarmgordillom@gmail.com","nombre":"César Manuel Gordillo Mena"},{"email":"jon031288@gmail.com","nombre":"Cristopher Jonathan Rivera Limon"},{"email":"oscarflores8327@gmail.com","nombre":"Oscar Flores Flores"},{"email":"tritonmx@live.com","nombre":"Alfredo Carrera Ortega"},{"email":"cafeneci@outlook.com","nombre":"Carlos Fernando Neyra Cisneros"},{"email":"soyceciba@gmail.com","nombre":"Cecilia Lorenc"},{"email":"identidadtv@hotmail.com","nombre":"Diego Guayasamin"},{"email":"chiloevideo@gmail.com","nombre":"Eduardo Burgos Sepúlveda"},{"email":"adancampo0@gmail.com","nombre":"Adan Cepeda"},{"email":"robertalvaradoonofre@gmail.com","nombre":"Robert Lenin Alvarado Onofre"},{"email":"pakoandrade@gmail.com","nombre":"Francisco Javier Andrade Madrigal"},{"email":"rodrigolmi72@gmail.com","nombre":"Rodrigo Matias Olmi Tapia"},{"email":"mariapastora@meridionalradio.cl","nombre":"María Pastora Sandoval"},{"email":"gpericial@gmail.com","nombre":"Luis Alamancos Psmpín"},{"email":"astrolabio33@hotmail.com","nombre":"Maria Zanatta"},{"email":"leoceballosch@gmail.com","nombre":"Leonardo Ceballos"},{"email":"pablowino@gmail.com","nombre":"Pablo Ezequiel Winokur"},{"email":"garciamercedes@gmail.com","nombre":"Mercedes L Garcia"},{"email":"jaimecortess@gmail.com","nombre":"Jaime Cortes"},{"email":"jonatanfabbian@mundialdefondo.com","nombre":"Jonatan Fabbian"},{"email":"fercoc@gmail.com","nombre":"Fernando Coca Meneses"},{"email":"susana.pozzi@gmail.com","nombre":"Susana Pozzi"},{"email":"maricela0619@gmail.com","nombre":"Maricela Luna Gutierrez"},{"email":"alejandromotta@gmail.com","nombre":"Alejandro Motta"},{"email":"alejandroalarconzapata@gmail.com","nombre":"Alejandro Alarcón Zapata"},{"email":"nestunia@hotmail.com","nombre":"Natalia Liliana Fumagalli"},{"email":"tmarchanluna@gmail.com","nombre":"Teresa Marchán Luna"},{"email":"alneyuribe@gmail.com","nombre":"José Uribe"},{"email":"jesusm@morquecho.com.mx","nombre":"Jesus Magdaleno Saucedo Morquecho"},{"email":"manfredecheverria@gmail.com","nombre":"Manfred Echeverria"},{"email":"sportmedios@gmail.com","nombre":"Sergio Torres"},{"email":"aguilaredwards@gmail.com","nombre":"Andrea Aguilar Edwards"},{"email":"cdcastillin@gmail.com","nombre":"Carlos Castillo Cordero"},{"email":"davidmartiz@gmail.com","nombre":"David Martínez"},{"email":"barcapa@outlook.es","nombre":"Paulina Bárcenas Cabrera"},{"email":"catalina.juradotoro@gmail.com","nombre":"Catalina Jurado"},{"email":"contrerasnatalialuciana@gmail.com","nombre":"Natalia Luciana Contreras"},{"email":"percar2@gmail.com","nombre":"Rogelio Perusquia"},{"email":"nancycuebas@yahoo.com","nombre":"Nancy Cuebas"},{"email":"fernandezenrique2011@hotmail.com","nombre":"Enrique Fernández"},{"email":"edgue2005@gmail.com","nombre":"Mariano Guevara Soto"},{"email":"luismanuel.grullon@gmail.com","nombre":"Luis Grullon"},{"email":"marquezhugo121@gmail.com","nombre":"Hugo Marquez"},{"email":"rafa2.garcia@gmail.com","nombre":"Angel Rafael Garcia Ramirez"},{"email":"cpa.jcr@gmail.com","nombre":"Juan Ramirez Castillo"},{"email":"cquezadaruiz@gmail.com","nombre":"Carlos Quezada Ruiz"},{"email":"ebuitragorico@gmail.com","nombre":"Edgar Buitrago Rico"},{"email":"pcummings300@gmail.com","nombre":"Pedro Cummings"},{"email":"joanareyesv@gmail.com","nombre":"Joana Reyes Vázquez"},{"email":"epalacios@uca.edu.sv","nombre":"Hugo Palacios"},{"email":"arli36@hotmail.com","nombre":"Alfredo Miranda Salazar"},{"email":"sechman@gmail.com","nombre":"Samuel Chavez"},{"email":"javier.rosiles@gmail.com","nombre":"Javier Rosiles"},{"email":"jamenluj@gmail.com","nombre":"Jose Antonio"},{"email":"jomartinez@cecytech.edu.mx","nombre":"José Domingo Martínez"},{"email":"gerencia@decibeles.net","nombre":"Jorge Enrique Ortiz Caycedo"},{"email":"agrajalescano@hotmail.com","nombre":"Alfonso Grajales Cano"},{"email":"rlshn@yahoo.com","nombre":"Rodolfo Leonel Sandoval"},{"email":"ximeojulicontenidodigital@gmail.com","nombre":"Ximena Juliana González Piñeros"},{"email":"claudiatueme@yahoo.com","nombre":"Claudia Yvonne Tueme Witron"},{"email":"octavio.pelaez@gmail.com","nombre":"Octavio Eduardo Peláez Mendoza"},{"email":"joshojose1@gmail.com","nombre":"Jose Luis Pérez Muñoz"},{"email":"renefabiancardozo@gmail.com","nombre":"Rene Fabian Cardozo"},{"email":"medardodrago@gmail.com","nombre":"Medardo Drago Leon"},{"email":"mig.gto@gmail.com","nombre":"Jose Miguel Velazquez"},{"email":"amalavoz@gmail.com","nombre":"Alejandro Maciel"},{"email":"normaolivoorrico@gmail.com","nombre":"Norma Olivo"},{"email":"sebaele@hotmail.com","nombre":"Sebastián Erik Lucas Reina"},{"email":"marco.martinez@varaalta.com","nombre":"Marco Antonio Martinez Garcia"},{"email":"publicity.mxl@gmail.com","nombre":"Luis Canez"},{"email":"reportewebtv@gmail.com","nombre":"Juan Carlos Quiñonez"},{"email":"jensser.morales@gmail.com","nombre":"Jensser Morales"},{"email":"antonio.rios@tec.mx","nombre":"Antonio Rios"},{"email":"salvador.chavira@yahoo.com","nombre":"Salvador Chavira"},{"email":"jnandome@gmail.com","nombre":"Jorge Fernando Mérida"},{"email":"didierdemar@yahoo.es","nombre":"Didier Castañeda"},{"email":"veramatosorestes@gmail.com","nombre":"Orestes Vera"},{"email":"lcc.brendalara@gmail.com","nombre":"Brenda Lara"},{"email":"jalepezochoa@gmail.com","nombre":"Antonio López Ochoa"},{"email":"cristiandminich@gmail.com","nombre":"Cristian Minich"},{"email":"saularellano1@gmail.com","nombre":"Saúl Arellano Almanza"},{"email":"anibal.steffen@gmail.com","nombre":"Anibal Steffen"},{"email":"miguelboizo@gmail.com","nombre":"Miguel Ángel Boizo"},{"email":"eldesfile1@gmail.com","nombre":"Herculano Hernández Aragon"},{"email":"dayahc@hotmail.com","nombre":"Yessica Hilario Cruz"},{"email":"ronicoralvargas@gmail.com","nombre":"Roni Coral Vargas"},{"email":"oilujrasecinamam@gmail.com","nombre":"Julio Cesar Mamani Chura"},{"email":"margot182505@hotmail.com","nombre":"Carlos Mesias Zárate"},{"email":"zenschocolate@gmail.com","nombre":"Luis Supliguicha Cárdenas"},{"email":"badelmedia@gmail.com","nombre":"Luis Badel"},{"email":"eledithdiaz@gmail.com","nombre":"Eledith Día Jiménez"},{"email":"claudio.iberiartv@gmail.com","nombre":"Claudio Segura Alfaro"},{"email":"mariajose1978@gmail.com","nombre":"María José Muñoz"},{"email":"dmera.producciones@gmail.com","nombre":"Danielo German Mera"},{"email":"hchinchillatv@gmail.com","nombre":"Hector Chinchilla"},{"email":"fjavierfc@yahoo.com","nombre":"Francisco Fernandez"},{"email":"marayarielarivera@gmail.com","nombre":"Mara Rivera"},{"email":"periodismo2100@gmail.com","nombre":"Jaime Alberto Vélez Villa"},{"email":"revistaelparaiso@hotmail.com","nombre":"Jhoseph Vladimir Medina Maldonado"},{"email":"noriux75@hotmail.com","nombre":"Nora Hernández"},{"email":"voxpopulisanluis@outlook.com","nombre":"Gerardo Guillermo Almendárez Mireles"},{"email":"dariomedina.cyc@gmail.com","nombre":"Dario Medina"},{"email":"cesarbaytala@hotmail.com","nombre":"Cesar Baytala"},{"email":"capacit.lea@gmail.com","nombre":"Luis Alberto Esteves Ahumada"},{"email":"kbzon59@hotmail.com","nombre":"Freddy Rivera"},{"email":"pedrodiffo@gmail.com","nombre":"Pedro Difo"},{"email":"xochitlbravo@gmail.com","nombre":"Xochitl Bravo"},{"email":"rigo.brito.osuna@gmail.com","nombre":"Rigoberto Brito Osuna"},{"email":"mamnoticias@gmail.com","nombre":"Evaristo Tenorio"},{"email":"amarildoariza@gmail.com","nombre":"Amarildo Ariza Jimenez"},{"email":"fernandoalffonso@gmail.com","nombre":"Fernando Alfonso Avila Hernandez"},{"email":"revistaentintanegra@gmail.com","nombre":"Juan Martin Sánchez Castro"},{"email":"nadietita@yahoo.com.mx","nombre":"Nadia Adriana Mejía Mejía"},{"email":"rudicarb@gmail.com","nombre":"Rodolfo Carrillo"},{"email":"fggn811202@gmail.com","nombre":"Francisco Genaro Guerrero Navarro"},{"email":"diazrozas@gmail.com","nombre":"Felipe Antonio Diaz Rozas"},{"email":"tilleriasergio@gmail.com","nombre":"Sergio Tillería"},{"email":"tureyangel@gmail.com","nombre":"Miguel Angel Reyes Gámez"},{"email":"alejandrofes@gmail.com","nombre":"Alejandro Moreno"},{"email":"sergioauad@gmail.com","nombre":"Sergio Auad"},{"email":"luciano1997@live.com.ar","nombre":"Luciano Martin Garcia"},{"email":"fernandoavila.baez@gmail.com","nombre":"Fernando Avila Baez"},{"email":"isaijara@gmail.com","nombre":"Isaí Jara Arias"},{"email":"htavitas@gmail.com","nombre":"Hector Tavitas"},{"email":"adcmatices@hotmail.com","nombre":"Juan Jose Torres Luyo"},{"email":"maitagarrinson@gmail.com","nombre":"Garrinson Maita"},{"email":"bureau.mexico@gmail.com","nombre":"Laurence Cuvillier"},{"email":"gercamdom@gmail.com","nombre":"Gerardo Campos"},{"email":"sosadaniel2104@gmail.com","nombre":"Daniel Sosa"},{"email":"macovich@pm.me","nombre":"Marco Tovar"},{"email":"braudilio.batista91@gmail.com","nombre":"Braudilio Batista"},{"email":"novedades814@gmail.com","nombre":"David Camargo Durán"},{"email":"lissitame2.0@gmail.com","nombre":"Melissa Rubio"},{"email":"dianasantanaj@gmail.com","nombre":"Diana Santana"},{"email":"sandrarociogomez@hotmail.com","nombre":"Sandra Gómez"},{"email":"yilbereta@hotmail.com","nombre":"Yilber Vega Ruiz"},{"email":"carolavbriones@gmail.com","nombre":"Carolina Valenzuela"},{"email":"luron1980@gmail.com","nombre":"Luciano Gabriel Ronzoni Guzman"},{"email":"mmerk2mald@gmail.com","nombre":"Miriam Mercado Mercado"},{"email":"pazpeletam@gmail.com","nombre":"Piedad Azpeleta Martín"},{"email":"ctolher@gmail.com","nombre":"César Toledo Hernández"},{"email":"mplazaba@gmail.com","nombre":"Fernando Pla"},{"email":"ordonezojedag@gmail.com","nombre":"Gonzalo Ordóñez Ojeda"},{"email":"lawamendoza@gmail.com","nombre":"Laura Mendoza"},{"email":"nataliamuruaga@gmail.com","nombre":"Natalia Muruaga"},{"email":"juanluisdelarosa9@gmail.com","nombre":"Juan Luis De la Rosa Hernández"},{"email":"estradacepero@gmail.com","nombre":"Ignacio Estrada"},{"email":"doriscamino5@hotmail.com","nombre":"Doris Camino Barreto"},{"email":"jlo2107@gmail.com","nombre":"Jennyfer Hernández Escobar"},{"email":"hernan@institutoicr.com.ar","nombre":"Hernán Auci"},{"email":"elimparcial07@yahoo.com.mx","nombre":"Marco Antonio Xaca Solabac"},{"email":"asji.us@gmail.com","nombre":"Adriana Sanchez"},{"email":"josetates@yahoo.com","nombre":"Jose Tates"},{"email":"lizfmfm@gmail.com","nombre":"Fletes Liz"},{"email":"flaviafuentescopello@gmail.com","nombre":"Flavia Fuentes Copello"},{"email":"gustavo.mathieu@gmail.com","nombre":"Gustavo Mathieu"},{"email":"rodrigomarin_photo@live.com","nombre":"Rodrigo Reyes Marin"},{"email":"rubenmelgarejoag@gmail.com","nombre":"Rubén Melgarejo Aguilar"},{"email":"vicalva.vau@gmail.com","nombre":"Victor Alvarez Uvalle"},{"email":"temuco.visionsur@gmail.com","nombre":"Cesar Rivera"},{"email":"janavarroc@hotmail.com","nombre":"Julio Navarro"},{"email":"loretomartinezg@gmail.com","nombre":"Loreto Martinez"},{"email":"wernerhansen@gmail.com","nombre":"Werner Hansen Leiva"}]

const L4 = {
  subject: 'Sacamos algo nuevo. Y es para vos.',
  html: `
<p>Hola,</p>
<p>Desde Periodistas Digitales estuvimos construyendo algo.</p>
<p>Se llama <strong>Leadr</strong>.</p>
<p>Es la plataforma de IA para periodistas que queríamos que existiera y no existía. Todo en español. Todo para el trabajo real de cubrir, investigar y publicar.</p>
<p>Decidimos dársela primero a los que confiaron en nosotros desde el principio.</p>
<p>Vos compraste el curso. Eso cuenta.</p>
<p>30 días gratis. Sin tarjeta. Sin formularios.</p>
<p style="font-size:18px;"><strong><a href="https://leadr.cloud/activar" style="color:#6366f1;">→ Activar mi acceso gratuito</a></strong></p>
<p>Válido hasta el 31 de mayo.</p>
<p>El equipo de Periodistas Digitales</p>
<p><small>PD: Si ya activaste, ignorá este email. Gracias.</small></p>
  `,
  text: `Hola,\n\nDesde Periodistas Digitales estuvimos construyendo algo.\n\nSe llama Leadr.\n\nEs la plataforma de IA para periodistas que queríamos que existiera y no existía. Todo en español. Todo para el trabajo real de cubrir, investigar y publicar.\n\nDecidimos dársela primero a los que confiaron en nosotros desde el principio.\n\nVos compraste el curso. Eso cuenta.\n\n30 días gratis. Sin tarjeta. Sin formularios.\n\n→ leadr.cloud/activar\n\nVálido hasta el 31 de mayo.\n\nEl equipo de Periodistas Digitales\n\nPD: Si ya activaste, ignorá este email. Gracias.`,
}

async function assertAdmin() {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null
  const { data } = await supabaseAdmin.from('users').select('is_admin').eq('id', user.id).single()
  return data?.is_admin ? user : null
}

async function getActivatedEmails(): Promise<Set<string>> {
  const { data } = await supabaseAdmin
    .from('users')
    .select('email')
    .not('plan', 'is', null)
  if (!data) return new Set()
  return new Set(data.map((u: { email: string }) => u.email.toLowerCase()))
}

// GET — preview: cuántos no activaron
export async function GET() {
  const user = await assertAdmin()
  if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const activados = await getActivatedEmails()
  const pendientes = COMPRADORES.filter(c => !activados.has(c.email.toLowerCase()))

  return NextResponse.json({
    total: COMPRADORES.length,
    activados: activados.size,
    pendientes: pendientes.length,
    lista_preview: pendientes.slice(0, 5).map(c => c.email),
  })
}

// POST — enviar L4 a no-activadores
export async function POST() {
  const user = await assertAdmin()
  if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const activados = await getActivatedEmails()
  const pendientes = COMPRADORES.filter(c => !activados.has(c.email.toLowerCase()))

  if (pendientes.length === 0) {
    return NextResponse.json({ ok: true, sent: 0, message: 'Todos activaron Leadr — sin pendientes' })
  }

  let sent = 0
  let errors = 0

  for (const contacto of pendientes) {
    try {
      const res = await fetch(BREVO_URL, {
        method: 'POST',
        headers: {
          'accept': 'application/json',
          'api-key': process.env.BREVO_API_KEY!,
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          sender: SENDER,
          to: [{ email: contacto.email, name: contacto.nombre }],
          subject: L4.subject,
          htmlContent: L4.html,
          textContent: L4.text,
          headers: { 'X-Mailin-custom': 'leadr-l4' },
        }),
      })
      if (res.ok) sent++
      else errors++
    } catch {
      errors++
    }
    // Pequeña pausa para no saturar Brevo
    await new Promise(r => setTimeout(r, 100))
  }

  // Actualizar estado de Sofía en agent_states
  await supabaseAdmin.from('agent_states').update({
    ultima_accion: new Date().toISOString().split('T')[0],
    estado: 'ok',
    proxima_accion: `Campaña L1-L4 completa — ${sent} emails enviados. Próximo ciclo por definir.`,
    updated_at: new Date().toISOString(),
  }).eq('agent_id', 'sofia')

  return NextResponse.json({ ok: true, sent, errors, total: pendientes.length })
}
