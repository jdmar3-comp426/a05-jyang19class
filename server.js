// Define app using express
var express = require("express")
var app = express()
// Require database SCRIPT file
var db = require("./database.js")

// Require md5 MODULE
var md5 = require("md5")

// Make Express use its own built-in body parser
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Set server port
var HTTP_PORT = 5000

// Start server
app.listen(HTTP_PORT, () => {
    console.log("Server running on port %PORT%".replace("%PORT%",HTTP_PORT))
});
// READ (HTTP method GET) at root endpoint /app/
app.get("/app/", (req, res, next) => {
    res.json({"message":"Your API works! (200)"});
	res.status(200);
});

// Define other CRUD API endpoints using express.js and better-sqlite3
// CREATE a new user (HTTP method POST) at endpoint /app/new/
app.post("/app/new/", (req, res) => {
	user = req.body.user
	password = md5(req.body.pass)
	const insert = db.prepare("INSERT INTO userinfo (user, pass) VALUES (?,?)")
	const id = insert.run(user, password)
	res.status(201).json({"message":"1 record created: ID " + id.lastInsertRowid + " (201)"});
})

// READ a list of all users (HTTP method GET) at endpoint /app/users/
app.get("/app/users", (req, res) => {	
	const stmt = db.prepare("SELECT * FROM userinfo").all();
	res.status(200).json(stmt);
});

// READ a single user (HTTP method GET) at endpoint /app/user/:id
app.get("/app/user/:id", (req, res) => {	
	id = req.params.id
	const stmt = db.prepare("SELECT * FROM userinfo WHERE id=?")
	const info = stmt.get(id)
	res.status(200).json(info);
});

// UPDATE a single user (HTTP method PATCH) at endpoint /app/update/user/:id
app.patch("/app/update/user/:id", (req, res) => {
	id = req.params.id
	user = req.body.user
	password = md5(req.body.pass)
	const update = db.prepare("UPDATE userinfo SET user = COALESCE(?,user), pass = COALESCE(?,pass) WHERE id = ?")
	update.run(user, password, id)
	res.status(200).json({"message":"1 record updated: ID " + id + " (200)"});
})

// DELETE a single user (HTTP method DELETE) at endpoint /app/delete/user/:id
app.delete("/app/delete/user/:id", (req, res) => {
	id = req.params.id
	const remove = db.prepare("DELETE FROM userinfo WHERE id = ?")
	remove.run(id)
	res.status(200).json({"message":"1 record deleted: ID " + id + " (200)"})
})

// Default response for any other request
app.use(function(req, res){
	res.json({"message":"Endpoint not found. (404)"});
    res.status(404);
});
