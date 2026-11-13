export const ANIME_GENRES = ["Action", "Comedy", "Slice of Life", "Shounen", "Mystery"] as const;
export type AnimeGenre = typeof ANIME_GENRES[number];
export interface CatalogueAnime { key: string; title: string; genres: AnimeGenre[]; description: string; }
// Curated discovery shelf, not a fabricated global ranking. Seasons and films are separate completed cards.
const groups: { genres: AnimeGenre[]; description: string; titles: string[] }[] = [
  { genres: ["Shounen", "Action"], description: "Teamwork, practice and sporting competition.", titles: [
    "Haikyu!!", "Haikyu!! Second Season", "Haikyu!! Karasuno vs Shiratorizawa", "Haikyu!! To the Top", "Haikyu!! To the Top Part 2", "Haikyu!! The Dumpster Battle",
    "Ace of Diamond", "Ace of Diamond Second Season", "Ace of Diamond Act II", "Big Windup!", "Big Windup! Summer Tournament", "Major", "Major Season 2", "Major Season 3", "Major Season 4", "Major Season 5", "Major Season 6", "Major 2nd", "Major 2nd Second Season", "Captain Tsubasa (2018)",
    "Captain Tsubasa: Junior Youth Arc", "Whistle!", "Days", "Giant Killing", "Ao Ashi", "Yowamushi Pedal", "Yowamushi Pedal Grande Road", "Yowamushi Pedal New Generation", "Yowamushi Pedal Glory Line", "Yowamushi Pedal Limit Break",
    "Ping Pong the Animation", "Tsurune", "Tsurune: The Linking Shot", "Tsurune: The First Shot", "Run with the Wind", "Bakuten!!", "Bakuten!! Movie", "RE-MAIN", "Stars Align", "Oblivion Battery",
  ] },
  { genres: ["Slice of Life"], description: "Everyday friendships, hobbies and small discoveries.", titles: [
    "Laid-Back Camp", "Laid-Back Camp Season 2", "Laid-Back Camp Season 3", "Laid-Back Camp Movie", "Room Camp", "Encouragement of Climb", "Encouragement of Climb Second Season", "Encouragement of Climb Third Season", "Encouragement of Climb: Next Summit", "Do It Yourself!!",
    "Super Cub", "Diary of Our Days at the Breakwater", "Slow Loop", "Let's Make a Mug Too", "Let's Make a Mug Too: Second Kiln", "Tamayura", "Tamayura: Hitotose", "Tamayura: More Aggressive", "Tamayura: Graduation Photo Part 1", "Tamayura: Graduation Photo Part 2", "Tamayura: Graduation Photo Part 3", "Tamayura: Graduation Photo Part 4",
    "A Place Further Than the Universe", "Shirobako", "Shirobako Movie", "The Great Passage", "Space Brothers", "Space Brothers #0", "Barakamon", "Silver Spoon", "Silver Spoon Season 2", "Sketchbook: Full Color's",
  ] },
  { genres: ["Comedy", "Slice of Life"], description: "Gentle humour, creative hobbies and everyday company.", titles: [
    "Non Non Biyori", "Non Non Biyori Repeat", "Non Non Biyori Nonstop", "Non Non Biyori Vacation", "School Babysitters", "My New Boss Is Goofy", "Play It Cool, Guys", "My Roommate Is a Cat", "Chi's Sweet Home", "Chi's New Address",
    "Chi's Sweet Adventure", "Chi's Sweet Adventure Season 2", "Bananya", "Bananya and the Curious Bunch", "Pui Pui Molcar", "Pui Pui Molcar Driving School", "Rilakkuma and Kaoru", "Rilakkuma's Theme Park Adventure", "With a Dog AND a Cat, Every Day Is Fun", "Bonobono (2016)",
    "Bocchi the Rock!", "Bocchi the Rock! Re:", "Bocchi the Rock! Re:Re:", "Keep Your Hands Off Eizouken!", "Hitoribocchi no Marumaru Seikatsu",
  ] },
  { genres: ["Mystery"], description: "Grounded investigation and curious puzzles; some stories contain tense scenes.", titles: [
    "Sherlock Hound", "Sherlock Hound: The Adventure of the Blue Carbuncle", "Sherlock Hound: Treasure Under the Sea",
  ] },
];
export const animeKey = (title: string) => title.toLowerCase().normalize("NFKD").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
export const ANIME_CATALOGUE: CatalogueAnime[] = groups.flatMap((group) => group.titles.map((title) => ({ key: animeKey(title), title, genres: group.genres, description: group.description })));
export function filterAnime(query: string, genre: string) {
  return ANIME_CATALOGUE.filter((a) => (genre === "All" || a.genres.some((g) => g === genre)) && a.title.toLowerCase().includes(query.trim().toLowerCase()));
}