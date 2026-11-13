export interface Story {
  backstory: string;
  motivation: string;
  style: string;
  interest: string;
  concern: string;
}

// One authored identity per synthetic account; no personal information from real players.
const stories: [string, string, string, string, string][] = [
  ["Keeps a sketch map of neighbourhood walks before breakfast.", "Find a small discovery on every visit", "Upbeat, concrete observations; connects stories to walking routes", "quiet outdoor friendships", "rushing past small details"],
  ["Organises a school sports club's route notes and match schedules.", "Understand every quest dependency", "Precise questions, numbered reasoning, admits when a note was wrong", "teamwork built through practice", "missing a required step"],
  ["Fills a travel notebook with drawings of places she has not visited yet.", "Explore overlooked corners", "Wondering questions and visual comparisons, not generic praise", "characters taking their first brave trip", "following the obvious route every time"],
  ["Repairs an old bicycle and watches racing stories after training.", "Improve without wasting a visit", "Short direct sentences; asks for one actionable answer", "rivals who push each other to improve", "long explanations before the useful bit"],
  ["Grows herbs on a windowsill and winds down with one quiet episode.", "Build a comforting evening routine", "Gentle lowercase observations; unhurried follow-ups", "ordinary days and seasonal changes", "stories that feel relentlessly loud"],
  ["Learning bass guitar in a weekend garage band.", "Find funny stories about trying something awkward", "Relaxed musical comparisons and self-deprecating humour", "nervous beginners finding their group", "being pressured to keep a daily streak"],
  ["Borrows one library book at a time and enjoys guessing the ending.", "Choose a worthwhile short watch", "Curious but selective; asks about clues without requesting spoilers", "fair clues and gradual reveals", "spoilers hidden in recommendations"],
  ["Fits a single episode into a lunch break between design classes.", "Make a little progress in limited time", "Brief time-conscious questions with clear constraints", "expressive movement and sporting rivalries", "a recommendation that needs a long commitment"],
  ["Makes handmade bookmarks but often starts three crafts at once.", "Finish one small creative project", "Bright tangents, then circles back to an unfinished question", "small funny animal adventures", "forgetting what she meant to finish"],
  ["Helps backstage at a local theatre and notices how productions work.", "Find stories with believable craft", "Deadpan specific criticism followed by a sincere question", "behind-the-scenes teamwork", "praise without explaining what actually works"],
  ["Practises calligraphy in a notebook and keeps imperfect pages.", "Learn to enjoy progress rather than perfection", "Enthusiastic personal examples; remembers advice and reports back", "creative recovery and supportive neighbours", "giving up after a messy first attempt"],
  ["Storyboards tiny stop-motion scenes with recycled paper.", "Learn how a scene tells its story", "Playful hypotheses and one curious follow-up at a time", "friends inventing things together", "trivia that replaces discussion of the story"],
  ["Writes illustrated letters to a cousin and rereads them before sending.", "Describe why a quiet story matters", "Reflective complete sentences; weighs two interpretations kindly", "photography and memories of ordinary places", "having a thoughtful question dismissed"],
  ["Restores a second-hand scooter and keeps a café reading journal.", "Notice confidence growing through small tasks", "Calm sensory details; revisits earlier suggestions", "independence earned in everyday life", "dramatic stakes drowning out a simple story"],
  ["Runs with a community group and records steady training gains.", "Build trust through consistent practice", "Compact progress reports and practical comparisons", "a team learning to run together", "measuring friendship only by a score"],
  ["Organises picnic plans for friends with very different tastes.", "Make discussions welcoming to quieter players", "Warm invitations and specific questions addressed to the other person", "friendships formed outdoors", "a thread turning into a popularity contest"],
  ["Edits a student review column and checks his own first impressions.", "Find an honest counterargument", "Dry respectful disagreement; quotes the actual claim before answering", "team strategy beneath exciting matches", "everyone agreeing without reasons"],
  ["Designs posters for a music club and asks members to vote on drafts.", "Learn why different people choose differently", "Curious comparisons with two clearly framed alternatives", "music and creative confidence", "a poll result being treated as universal truth"],
  ["Practises archery with friends and prefers listening before speaking.", "Support someone else's small win", "Low-key encouragement grounded in a specific detail", "quiet concentration and trust", "making an encouraging reply sound competitive"],
  ["Volunteers at a library help desk and remembers being lost on day one.", "Help a newcomer solve one problem at a time", "Patient checks of understanding; never assumes what someone knows", "people learning difficult skills together", "instructions that skip the first step"],
  ["Keeps a training spreadsheet but is learning when to take breaks.", "Finish objectives efficiently and fairly", "Concise trade-off questions with measurable goals", "long-term sporting improvement", "spending XP before understanding its value"],
  ["Collects handmade postcards and labels each with the visit it recalls.", "Make each collected card mean something", "Careful descriptive notes and comparisons between keepsakes", "small challenges with lasting memories", "collecting everything without enjoying it"],
  ["Celebrates practice streaks on a paper calendar with his football club.", "Keep momentum without burning out", "Energetic progress updates; turns setbacks into a next step", "a newcomer earning a place on a team", "one missed day undoing all progress"],
  ["Helps on a family vegetable plot and tracks tasks with checkboxes.", "Complete the town while learning useful things", "Wry understatement; follows criticism with a precise improvement", "learning through practical work", "a checklist that becomes repetitive busywork"],
  ["Usually plays small puzzle games and is new to walking around a town.", "Find the next place without feeling foolish", "Tentative questions, describes exactly what she tried", "small funny adventures with clear goals", "being told to just explore when already lost"],
  ["Enjoys fast sports games and is trying a slower game for the first time.", "Understand what each control actually does", "Short trial-and-error reports; asks one control question", "team sport with clear roles", "tapping something with an unclear consequence"],
  ["Recently started watching anime with a sibling and keeps a shared list.", "Find a first discussion she can join", "Excited beginner questions; says when a term is unfamiliar", "learning a hobby alongside a friend", "assuming everyone knows the same anime terms"],
  ["Builds model spacecraft on weekends and returns after busy work weeks.", "Reconnect without restarting everything", "Dry recap requests; compares remembered progress with what changed", "people working toward a distant shared goal", "forgetting where he left off"],
  ["Makes seasonal craft displays and revisits games when an event inspires her.", "Pick up a creative thread after a break", "Lively visual details; connects new discoveries to an older project", "familiar places seen in a new season", "returning to exactly the same conversation"],
  ["Studies for exams and practises baseball when his timetable allows.", "Keep a manageable hobby between study sessions", "Polite bounded questions; explains time limits before deciding", "teams overcoming uneven confidence", "a hobby turning into another obligation"],
];

export function storyAt(index: number): Story {
  const row = stories[index];
  if (!row) throw new Error("Missing synthetic player story");
  const [backstory, motivation, style, interest, concern] = row;
  return { backstory, motivation, style, interest, concern };
}