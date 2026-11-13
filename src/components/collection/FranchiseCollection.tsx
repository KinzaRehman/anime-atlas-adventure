import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { useQuery,useMutation,useQueryClient } from "@tanstack/react-query";
import { Heart,Search,BookOpen,Play,Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog,DialogContent,DialogHeader,DialogTitle,DialogDescription } from "@/components/ui/dialog";
import { ANIME_CATALOGUE,ANIME_METADATA,ANIME_GENRES,filterAnime,type CatalogueAnime } from "@/data/anime-catalogue";
import { useUser } from "@/lib/session";
import { loadAnimeTracking,saveAnimeProgress,toggleAnimeFavorite,franchiseProgress,WATCH_STATUSES,type AnimeProgress,type WatchStatus } from "@/lib/anime-tracking";
const TABS=["Discover Anime","My Collection","Currently Watching","Completed","Favorites"];
export function FranchiseCollection() {
 const user=useUser(),qc=useQueryClient();
 const [tab,setTab]=useState(TABS[0]),[query,setQuery]=useState(""),[genre,setGenre]=useState("All"),[year,setYear]=useState("All"),[format,setFormat]=useState("All"),[status,setStatus]=useState("All"),[sort,setSort]=useState("Alphabetical"),[selected,setSelected]=useState<CatalogueAnime|null>(null);
 const tracking=useQuery({queryKey:["anime-tracking",user?.id],queryFn:()=>user?loadAnimeTracking(user.id):Promise.resolve({progress:[],favorites:[]}),enabled:!!user});
 const progress=tracking.data?.progress??[],favorites=tracking.data?.favorites??[];
 const refresh=()=>qc.invalidateQueries({queryKey:["anime-tracking"]});
 const favorite=useMutation({mutationFn:async (a:CatalogueAnime)=>{if(!user)throw new Error("Sign in to save favorites.");await toggleAnimeFavorite(user.id,a.franchiseId,!favorites.some(f=>f.franchise_id===a.franchiseId));},onSuccess:refresh});
 const available=filterAnime(query,genre).filter(a=>{
  const p=franchiseProgress(a.installmentIds,progress),owned=progress.some(p=>p.franchise_id===a.franchiseId),liked=favorites.some(f=>f.franchise_id===a.franchiseId);
  return (year==="All"||String(a.metadata?.seasonYear??a.metadata?.startDate.year)===year)&&(format==="All"||a.metadata?.format===format)&&(status==="All"||p.status===status)&&(tab!=="My Collection"||owned||liked)&&(tab!=="Currently Watching"||p.status==="Watching")&&(tab!=="Completed"||p.status==="Completed")&&(tab!=="Favorites"||liked);
 }).sort((a,b)=>{
  if(sort==="Rating")return (b.metadata?.averageScore??-1)-(a.metadata?.averageScore??-1);
  if(sort==="Popularity")return (b.metadata?.popularity??-1)-(a.metadata?.popularity??-1);
  if(sort==="Release date")return (b.metadata?.startDate.year??0)-(a.metadata?.startDate.year??0);
  if(sort==="Recently added") {const latest=(id:number)=>Math.max(0,...progress.filter(p=>p.franchise_id===id).map(p=>Date.parse(p.updated_at)),...favorites.filter(f=>f.franchise_id===id).map(f=>Date.parse(f.created_at)));return latest(b.franchiseId)-latest(a.franchiseId);}
  return a.title.localeCompare(b.title);
 });
 const years=[...new Set(ANIME_CATALOGUE.map(a=>a.metadata?.seasonYear??a.metadata?.startDate.year).filter(Boolean))].sort((a,b)=>Number(b)-Number(a));
 return <section className="mt-8 border-t border-border pt-8">
  <header className="flex flex-wrap items-end justify-between gap-4"><div><p className="text-xs font-semibold uppercase text-primary">The anime atlas</p><h2 className="mt-1 text-3xl font-bold">Discover your next story</h2><p className="mt-2 text-sm text-muted-foreground">100 curated franchises · AniList metadata</p></div>{!user&&<Button asChild variant="outline"><Link to="/auth" search={{redirect:"/collection"}}>Sign in to track anime</Link></Button>}</header>
  <div className="mt-5 flex flex-wrap gap-2" role="tablist" aria-label="Collection views">{TABS.map(t=><Button key={t} role="tab" aria-selected={tab===t} variant={tab===t?"default":"outline"} onClick={()=>setTab(t)}>{t}</Button>)}</div>
  <div className="mt-5 grid gap-3 sm:grid-cols-3 lg:grid-cols-6"><label className="relative sm:col-span-3 lg:col-span-2"><Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground"/><Input aria-label="Search franchises" placeholder="Title or alternative title" className="pl-9" value={query} onChange={e=>setQuery(e.target.value)}/></label>{[
   {label:"Genre",value:genre,set:setGenre,options:["All",...ANIME_GENRES]},
   {label:"Release year",value:year,set:setYear,options:["All",...years.map(String)]},
   {label:"Anime type",value:format,set:setFormat,options:["All",...new Set(ANIME_CATALOGUE.map(a=>a.metadata?.format??"Unknown"))]},
   {label:"Watch status",value:status,set:setStatus,options:["All",...WATCH_STATUSES]},
  ].map(f=><label key={f.label} className="min-w-0 text-xs text-muted-foreground">{f.label}<select aria-label={f.label} className="mt-1 h-10 w-full rounded-md border border-input bg-background px-2 text-sm text-foreground" value={f.value} onChange={e=>f.set(e.target.value)}>{f.options.map(o=><option key={o}>{o}</option>)}</select></label>)}</div>
  <div className="mt-4 flex items-center justify-between gap-3"><p className="text-sm text-muted-foreground">{available.length} franchises</p><select aria-label="Sort anime" className="max-w-44 rounded-md border border-input bg-background p-2 text-sm" value={sort} onChange={e=>setSort(e.target.value)}>{["Alphabetical","Popularity","Rating","Release date","Recently added"].map(s=><option key={s}>{s}</option>)}</select></div>
  {(tracking.error||favorite.error)&&<p role="alert" className="mt-3 text-destructive">Couldn’t save or load your collection. <Button variant="ghost" onClick={()=>tracking.refetch()}>Retry</Button></p>}
  <div className="mt-5 grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4">{available.map(a=>{
   const p=franchiseProgress(a.installmentIds,progress),m=a.metadata,liked=favorites.some(f=>f.franchise_id===a.franchiseId);
   return <article key={a.franchiseId} className="flex min-w-0 flex-col overflow-hidden rounded-lg border border-border bg-card" data-franchise-id={a.franchiseId}>
    <div className="relative aspect-[3/4] overflow-hidden bg-muted"><AnimeCover anime={a}/><Button title={liked?"Remove favorite":"Favorite"} aria-label={`${liked?"Unfavorite":"Favorite"} ${a.title}`} disabled={!user||favorite.isPending} variant="secondary" size="icon" className="absolute right-2 top-2" onClick={()=>favorite.mutate(a)}><Heart className={liked?"fill-primary text-primary":""}/></Button></div>
    <div className="flex flex-1 flex-col p-3 sm:p-4"><p className="text-xs text-muted-foreground">{m?.seasonYear??m?.startDate.year??"Year unknown"} · {m?.format?.replaceAll("_"," ")??"Type unknown"}{m?.averageScore!=null&&` · ${m.averageScore/10}/10`}</p><h3 className="mt-2 text-base font-bold sm:text-lg">{a.title}</h3><p className="mt-1 line-clamp-1 text-xs text-primary">{a.genres.join(" · ")}</p><p className="mt-2 line-clamp-3 text-sm text-muted-foreground">{a.description}</p><p className="mt-2 text-xs text-muted-foreground">{m?.episodes!=null?`${m.episodes} episodes`:"Episodes TBA"} · {m?.studios.nodes.map(s=>s.name).join(", ")||"Studio unavailable"}</p><div className="mt-3"><div className="flex flex-wrap justify-between gap-1 text-xs"><span>{p.status}</span><span>{p.completed}/{p.total} installments</span></div><div className="mt-2 h-1 overflow-hidden rounded-full bg-muted"><div className="h-full bg-primary" style={{width:`${p.percent}%`}}/></div></div><Button variant="outline" className="mt-4 w-full" onClick={()=>setSelected(a)}><BookOpen className="h-4 w-4"/>View Details</Button></div>
   </article>;
  })}</div>
  {!available.length&&<p className="py-10 text-center text-muted-foreground">{tracking.isFetching?"Loading collection…":"No anime match this view."}</p>}
  <Dialog open={!!selected} onOpenChange={open=>{if(!open)setSelected(null);}}><DialogContent className="max-h-[90dvh] max-w-3xl overflow-y-auto"><DialogHeader><DialogTitle>{selected?.title}</DialogTitle><DialogDescription>{selected?.genres.join(" · ")}</DialogDescription></DialogHeader>{selected&&<><p className="text-sm leading-relaxed text-muted-foreground">{selected.description}</p><p className="text-xs text-muted-foreground">Related series, remakes and films are tracked independently. Metadata: AniList · {selected.metadata?.siteUrl&&<a className="underline" href={selected.metadata.siteUrl} target="_blank" rel="noreferrer">Source</a>}</p>{!user&&<Button asChild><Link to="/auth" search={{redirect:"/collection"}}>Sign in to save progress</Link></Button>}<div className="divide-y divide-border">{selected.installmentIds.map((id,index)=>{const saved=progress.find(p=>p.installment_id===id);return <InstallmentRow key={`${user?.id}-${id}-${saved?.updated_at??"empty"}`} id={id} index={index} franchise={selected} uid={tracking.isFetching?undefined:user?.id} progress={saved} refresh={refresh}/>;})}</div></>}</DialogContent></Dialog>
 </section>;
}
function AnimeCover({anime}:{anime:CatalogueAnime}) {
 const [failed,setFailed]=useState(false);
 return <><div className="absolute inset-0 grid place-content-center gap-3 px-3 text-center text-muted-foreground"><BookOpen className="mx-auto h-10 w-10"/><span className="text-xs">{anime.title} · Cover unavailable</span></div>{anime.cover&&!failed&&<img src={anime.cover} alt={`${anime.title} official cover`} loading="lazy" width={300} height={400} className="relative h-full w-full object-cover" onError={()=>setFailed(true)}/>}</>;
}
function InstallmentRow({id,index,franchise,uid,progress,refresh}:{id:number;index:number;franchise:CatalogueAnime;uid:string|undefined;progress:AnimeProgress|undefined;refresh:()=>Promise<unknown>}) {
 const m=ANIME_METADATA[String(id)];const [status,setStatus]=useState<WatchStatus>(progress?.status??"Not Started"),[watched,setWatched]=useState(progress?.episodes_watched??0);
 const save=useMutation({mutationFn:async()=>{if(!uid||!m)throw new Error("Sign in to track episodes.");await saveAnimeProgress(uid,franchise.franchiseId,id,status,watched,m.episodes);},onSuccess:refresh});
 if(!m)return null;
 const title=m.title.english??m.title.romaji;
 return <div className="py-4"><h4 className="text-sm font-semibold">{index+1}. {title}</h4><p className="mt-1 text-xs text-muted-foreground">{m.format?.replaceAll("_"," ")} · {m.seasonYear??m.startDate.year??"Release TBA"} · {m.episodes!=null?`${m.episodes} episodes`:"Episode count unknown"}</p><div className="mt-3 flex flex-wrap items-end gap-2"><label className="min-w-0 flex-1 text-xs">Status<select aria-label={`Status for ${title}`} disabled={!uid} className="mt-1 block h-10 w-full rounded-md border border-input bg-background px-2 text-sm" value={status} onChange={e=>{const s=e.target.value as WatchStatus;setStatus(s);if(s==="Completed"&&m.episodes!==null)setWatched(m.episodes);}}>{WATCH_STATUSES.map(s=><option key={s}>{s}</option>)}</select></label><label className="w-24 text-xs">{m.format==="MOVIE"?"Watched":"Episodes"}<Input aria-label={`Episodes watched for ${title}`} type="number" min={0} max={m.episodes??undefined} disabled={!uid} value={watched} onChange={e=>setWatched(Number(e.target.value))} className="mt-1"/></label><Button disabled={!uid||save.isPending} onClick={()=>save.mutate()}><Check className="h-4 w-4"/>{save.isPending?"Saving…":"Save"}</Button></div>{progress&&progress.status==="Watching"&&<p className="mt-2 flex items-center gap-1 text-xs text-primary"><Play className="h-3 w-3"/>Resume at episode {progress.episodes_watched+1}</p>}{save.isSuccess&&<p className="mt-2 text-xs text-secondary-foreground">Progress saved</p>}{save.error&&<p role="alert" className="mt-2 text-xs text-destructive">{save.error.message}</p>}</div>;
}
