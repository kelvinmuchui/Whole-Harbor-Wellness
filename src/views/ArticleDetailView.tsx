import React, { useEffect, useState } from 'react';
import { dbService } from '../services/dbService.ts';
import type { EducationalArticle } from '../types/index.ts';

interface ArticleDetailViewProps {
  slug: string;
  navigate: (path: string, param?: string) => void;
}

function renderFormattedLine(text: string): React.ReactNode {
  const segments = text.split(/(\*\*[^*]+\*\*)/g);
  return segments.map((seg, i) => {
    if (seg.startsWith('**') && seg.endsWith('**')) {
      return (
        <strong key={i} className="font-semibold text-[#0c2340]">
          {seg.slice(2, -2)}
        </strong>
      );
    }
    return <React.Fragment key={i}>{seg}</React.Fragment>;
  });
}

export const ArticleDetailView: React.FC<ArticleDetailViewProps> = ({ slug, navigate }) => {
  const [article, setArticle] = useState<EducationalArticle | null>(null);
  const [related, setRelated] = useState<EducationalArticle[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    const loadArticle = async () => {
      setLoading(true);
      try {
        const all = await dbService.getArticles();
        const published = all.filter((a) => a.status === 'PUBLISHED');
        const found = published.find((a) => a.slug === slug) || null;
        if (active) {
          setArticle(found);
          setRelated(published.filter((a) => a.slug !== slug).slice(0, 3));
        }
      } catch (err) {
        console.error('Failed to load article:', err);
      } finally {
        if (active) setLoading(false);
      }
    };
    void loadArticle();
    const unsub = dbService.subscribeToCollections(['educational_articles'], () => {
      void loadArticle();
    });
    return () => {
      active = false;
      unsub();
    };
  }, [slug]);

  useEffect(() => {
    if (!article) return;
    document.title = article.seoTitle || `${article.title} – Whole Harbor Wellness`;
    const metaDesc = document.head.querySelector<HTMLMetaElement>('meta[name="description"]');
    if (metaDesc) {
      metaDesc.setAttribute('content', article.seoDescription || article.summary);
    }
  }, [article]);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center text-[#5a6b7c]">
        <p className="text-sm">Loading research article...</p>
      </div>
    );
  }

  if (!article) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="bg-[#fffdfb] border border-[#dfd7c7] rounded-3xl p-10 text-center space-y-4 shadow-xs">
          <span className="material-symbols-outlined text-[40px] text-[#c5a059]">menu_book</span>
          <h1 className="font-serif text-3xl font-bold text-[#0c2340]">
            Article Not Found
          </h1>
          <p className="text-sm text-[#5a6b7c]">
            This research briefing is unavailable or still in draft status.
          </p>
          <button
            type="button"
            onClick={() => navigate('learn')}
            className="px-5 py-2.5 rounded-xl bg-[#0c2340] text-white text-xs font-semibold hover:bg-[#c5a059] transition-colors cursor-pointer"
          >
            Back to Learn Studio
          </button>
        </div>
      </div>
    );
  }

  const lines = article.content
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.length > 0);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16 space-y-10">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => navigate('learn')}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#5a6b7c] hover:text-[#0c2340] cursor-pointer"
        >
          <span className="material-symbols-outlined text-[16px]">arrow_back</span>
          <span>Back to Education Studio</span>
        </button>
        <div className="flex items-center gap-2 text-xs text-[#5a6b7c]">
          <span className="px-2.5 py-0.5 rounded-full bg-[#f6f4ee] border border-[#dfd7c7] text-[#c5a059] font-bold uppercase text-[10px]">
            {article.category}
          </span>
          <span>•</span>
          <span>{article.readTime}</span>
        </div>
      </div>

      <article className="bg-[#fffdfb] border border-[#dfd7c7] rounded-3xl overflow-hidden shadow-xs">
        {article.imageUrl && (
          <div className="h-64 sm:h-80 w-full bg-[#f6f4ee] overflow-hidden border-b border-[#dfd7c7]">
            <img
              src={article.imageUrl}
              alt={article.title}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        <div className="p-7 sm:p-10 space-y-6">
          <div className="space-y-3 border-b border-[#dfd7c7] pb-6">
            <h1 className="font-serif text-3xl sm:text-4xl font-bold text-[#0c2340] leading-tight">
              {article.title}
            </h1>
            <p className="text-base text-[#5a6b7c] leading-relaxed">
              {article.summary}
            </p>
            <div className="flex flex-wrap items-center justify-between gap-3 pt-2 text-xs text-[#5a6b7c]">
              <span>
                By <strong className="text-[#0c2340]">{article.author}</strong>
              </span>
              <span>
                Published {new Date(article.publishedAt || article.createdAt).toLocaleDateString()}
              </span>
            </div>
            {article.tags && article.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 pt-2">
                {article.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-2.5 py-0.5 rounded-full bg-[#f6f4ee] border border-[#dfd7c7] text-[10px] font-semibold text-[#5a6b7c]"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-4 text-sm text-[#111d2b] leading-relaxed">
            {lines.map((line, index) => {
              if (line.startsWith('#### ')) {
                return (
                  <h3 key={index} className="font-serif text-xl font-semibold text-[#0c2340] pt-3">
                    {line.slice(5)}
                  </h3>
                );
              }
              if (line.startsWith('### ')) {
                return (
                  <h2 key={index} className="font-serif text-2xl font-bold text-[#0c2340] pt-4">
                    {line.slice(4)}
                  </h2>
                );
              }
              if (line.startsWith('- ')) {
                return (
                  <div key={index} className="flex items-start gap-2.5 pl-2">
                    <span className="text-[#c5a059] font-bold">•</span>
                    <span>{renderFormattedLine(line.slice(2))}</span>
                  </div>
                );
              }
              if (/^\d+\.\s/.test(line)) {
                const match = line.match(/^(\d+\.)\s(.*)$/);
                return (
                  <div key={index} className="flex items-start gap-2.5 pl-2">
                    <span className="text-[#c5a059] font-bold min-w-5">{match?.[1]}</span>
                    <span>{renderFormattedLine(match?.[2] || line)}</span>
                  </div>
                );
              }
              return <p key={index}>{renderFormattedLine(line)}</p>;
            })}
          </div>
        </div>
      </article>

      {related.length > 0 && (
        <div className="space-y-4">
          <h2 className="font-serif text-2xl font-bold text-[#0c2340]">
            More Clinical Briefings
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {related.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => navigate('article-detail', item.slug)}
                className="text-left bg-[#fffdfb] border border-[#dfd7c7] rounded-2xl p-5 hover:border-[#c5a059] transition-all cursor-pointer space-y-2 shadow-xs"
              >
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#c5a059]">
                  {item.category} • {item.readTime}
                </span>
                <h3 className="font-serif text-lg font-bold text-[#0c2340] leading-snug">
                  {item.title}
                </h3>
                <p className="text-xs text-[#5a6b7c] line-clamp-2">{item.summary}</p>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ArticleDetailView;
