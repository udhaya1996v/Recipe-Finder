
import { useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";

function Favorites({ favorites, removeFavorite }) {
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [loading, setLoading] = useState(false);

  async function handleViewDetails(id) {
  try {
    setLoading(true);

    const response = await axios.get(
      `https://www.themealdb.com/api/json/v1/1/lookup.php?i=${id}`
    );

    setSelectedRecipe(response.data.meals?.[0] || null);

    setTimeout(() => {
      document.getElementById("recipe-details")?.scrollIntoView({
        behavior: "smooth",
        block: "start"
      });
    }, 100);

  } catch (error) {
    console.log("Error fetching recipe details:", error);
  } finally {
    setLoading(false);
  }
}

  return (
    <div className="min-h-screen bg-orange-50 p-6">

<nav className="w-full px-6 py-5 mb-8">
  <div className="flex justify-center items-center gap-6">

    <Link
      to="/"
      className="bg-gradient-to-r from-orange-500 to-orange-600 text-white font-bold text-lg px-8 py-3 rounded-full shadow-lg hover:scale-105 hover:shadow-xl transition duration-300"
    >
      🏠 Home
    </Link>

    <Link
      to="/favorites"
      className="bg-gradient-to-r from-pink-500 to-rose-600 text-white font-bold text-lg px-8 py-3 rounded-full shadow-lg hover:scale-105 hover:shadow-xl transition duration-300"
    >
      ❤️ Favorites ({favorites.length})
    </Link>

  </div>
</nav>

      <h1 className="text-3xl font-bold text-center text-orange-600 mb-8">
        My Favorite Recipes ❤️
      </h1>

      {favorites.length === 0 ? (
        <p className="text-center text-gray-600">
          No favorite recipes yet!
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {favorites.map((recipe) => (
            <div
              key={recipe.idMeal}
              className="bg-white rounded-xl shadow-lg p-4"
            >
              <img
                src={recipe.strMealThumb}
                alt={recipe.strMeal}
                className="w-full h-48 object-cover rounded-lg"
              />

              <h2 className="font-bold mt-3">
                {recipe.strMeal}
              </h2>

              <button
                onClick={() => handleViewDetails(recipe.idMeal)}
                className="bg-orange-500 text-white px-4 py-2 rounded-lg mt-3 w-full"
              >
                View Details
              </button>

              <button
                onClick={() => removeFavorite(recipe.idMeal)}
                className="bg-red-500 text-white px-4 py-2 rounded-lg mt-2 w-full"
              >
                Remove ❤️
              </button>
            </div>
          ))}
        </div>
      )}

      {loading && (
        <p className="text-center mt-6">Loading recipe details...</p>
      )}

      {selectedRecipe && (
        
        <div className="bg-white rounded-xl shadow-lg p-6 mt-10 max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-orange-600 mb-4">
            {selectedRecipe.strMeal}
          </h2>
<div id="recipe-details"></div>
          <img
            src={selectedRecipe.strMealThumb}
            alt={selectedRecipe.strMeal}
            className="w-full max-w-md rounded-lg mb-4"
          />

          <p><b>Category:</b> {selectedRecipe.strCategory}</p>
          <p><b>Area:</b> {selectedRecipe.strArea}</p>

          <h3 className="text-xl font-bold mt-5 mb-2">Ingredients</h3>

          <ul className="list-disc pl-6">
            {Array.from({ length: 20 }, (_, i) => {
              const ingredient = selectedRecipe[`strIngredient${i + 1}`];
              const measure = selectedRecipe[`strMeasure${i + 1}`];

              return ingredient?.trim() ? (
                <li key={i}>
                  {measure} {ingredient}
                </li>
              ) : null;
            })}
          </ul>

          <h3 className="text-xl font-bold mt-5 mb-2">Instructions</h3>
          <p className="whitespace-pre-line">
            {selectedRecipe.strInstructions}
          </p>

          {selectedRecipe.strYoutube && (
            <a
              href={selectedRecipe.strYoutube}
              target="_blank"
              rel="noreferrer"
              className="text-blue-600 underline block mt-4"
            >
              Watch YouTube Video
            </a>
          )}

          <button
            onClick={() => setSelectedRecipe(null)}
            className="bg-gray-600 text-white px-5 py-2 rounded-lg mt-6"
          >
            Close Details
          </button>
        </div>
      )}

    </div>
  );
}

export default Favorites;
