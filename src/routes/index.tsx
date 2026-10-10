import { createFileRoute } from "@tanstack/react-router";
import { ArrowUpRight, Play, ShieldCheck, BookOpen, Video, Target, TrendingUp, Lightbulb, Zap, CalendarDays, Users, Check, LockKeyhole } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LivePresentation } from "@/components/live-presentation";
import { PurchaseNotification } from "@/components/purchase-notification";
import { salesConfig } from "@/lib/sales-config";
import creatorImage from "@/assets/creator-studio.jpg";
import ebookImage from "@/assets/ebook-cover.jpg";

export const Route = createFileRoute("/")({
  head: () => ({ meta: [
    { title: "O Segredo para Viralizar no TikTok — Guia Digital" },
    { name: "description", content: "Aprende a criar vídeos com mais estratégia, captar a atenção e trabalhar o crescimento do teu perfil. Conhece o eBook por 2.850 Kz." },
    { property: "og:title", content: "O Segredo para Viralizar no TikTok — 2.850 Kz" },
    { property: "og:description", content: "Um guia digital com princípios práticos para melhorar os teus conteúdos e desenvolver uma estratégia no TikTok." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary_large_image" },
  ] }),
  component: Index,
});

const benefits = [
  { icon: Video, title: "Criação de conteúdo", text: "Princípios para estruturar vídeos de forma mais interessante." },
  { icon: Zap, title: "Atenção nos primeiros segundos", text: "Ideias para criar aberturas que despertem curiosidade." },
  { icon: TrendingUp, title: "Estratégias de alcance", text: "Conceitos para melhorar as oportunidades de distribuição dos vídeos." },
  { icon: Users, title: "Crescimento do perfil", text: "Princípios de consistência e construção de audiência." },
  { icon: CalendarDays, title: "Publicação com intenção", text: "Aprender a planear conteúdos em vez de publicar sem direção." },
];

function Price() {
  return <><div className="price-row"><del className="original-price">{salesConfig.originalPrice}</del><span className="promo-badge">PREÇO PROMOCIONAL</span></div><p className="current-price">2.850 <span>Kz</span></p></>;
}

function CheckoutButton({ final = false }: { final?: boolean }) {
  return <Button variant="purchase" size="sales" asChild><a href={salesConfig.checkoutUrl}>{final ? "QUERO O MEU EBOOK — 2.850 KZ" : "QUERO O GUIA COMPLETO — 2.850 KZ"}<ArrowUpRight /></a></Button>;
}

function Index() {
  return (
    <div>
      <header className="site-header"><div className="page-container header-inner"><a href="#inicio" className="brand-name min-w-0" aria-label="O Segredo para Viralizar no TikTok — início">O SEGREDO PARA<br /><span>VIRALIZAR NO TIKTOK.</span></a><div className="flex shrink-0 items-center gap-7"><span className="header-tag">CRIA. CAPTA. CRESCE.</span><Button variant="presentation" size="sm" asChild><a href="#oferta">CONHECER O GUIA<ArrowUpRight /></a></Button></div></div></header>
      <main>
        <section className="hero" id="inicio">
          <img className="hero-image" src={creatorImage} alt="Criador de conteúdo a analisar as estatísticas do seu perfil no telemóvel" width={1536} height={1024} fetchPriority="high" />
          <div className="hero-overlay" />
          <div className="page-container hero-content"><p className="eyebrow">O SEGREDO PARA VIRALIZAR NO TIKTOK</p><h1>PUBLICAS VÍDEOS<br />NO TIKTOK, MAS<br /><span className="text-cyan">QUASE NINGUÉM<br />OS VÊ?</span></h1><p className="hero-copy">Passas tempo a criar conteúdo, publicas vídeos e esperas conseguir mais visualizações, mas os resultados continuam abaixo das tuas expectativas? Talvez precises de compreender melhor como captar a atenção, estruturar os teus vídeos e despertar o interesse do público.</p><Button variant="purchase" size="sales" asChild><a href="#apresentacao"><Play size={16} />VER APRESENTAÇÃO<ArrowUpRight /></a></Button><p className="hero-footnote"><BookOpen size={13} />Mais estratégia. Novas ideias. Conteúdo com intenção.</p></div>
        </section>
        <section className="section presentation-section"><div className="page-container"><div className="presentation-layout"><div className="presentation-copy"><p className="eyebrow">UM NOVO OLHAR SOBRE O TEU CONTEÚDO</p><h2 className="section-heading">PARTICIPA AGORA<br />NA NOSSA<br /><span className="text-cyan">APRESENTAÇÃO!</span></h2><p className="body-copy">Descobre ideias e estratégias que podes começar a aplicar nos teus conteúdos.</p><Button variant="presentation" size="sales" asChild><a href="#apresentacao"><Play />VER APRESENTAÇÃO<ArrowUpRight /></a></Button><p className="presentation-note"><ShieldCheck size={15} />Apresentação demonstrativa, não uma transmissão em direto.</p></div><LivePresentation /></div><div className="live-transition"><h2>NÃO TIVESTE A OPORTUNIDADE<br />DE PARTICIPAR NA LIVE?</h2><p className="body-copy">Podes conhecer o eBook ‘O Segredo para Viralizar no TikTok’, um guia digital com ideias e estratégias para melhorar os teus conteúdos, captar a atenção do público e trabalhar no crescimento do teu perfil.</p></div></div></section>
        <section className="section"><div className="page-container center-heading"><p className="eyebrow">O PRÓXIMO VÍDEO PODE SER DIFERENTE</p><h2 className="section-heading">E SE O TEU PRÓXIMO VÍDEO TIVESSE MAIS POTENCIAL PARA <span className="text-cyan">ALCANÇAR MUITAS PESSOAS?</span></h2><p className="body-copy">Existem estratégias de criação de conteúdo que podem ajudar a captar a atenção e melhorar as oportunidades de crescimento. Descobre como podes começar a aplicá-las nos teus próprios vídeos.</p></div></section>
        <section className="section desire-section"><div className="page-container"><div className="center-heading"><p className="eyebrow">MENOS IMPROVISO. MAIS INTENÇÃO.</p><h2 className="section-heading">TRANSFORMA A FORMA COMO<br />CRIAS E PUBLICAS OS TEUS VÍDEOS</h2><p className="body-copy">Aprende princípios práticos para criar conteúdos mais interessantes, captar a atenção nos primeiros segundos e desenvolver uma estratégia para procurar mais alcance e seguidores.</p></div><div className="desire-cards">{[{ icon: Video, title: "Criar vídeos que despertem interesse." },{ icon: Target, title: "Aprender a captar a atenção do público." },{ icon: TrendingUp, title: "Desenvolver uma estratégia de crescimento." }].map(({icon: Icon, title}, i) => <article className="desire-card" key={title}><span className="card-number">0{i+1}</span><Icon aria-hidden="true" /><h3>{title}</h3></article>)}</div></div></section>
        <section className="section product-section"><div className="page-container product-layout"><img className="book-image" src={ebookImage} alt="Capa do guia digital O Segredo para Viralizar no TikTok; representação ilustrativa do eBook" width={1024} height={1280} loading="lazy" /><div><p className="eyebrow">O TEU PRÓXIMO PASSO</p><h2 className="product-heading">DESCOBRE O SEGREDO PARA <span className="text-cyan">VIRALIZAR NO TIKTOK</span> E ALCANÇAR MILHÕES DE SEGUIDORES!</h2><p className="body-copy product-copy">Conhece estratégias para melhorar os teus vídeos, captar a atenção de novas pessoas e trabalhar no crescimento do teu perfil.</p><p className="disclaimer">Um objetivo ambicioso, não uma promessa: o guia não garante viralização ou milhões de seguidores.</p><Button className="mt-6" variant="presentation" size="sales" asChild><a href="#oferta">DESCOBRIR O EBOOK<ArrowUpRight /></a></Button></div></div></section>
        <section className="section offer-section" id="oferta"><div className="page-container"><div className="offer-content"><p className="eyebrow justify-center">CONTEÚDO COM MAIS ESTRATÉGIA</p><h2 className="section-heading">O SEGREDO PARA<br /><span className="text-cyan">VIRALIZAR NO TIKTOK</span></h2><p className="body-copy offer-description">Um guia digital para quem quer aprender a criar conteúdo com mais estratégia, captar a atenção dos espectadores e desenvolver novas formas de procurar mais visualizações e seguidores.</p><Price /><CheckoutButton /><p className="checkout-note"><LockKeyhole size={12} />Compra através do checkout oficial Kursinha</p><p className="disclaimer">Guia em formato digital. Imagem do livro meramente ilustrativa.</p></div></div></section>
        <section className="section"><div className="page-container"><div className="center-heading"><p className="eyebrow">IDEIAS PARA COLOCAR EM PRÁTICA</p><h2 className="section-heading">O QUE VAIS ENCONTRAR <span className="text-cyan">NESTE GUIA?</span></h2></div><div className="benefits-grid">{benefits.map(({ icon: Icon, title, text }) => <article className="benefit-card" key={title}><Icon aria-hidden="true" /><h3>{title}</h3><p>{text}</p></article>)}</div></div></section>
        <section className="section final-section"><div className="page-container"><div className="offer-content"><p className="eyebrow justify-center">O PRÓXIMO PASSO É TEU</p><h2 className="section-heading">COMEÇA A CRIAR CONTEÚDO<br /><span className="text-cyan">COM MAIS ESTRATÉGIA</span></h2><p className="body-copy">Se queres melhorar os teus vídeos e aprender novas formas de trabalhar o crescimento do teu perfil, conhece o guia e decide se é adequado aos teus objetivos.</p><Price /><CheckoutButton final /><p className="checkout-note"><Check size={13} />Guia digital · Princípios práticos · Conteúdo com intenção</p><p className="disclaimer">Os resultados dependem de vários fatores, incluindo o conteúdo, a consistência e o público.<br />Não existe garantia de viralização, seguidores ou resultados financeiros.</p></div></div></section>
      </main>
      <footer className="site-footer"><div className="page-container footer-inner"><span className="brand-name">O SEGREDO PARA <span>VIRALIZAR NO TIKTOK.</span></span><p>Produto independente. Não afiliado ao TikTok.</p></div></footer>
      <PurchaseNotification />
    </div>
  );
}
