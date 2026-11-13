import { useRef, useState } from "react";
import { bus } from "@/game/bus";

export function Joystick() {
  const base = useRef<HTMLDivElement>(null);
  const [knob, setKnob] = useState({ x: 0, y: 0 });
  const R = 44;
  const move = (e: React.PointerEvent) => {
    const r = base.current?.getBoundingClientRect();
    if (!r) return;
    let dx = e.clientX - (r.left + r.width / 2), dy = e.clientY - (r.top + r.height / 2);
    const l = Math.hypot(dx, dy); if (l > R) { dx = (dx / l) * R; dy = (dy / l) * R; }
    setKnob({ x: dx, y: dy }); bus.input.x = dx / R; bus.input.y = dy / R;
  };
  const end = () => { setKnob({ x: 0, y: 0 }); bus.input.x = 0; bus.input.y = 0; };
  return (
    <div ref={base} aria-hidden className="glass relative h-32 w-32 touch-none rounded-full"
      onPointerDown={(e) => { e.stopPropagation(); e.currentTarget.setPointerCapture(e.pointerId); move(e); }} onPointerMove={(e) => e.buttons && move(e)} onPointerUp={end} onPointerCancel={end} onLostPointerCapture={end}>
      <div className="absolute left-1/2 top-1/2 h-14 w-14 rounded-full bg-ivory/90 shadow-soft" style={{ transform: `translate(calc(-50% + ${knob.x}px), calc(-50% + ${knob.y}px))` }} />
    </div>
  );
}
