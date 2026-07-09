import { useState, useEffect, useRef } from 'react';
import './index.css';
import { toolsData, allCategories, pricingTiers } from './data';

function App() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedPricing, setSelectedPricing] = useState('All');
  const [showOnlyFavorites, setShowOnlyFavorites] = useState(false);
  const [favorites, setFavorites] = useState(() => {
    const saved = localStorage.getItem('toolArchiveFavorites');
    return saved ? JSON.parse(saved) : [];
  });
  
  const searchInputRef = useRef(null);

  useEffect(() => {
    localStorage.setItem('toolArchiveFavorites', JSON.stringify(favorites));
  }, [favorites]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      // Focus search bar on '/' press if we're not already typing in an input
      if (e.key === '/' && document.activeElement.tagName !== 'INPUT') {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const toggleFavorite = (e, id) => {
    e.preventDefault(); // Prevent link click
    if (favorites.includes(id)) {
      setFavorites(favorites.filter(favId => favId !== id));
    } else {
      setFavorites([...favorites, id]);
    }
  };

  const filteredTools = toolsData.filter(tool => {
    const matchesCategory = selectedCategory === 'All' || tool.categories.includes(selectedCategory);
    const matchesPricing = selectedPricing === 'All' || tool.pricing === selectedPricing;
    const matchesSearch = tool.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          tool.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFavorites = !showOnlyFavorites || favorites.includes(tool.id);
    
    return matchesCategory && matchesPricing && matchesSearch && matchesFavorites;
  });

  const getPricingClass = (pricing) => {
    if (pricing.includes("Fully Free")) return "pricing-free";
    if (pricing.includes("Freemium")) return "pricing-partly";
    if (pricing.includes("Subscription")) return "pricing-sub";
    return "";
  };

  return (
    <div className="app-container">
      <header className="header">
        <h1 className="title">ToolArchive</h1>
        <p className="subtitle">Press <kbd>/</kbd> to search. Discover the best tools across multiple disciplines.</p>
        
        <div className="filters-container">
          <input 
            type="text" 
            ref={searchInputRef}
            className="filter-input search-bar" 
            placeholder="Search resources by name or description... 🔍" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <select 
            className="filter-input select-box"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            <option value="All">All Categories</option>
            {allCategories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
          <select 
            className="filter-input select-box"
            value={selectedPricing}
            onChange={(e) => setSelectedPricing(e.target.value)}
          >
            <option value="All">All Pricing</option>
            {pricingTiers.map(tier => (
              <option key={tier} value={tier}>{tier}</option>
            ))}
          </select>
          <button 
            className={`filter-input fav-filter-btn ${showOnlyFavorites ? 'active' : ''}`}
            onClick={() => setShowOnlyFavorites(!showOnlyFavorites)}
            title="Toggle Favorites"
          >
            {showOnlyFavorites ? '⭐ Favorites Only' : '☆ Show All'}
          </button>
        </div>
      </header>

      <main className="main-content">
        <section className="tools-grid">
          {filteredTools.map(tool => (
            <a 
              href={tool.url || "#"} 
              target="_blank" 
              rel="noreferrer" 
              className="tool-card-link" 
              key={tool.id}
            >
              <div className="tool-card">
                <button 
                  className={`fav-btn ${favorites.includes(tool.id) ? 'active' : ''}`}
                  onClick={(e) => toggleFavorite(e, tool.id)}
                  title="Toggle Favorite"
                >
                  {favorites.includes(tool.id) ? '⭐' : '☆'}
                </button>
                <div className="tool-header">
                  <div className="tool-header-top">
                    <h3 className="tool-name">
                      <span className="type-icon" title={tool.type === "Website" ? "Website" : "Software Tool"}>
                        {tool.type === "Website" ? "🌐" : "🧰"}
                      </span>
                      {tool.name}
                    </h3>
                    <span className={`pricing-badge ${getPricingClass(tool.pricing)}`}>
                      {tool.pricing}
                    </span>
                  </div>
                </div>
                <p className="tool-desc">{tool.description}</p>
                
                <div className="tool-footer">
                  <div className="category-tags">
                    {tool.categories.map(cat => (
                      <span 
                        key={cat} 
                        className={`tag ${cat === selectedCategory ? 'highlight' : ''}`}
                      >
                        {cat}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </a>
          ))}
          {filteredTools.length === 0 && (
            <div className="no-results">
              <h3>No resources found matching your criteria.</h3>
              <p>Try adjusting your search or filters.</p>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

export default App;
