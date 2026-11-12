import { MISSIONS, missionPeriod } from "@/data/missions";
import { claimMission, useProgress } from "@/lib/progress";
import { Button } from "@/components/ui/button";
import { Check, Award } from "lucide-react";

export function Missions() {
  const progress = useProgress();
  return <div className="space-y-6">{MISSIONS.map((mission) => {
    const saved = progress.missions[mission.id];
    const active = saved?.period === missionPeriod(mission.period) ? saved : undefined;
    const count = active?.steps.length ?? 0;
    return <section key={mission.id} className="border-b border-border pb-5">
      <p className="text-xs font-bold uppercase text-primary">{mission.period} · {mission.xp} XP</p>
      <h3 className="font-display text-xl font-bold">{mission.title}</h3>
      <ol className="my-3 space-y-2">{mission.labels.map((label, i) => <li key={label} className={`flex items-center gap-2 ${i < count ? "text-primary" : "text-muted-foreground"}`}><span className="grid h-6 w-6 place-items-center rounded-full border border-border">{i < count ? <Check className="h-4 w-4" /> : i + 1}</span>{label}</li>)}</ol>
      <Button disabled={count !== mission.steps.length || !!active?.claimed} onClick={() => claimMission(mission.id)}><Award className="h-4 w-4" />{active?.claimed ? "Reward collected" : "Collect XP & badge"}</Button>
    </section>;
  })}<p className="text-xs text-muted-foreground">Daily resets at 00:00 UTC · Weekly resets Monday at 00:00 UTC</p></div>;
}