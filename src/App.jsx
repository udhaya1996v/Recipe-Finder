
import { useState, useEffect, useRef } from "react";
import axios from "axios";
import Favorites from "./Favorites.jsx";
import { Link, Routes, Route, useNavigate } from "react-router-dom";
import RecipeDetails from "./RecipeDetails.jsx";


function App() 
{

  const navigate = useNavigate();
  const [recipes, setRecipes] = useState([]);
  const [search, setSearch] = useState("");
  const [ingredient, setIngredient] = useState("");
  const [categories, setCategories] = useState([]);
  const [areas, setAreas] = useState([]);
  const [selectedArea, setSelectedArea] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [selectedCategory, setSelectedCategory] = useState("");
  

  const [sortOrder, setSortOrder] = useState("");

  const [currentPage, setCurrentPage] = useState(1);
  const recipesRef = useRef(null);
  const recipesPerPage = 8;
  const fetchedAreaIds = useRef(new Set()); 

  // Favorites

  const [favorites, setFavorites] = useState(() => {
    try {
      const saved = localStorage.getItem("favorites");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  
  // Save favorites
  useEffect(() => {
    localStorage.setItem("favorites", JSON.stringify(favorites));
  }, [favorites]);

  
  
  // Load categories
  useEffect(() => {
    axios
      .get("https://www.themealdb.com/api/json/v1/1/list.php?c=list")
      .then((response) => {
        setCategories(response.data.meals || []);
      })
      .catch(() => {
        setError("Unable to fetch categories");
      });
  }, []);

useEffect(() => {
  axios
    .get("https://www.themealdb.com/api/json/v1/1/list.php?a=list")
    .then((response) => {
      setAreas(response.data.meals || []);
    })
    .catch(() => {
      setError("Unable to fetch cuisine areas");
    });
}, []);


  // Load all recipes when the app opens
  
  async function loadAllRecipes() {
    setLoading(true);
    setError("");

    try {
      const letters = "abcdefghijklmnopqrstuvwxyz".split("");

      const responses = await Promise.all(
        letters.map((letter) =>
          axios.get(
            `https://www.themealdb.com/api/json/v1/1/search.php?f=${letter}`
          )
        )
      );

      const allMeals = responses.flatMap(
        (response) => response.data.meals || []
      );

      // Remove duplicate recipes
  
      const uniqueMeals = [
        ...new Map(
          allMeals.map((meal) => [meal.idMeal, meal])
        ).values()
      ];

      setRecipes(uniqueMeals);
      setCurrentPage(1);
    
    } catch (err) {
      console.error(err);
      setError("Unable to load all recipes.");
    } finally {
      setLoading(false);
    }
  }

  
// Run once when the Home page loads

useEffect(() => {
    loadAllRecipes();
  }, []);


  // Apply all selected filters
 
  async function handleApplyFilters() {
  const name = search.trim();
  const ingredientName = ingredient.trim();

 if (!name && !ingredientName && !selectedCategory && !selectedArea) {
    setError("Please enter a search or select a category");
    return;
  }

  setCurrentPage(1);
  setLoading(true);
  setError("");

 

  try {
    const requests = [];

  
  
 // Search by recipe name or category keyword

 if (name) {
  const categoryAliases = {
    pasta: "Pasta",
    mutton: "Lamb",
    lamb: "Lamb"
  };

  const matchedCategory = categoryAliases[name.toLowerCase()];

  if (matchedCategory) {
    requests.push(
      axios.get(
        `https://www.themealdb.com/api/json/v1/1/filter.php?c=${encodeURIComponent(matchedCategory)}`
      )
    );
  } else {
    requests.push(
      axios.get(
        `https://www.themealdb.com/api/json/v1/1/search.php?s=${encodeURIComponent(name)}`
      )
    );
  }
}


// Search by ingredient

if (ingredientName) {
      requests.push(
        axios.get(
          `https://www.themealdb.com/api/json/v1/1/filter.php?i=${encodeURIComponent(ingredientName)}`
        )
      );
    }

    // Filter by category

    if (selectedCategory) {
      requests.push(
        axios.get(
          `https://www.themealdb.com/api/json/v1/1/filter.php?c=${encodeURIComponent(selectedCategory)}`
        )
      );
    }




// Filter by cuisine / area

if (selectedArea) {
  requests.push(
    axios.get(
      `https://www.themealdb.com/api/json/v1/1/filter.php?a=${encodeURIComponent(selectedArea)}`
    )
  );
}



    // Get all API results

    const responses = await Promise.all(requests);

    const resultLists = responses.map(
      (response) => response.data.meals || []
    );

    console.log(
      "Individual result counts:",
      resultLists.map((list) => list.length)
    );

    // Start with the first result

    let matchingRecipes = resultLists[0];

    // Find recipes present in every result

    for (let i = 1; i < resultLists.length; i++) {
      const matchingIds = new Set(
        resultLists[i].map((recipe) => recipe.idMeal)
      );

      matchingRecipes = matchingRecipes.filter(
        (recipe) => matchingIds.has(recipe.idMeal)
      );
    }

    // Display matching recipes

    setRecipes(matchingRecipes);

    setTimeout(() => {
    recipesRef.current?.scrollIntoView({
    behavior: "smooth",
    block: "start"
  });
}, 200);

    console.log("Final matching count:", matchingRecipes.length);

    if (matchingRecipes.length === 0) {
      setError("No recipes found. Try different search values.");
    }

  }
   catch (err) 
   {
    console.error("Actual error:", err);
    setError("Unable to fetch recipes. Please try again.");
    setRecipes([]);
  }
   finally
    {
    setLoading(false);
  }
}


  // Clear all filters
  
  function handleClear()
   {
    setSearch("");
    setIngredient("");
    setSelectedCategory("");
    setSortOrder("");
    loadAllRecipes();  
    setError("");
    setCurrentPage(1);
    setLoading(false);
    setSelectedArea("");

  }

  // Get complete recipe details
  
  function handleRecipeClick(recipe) 
  {
  navigate(`/recipe/${recipe.idMeal}`);
}

  
// Add to favorites

function handleFavorite(recipe) 
{
    if (favorites.some((item) => item.idMeal === recipe.idMeal)) {
      setError("This recipe is already in Favorites!");
      return;
    }

    setFavorites((previous) => [...previous, recipe]);
    setError("");
  }

  // Remove from favorites

  function removeFavorite(id) {
    setFavorites((previous) =>
      previous.filter((recipe) => recipe.idMeal !== id)
    );
  }

  // Sort recipes

  const sortedRecipes = [...recipes].sort((a, b) => {
    if (sortOrder === "az") {
      return a.strMeal.localeCompare(b.strMeal);
    }

    if (sortOrder === "za") {
      return b.strMeal.localeCompare(a.strMeal);
    }

    return 0;
  });

  // Pagination

  const totalPages = Math.ceil(
    sortedRecipes.length / recipesPerPage
  );

  const firstIndex = (currentPage - 1) * recipesPerPage;

  const currentRecipes = sortedRecipes.slice(
    firstIndex,
    firstIndex + recipesPerPage
  );

  // Fetch complete information for visible recipes

  useEffect(() => {
  let cancelled = false;
  let completed = false;

  async function fetchRecipeAreas() {
   const missingRecipes = currentRecipes.filter(
  (recipe) =>
    (!recipe.strArea || !recipe.strCategory) &&
    !fetchedAreaIds.current.has(recipe.idMeal)
);

    if (missingRecipes.length === 0) return;

    missingRecipes.forEach((recipe) => {
      fetchedAreaIds.current.add(recipe.idMeal);
    });

    try {
      const results = await Promise.all(
        missingRecipes.map(async (recipe) => {
          try {
            const response = await axios.get(
              `https://www.themealdb.com/api/json/v1/1/lookup.php?i=${recipe.idMeal}`
            );

            return response.data.meals?.[0] || null;
          } catch {
            return null;
          }
        })
      );

      if (cancelled) return;

      const detailsMap = new Map(
        results
          .filter(Boolean)
          .map((meal) => [meal.idMeal, meal])
      );

      completed = true;

      if (detailsMap.size > 0) {
        setRecipes((previous) =>
          previous.map((recipe) => {
            const details = detailsMap.get(recipe.idMeal);

            return details
              ? {
                  ...recipe,
                  strArea: details.strArea,
                  strCategory: details.strCategory,
                }
              : recipe;
          })
        );
      }
    } catch (error) {
      console.log("Area lookup error:", error);
    }
  }

  fetchRecipeAreas();

  return () => {
    cancelled = true;

    if (!completed) {
      currentRecipes.forEach((recipe) => {
        fetchedAreaIds.current.delete(recipe.idMeal);
      });
    }
  };
}, [recipes, currentPage, sortOrder]);


  return (
    <Routes>

      {/* Home page */}

      <Route
        path="/"
        element={
          <div className="min-h-screen bg-orange-50 p-6">

            {/* Navigation */}
         
<nav className="w-full bg-white shadow-md px-6 md:px-12 py-5 mb-8">
  <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-5">

    {/* Left side - Heading */}
    <h1 className="text-2xl md:text-3xl font-extrabold text-orange-600">
      Welcome to Recipe Finder 🍽️
    </h1>

    {/* Right side - Navigation buttons */}

    <div className="flex items-center gap-4">
      <Link
        to="/"
        className="bg-orange-500 text-white font-bold px-6 py-3 rounded-full shadow-md hover:bg-orange-600 hover:scale-105 transition duration-300"
      >
        🏠 Home
      </Link>

      <Link
        to="/favorites"
        className="bg-pink-500 text-white font-bold px-6 py-3 rounded-full shadow-md hover:bg-pink-600 hover:scale-105 transition duration-300"
      >
        ❤️ Favorites
      </Link>
    </div>

  </div>
</nav>
           {/* Hero Section */}
           
            <div className="grid md:grid-cols-2 items-center gap-8 bg-orange-100 rounded-3xl p-8 md:p-12 mb-10">
              <div>
                <p className="text-orange-600 font-bold uppercase tracking-widest mb-3">
                  Welcome to Foodie
                </p>

                <h1 className="text-4xl md:text-5xl font-extrabold text-gray-800 leading-tight mb-5">
                  Discover Delicious Recipes 🍽️
                </h1>

                <p className="text-gray-600 text-lg mb-6">
                  Find your favorite meals and make every day delicious!
                </p>

                <p className="text-orange-600 font-semibold">
                  Cook with love. Eat with joy. ❤️
                </p>
              </div>

              <div>
                <img
                  src="https://images.unsplash.com/photo-1546069901-ba9599a7e63c"
                  alt="Delicious food"
                  className="w-full h-72 md:h-80 object-cover rounded-3xl shadow-xl"
                />
              </div>
            </div>

            
{/* Recipe Discovery & Filters */}

<div className="max-w-6xl mx-auto bg-white rounded-3xl shadow-lg p-6 md:p-8 mb-10">

  <div className="text-center mb-7">
    <p className="text-orange-500 font-bold uppercase tracking-widest text-sm">
      Find something delicious
    </p>
    <h2 className="text-3xl font-extrabold text-gray-800 mt-2">
      Explore Recipes
    </h2>
    <p className="text-gray-500 mt-2">
      Search, discover and organize your favourite meals.
    </p>
  </div>

  {/* Search */}

  <div className="grid md:grid-cols-2 gap-4 mb-7">

    <div>
      <label className="block font-bold text-gray-700 mb-2">
        🔍 Recipe Name
      </label>
      <input
        type="text"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        onKeyDown={(e) =>
          e.key === "Enter" && handleApplyFilters()
        }
        placeholder="Example: Chicken, Pasta..."
        className="w-full border border-orange-200 rounded-xl p-4 focus:outline-none focus:ring-2 focus:ring-orange-400"
      />
    </div>

    <div>
      <label className="block font-bold text-gray-700 mb-2">
        🥕 Search Ingredient
      </label>
      <input
        type="text"
        value={ingredient}
        onChange={(e) => setIngredient(e.target.value)}
        onKeyDown={(e) =>
          e.key === "Enter" && handleApplyFilters()
        }
        placeholder="Example: Tomato, Chicken..."
        className="w-full border border-orange-200 rounded-xl p-4 focus:outline-none focus:ring-2 focus:ring-orange-400"
      />
    </div>

  </div>

  {/* Category */}

  <div className="mb-5">
    <label className="block font-bold text-gray-700 mb-2">
      🍽️ Choose Your Category
    </label>

    <select
      value={selectedCategory}
      onChange={(e) => setSelectedCategory(e.target.value)}
      className="w-full border border-orange-200 bg-orange-50 rounded-xl p-4 focus:outline-none focus:ring-2 focus:ring-orange-400"
    >
      <option value="">All Categories</option>
      {categories.map((category) => (
        <option
          key={category.strCategory}
          value={category.strCategory}
        >
          {category.strCategory}
        </option>
      ))}
    </select>
  </div>

  {/* Cuisine */}

  <div className="mb-5">
    <label className="block font-bold text-gray-700 mb-2">
      🌍 Choose Your Cuisine
    </label>

    <select
      value={selectedArea}
      onChange={(e) => setSelectedArea(e.target.value)}
      className="w-full border border-orange-200 bg-orange-50 rounded-xl p-4 focus:outline-none focus:ring-2 focus:ring-orange-400"
    >
      <option value="">All Cuisines</option>
      {[...new Map(
        areas.map((area) => [area.strArea, area])
      ).values()].map((area) => (
        <option key={area.strArea} value={area.strArea}>
          {area.strArea}
        </option>
      ))}
    </select>
  </div>

  {/* Sorting */}

  <div className="mb-7">
    <label className="block font-bold text-gray-700 mb-2">
      ↕️ Sort Recipes
    </label>

    <select
      value={sortOrder}
      onChange={(e) => {
        setSortOrder(e.target.value);
        setCurrentPage(1);
      }}
      className="w-full border border-orange-200 bg-orange-50 rounded-xl p-4 focus:outline-none focus:ring-2 focus:ring-orange-400"
    >
      <option value="">Default Order</option>
      <option value="az">Name: A to Z</option>
      <option value="za">Name: Z to A</option>
    </select>
  </div>

  {/* Action Buttons */}
 
  <div className="flex flex-col sm:flex-row gap-3">
    <button
      onClick={handleApplyFilters}
      className="flex-1 bg-orange-500 hover:bg-orange-600 text-white font-bold p-4 rounded-xl shadow-md transition duration-300"
    >
      🔍 Find Recipes
    </button>

    <button
      onClick={handleClear}
      className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold p-4 rounded-xl transition duration-300"
    >
      ↻ Clear All Filters
    </button>
  </div>

</div>


{/* Loading */}


            {loading && (
              <p className="text-center text-blue-600 font-bold mb-5">
                Loading recipes...
              </p>
            )}

 {/* Error */}


            {error && (
              <p className="text-center text-red-600 font-bold mb-4">
                {error}
              </p>
            )}
            

            
          
{/* Recipe Cards */}


{!loading && recipes.length > 0 && (
  <p className="text-center font-bold text-gray-700 mt-4">
    Total Recipes: {recipes.length}
  </p>
)}
<div
  ref={recipesRef}
  className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mt-6"
>

  
  {currentRecipes.map((recipe) => {
    const isFavorite = favorites.some(
      (item) => item.idMeal === recipe.idMeal
    );
    

    return (
     <div
  key={recipe.idMeal}
  onClick={() => handleRecipeClick(recipe)}
  className="bg-white rounded-2xl shadow-md p-4 overflow-hidden hover:shadow-2xl hover:-translate-y-2 transition duration-300 cursor-pointer"
>
        <img
          src={recipe.strMealThumb}
          alt={recipe.strMeal}
         
          className="w-full h-52 object-cover rounded-xl cursor-pointer"
        />

        <h2
        
          className="text-lg font-bold mt-4 text-gray-800 cursor-pointer"
        >
          {recipe.strMeal}
        </h2>

    <div className="cursor-default select-text">

  <p className="text-orange-600 text-sm font-semibold mt-2">
  {selectedCategory && (
  <p className="text-orange-600 text-sm font-semibold  mt-2">
    Category: {
      recipe.strCategory ||
      ({
        mutton: "Lamb",
        lamb: "Lamb",
        pasta: "Pasta"
      }[search.trim().toLowerCase()]) ||
      "Not available"
    }
  </p>
)}
</p>

  {selectedArea && (
    <p className="text-orange-600 text-sm font-semibold mt-2">
      Country: {selectedArea}
    </p>
  )}

  {search.trim() && (
    <p className="text-orange-600 text-sm font-semibold mt-2">
      Search: {search}
    </p>
  )}

  {ingredient.trim() && (
    <p className="text-orange-600 text-sm font-semibold  mt-2">
      Ingredient: {ingredient}
    </p>
  )}

</div>
        <div className="flex flex-col gap-2 mt-3">
          <button
           
            className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg"
          >
            View Details
          </button>

          <button
           onClick={(e) => {
  e.stopPropagation();
  handleFavorite(recipe);
}}
            disabled={isFavorite}
            className={`text-white px-4 py-2 rounded-lg ${
              isFavorite
                ? "bg-green-600 cursor-not-allowed"
                : "bg-orange-500 hover:bg-orange-600"
            }`}
          >
            {isFavorite ? "Added ❤️" : "Add to Favorites ❤️"}
          </button>
        </div>
      </div>
    );
  })}
</div>


            {/* Pagination */}

            
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-5 mt-8">
                <button
                  onClick={() =>
                    setCurrentPage((page) => page - 1)
                  }
                  disabled={currentPage === 1}
                  className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg disabled:bg-gray-400"
                >
                  Previous
                </button>

                <span className="font-bold text-gray-700">
                  Page {currentPage} of {totalPages}
                </span>

                <button
                  onClick={() =>
                    setCurrentPage((page) => page + 1)
                  }
                  disabled={currentPage === totalPages}
                  className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg disabled:bg-gray-400"
                >
                  Next
                </button>
              
              </div>
            )}

            {/* Footer */}

            <footer className="mt-16 bg-gradient-to-r from-orange-600 via-orange-500 to-amber-500 text-white px-6 py-10 rounded-2xl shadow-lg">
              <div className="max-w-7xl mx-auto text-center">

                <h2 className="text-2xl md:text-3xl font-extrabold mb-3">
                  🍽️ Made with Love & Passion
                </h2>

                <p className="text-orange-50 text-lg mb-5">
                  Discover delicious recipes. Create beautiful memories.
                </p>

                <div className="text-3xl mb-5">
                  🍕 🥗 🍰 🍜
                </div>

                <div className="border-t border-orange-200 pt-5">
                  <p className="text-sm">
                    © 2026 Recipe Finder | Every recipe tells a story ❤️
                  </p>
                </div>

              </div>
            </footer>

          </div>
        }
      />

      
{/* Favorites Page */}

<Route
  path="/favorites"
  element={
    <Favorites
      favorites={favorites}
      removeFavorite={removeFavorite}
    />
  }
/>

{/* Recipe Details Page */}

<Route
  path="/recipe/:id"
  element={
    <RecipeDetails
      favorites={favorites}
      handleFavorite={handleFavorite}
      removeFavorite={removeFavorite}
    />
  }
/>
    </Routes>
  );
}

export default App;
