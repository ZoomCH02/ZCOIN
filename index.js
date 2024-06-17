const express = require("express");
const session = require("express-session");
const sqlite3 = require("sqlite3").verbose();
const bodyParser = require("body-parser");
var jwt = require('jsonwebtoken');
const JWTSECRET = 'afw4tds'

const app = express();
const port = 3000;

app.use(bodyParser.json());
app.use(express.static("public"));

app.use(
    session({
        secret: "your-secret-key",
        resave: false,
        saveUninitialized: true,
    }),
);

const db = new sqlite3.Database("./db.db", (err) => {});

app.post("/", (req, res) => {
    const { userId } = req.body;
    if (!userId) {
        return res.status(400).send("userId is required");
    }
    res.send({ userId });
});

app.get("/userInfo", (req, res) => {
    var decoded = {}
    try {
       decoded = jwt.verify(req.query.user, JWTSECRET);
    } catch(err) {
      res.send('no')
      return;
    }
    
    if(!decoded.userId){
        res.send('no2')
        return;
    }

    const userId = decoded.userId
    req.session.userId = userId;

    db.get(
        "SELECT * FROM Sessions s, Levels l WHERE s.user_id = ? AND l.id = s.level",
        [userId],
        (err, row) => {
            if (err) {
                console.error("Ошибка при запросе к базе данных:", err.message);
                res.status(500).send("Ошибка при запросе к базе данных");
            } else {
                const clickCount = row ? row.click_count : 0;
                res.send({ clickCount, row });
            }
        },
    );
});

app.get("/cards", (req, res) => {
    db.all("SELECT * FROM Cards", (err, rows) => {
        if (err) {
            console.error("Ошибка при запросе к базе данных:", err.message);
            res.status(500).send("Ошибка при запросе к базе данных");
        } else {
            res.send({ rows });
        }
    });
});

app.post("/updateLevel", (req, res) => {
    const userId = req.session.userId;
    const level = req.body.lvl;
    if (!userId) {
        return res.status(400).send("userId is required");
    }
    db.run(
        "UPDATE Sessions SET level = ? WHERE user_id = ?",
        [level, userId],
        (err) => {
            if (err) {
                console.error(
                    "Ошибка при обновлении базы данных:",
                    err.message,
                );
                res.status(500).send("Ошибка при обновлении базы данных");
            } else {
                res.send("Уровень успешно обновлен");
            }
        },
    );
});

app.post("/click", (req, res) => {
    const userId = req.session.userId;
    const clickCount = req.body.clickCount;
    if (!userId) {
        return res.status(400).send("userId is required");
    }
    db.get("SELECT * FROM Sessions WHERE user_id = ?", [userId], (err, row) => {
        if (err) {
            console.error("Ошибка при запросе к базе данных:", err.message);
            res.status(500).send("Ошибка при запросе к базе данных");
        } else {
            if (row) {
                db.run(
                    "UPDATE Sessions SET click_count = ? WHERE user_id = ?",
                    [clickCount, userId],
                    (err) => {
                        if (err) {
                            console.error(
                                "Ошибка при обновлении базы данных:",
                                err.message,
                            );
                            res.status(500).send(
                                "Ошибка при обновлении базы данных",
                            );
                        } else {
                            res.send("Клик успешно обновлен");
                        }
                    },
                );
            } else {
                db.run(
                    "INSERT INTO Sessions (user_id, click_count, level, clickPrice) VALUES (?, ?, ?, ?)",
                    [userId, clickCount, 1, 1],
                    (err) => {
                        if (err) {
                            console.error(
                                "Ошибка при записи в базу данных:",
                                err.message,
                            );
                            res.status(500).send(
                                "Ошибка при записи в базу данных",
                            );
                        } else {
                            res.send("Клик успешно зарегистрирован");
                        }
                    },
                );
            }
        }
    });
});

app.listen(port, () => {
    console.log(`Сервер запущен на порту ${port}`);
});
