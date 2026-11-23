import {createClient} from "https://esm.sh/@supabase/supabase-js@2.49.1";
const db=createClient(Deno.env.get("SUPABASE_URL")!,Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,{auth:{persistSession:false}});
const headers={"Access-Control-Allow-Origin":"*","Access-Control-Allow-Headers":"content-type","Access-Control-Allow-Methods":"POST, OPTIONS","Content-Type":"application/json","Cache-Control":"no-store"};
const reply=(body:unknown,status=200)=>new Response(JSON.stringify(body),{status,headers});
async function digest(value:string){
  const bytes=await crypto.subtle.digest("SHA-256",new TextEncoder().encode(value));
  return Array.from(new Uint8Array(bytes),b=>b.toString(16).padStart(2,"0")).join("");
}
Deno.serve(async req=>{
  if(req.method==="OPTIONS")return new Response(null,{headers});
  if(req.method!=="POST")return reply({error:"Gebruik POST."},405);
  try{
    const {token,action,visible}=await req.json();
    if(typeof token!=="string"||!/^[a-f0-9]{48}$/.test(token))return reply({error:"Meld je aan bij Quest."},401);
    const {data:player,error}=await db.from("quest_students").select("id,class_id,quest_profile").eq("token_hash",await digest(token)).maybeSingle();
    if(error)throw error;
    if(!player)return reply({error:"Meld je aan bij Quest."},401);
    let joined=player.quest_profile?.expeditionVisible===true;
    if(action==="visibility"&&typeof visible==="boolean"){
      const saved=await db.rpc("quest_save_profile",{p_student:player.id,p_patch:{expeditionVisible:visible}});
      if(saved.error)throw saved.error;
      joined=visible;
    }else if(action!=="board")return reply({error:"Onbekende keuze."},400);
    if(!joined)return reply({joined:false,members:[]});
    const result=await db.from("quest_students").select("id,xp").eq("class_id",player.class_id).contains("quest_profile",{expeditionVisible:true}).order("xp",{ascending:false});
    if(result.error)throw result.error;
    const members=await Promise.all(result.data.map(async row=>{
      const code=await digest("quest-expeditie-"+row.id);
      const animal=["Otter","Valk","Vos","Reiger","Uil","Bever","Lynx","Das"][parseInt(code.slice(0,2),16)%8];
      return {alias:animal+" "+code.slice(2,6).toUpperCase(),xp:row.xp,mine:row.id===player.id};
    }));
    return reply({joined:true,members});
  }catch{return reply({error:"De expeditie is tijdelijk niet bereikbaar."},503)}
});