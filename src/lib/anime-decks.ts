import { supabase } from "@/integrations/supabase/client";
import { animeKey } from "@/data/anime-catalogue";
export interface DeckCard { id: string; user_id: string; anime_key: string; title: string; rating: number; description: string; rewatch: boolean; character_name: string; shared: boolean; created_at: string; }
export interface CardDraft { title: string; rating: number; description: string; rewatch: boolean; character: string; shared: boolean; }
export function validateDeckCard(card: CardDraft) {
  if (!card.title.trim() || card.title.trim().length > 160) throw new Error("Add an anime name (up to 160 characters).");
  if (!Number.isInteger(card.rating) || card.rating < 1 || card.rating > 5) throw new Error("Choose a rating from 1 to 5 stars.");
  if (card.description.length > 240 || card.character.length > 60) throw new Error("Keep your description and character name short.");
}
export async function listDeck(uid: string): Promise<DeckCard[]> {
  const { data, error } = await supabase.from("anime_deck_cards").select("*").eq("user_id", uid).order("created_at", { ascending: false });
  if (error) throw error; return data ?? [];
}
export async function saveDeckCard(uid: string, card: CardDraft) {
  validateDeckCard(card);
  const { error } = await supabase.from("anime_deck_cards").upsert({ user_id: uid, anime_key: animeKey(card.title), title: card.title.trim(), rating: card.rating, description: card.description.trim(), rewatch: card.rewatch, character_name: card.character.trim(), shared: card.shared }, { onConflict: "user_id,anime_key" });
  if (error) throw error;
}
export async function removeDeckCard(id: string) {
  const { error } = await supabase.from("anime_deck_cards").delete().eq("id", id); if (error) throw error;
}
export interface SharedPlayer { id: string; name: string; titles: string[]; }
export function groupSharedPlayers(rows: { user_id: string; title: string; profiles: { display_name: string } | null }[]): SharedPlayer[] {
  const players = new Map<string, SharedPlayer>();
  for (const row of rows) {
    const player = players.get(row.user_id) ?? { id: row.user_id, name: row.profiles?.display_name ?? "Traveler", titles: [] };
    if (!player.titles.includes(row.title)) player.titles.push(row.title);
    players.set(row.user_id, player);
  }
  return [...players.values()].sort((a, b) => b.titles.length - a.titles.length || a.name.localeCompare(b.name));
}
export async function sharedPlayers(uid: string, keys: string[]): Promise<SharedPlayer[]> {
  if (!keys.length) return [];
  const { data, error } = await supabase.from("anime_deck_cards").select("user_id,title,profiles(display_name)").eq("shared", true).neq("user_id", uid).in("anime_key", keys).limit(500);
  if (error) throw error;
  return groupSharedPlayers(data ?? []);
}