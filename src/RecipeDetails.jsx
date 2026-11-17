
import { useEffect, useState } from "react";
import axios from "axios";
import { useParams, useNavigate} from "react-router-dom";

function RecipeDetails({ favorites, handleFavorite, removeFavorite })  {
const { id } = useParams();
const navigate = useNavigate();
const [recipe, setRecipe] = useState(null);
const [loading, setLoading] = useState(true);
const [error, setError] = useState("");

  useEffect(() => {
    setLoading(true);
    setError("");

    axios
      .get(
  `https://www.themealdb.com/api/json/v1/1/lookup.php?i=${id}`
)
      .then((response) => {
        const meal = response.data.meals?.[0];

        if (meal) {
          setRecipe(meal);
        } else {
          setError("Recipe not found");
        }
      })
      .catch(() => {
        setError("Unable to fetch recipe details");
      })
      .finally(() => {
        setLoading(false);
      });
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-orange-50">
        <p className="text-xl font-semibold text-orange-600">
          Loading recipe...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-orange-50">
        <p className="text-red-600 text-xl mb-5">{error}</p>
        <button
          onClick={() => navigate(-1)}
          className="bg-orange-500 text-white px-6 py-2 rounded-lg hover:bg-orange-600"
        >
          Go Back
        </button>
      </div>
    );
  }

  if (!recipe) return null;
  const isFavorite = favorites.some(
  (item) => item.idMeal === recipe.idMeal
);

    const ingredients = Array.from({ length: 20 }, (_, index) => {
    const name = recipe[`strIngredient${index + 1}`];
    const measure = recipe[`strMeasure${index + 1}`];

    if (!name || !name.trim()) return null;

    return {
      name,
      measure,
      id: index,
    };
  }).filter(Boolean);

  const youtubeId = recipe.strYoutube?.match(
    /(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&?/]+)/
  )?.[1];

  return (
    <div className="min-h-screen bg-orange-50 py-8 px-4">
      <div className="max-w-5xl mx-auto">


        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="mb-6 bg-white text-orange-600 font-semibold px-5 py-2 rounded-full shadow hover:bg-orange-100 transition"
        >
          ← Back 
        </button>

        {/* Main Recipe Card */}
        <div className="bg-white rounded-3xl shadow-xl overflow-hidden">

          {/* Recipe Image and Name */}
          <div className="grid md:grid-cols-2 gap-6 p-5 md:p-8 items-center">
            <img
              src={recipe.strMealThumb}
              alt={recipe.strMeal}
              className="w-full h-72 md:h-80 object-cover rounded-2xl shadow-md"
            />

            <div>
              <p className="text-orange-500 font-bold uppercase tracking-widest text-sm mb-3">
                Recipe Details
              </p>

              <h1 className="text-3xl md:text-4xl font-extrabold text-gray-800">
                {recipe.strMeal}
              </h1>

              <div className="flex flex-wrap gap-3 mt-6">
                {recipe.strCategory && (
                  <span className="bg-orange-100 text-orange-700 px-4 py-2 rounded-full font-semibold">
                    🍽️ {recipe.strCategory}
                  </span>
                )}

                {recipe.strArea && (
                  <span className="bg-green-100 text-green-700 px-4 py-2 rounded-full font-semibold">
                    🌍 {recipe.strArea}
                  </span>
                )}
              </div>
<button
  onClick={() =>
    isFavorite
      ? removeFavorite(recipe.idMeal)
      : handleFavorite(recipe)
  }
  className={`mt-6 px-6 py-3 rounded-full font-bold shadow transition ${
    isFavorite
      ? "bg-red-100 text-red-600 hover:bg-red-200"
      : "bg-orange-500 text-white hover:bg-orange-600"
  }`}
>
  {isFavorite ? "❤️ Remove from Favorites" : "🤍 Add to Favorites"}
</button>

            </div>
          </div>

          <div className="border-t border-orange-100 mx-5 md:mx-8" />

          {/* Ingredients */}
          <section className="p-5 md:p-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-5">
              🥕 Ingredients
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {ingredients.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between gap-3 bg-orange-50 border border-orange-100 p-4 rounded-xl"
                >
                  <span className="font-medium text-gray-700">
                    {item.name}
                  </span>

                  <span className="text-orange-600 font-semibold text-sm">
                    {item.measure}
                  </span>
                </div>
              ))}
            </div>
          </section>

          <div className="border-t border-orange-100 mx-5 md:mx-8" />

          {/* Cooking Instructions */}
          <section className="p-5 md:p-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-5">
              👨‍🍳 Cooking Instructions
            </h2>

            <p className="text-gray-700 leading-8 whitespace-pre-line">
              {recipe.strInstructions}
            </p>
          </section>

          {/* YouTube Video */}
          
          {recipe.strYoutube && (
            <>
              <div className="border-t border-orange-100 mx-5 md:mx-8" />

              <section className="p-5 md:p-8">
                <h2 className="text-2xl font-bold text-gray-800 mb-5">
                  🎬 Cooking Video
                </h2>

                {youtubeId ? (
                  <div className="w-full aspect-video rounded-2xl overflow-hidden shadow-lg">
                    <iframe
                      className="w-full h-full"
                      src={`https://www.youtube.com/embed/${youtubeId}`}
                      title={`${recipe.strMeal} cooking video`}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  </div>
                ) : (
                  <a
                    href={recipe.strYoutube}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block bg-red-600 text-white px-6 py-3 rounded-full font-semibold hover:bg-red-700 transition"
                  >
                    Watch on YouTube →
                  </a>
                )}
              </section>
            </>
          )}

        </div>

        <p className="text-center text-gray-500 text-sm mt-6">
          Enjoy your delicious homemade recipe! ❤️
        </p>
      </div>
    </div>
  );
}

export default RecipeDetails;
