import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import './App.css';

const API_URL = 'https://dummyjson.com/recipes';

function RecipeDetails({ recipe, onBack, onAddToCart }) {
  if (!recipe) return null;


  return (
    <div className="recipeDetails">
      <button className="backBtn" onClick={onBack}>
        ← Back
      </button>

      <div className="detailsHero">
        {recipe.image ? (
          <img className="detailsImage" src={recipe.image} alt={recipe.name || 'Recipe'} />
        ) : null}
        <div className="detailsText">
          <h2 className="detailsTitle">{recipe.name}</h2>
          {recipe.cuisine ? <div className="pill">Cuisine: {recipe.cuisine}</div> : null}
          {typeof recipe.rating === 'number' ? (
            <div className="pill">Rating: {recipe.rating}</div>
          ) : null}
          {typeof recipe.reviewCount === 'number' ? (
            <div className="pill">Reviews: {recipe.reviewCount}</div>
          ) : null}

          <div className="detailsActions">
          <button
              className="addToCartBtn detailsCartBtn"
              onClick={() => onAddToCart?.(recipe)}
              aria-label={`Add ${recipe.name} to cart`}
            >
              <span className="cartIcon">🛒</span>
              <span className="addToCartText">Add to cart</span>
            </button>
          </div>
        </div>
      </div>


      {recipe.instructions ? (
        <section>
          <h3>Instructions</h3>
          {Array.isArray(recipe.instructions) ? (
            <ol>
              {recipe.instructions.map((step, idx) => (
                <li key={idx}>{step}</li>
              ))}
            </ol>
          ) : (
            <p>{recipe.instructions}</p>
          )}
        </section>
      ) : null}

      {recipe.ingredients ? (
        <section>
          <h3>Ingredients</h3>
          {Array.isArray(recipe.ingredients) ? (
            <ul className="ingredients">
              {recipe.ingredients.map((ing, idx) => (
                <li key={idx}>{ing}</li>
              ))}
            </ul>
          ) : (
            <p>{String(recipe.ingredients)}</p>
          )}
        </section>
      ) : null}

      {recipe.difficulty ? (
        <section>
          <h3>Difficulty</h3>
          <p>{recipe.difficulty}</p>
        </section>
      ) : null}

      {recipe.tips ? (
        <section>
          <h3>Tips</h3>
          <p>{recipe.tips}</p>
        </section>
      ) : null}

      {recipe.description ? (
        <section>
          <h3>Description</h3>
          <p>{recipe.description}</p>
        </section>
      ) : null}
    </div>
  );
}

function RecipeCard({ recipe, onOpen, onAddToCart }) {
  return (
    <div className="recipeCard">
      <button className="recipeCardMain" onClick={() => onOpen(recipe)}>

        {recipe.image ? <img className="recipeThumb" src={recipe.image} alt={recipe.name} /> : null}
        <div className="recipeCardBody">
          <h3 className="recipeName">{recipe.name}</h3>
          {recipe.cuisine ? <div className="recipeMeta">{recipe.cuisine}</div> : null}
          {typeof recipe.rating === 'number' ? <div className="recipeMeta">★ {recipe.rating}</div> : null}
        </div>
      </button>

      <button
        className="addToCartBtn"
        onClick={(e) => {
          e.stopPropagation();
          onAddToCart(recipe);
        }}
        aria-label={`Add ${recipe.name} to cart`}
        title="Add to cart"
      >
        <span className="cartIcon">🛒</span>
        <span className="addToCartText">Add</span>
      </button>
    </div>
  );
}


export default function App() {
  const [recipes, setRecipes] = useState([]);
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    let isMounted = true;

    async function load() {
      try {
        setLoading(true);
        setError('');

        const res = await axios.get(API_URL);
        // dummyjson returns { recipes: [...] }
        const data = res.data?.recipes ?? [];

        if (isMounted) setRecipes(data);
      } catch (e) {
        if (!isMounted) return;
        setError('Failed to load recipes. Please try again.');
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    load();
    return () => {
      isMounted = false;
    };
  }, []);

  const filteredRecipes = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return recipes;
    return recipes.filter((r) => String(r.name || '').toLowerCase().includes(q));
  }, [recipes, query]);

  return (
    <div className="app">
      <header className="header">
        <div className="brand">
          <div className="logo">🍳</div>
          <div>
            <h1>RecipeBook</h1>
          </div>
        </div>
        <div className="searchWrap">
          <div className="searchBox">
            <span className="searchIcon" aria-hidden="true">
              🔎
            </span>
            <input
              className="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search..."
              aria-label="Search recipes"
            />
          </div>
        </div>
      </header>

      <main className="main">
        {loading ? <div className="status">Loading recipes...</div> : null}
        {error ? <div className="status error">{error}</div> : null}

        {!loading && !error && selectedRecipe ? (
          <RecipeDetails
            recipe={selectedRecipe}
            onBack={() => setSelectedRecipe(null)}
            onAddToCart={(r) => alert(`Added to cart: ${r.name}`)}
          />
        ) : null}


        {!loading && !error && !selectedRecipe ? (
          <section>
            <div className="resultsBar">
              <div className="resultsCount">{filteredRecipes.length} recipe(s)</div>
              {query.trim() ? <button className="clearBtn" onClick={() => setQuery('')}>Clear</button> : null}
            </div>

            {filteredRecipes.length === 0 ? (
              <div className="empty">No recipes match “{query}”.</div>
            ) : (
              <div className="grid">
                {filteredRecipes.map((recipe) => (
                  <RecipeCard
                    key={recipe.id}
                    recipe={recipe}
                    onOpen={setSelectedRecipe}
                    onAddToCart={(r) => {
                      // UI-only cart (no backend)
                      alert(`Added to cart: ${r.name}`);
                    }}
                  />
                ))}
              </div>
            )}

          </section>
        ) : null}
      </main>
    </div>
  );
}
