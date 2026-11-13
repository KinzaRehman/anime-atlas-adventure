import {describe,it,expect} from "vitest";
import {ANIME_CATALOGUE,ANIME_METADATA,filterAnime} from "@/data/anime-catalogue";
import {franchiseProgress,validateProgress,type AnimeProgress} from "@/lib/anime-tracking";
import {vi} from "vitest";
vi.mock("@/integrations/supabase/client",()=>({supabase:{}}));
describe("franchise catalogue",()=>{
 it("contains exactly 100 unique main franchise IDs",()=>{expect(ANIME_CATALOGUE).toHaveLength(100);expect(new Set(ANIME_CATALOGUE.map(a=>a.franchiseId)).size).toBe(100);});
 it("groups all six requested Haikyu installments in one main card",()=>{const matches=filterAnime("Haikyu","All");expect(matches).toHaveLength(1);expect(matches[0]?.installmentIds).toEqual([20583,28891,32935,38883,40776,52742]);});
 it("retains Naruto and Shippuden as independent installments",()=>{expect(ANIME_CATALOGUE.find(a=>a.title==="Naruto")?.installmentIds).toEqual([20,1735]);});
 it("uses unique source descriptions and real source IDs",()=>{expect(new Set(ANIME_CATALOGUE.map(a=>a.description)).size).toBe(100);for(const a of ANIME_CATALOGUE){expect(a.metadata?.idMal).toBe(a.franchiseId);expect(a.description.length).toBeGreaterThan(40);for(const id of a.installmentIds){const m=ANIME_METADATA[String(id)];expect(id>0?m?.idMal:m?.id).toBe(Math.abs(id));}}});
 it("does not merge unrelated titles with mistaken sequel IDs",()=>{expect(ANIME_CATALOGUE.find(a=>a.title==="Ace of Diamond")?.installmentIds).toContain(30230);expect(ANIME_CATALOGUE.find(a=>a.title==="Ace of Diamond")?.installmentIds).not.toContain(28825);expect(ANIME_CATALOGUE.find(a=>a.title==="Digimon Adventure")?.installmentIds).not.toContain(32189);});
 it("includes both independent Attack on Titan finale specials",()=>{expect(ANIME_CATALOGUE.find(a=>a.title==="Attack on Titan")?.installmentIds).toEqual([16498,25777,35760,38524,40028,48583,51535,-162314]);});
 it("does not complete a franchise when just one season is completed",()=>{const p={installment_id:20583,status:"Completed",episodes_watched:25} as AnimeProgress;expect(franchiseProgress([20583,28891],[p])).toEqual({status:"Watching",completed:1,total:2,percent:50});});
 it("rejects episodes above the known installment count",()=>{expect(()=>validateProgress({status:"Watching",episodes_watched:26},25)).toThrow();expect(()=>validateProgress({status:"Watching",episodes_watched:25},25)).not.toThrow();});
 it("keeps movie and season progress independent",()=>{const p={installment_id:52742,status:"Completed",episodes_watched:1} as AnimeProgress;expect(franchiseProgress([20583,52742],[p]).completed).toBe(1);});
});
