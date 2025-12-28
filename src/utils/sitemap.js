import { tmdbApi } from '../services/api.js';

class SitemapGenerator {
  constructor() {
    this.baseUrl = 'https://movieflix-app.vercel.app';
    this.staticPages = [
      { url: '/', priority: '1.0', changefreq: 'daily' },
      { url: '/movies', priority: '0.9', changefreq: 'daily' },
      { url: '/popular', priority: '0.8', changefreq: 'weekly' },
      { url: '/top-rated', priority: '0.8', changefreq: 'weekly' },
      { url: '/now-playing', priority: '0.8', changefreq: 'daily' },
      { url: '/upcoming', priority: '0.7', changefreq: 'weekly' }
    ];
  }

  async generateSitemap() {
    try {
      const moviePages = await this.getMoviePages();
      const allPages = [...this.staticPages, ...moviePages];
      
      return this.createXMLSitemap(allPages);
    } catch (error) {
      console.error('Sitemap generation error:', error);
      return this.createXMLSitemap(this.staticPages);
    }
  }

  async getMoviePages() {
    const moviePages = [];
    
    try {
      // Get popular movies for sitemap
      const popularMovies = await tmdbApi.getMovies('popular', 1);
      const topRatedMovies = await tmdbApi.getMovies('top_rated', 1);
      
      const allMovies = [
        ...(popularMovies.results || []),
        ...(topRatedMovies.results || [])
      ];
      
      // Remove duplicates
      const uniqueMovies = allMovies.filter((movie, index, self) => 
        index === self.findIndex(m => m.id === movie.id)
      );
      
      uniqueMovies.forEach(movie => {
        moviePages.push({
          url: `/movie/${movie.id}`,
          priority: '0.6',
          changefreq: 'monthly',
          lastmod: new Date().toISOString().split('T')[0]
        });
      });
      
    } catch (error) {
      console.error('Error fetching movies for sitemap:', error);
    }
    
    return moviePages;
  }

  createXMLSitemap(pages) {
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${pages.map(page => `  <url>
    <loc>${this.baseUrl}${page.url}</loc>
    <lastmod>${page.lastmod || new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`).join('\n')}
</urlset>`;
    
    return xml;
  }

  // Generate robots.txt content
  generateRobotsTxt() {
    return `User-agent: *
Allow: /

Sitemap: ${this.baseUrl}/sitemap.xml

# Crawl-delay for respectful crawling
Crawl-delay: 1

# Block unnecessary paths
Disallow: /api/
Disallow: /_next/
Disallow: /admin/
Disallow: /private/`;
  }
}

export const sitemapGenerator = new SitemapGenerator();