import { useParams, Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { news } from "@/lib/mock-data";

export const NewsList = () => {
  const sorted = [...news].sort((a, b) => {
    if (a.pinned && !b.pinned) return -1;
    if (!a.pinned && b.pinned) return 1;
    return new Date(b.date).getTime() - new Date(a.date).getTime();
  });

  return (
    <div className="container mx-auto px-4 py-10">
      <h1 className="text-3xl md:text-4xl font-heading font-bold text-foreground mb-2">News</h1>
      <p className="text-muted-foreground mb-8">Latest announcements and updates</p>

      <div className="space-y-4">
        {sorted.map((article) => (
          <Link
            key={article.id}
            to={`/news/${article.id}`}
            className="block bg-gradient-card rounded-lg border border-border p-6 transition-all hover:border-primary/40 hover:shadow-glow-blue group"
          >
            <div className="flex items-center gap-2 mb-2">
              {article.pinned && <span className="text-[10px] uppercase tracking-wider text-accent font-bold">📌 Pinned</span>}
              <span className="text-xs text-muted-foreground">{article.date} · {article.author}</span>
            </div>
            <h2 className="text-xl font-heading font-bold text-foreground group-hover:text-primary transition-colors">{article.title}</h2>
            <p className="text-sm text-muted-foreground mt-2 line-clamp-2">{article.content}</p>
          </Link>
        ))}
      </div>
    </div>
  );
};

export const NewsDetail = () => {
  const { id } = useParams();
  const article = news.find((n) => n.id === id);

  if (!article) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <h1 className="text-2xl font-heading font-bold text-foreground">Article not found</h1>
        <Link to="/news" className="text-primary hover:underline mt-4 inline-block">← Back to News</Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-10 max-w-3xl">
      <Link to="/news" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6">
        <ArrowLeft className="h-4 w-4" /> All News
      </Link>

      <article>
        <div className="text-xs text-muted-foreground mb-2">{article.date} · {article.author}</div>
        <h1 className="text-3xl md:text-4xl font-heading font-bold text-foreground mb-6">{article.title}</h1>
        <p className="text-foreground/80 leading-relaxed">{article.content}</p>
      </article>
    </div>
  );
};
