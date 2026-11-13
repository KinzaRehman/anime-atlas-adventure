import { useEffect, useState } from "react";
import player from "@/assets/world/player.webp";
import { renderAvatarArt } from "@/lib/avatar-art";
import type { AvatarConfig } from "@/data/avatar";

export function AvatarPortrait({ avatar }: { avatar: AvatarConfig }) {
  const [url, setUrl] = useState(player);
  useEffect(() => {
    let current = true;
    renderAvatarArt(avatar).then((result) => { if (current) setUrl(result); }).catch(() => {});
    return () => { current = false; };
  }, [avatar.body, avatar.cut, avatar.hair, avatar.eyes, avatar.glasses, avatar.outfit, avatar.shoes, avatar.accessory]);
  return <img src={url} alt="Your explorer avatar" className="h-72 w-auto max-w-full object-contain motion-safe:animate-bob" />;
}