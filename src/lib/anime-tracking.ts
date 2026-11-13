import { supabase } from "@/integrations/supabase/client";
export const WATCH_STATUSES=["Not Started","Watching","Completed","On Hold","Dropped"] as const;
export type WatchStatus=typeof WATCH_STATUSES[number];
export interface AnimeProgress { user_id:string; installment_id:number; franchise_id:number; status:WatchStatus; episodes_watched:number; completed_at:string|null; updated_at:string }
export interface AnimeFavorite { franchise_id:number; created_at:string }
export function validateProgress(p:Pick<AnimeProgress,"status"|"episodes_watched">,episodes:number|null) {
 if(!WATCH_STATUSES.includes(p.status)||!Number.isInteger(p.episodes_watched)||p.episodes_watched<0||(episodes!==null&&p.episodes_watched>episodes)) throw new Error("Choose a valid status and episode count.");
}
export function franchiseProgress(ids:readonly number[],progress:readonly AnimeProgress[]) {
 const tracked=progress.filter(p=>ids.includes(p.installment_id));
 const completed=tracked.filter(p=>p.status==="Completed").length;
 const status:WatchStatus=completed===ids.length&&ids.length>0?"Completed":tracked.some(p=>p.status==="Watching")?"Watching":tracked.some(p=>p.status==="On Hold")?"On Hold":tracked.some(p=>p.status==="Dropped")?"Dropped":completed>0?"Watching":"Not Started";
 return {status,completed,total:ids.length,percent:ids.length?Math.round(completed/ids.length*100):0};
}
export async function loadAnimeTracking(uid:string) {
 const [p,f]=await Promise.all([supabase.from("anime_installment_progress").select("*").eq("user_id",uid),supabase.from("anime_franchise_favorites").select("franchise_id,created_at").eq("user_id",uid)]);
 if(p.error)throw p.error;if(f.error)throw f.error;
 return {progress:(p.data??[]) as AnimeProgress[],favorites:f.data??[]};
}
export async function saveAnimeProgress(uid:string,franchiseId:number,installmentId:number,status:WatchStatus,watched:number,episodes:number|null) {
 validateProgress({status,episodes_watched:watched},episodes);
 const {error}=await supabase.from("anime_installment_progress").upsert({user_id:uid,franchise_id:franchiseId,installment_id:installmentId,status,episodes_watched:watched,completed_at:status==="Completed"?new Date().toISOString():null,updated_at:new Date().toISOString()},{onConflict:"user_id,installment_id"});if(error)throw error;
}
export async function toggleAnimeFavorite(uid:string,id:number,favorite:boolean) {
 const result=favorite?await supabase.from("anime_franchise_favorites").upsert({user_id:uid,franchise_id:id},{onConflict:"user_id,franchise_id"}):await supabase.from("anime_franchise_favorites").delete().eq("user_id",uid).eq("franchise_id",id);
 if(result.error)throw result.error;
}
