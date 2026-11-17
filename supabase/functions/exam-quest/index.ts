import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";
import { items, avatars, pass, avatarColors, legacyBackdrops, pirateRoll } from "./catalog.js";
import CE from "./ce.json" with { type: "json" };
import { gradeOpenAnswer } from "./open-review.js";
const reviewKey = Deno.env.get("OPENAI_API_KEY");
const URL= Deno.env.get("SUPABASE_URL")!;
const KEY= Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const db=createClient(URL,KEY,{auth:{persistSession:false}});
const Q=[["n1","H7","begrip","Wat is een delta?",["Een vertakte riviermonding","Een diepe polder","Een duinenrij","Een bergbeek"],0,"Bij de monding vertakt een rivier zich doordat de stroomsnelheid en sedimentatie veranderen."],["n2","H7","verklaren","Waarom ontstaan oeverwallen langs rivieren?",["Door uitspoeling van klei","Door afzetting van zwaarder zand bij overstromingen","Door het droogpompen van polders","Door opstuwing van zeewater"],1,"Bij een overstroming neemt de stroomsnelheid af en wordt grover materiaal het eerst afgezet."],["n3","H7","begrip","Welke polder ligt doorgaans het diepst onder NAP?",["Zeepolder","Veenpolder","Droogmakerij","Uiterwaard"],2,"Droogmakerijen zijn voormalige meren die zijn leeggepompt."],["n4","H7","toepassen","Waarom is bemaling nodig in laaggelegen polders?",["Om zout water te maken","Omdat het water niet vanzelf naar hoger gelegen afvoerwater stroomt","Omdat rivieren geen regenwater afvoeren","Om sedimentatie te versnellen"],1,"Een gemaal pompt water naar een hoger gelegen boezem of afvoerwater."],["n5","H7","begrip","Wat betekent kwel?",["Het verdampen van water","Het stromen van grondwater","Het afvoeren via een sluis","Het ontzilten van water"],1,"Kwel is stromend grondwater, soms onder een dijk door."],["n6","H7","begrip","Wat is de watervoetafdruk?",["Alleen kraanwater thuis","Het totale zoetwatergebruik voor consumptie en productie","De neerslag van een land","De hoeveelheid zout water in de zee"],1,"De watervoetafdruk omvat ook water gebruikt voor voedsel en producten."],["n7","H7","verklaren","Waarom is grondwater vaak gemakkelijker te zuiveren dan rivierwater?",["Grondwater is altijd zout","De bodem filtert tijdens infiltratie een deel van de verontreiniging","Er zitten nooit mineralen in grondwater","Rivierwater bevat geen zuurstof"],1,"De bodem heeft een filterende werking, al blijft behandeling soms nodig."],["n8","H7","toepassen","Wat helpt een rivier bij hoogwater meer ruimte te geven?",["Een nevengeul graven","Een uiterwaard bebouwen","Een winterdijk naar de rivier toe verplaatsen","Een krib verlengen"],0,"Een nevengeul vergroot de afvoercapaciteit bij hoogwater."],["n9","H7","begrip","Waarvoor is een winterdijk bedoeld?",["Water keren bij hoge rivierstand","Alleen water keren in de zomer","Schepen afremmen","Zoetwater ontzilten"],0,"De winterdijk beschermt het achterland bij hoge rivierwaterstanden."],["n10","H7","verklaren","Waarom koelt een elektriciteitscentrale gebruikt koelwater af vóór lozing?",["Om het zoutgehalte te verhogen","Omdat warm water minder zuurstof kan bevatten en ecologische schade kan geven","Om de rivier sneller te laten stromen","Om het debiet te meten"],1,"Thermische vervuiling vermindert de hoeveelheid opgeloste zuurstof."],["n11","H7","open","Leg uit waarom een nevengeul bij Nijmegen de overstromingskans verkleint.",null,null,"Door een extra geul kan bij hoogwater meer rivierwater worden afgevoerd; daardoor komt de waterstand minder hoog en daalt de kans op overstroming."],["n12","H7","open","Leg uit waarom zoet grondwater in de duinen boven zout grondwater ligt.",null,null,"Zoet water heeft een lagere dichtheid dan zout water; daardoor kan een zoetwaterzak boven zout grondwater aanwezig zijn."],["c1","H8","begrip","Wat is het stroomgebied van een rivier?",["Alleen de riviermonding","Al het gebied waarvan water naar die rivier en haar zijrivieren stroomt","De berg waar de rivier begint","Alleen de uiterwaarden"],1,"Een stroomgebied omvat het hele gebied dat afwatert op een rivier."],["c2","H8","begrip","Hoe noem je de grens tussen twee stroomgebieden?",["Oeverwal","Waterscheiding","Winterdijk","Boezem"],1,"Een waterscheiding scheidt twee gebieden waarvan het water naar verschillende rivieren stroomt."],["c3","H8","begrip","Wat is debiet?",["De hoeveelheid water die per seconde passeert","De diepte van een rivier","De breedte van een rivier","De jaarlijkse neerslag"],0,"Debiet wordt meestal uitgedrukt in kubieke meters per seconde (m³/s)."],["c4","H8","begrip","Wat betekent het regiem van een rivier?",["De jaarschommelingen in waterafvoer","De gemiddelde breedte van de rivier","De hoogte van het gebergte","De hoeveelheid vervoerde goederen"],0,"Regiem beschrijft hoe de afvoer door het jaar heen varieert."],["c5","H8","toepassen","Een rivier wordt gevoed door zowel regen als smeltwater. Welke soort is dit?",["Regenrivier","Gletsjerrivier","Gemengde rivier","Wadi"],2,"Een gemengde rivier krijgt water uit neerslag en smeltende sneeuw of ijs."],["c6","H8","verklaren","Waarom ligt de bovenloop van een rivier vaak in gebergte?",["Daar is het verval groot","Daar is het water altijd zout","Daar zijn geen zijrivieren","Daar zijn altijd polders"],0,"De bovenloop ligt hoog en heeft doorgaans een groot verval."],["c7","H8","begrip","Welke functie kan een stuwdam in China hebben?",["Water opslaan en elektriciteit opwekken","Zeezout produceren","Tornado's afremmen","De waterscheiding verplaatsen"],0,"Een stuwmeer kan water vasthouden en waterkrachtcentrales voeden."],["c8","H8","verklaren","Waarom kan een stuwdam nadelig zijn voor landbouw stroomafwaarts?",["De rivier krijgt daar altijd méér sediment","Er kan minder water en sediment benedenstrooms aankomen","De rivier wordt benedenstrooms een oceaan","Alle grondwater verdampt"],1,"Een stuwdam verandert de waterafvoer en houdt vaak sediment tegen."],["c9","H8","begrip","Wat is piekafvoer?",["Het laagste debiet van een jaar","De hoogste afvoer tijdens een periode","De totale regenval van een maand","De snelheid van verdamping"],1,"Piekafvoer is de hoogste waterafvoer van een rivier."],["c10","H8","begrip","Wat is infiltratie?",["Water dat in de bodem wegzakt","Water dat in de atmosfeer condenseert","Water dat een dam passeert","Water dat ontzilt wordt"],0,"Neerslag vult via infiltratie het grondwater aan."],["c11","H8","open","Leg uit waarom een rivier na zware regenval een hogere piekafvoer kan krijgen.",null,null,"Door veel regen stroomt meer water via afstroming en zijrivieren naar de rivier, waardoor het debiet tijdelijk sterk stijgt."],["c12","H8","open","Noem twee voordelen en één nadeel van een stuwdam voor China.",null,null,"Mogelijke voordelen: hydro-elektriciteit, wateropslag, hoogwaterbeheersing en irrigatie. Nadelen: gedwongen verhuizing, tegenhouden sediment, natuurschade."],["m1","H9","begrip","Wat is fossiel water?",["Pas gevallen regen","Oud grondwater uit een nattere klimaatperiode","Water uit zeewier","Bevroren rivierwater"],1,"Fossiel water is vaak duizenden jaren oud en wordt zeer langzaam aangevuld."],["m2","H9","begrip","Wat is een wadi?",["Een rivierbedding die meestal droog staat","Een dam in de oceaan","Een zoetwaterzak onder de duinen","Een permanente gletsjerrivier"],0,"Een wadi voert alleen gedurende een deel van het jaar water."],["m3","H9","toepassen","Welke irrigatievorm gebruikt doorgaans het zuinigst water direct bij planten?",["Oppervlakte-irrigatie","Druppelirrigatie","Beregening","Overstromingsirrigatie"],1,"Druppelirrigatie voert water gericht naar de wortels en beperkt verdamping."],["m4","H9","begrip","Wat is ontzilting?",["Zout water omzetten in zoet water","Zoet water in zout water veranderen","Regenwater laten infiltreren","Een rivier uitbaggeren"],0,"Bij ontzilting wordt zout uit water gehaald, bijvoorbeeld voor drinkwater."],["m5","H9","verklaren","Waarom is ontzilting vooral haalbaar in rijke Golfstaten?",["Er valt altijd veel regen","Het kost veel energie en geld","Er komen geen steden voor","Ze hebben geen kust"],1,"Ontzilting is doorgaans energie-intensief en duur."],["m6","H9","begrip","Wat betekent een internationale rivier?",["Een rivier die door meer dan één land stroomt","Een rivier in een grote stad","Een rivier die alleen in de zomer stroomt","Een rivier onder de grond"],0,"De Eufraat en Tigris zijn voorbeelden van internationale rivieren."],["m7","H9","verklaren","Waarom kan de aanleg van stuwdammen in Turkije tot waterconflicten leiden?",["Benedenstroomse landen kunnen minder rivierwater ontvangen","De zee wordt onmiddellijk zoet","De rivier gaat terug omhoog stromen","Er valt meer regen in alle landen"],0,"Landen stroomafwaarts zijn afhankelijk van de hoeveelheid water die wordt doorgelaten."],["m8","H9","toepassen","Waarom raakt fossiel water bij langdurige grootschalige winning uitgeput?",["Omdat het nauwelijks wordt aangevuld","Omdat het ieder jaar opnieuw bevriest","Omdat het direct in zeewater verandert","Omdat een stuwdam het grondwater tegenhoudt"],0,"Fossiel grondwater is ontstaan onder vroegere, nattere omstandigheden."],["m9","H9","begrip","Waarvoor wordt in droge gebieden vaak het meeste water gebruikt?",["Landbouw","Straatverlichting","Scheepvaart","Datacenters"],0,"Irrigatielandbouw gebruikt in veel droge gebieden een groot deel van het beschikbare zoetwater."],["m10","H9","verklaren","Waardoor kan irrigatie in een warm, droog gebied leiden tot verzilting?",["Water verdampt terwijl opgeloste zouten achterblijven","Zout verdampt sneller dan water","Door irrigatie valt er altijd sneeuw","Grondwater bevat nooit zout"],0,"Bij veel verdamping kunnen zouten in de bodem achterblijven en zich ophopen."],["m11","H9","open","Leg uit waarom de bouw van een stuwdam in de Eufraat gevolgen kan hebben voor boeren in Syrië.",null,null,"Als stroomopwaarts water wordt vastgehouden, komt stroomafwaarts minder water beschikbaar voor irrigatie; daardoor kunnen oogsten afnemen."],["m12","H9","open","Leg uit waarom druppelirrigatie in het Midden-Oosten vaak zuiniger is dan oppervlakte-irrigatie.",null,null,"Druppelirrigatie brengt kleine hoeveelheden water direct bij de wortels; daardoor gaat minder water verloren door verdamping en wegstroming."],["h7_open_01","H7","verklaren","Leg uit hoe een rivierdelta ontstaat. Gebruik de begrippen stroomsnelheid en sedimentatie.",null,null,"Bij de monding neemt de stroomsnelheid af. Daardoor wordt zand en klei afgezet (sedimentatie). Geulen kunnen dichtslibben, waarna het water een nieuwe vertakking zoekt."],["h7_open_02","H7","verklaren","Verklaar waarom komgronden lager liggen dan oeverwallen.",null,null,"Bij overstromingen wordt grover zand vlak langs de rivier afgezet. Fijnere klei bezinkt pas verderop, waardoor oeverwallen hoger worden dan komgronden."],["h7_open_03","H7","verklaren","Leg uit waardoor veenpolders door ontwatering kunnen inklinken.",null,null,"Door drainage daalt het grondwater. Veen droogt uit, krimpt en verteert onder invloed van zuurstof. Daardoor daalt de bodem."],["h7_open_04","H7","verklaren","Waarom hebben droogmakerijen vaak gemalen nodig? Leg je antwoord uit.",null,null,"Droogmakerijen liggen vaak meerdere meters onder NAP. Overtollig water kan niet vanzelf naar het hogere afvoerwater stromen en moet omhoog worden gepompt."],["h7_open_05","H7","verklaren","Noem twee verschillen tussen een zomerdijk en een winterdijk.",null,null,"Een zomerdijk ligt dichter bij de rivier, is lager en keert water bij normale of lagere hoge waterstanden. De winterdijk ligt verder van de rivier, is hoger en beschermt het achterland bij zeer hoog water."],["h7_open_06","H7","verklaren","Leg uit hoe een nevengeul de veiligheid langs een rivier vergroot.",null,null,"Bij hoogwater kan het water ook via de nevengeul wegstromen. Door de grotere afvoercapaciteit stijgt de rivierwaterstand minder hoog, zodat de overstromingskans afneemt."],["h7_open_07","H7","verklaren","Noem twee manieren waarop een polder water kan afvoeren en leg uit wanneer ze worden gebruikt.",null,null,"Bij voldoende hoogteverschil en laag buitenwater kan water via een sluis wegstromen. Als het buitenwater hoger staat of de polder laag ligt, pompt een gemaal het water omhoog."],["h7_open_08","H7","verklaren","Leg uit waarom de duinen een belangrijke plek zijn voor drinkwaterwinning.",null,null,"Regenwater infiltreert gemakkelijk in doorlatend duinzand. Zo kan een voorraad zoet grondwater ontstaan die boven het zoutere grondwater ligt."],["h7_open_09","H7","verklaren","Verklaar waarom drinkwaterwinning uit oppervlaktewater meer zuiveringsstappen nodig kan hebben dan winning uit grondwater.",null,null,"Oppervlaktewater is vaker blootgesteld aan ziekteverwekkers en vervuilende stoffen. Grondwater is tijdens infiltratie deels natuurlijk gefilterd, hoewel ook dit water controle en behandeling nodig heeft."],["h7_open_10","H7","verklaren","Leg uit wat de waterkringloop te maken heeft met de aanvulling van grondwater.",null,null,"Water verdampt en condenseert tot neerslag. Een deel van die neerslag infiltreert in de bodem en vult het grondwater aan."],["h7_open_11","H7","verklaren","Noem twee doelen van het Nationaal Deltaprogramma en leg één bijbehorende maatregel uit.",null,null,"Doelen zijn bescherming tegen overstromingen, beperken van wateroverlast en voldoende zoetwater in droge perioden. Bijvoorbeeld: een dijk versterken of een rivier meer ruimte geven verkleint het overstromingsrisico."],["h7_open_12","H7","verklaren","Een leerling zegt: ‘Als een uiterwaard overstroomt, is dat altijd een ramp.’ Leg uit waarom die uitspraak niet klopt.",null,null,"Uiterwaarden zijn juist bedoeld om bij hoogwater tijdelijk water op te vangen. Dat geeft de rivier meer ruimte en verlaagt de kans op overstroming van het gebied achter de winterdijk."],["h8_open_01","H8","verklaren","Leg uit hoe het regiem van een gemengde rivier wordt beïnvloed door regen en smeltwater.",null,null,"De afvoer varieert door het jaar: regen zorgt voor hogere afvoer in natte perioden en smeltwater kan voor extra afvoer zorgen wanneer sneeuw en ijs smelten."],["h8_open_02","H8","verklaren","Waarom kan ontbossing in een stroomgebied tot een hogere piekafvoer leiden?",null,null,"Er wordt minder regenwater door planten vastgehouden en minder water infiltreert. Meer water stroomt snel naar de rivier en de piekafvoer kan toenemen."],["h8_open_03","H8","verklaren","Leg uit waarom een stuwmeer geschikt kan zijn om elektriciteit op te wekken.",null,null,"Een stuwdam houdt water op hoogte vast. Als water naar beneden langs turbines stroomt, wordt bewegingsenergie omgezet in elektriciteit."],["h8_open_04","H8","verklaren","Noem twee voordelen en twee nadelen van de aanleg van een grote stuwdam.",null,null,"Voordelen: elektriciteitsopwekking, wateropslag, hoogwaterbeheersing of irrigatie. Nadelen: bewoners moeten verhuizen, leefgebieden overstromen, sediment wordt tegengehouden of er ontstaat ecologische schade."],["h8_open_05","H8","verklaren","Waarom kan sedimentatie stroomafwaarts veranderen na de aanleg van een stuwdam?",null,null,"In het stuwmeer wordt de stroomsnelheid lager, zodat sediment bezinkt. Daardoor vervoert de rivier benedenstrooms minder zand en slib."],["h8_open_06","H8","verklaren","Leg uit hoe sterk verstedelijkte gebieden kunnen bijdragen aan een hoge piekafvoer.",null,null,"Veel oppervlakken zijn verhard, waardoor neerslag minder infiltreert en sneller via straten en afvoerkanalen in de rivier terechtkomt."],["h8_open_07","H8","verklaren","Wat is het verschil tussen een stroomgebied en een waterscheiding?",null,null,"Een stroomgebied is het gebied dat afwatert op één rivier en haar zijrivieren. Een waterscheiding is de grens tussen twee stroomgebieden."],["h8_open_08","H8","verklaren","Waarom is het verval van een rivier meestal groter in de bovenloop dan in de benedenloop?",null,null,"De bovenloop ligt vaak in steil gebergte met grote hoogteverschillen. Bij de vlakke benedenloop dicht bij zee is het verval doorgaans klein."],["h8_open_09","H8","verklaren","Leg uit waarom een stuwdam zowel droogteproblemen als overstromingsgevaar kan verminderen.",null,null,"In een natte periode kan water worden opgeslagen waardoor minder water direct benedenstrooms stroomt. In een droge periode kan opgeslagen water gecontroleerd worden doorgelaten."],["h8_open_10","H8","verklaren","Leg uit waarom een groot stuwmeer ook gevolgen kan hebben voor mensen die bovenstrooms wonen.",null,null,"Een groot gebied komt onder water te staan. Huizen, landbouwgrond en infrastructuur kunnen verdwijnen, waardoor bewoners moeten verhuizen."],["h8_open_11","H8","verklaren","Noem twee factoren die in een stroomgebied de snelheid van afstroming bepalen.",null,null,"Bijvoorbeeld hellingshoek/reliëf, doorlaatbaarheid van de bodem, begroeiing, bodemverzadiging en verharding."],["h8_open_12","H8","verklaren","Een rivier voert in de natte zomermaanden veel meer water af dan in droge wintermaanden. Leg uit hoe neerslagverdeling het regiem verklaart.",null,null,"Door meer neerslag komt in de zomer meer water via directe afstroming en zijrivieren in de hoofdrivier. In de droge winter is de watertoevoer kleiner, dus het debiet lager."],["h9_open_01","H9","verklaren","Leg uit waarom waterschaarste in het Midden-Oosten niet alleen wordt veroorzaakt door weinig neerslag.",null,null,"Ook hoge verdamping, groei van de bevolking, landbouw met veel irrigatie, vervuiling en ongelijke verdeling van water versterken waterschaarste."],["h9_open_02","H9","verklaren","Waarom kan fossiel grondwater een niet-duurzame watervoorraad zijn?",null,null,"Het is zeer oud grondwater dat bij het huidige droge klimaat nauwelijks wordt aangevuld. Bij snelle winning daalt de voorraad totdat deze uitgeput raakt."],["h9_open_03","H9","verklaren","Leg uit waarom druppelirrigatie water bespaart ten opzichte van oppervlakte-irrigatie.",null,null,"Kleine hoeveelheden water worden gericht bij de plantenwortels gebracht. Daardoor verdampt of stroomt minder water weg dan bij het onder water zetten van akkers."],["h9_open_04","H9","verklaren","Waarom kan beregening in een heet, droog gebied relatief veel water verspillen?",null,null,"Een deel van het sproeiwater verdampt voordat het de bodem of plantenwortels bereikt. Wind kan het water daarnaast verspreiden."],["h9_open_05","H9","verklaren","Leg uit hoe langdurige irrigatie in een droog gebied tot verzilting van landbouwgrond kan leiden.",null,null,"Irrigatiewater bevat opgeloste zouten. Het water verdampt in het hete klimaat, maar het zout blijft in de bodem achter en kan zich ophopen."],["h9_open_06","H9","verklaren","Waarom is ontzilting geen vanzelfsprekende oplossing voor ieder land met waterschaarste?",null,null,"Ontziltingsinstallaties vereisen grote investeringen en energie. Ook moet het geconcentreerde zoute restwater verantwoord worden verwerkt."],["h9_open_07","H9","verklaren","Leg uit waarom een bovenstrooms gelegen land invloed heeft op de watervoorziening in een benedenstrooms gelegen land.",null,null,"Het bovenstroomse land kan water vasthouden in stuwmeren of gebruiken voor irrigatie. Dan bereikt minder water het benedenstroomse land."],["h9_open_08","H9","verklaren","Wat wordt bedoeld met een waterconflict? Geef een voorbeeld van een belangentegenstelling.",null,null,"Een waterconflict is onenigheid over gebruik of verdeling van water. Bijvoorbeeld: het ene land wil veel water opslaan in een dam, terwijl een ander land stroomafwaarts dat water nodig heeft voor landbouw."],["h9_open_09","H9","verklaren","Leg uit waarom een rivier-oase ook in een droog klimaat kan bestaan.",null,null,"De rivier voert water aan uit een natter stroomopwaarts gebied. Daardoor is lokaal water beschikbaar ondanks de geringe neerslag."],["h9_open_10","H9","verklaren","Noem twee maatregelen waarmee een droog land de vraag naar zoet water kan verminderen.",null,null,"Bijvoorbeeld druppelirrigatie, hergebruik van gezuiverd afvalwater, minder waterintensieve gewassen of het repareren van lekkende leidingen."],["h9_open_11","H9","verklaren","Waarom kan snelle bevolkingsgroei leiden tot meer watertekort?",null,null,"Meer mensen hebben drinkwater, voedsel en voorzieningen nodig. Daardoor stijgt de vraag naar zoet water terwijl het beschikbare aanbod niet evenredig groeit."],["h9_open_12","H9","verklaren","Stel: landbouwgrond wordt steeds zouter. Noem een mogelijke oorzaak en een passende maatregel.",null,null,"Oorzaak: sterke verdamping van irrigatiewater met achterblijvende zouten. Maatregel: efficiëntere irrigatie en goede drainage, eventueel met doorspoelen als voldoende geschikt water beschikbaar is."]];
Q.push(...CE);
const riverRoutes=[
  ["Waar stroomt een rivier vanaf de bron naartoe?",["Stroomafwaarts","Stroomopwaarts"],0],
  ["Welke maatregel geeft de rivier meer ruimte?",["Uiterwaard bebouwen","Nevengeul graven"],1],
  ["Wat gebeurt er met zout als irrigatiewater verdampt?",["Het blijft achter","Het verdampt mee"],0],
];
const gameKey=crypto.subtle.importKey("raw",new TextEncoder().encode(KEY),{name:"HMAC",hash:"SHA-256"},false,["sign","verify"]);
const signGame=async data=>Array.from(new Uint8Array(await crypto.subtle.sign("HMAC",await gameKey,new TextEncoder().encode(data)))).map(n=>n.toString(16).padStart(2,"0")).join("");
const headers={"Access-Control-Allow-Origin":"*","Access-Control-Allow-Headers":"authorization, apikey, content-type","Access-Control-Allow-Methods":"POST,OPTIONS","Content-Type":"application/json"};
const output=(obj,status=200)=>new Response(JSON.stringify(obj),{status,headers});
const hash=async(x)=>Array.from(new Uint8Array(await crypto.subtle.digest("SHA-256",new TextEncoder().encode(x)))).map(v=>v.toString(16).padStart(2,"0")).join("");
const random=()=>Array.from(crypto.getRandomValues(new Uint8Array(24))).map(v=>v.toString(16).padStart(2,"0")).join("");
async function student(token){if(!token||token.length!==48)return null;const{data}=await db.from("quest_students").select("*").eq("token_hash",await hash(token)).maybeSingle();return data;}
async function teacher(token){if(!token)return false;const{data,error}=await db.auth.getUser(token);if(error||!data?.user)return false;const t=await db.from("energy_teachers").select("user_id").eq("user_id",data.user.id).maybeSingle();return !!t.data;}
function publicQ(q){return{id:q[0],chapter:q[1],skill:q[2],text:q[3],options:q[4],type:q[4]?"choice":"open",source:q[7]||null};}
Deno.serve(async(req)=>{
if(req.method==="OPTIONS")return new Response(null,{headers});
if(req.method!=="POST")return output({error:"Method not allowed"},405);
try{
const body=await req.json();const action=String(body.action||"");
if(action==="join"){
const name=String(body.name||"").trim().replace(/[^\p{L} '-]/gu,"").slice(0,32);
const code=String(body.code||"").trim().toUpperCase();
if(name.length<2||code.length<6)return output({error:"Vul je voornaam en klascode in."},400);
const cl=await db.from("quest_classes").select("id,label").eq("join_code",code).maybeSingle();
if(!cl.data)return output({error:"Klascode niet gevonden."},403);
const token=random();const x=await db.from("quest_students").insert({class_id:cl.data.id,first_name:name,token_hash:await hash(token)}).select("id,first_name,avatar,xp,coins,active_seconds").single();
if(x.error)return output({error:"Account kon niet worden aangemaakt."},500);
return output({token,student:x.data,className:cl.data.label});
}
if(action==="me"||action==="questions"||action==="answer"||action==="heartbeat"||action==="avatar"||action==="buy"||action==="profile"||action==="cosmetics"||action==="game-badge"||action==="game-start"||action==="open-review"){
const s=await student(String(body.token||""));if(!s)return output({error:"Sessie onbekend. Gebruik je persoonlijke herstelcode."},401);
if(action==="open-review"){
  if(!reviewKey)return output({error:"AI-nakijken is nog niet beschikbaar."},503);
  const question=Q.find(row=>row[0]===body.questionId&&!row[4]);
  if(!question)return output({error:"Kies een open vraag."},400);
  const answer=String(body.response??"").trim().slice(0,1400);
  if(!answer)return output({error:"Vul eerst een antwoord in."},400);
  const attempt=await db.from("quest_attempts").select("id,response")
    .eq("student_id",s.id).eq("question_id",question[0]).eq("response",answer)
    .is("is_correct",null).order("id",{ascending:false}).limit(1).maybeSingle();
  if(attempt.error)return output({error:"Antwoord kon niet worden opgehaald."},503);
  if(!attempt.data)return output({error:"Stuur je antwoord eerst in."},404);

  const slot=await db.rpc("quest_reserve_ai_review",{p_student:s.id,p_attempt:attempt.data.id});
  if(slot.error)return output({error:"AI-nakijken is tijdelijk niet beschikbaar."},503);
  if(slot.data?.status==="existing"&&slot.data.review)return output({review:slot.data.review});
  if(slot.data?.status==="limit")return output({error:"De limiet voor AI-feedback is bereikt. Probeer morgen opnieuw."},429);
  if(slot.data?.status!=="reserved")return output({error:"Dit antwoord is al aangeboden ter beoordeling."},409);

  try{
    const maxPoints=Number(question[7]?.points)||2;
    const review=await gradeOpenAnswer({
      key:reviewKey,question:question[3],rubric:question[6],answer:attempt.data.response,maxPoints
    });
    const saved=await db.from("quest_ai_reviews").update({review}).eq("attempt_id",attempt.data.id).eq("student_id",s.id);
    if(saved.error)throw new Error("Review could not be saved");
    return output({review});
  }catch{
    return output({error:"AI kon dit antwoord niet nakijken. Je antwoord is opgeslagen."},503);
  }
}
if(action==="questions")return output({questions:Q.map(publicQ)});
if(action==="me"){
const [a,p,r,grades]=await Promise.all([
  db.from("quest_attempts").select("question_id,is_correct,awarded_xp,created_at").eq("student_id",s.id).order("created_at",{ascending:false}).order("id",{ascending:false}).limit(600),
  db.from("quest_purchases").select("item_id").eq("student_id",s.id),
  db.from("quest_rewards").select("question_id").eq("student_id",s.id),
  reviewKey ? db.from("quest_ai_reviews").select("review,quest_attempts(question_id)")
    .eq("student_id",s.id).not("review","is",null).order("attempt_id",{ascending:false}).limit(240) : null
]);
if(a.error||p.error||r.error)return output({error:"Voortgang kon niet worden geladen."},503);
const solved=r.data.map(x=>x.question_id);
const reviews=Object.create(null);
for(const grade of grades?.data||[]){
  const questionId=grade.quest_attempts?.question_id;
  if(questionId&&!(questionId in reviews))reviews[questionId]=grade.review;
}
return output({student:{id:s.id,first_name:s.first_name,avatar:s.avatar,xp:s.xp,coins:s.coins,active_seconds:s.active_seconds,cosmetics:{...(s.cosmetics||{}),...(s.quest_profile||{})}},attempts:a.data,purchases:p.data.map(x=>x.item_id),profile:{...(s.cosmetics||{}),...(s.quest_profile||{})},solved,reviews,pirate:solved.some(id=>pirateRoll(s.id,id))});
}
if(action==="heartbeat"){
const now=Date.now(),before=s.last_heartbeat?new Date(s.last_heartbeat).getTime():0;
const credit=before?Math.max(0,Math.min(30,Math.floor((now-before)/1000))):0;
await db.from("quest_students").update({active_seconds:s.active_seconds+credit,last_heartbeat:new Date(now).toISOString(),last_seen:new Date(now).toISOString()}).eq("id",s.id);
return output({ok:true});
}
if(action==="avatar"){
  const avatar=String(body.avatar||"");
  if(!Object.hasOwn(avatars,avatar))return output({error:"Onbekende avatar"},400);
  const {error}=await db.from("quest_students").update({avatar}).eq("id",s.id);
  return error ? output({error:"Avatar kon niet worden opgeslagen"},500) : output({ok:true});
}
if(action==="buy"){
  const id=String(body.item||"");
  if(!Object.hasOwn(items,id))return output({error:"Dit winkelartikel bestaat niet."},400);
  const bought=await db.rpc("quest_purchase",{p_student:s.id,p_item:id,p_cost:items[id].price});
  if(bought.error||!bought.data)return output({error:"Je bezit dit item al of hebt onvoldoende coins."},400);
  return output({ok:true});
}
if(action==="profile"||action==="cosmetics"){
  const patch=body.patch;
  if(!patch||typeof patch!=="object")return output({error:"Ongeldige profielwijziging."},400);
  const owned=await db.from("quest_purchases").select("item_id").eq("student_id",s.id);
  if(owned.error)return output({error:"Collectie kon niet worden geladen."},503);
  const unlocked=new Map([
    ...owned.data.filter(x=>Object.hasOwn(items,x.item_id)).map(x=>[x.item_id,items[x.item_id]]),
    ...pass.filter(x=>s.xp>=x.xp).map(x=>[x.id,x]),
  ]);
  const updates={};
  if(Object.hasOwn(patch,"color")){
    if(!Object.hasOwn(avatarColors,patch.color))return output({error:"Onbekende avatarkleur."},400);
    updates.color=patch.color;
  }
  if(action==="cosmetics"&&Object.hasOwn(patch,"badges")){
    const {count}=await db.from("quest_rewards").select("question_id",{count:"exact",head:true}).eq("student_id",s.id);
    if(!Number.isInteger(patch.badges)||patch.badges<0||patch.badges>Math.floor((count||0)/3))return output({error:"Nog geen badge beschikbaar."},400);
    updates.badges=patch.badges;
  }
  if(Object.hasOwn(patch,"bg")){
    const id=String(patch.bg||"");
    if(id && unlocked.get(id)?.slot!=="background" && !(unlocked.has(id)&&Object.hasOwn(legacyBackdrops,id)))return output({error:"Achtergrond is vergrendeld."},400);
    updates.bg=id;
  }
  if(Object.hasOwn(patch,"gear")){
    const gear=patch.gear;
    if(!Array.isArray(gear)||gear.length>6||new Set(gear.map(id=>unlocked.get(id)?.slot)).size!==gear.length||
       gear.some(id=>!unlocked.has(id)||unlocked.get(id).slot==="background"))return output({error:"Uitrusting is vergrendeld of gebruikt hetzelfde vak."},400);
    updates.gear=gear;
  }
  const saved=await db.rpc("quest_save_profile",{p_student:s.id,p_patch:updates});
  return saved.error ? output({error:"Profiel kon niet worden opgeslagen."},500) : output({profile:saved.data,cosmetics:{...(s.cosmetics||{}),...saved.data}});
}
if(action==="game-start"||action==="game-badge"){
  const game=String(body.game||"");
  if(!["memory","river"].includes(game))return output({error:"Onbekende minigame."},400);
  if(action==="game-start"){
    const {count,error}=await db.from("quest_rewards").select("question_id",{count:"exact",head:true}).eq("student_id",s.id);
    if(error)return output({error:"Voortgang kon niet worden geladen."},503);
    if(count<3)return output({error:"Maak eerst drie verschillende vragen goed."},400);
    const rounds=game==="memory"?[3,4,5].map(length=>Array.from(crypto.getRandomValues(new Uint8Array(length)),n=>n%4)):null;
    const rules=btoa(JSON.stringify({game,rounds,until:Date.now()+15*60*1000}));
    return output({rules,signature:await signGame(s.id+":"+rules),rounds,
      routes:game==="river"?riverRoutes.map(([question,options])=>({question,options})):null});
  }
  const rules=String(body.rules||"");
  const signature=String(body.signature||"");
  if(rules.length>512||!/^[0-9a-f]{64}$/.test(signature))return output({error:"Start eerst een nieuwe minigame."},400);
  const valid=await crypto.subtle.verify("HMAC",await gameKey,Uint8Array.from(signature.match(/../g),hex=>parseInt(hex,16)),new TextEncoder().encode(s.id+":"+rules));
  if(!valid)return output({error:"Start eerst een nieuwe minigame."},400);
  const run=JSON.parse(atob(rules));
  const expected=game==="memory"?run.rounds:riverRoutes.map(route=>route[2]);
  if(run.game!==game||run.until<Date.now()||JSON.stringify(body.answers)!==JSON.stringify(expected))return output({error:"De route klopt niet of de minigame is verlopen."},400);
  const saved=await db.rpc("quest_save_profile",{p_student:s.id,p_patch:{["badge_"+game]:true}});
  return saved.error ? output({error:"Badge kon niet worden opgeslagen."},500) : output({profile:saved.data});
}
if(action==="answer"){
const id=String(body.questionId||""),q=Q.find(x=>x[0]===id);if(!q)return output({error:"Vraag bestaat niet"},400);
const response=String(body.response??"").trim().slice(0,1400);
if(!response)return output({error:"Vul eerst een antwoord in"},400);
const correct=q[4] ? /^[0-5]$/.test(response)&&Number(response)===q[5] : null;
const saved=await db.rpc("quest_record_answer",{p_student:s.id,p_question:id,p_topic:q[1],p_skill:q[2],p_response:response,p_correct:correct});
if(saved.error)return output({error:"Opslaan niet gelukt"},500);
if(saved.data===-1)return output({error:"Wacht even en probeer opnieuw."},429);
return output({correct,awarded:saved.data,explanation:q[6],correctOption:q[5],selfCheck:!q[4],aiReviewAvailable:!q[4]&&Boolean(reviewKey)});
}}
if(action==="teacher"){
const auth=String(req.headers.get("authorization")||"").replace(/^Bearer /i,"");
if(!await teacher(auth))return output({error:"Geen docenttoegang"},403);
const classes=await db.from("quest_classes").select("id,label,join_code");
const studs=await db.from("quest_students").select("id,first_name,class_id,avatar,xp,coins,active_seconds,last_seen,created_at").order("first_name");
const attempts=await db.from("quest_attempts").select("student_id,question_id,topic,skill,response,is_correct,created_at").order("created_at",{ascending:false}).limit(4000);
return output({classes:classes.data||[],students:studs.data||[],attempts:attempts.data||[],questionCount:Q.length});
}
return output({error:"Onbekende actie"},400);
}catch(e){console.error(e);return output({error:"Serverfout. Probeer het opnieuw."},500);}
});
