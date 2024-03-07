const express = require("express");
const app = express();
app.use(express.json()); //middleware
const path = require("path");

const { open } = require("sqlite");
const sqlite3 = require("sqlite3");

const dbPath = path.join(__dirname, "./cricketTeam.db");
let db = null;
module.exports = app;

const initializeDBAndServer = async () => {
  try {
    app.listen(3000, () => {
      console.log("application running");
    });
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
  } catch (e) {
    console.log(`DB error: ${e.message}`);
    process.exit(1);
  }
};
initializeDBAndServer();

// first api
app.get("/players/", async (req, res) => {
  const get_players_query = `SELECT * FROM cricket_team`;
  const players_list = await db.all(get_players_query);
  const ans = (players_list) => {
    return {
      playerId: players_list.player_id,
      playerName: players_list.player_name,
      jerseyNumber: players_list.jersey_number,
      role: players_list.role,
    };
  };
  res.send(players_list.map((eachPlayer) => ans(eachPlayer)));
  //   return players_list;
});

app.post("/players/", async (req, res) => {
  const playerDetails = req.body;
  const { playerName, jerseyNumber, role } = playerDetails;
  const addPlayer = `INSERT into cricket_team(player_name,jersey_number,role) 
    VALUES ('${playerName}',${jerseyNumber},'${role}')`;
  const dbResponse = await db.run(addPlayer);
  res.send("Player Added to Team");
});

app.get("/players/:playerId", async (req, res) => {
  const { playerId } = req.params;
  const get_players_query = `SELECT * FROM cricket_team where player_id = ${playerId}`;
  const players_list = await db.get(get_players_query);
  const ans = {
    playerId: players_list.player_id,
    playerName: players_list.player_name,
    jerseyNumber: players_list.jersey_number,
    role: players_list.role,
  };
  res.send(ans);
});

app.put("/players/:playerId", async (req, res) => {
  const { playerId } = req.params;
  const playerDetails = req.body;
  const { playerName, jerseyNumber, role } = playerDetails;
  const editPlayer = `UPDATE cricket_team 
  SET 
    player_name ='${playerName}',
    jersey_number= ${jerseyNumber},
    role='${role}' 
    where player_id = ${playerId}`;
  const updatePlayer = await db.run(editPlayer);
  res.send("Player Details Updated");
});

app.delete("/players/:playerId/", async (req, res) => {
  const { playerId } = req.params;
  const deletePlayer = `DELETE from cricket_team where player_id = ${playerId}`;
  const deletePlayerExec = await db.run(deletePlayer);
  res.send("Player Removed");
});
