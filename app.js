const express = require("express");
const path = require("path");
const sqlite3 = require("sqlite3");
const { open } = require("sqlite");
const nodemon = require("nodemon");

const app = express();
app.use(express.json());

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

const objConverter = (Obj) => {
  if ("movie_id" in Obj) {
    return {
      movieId: Obj.movie_id,
      directorId: Obj.director_id,
      movieName: Obj.movie_name,
      leadActor: Obj.lead_actor,
    };
  } else if ("movie_name" in Obj) {
    return {
      movieName: Obj.movie_name,
    };
  } else if ("director_name" in Obj) {
    return {
      directorId: Obj.director_id,
      directorName: Obj.director_name,
    };
  }
};

const objConverterForAPI3 = (movieObj) => {};

//API 1
app.get("/movies/", async (request, response) => {
  const getAllPlayerQuery = `
        SELECT movie_name
        FROM movie;
    `;
  const moviesArray = await db.all(getAllPlayerQuery);
  response.send(moviesArray.map((eachMovie) => objConverter(eachMovie)));
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
  try {
    const { movieId } = request.params;
    const getMovieDetailsQuery = `
        SELECT 
            *
        FROM 
            movie
        WHERE 
            movie_id = ${movieId};
    `;
    const movieDetails = await db.get(getMovieDetailsQuery);
    response.send(objConverter(movieDetails));
  } catch (error) {
    console.log(error);
  }
});

//API 4
app.put("/movies/:movieId/", async (request, response) => {
  try {
    const { movieId } = request.params;
    const { directorId, movieName, leadActor } = request.body;
    // const updateMovieDetailsQuery = `
    //     UPDATE
    //         movie
    //     SET
    //         director_id = ${directorId},
    //         movie_name = '${movieName}',
    //         lead_actor = '${leadActor}',
    //     WHERE
    //         movie_id = ${movieId}
    const updateMovieQuery = `
            UPDATE 
                movie
            SET
              director_id = ${directorId},
              movie_name = '${movieName}',
              lead_actor = '${leadActor}'
            WHERE 
                movie_id = ${movieId};
    `;
    await db.run(updateMovieQuery);
    response.send("Movie Details Updated");
  } catch (error) {
    console.log("Error is in API 4");
  }
});

//API 5
app.delete("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const deleteMovieQuery = `
        DELETE 
        FROM 
            movie
        WHERE 
            movie_id = ${movieId};
    `;
  await db.run(deleteMovieQuery);
  response.send("Movie Removed");
});

//API 6
app.get("/directors/", async (request, response) => {
  const getDirectorsDetailsQuery = `
        SELECT
            *
        FROM
            director;        
    `;
  const directorsArray = await db.all(getDirectorsDetailsQuery);
  response.send(directorsArray.map((director) => objConverter(director)));
});

//API 7
app.get("/directors/:directorId/movies/", async (request, response) => {
  const { directorId } = request.params;
  const getMoviesQuery = `
        SELECT
            movie_name
        FROM
            movie
        WHERE
            director_id = ${directorId};
    `;
  const moviesArray = await db.all(getMoviesQuery);
  response.send(moviesArray.map((movie) => objConverter(movie)));
});

module.exports = app;
