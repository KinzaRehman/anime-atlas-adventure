import manifest from "./anime-manifest.json";
import rawMetadata from "./anime-metadata.json";
export interface AnimeMetadata {id:number;idMal:number;title:{romaji:string;english:string|null;native:string|null};synonyms:string[];description:string|null;genres:string[];format:string|null;episodes:number|null;seasonYear:number|null;startDate:{year:number|null;month:number|null;day:number|null};studios:{nodes:{name:string}[]};averageScore:number|null;popularity:number|null;status:string;coverImage:{large:string;extraLarge:string};siteUrl:string}
export const ANIME_METADATA=rawMetadata as unknown as Record<string,AnimeMetadata>;
const covers=import.meta.glob<{default:{url:string}}>("../assets/anime/*.asset.json",{eager:true});
export const animeKey=(title:string)=>title.toLowerCase().normalize("NFKD").replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"");
export interface CatalogueAnime {key:string;franchiseId:number;title:string;genres:string[];description:string;installmentIds:number[];metadata:AnimeMetadata|undefined;cover:string|null;alternatives:string[]}
export const ANIME_CATALOGUE:CatalogueAnime[]=manifest.map(row=>{
 const m=ANIME_METADATA[String(row.franchiseId)];
 const installments=row.installmentIds.filter(id=>!!ANIME_METADATA[String(id)]);
 return {...row,key:animeKey(row.title),genres:m?.genres??[],description:(m?.description??"Synopsis unavailable.").replace(/<[^>]*>/g,"").replace(/\(Source:[^)]*\)/g,"").trim(),metadata:m,cover:covers[`../assets/anime/${row.franchiseId}.jpg.asset.json`]?.default.url??null,alternatives:[m?.title.romaji??"",m?.title.english??"",m?.title.native??"",...(m?.synonyms??[])],installmentIds:installments};
});
export const ANIME_GENRES=[...new Set(ANIME_CATALOGUE.flatMap(a=>a.genres))].sort();
export type AnimeGenre=string;
export function filterAnime(query:string,genre:string) {return ANIME_CATALOGUE.filter(a=>(genre==="All"||a.genres.includes(genre))&&[a.title,...a.alternatives].some(t=>t.toLowerCase().includes(query.trim().toLowerCase())));}
