const express = require("express");
const path = require("path");
const sqlite3 = require("sqlite3");
const { open } = require("sqlite");
const nodemon = require("nodemon");

const app = express();

const dbPath = path.join(__dirname, "moviesData.db");

let db = null;

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server/Database started successfully");
    });
  } catch (e) {
    console.log("Error: ", e);
  }
};

initializeDBAndServer();

app.use(express.json());

const objConverterForAPI1 = (movieObj) => {
  return {
    movieName: movieObj.movie_name,
  };
};

const objConverterForAPI3 = (movieObj) => {
  return {
    movieId: movieObj.movie_id,
    directorId: movieObj.director_id,
    movieName: movieObj.movie_name,
    leadActor: movieObj.lead_actor,
  };
};

//API 1
app.get("/movies/", async (request, response) => {
  const getAllPlayerQuery = `
        SELECT movie_name
        FROM movie;
    `;
  const moviesArray = await db.all(getAllPlayerQuery);
  response.send(moviesArray.map((eachMovie) => objConverterForAPI1(eachMovie)));
});

//API 2
app.post("/movies/", async (request, response) => {
  try {
    const movieDetails = request.body;
    const { directorId, movieName, leadActor } = movieDetails;

    const addMovieQuery = `
    INSERT INTO movie
    (director_id, movie_name, lead_actor)
    VALUES(
        ${directorId},
        '${movieName}',
        '${leadActor}'
    )
  `;
    await db.run(addMovieQuery);
    response.send("Movie Successfully Added");
  } catch (error) {
    console.log("Error in API 2");
  }
});

//API 3
app.get("/movies/:movieId/", async (request, response) => {
  let movieId;
  try {
    movieId = parseInt(request.params.movieId);

    const getMovieQuery = `
        SELECT *
        FROM movie
        WHERE movie_id = ${movieId};
    `;
    const movieDetails = await db.get(getMovieQuery);
    response.send(objConverterForAPI3(movieDetails));
    console.log(movieDetails);
  } catch (error) {
    console.log(request.params);
    console.log("Error in API 3");
    console.log(typeof movieId);
  }
});

//API 4
app.put("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const { directorId, movieName, leadActor } = request.body;
  const updateMovieDetailsQuery = `
        UPDATE movie
        SET
        director_id = "${directorId}",
        movie_name = "${movieName}",
        lead_actor = "${leadActor}",
        WHERE movie_id = ${movieId}
    `;
  await db.run(updateMovieDetailsQuery);
  response.send("Movie Details Updated");
});

//API 5
app.delete("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const deleteMovieQuery = `
        DELETE FROM movie
        WHERE movie_id = '${movieId}';
    `;
  response.send("Movie Removed");
});

module.exports = app;
