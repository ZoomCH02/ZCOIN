const express = require('express');
const session = require('express-session');
const sqlite3 = require('sqlite3').verbose();
const bodyParser = require('body-parser');

const app = express();
const port = 3000;

// Используем bodyParser для обработки JSON-запросов
app.use(bodyParser.json());

app.use(express.static('public'));

// Инициализация сессий
app.use(session({
    secret: 'your-secret-key', // Секретный ключ для подписи сессии, используйте свой уникальный ключ
    resave: false,
    saveUninitialized: true
}));

// Инициализация базы данных SQLite
const db = new sqlite3.Database('./db.db', (err) => { });

app.get('/', (req, res) => {
    const sessionId = req.sessionID;
    res.send({ sessionId });
});

// app.post('/', (req, res) => {
//     const { userId, clickCount } = req.body;

//     const sessionId = req.sessionID;
//     db.get('SELECT * FROM Sessions s, Levels l WHERE s.session_id = ? AND l.id = s.level', [sessionId], (err, row) => {
//         if (err) { 
//             console.error('Ошибка при запросе к базе данных:', err.message);
//             res.status(500).send('Ошибка при запросе к базе данных');
//         } else {
//             const clickCount = row ? row.click_count : 0;
//             res.send({ clickCount, row });
//         }
//     });

//     res.send('Данные обновлены успешно: '+row);
// });

// Получение текущего количества кликов из базы данных для данной сессии
app.get('/userInfo', (req, res) => {
    const sessionId = req.sessionID;
    db.get('SELECT * FROM Sessions s, Levels l WHERE s.session_id = ? AND l.id = s.level', [sessionId], (err, row) => {
        if (err) {
            console.error('Ошибка при запросе к базе данных:', err.message);
            res.status(500).send('Ошибка при запросе к базе данных');
        } else {
            const clickCount = row ? row.click_count : 0;
            res.send({ clickCount, row });
        }
    });
});

//Получение карточек
app.get('/cards', (req, res) => {
    db.all('SELECT * FROM Cards', (err, row) => {
        if (err) {
            console.error('Ошибка при запросе к базе данных:', err.message);
            res.status(500).send('Ошибка при запросе к базе данных');
        } else {
            res.send({ row });
        }
    });
});

app.post('/updateLevel', (req, res) => {
    const sessionId = req.sessionID;
    const level = req.body.lvl;

    db.run('UPDATE Sessions SET level = ? WHERE session_id = ?', [level, sessionId], (err) => {
        if (err) {
            console.error('Ошибка при обновлении базы данных:', err.message);
            res.status(500).send('Ошибка при обновлении базы данных');
        } else {
            res.send('Клик успешно обновлен');
        }
    });

});

// Увеличение количества кликов для данной сессии и обновление в базе данных
app.post('/click', (req, res) => {
    const sessionId = req.sessionID;
    const clickCount = req.body.clickCount;

    db.get('SELECT * FROM Sessions WHERE session_id = ?', [sessionId], (err, row) => {
        if (err) {
            console.error('Ошибка при запросе к базе данных:', err.message);
            res.status(500).send('Ошибка при запросе к базе данных');
        } else {
            if (row) {
                // Обновляем существующую запись
                db.run('UPDATE Sessions SET click_count = ? WHERE session_id = ?', [clickCount, sessionId], (err) => {
                    if (err) {
                        console.error('Ошибка при обновлении базы данных:', err.message);
                        res.status(500).send('Ошибка при обновлении базы данных');
                    } else {
                        res.send('Клик успешно обновлен');
                    }
                });
            } else {
                // Создаем новую запись
                db.run('INSERT INTO Sessions (session_id, click_count, level, clickPrice) VALUES (?, ?, ?, ?)', [sessionId, clickCount, 1, 1], (err) => {
                    if (err) {
                        console.error('Ошибка при записи в базу данных:', err.message);
                        res.status(500).send('Ошибка при записи в базу данных');
                    } else {
                        res.send('Клик успешно зарегистрирован');
                    }
                });
            }
        }
    });
});

// Запуск сервера
app.listen(port, () => {
    console.log(`Сервер запущен на порту ${port}`);
});
