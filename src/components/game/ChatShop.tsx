import { BookOpen, Coffee, Compass, Check, ShoppingBag } from "lucide-react";
import { useState } from "react";
import { SHOP_ITEMS } from "@/data/shop";
import { availableXp, buyItem, equipItem, useProgress } from "@/lib/progress";
import { Button } from "@/components/ui/button";
import { Sheet } from "@/components/game/Sheet";

const ICONS = { book: BookOpen, cup: Coffee, compass: Compass };
export function ChatShop() {
  const p = useProgress();
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  return <>
    <Button variant="outline" onClick={() => setOpen(true)}><ShoppingBag className="h-4 w-4" />Chat shop<span className="tabular-nums">{availableXp(p)} XP</span></Button>
    {open && <Sheet kicker="Earned in Sakuragaoka" title="Chat shop" onClose={() => setOpen(false)}>
      <div className="mb-4 flex justify-between border-b border-border pb-3"><span className="font-semibold">Available XP</span><strong className="tabular-nums">{availableXp(p)}</strong></div>
      <div className="space-y-3">{SHOP_ITEMS.map((item) => {
        const Icon = ICONS[item.icon], owned = p.items.includes(item.id), equipped = p.equippedItem === item.id;
        return <article key={item.id} className="flex items-center gap-3 rounded-lg border border-border p-3">
          <Icon className={`h-8 w-8 shrink-0 ${item.tone}`} />
          <div className="min-w-0 flex-1"><h3 className="font-display font-bold">{item.name}</h3><p className="text-xs text-muted-foreground">Explorer title: {item.title}</p></div>
          <Button variant={owned ? "outline" : "default"} disabled={equipped || (!owned && availableXp(p) < item.price)} onClick={() => {
            if (owned) { equipItem(item.id); setMessage(`${item.name} equipped.`); }
            else { const result = buyItem(item.id); setMessage(result === "bought" ? `${item.name} bought and equipped.` : "Not enough XP."); }
          }} aria-label={equipped ? `${item.name} equipped` : owned ? `Equip ${item.name}` : `Buy ${item.name} for ${item.price} XP`}>
            {equipped ? <Check className="h-4 w-4" /> : owned ? "Equip" : `${item.price} XP`}
          </Button>
        </article>;
      })}</div>
      {p.equippedItem && <Button variant="ghost" className="mt-3" onClick={() => { equipItem(null); setMessage("Pin removed."); }}>Remove pin</Button>}
      <p role="status" className="mt-3 min-h-6 text-sm text-primary">{message}</p>
      <p className="mt-2 text-xs text-muted-foreground">Spending XP keeps your earned level. Pins and available XP are saved on this device.</p>
    </Sheet>}
  </>;
}