import { useEffect, useState } from "react";
import { ArrowUpRight, Eye, Heart, LockKeyhole, UserRoundPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import creatorImage from "@/assets/creator-studio.jpg";

const entrances = ["Um participante entrou na apresentação.", "Novo participante juntou-se à LIVE.", "Mais um participante está a assistir."];
const counts = [1248, 1253, 1246, 1257, 1251];

export function LivePresentation() {
  const [step, setStep] = useState(0);
  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (reduced.matches) return;
    const interval = window.setInterval(() => setStep((value) => value + 1), 5800);
    return () => window.clearInterval(interval);
  }, []);

  return (
    <div className="live-device" id="apresentacao">
      <img className="live-photo" src={creatorImage} alt="Imagem ilustrativa de um apresentador de conteúdos" width={1536} height={1024} loading="lazy" />
      <div className="live-shade" />
      <div className="live-top">
        <span className="live-badge"><span className="live-dot" />LIVE</span>
        <span className="live-viewers"><Eye size={13} />{(counts[step % counts.length] ?? 1248).toLocaleString("pt-PT")} espectadores <small>simulados</small></span>
      </div>
      <div className="live-host"><span className="host-avatar">T</span><div><strong>Conteúdo com estratégia</strong><span>Apresentação do guia digital</span></div></div>
      <div className="access-panel">
        <span className="access-label"><LockKeyhole size={12} />ACESSO LIMITADO</span>
        <h3>ESTA APRESENTAÇÃO<br />TEM ACESSO LIMITADO</h3>
        <p>Queres conhecer as estratégias completas? Descobre o guia digital O Segredo para Viralizar no TikTok.</p>
        <Button variant="purchase" size="sales" asChild><a href="#oferta">DESCOBRIR O EBOOK<ArrowUpRight /></a></Button>
      </div>
      <div className="live-comments"><span className="demo-label">COMENTÁRIOS DEMONSTRATIVOS</span><p><strong>Ana · exemplo</strong> Como captar a atenção no início? 👀</p><p><strong>Pedro · exemplo</strong> Quero criar com mais estratégia!</p></div>
      <div className="entry-notification" key={step}><UserRoundPlus size={15} /><span><small>ENTRADA DEMONSTRATIVA</small>{entrances[step % entrances.length]}</span></div>
      <div className="live-hearts" aria-hidden="true"><Heart /><Heart /><Heart /></div>
      <p className="simulation-caption">Apresentação demonstrativa — simulação visual</p>
    </div>
  );
}