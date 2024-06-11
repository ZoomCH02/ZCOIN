document.addEventListener('DOMContentLoaded', (event) => {
    window.Telegram.WebApp.ready();
})

const clickerContainer = document.getElementById('clicker-container');
const clickCountDisplay = document.getElementById('level-display');
const nameCity = document.getElementById('nameCity')

var currentLvl = 1;
var coldun = 0;

Telegram.WebApp.ready();


// Функция для обновления количества кликов
function updateClickCount(clickCount) {
    fetch('/click', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ clickCount })
    })
        .then(response => response.text())
        .then(data => {
            console.log(data);
            getClickCount();
        })
        .catch(error => console.error('Ошибка при обновлении количества кликов:', error));
}

function updateLevel(lvl) {
    fetch('/updateLevel', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ lvl })
    })
        .then(response => response.text())
        .then(data => {
            console.log(data);
            getClickCount();
        })
        .catch(error => console.error('Ошибка при обновлении количества кликов:', error));
}

function getClickCount() {
    fetch('/userInfo')
        .then(response => response.json())
        .then(data => {
            console.log(data)
            clickCountDisplay.textContent = data.clickCount;
            if (data.row) {
                nameCity.textContent = data.row.name
                var backgroundimg = document.getElementById('backgroundimg')
                backgroundimg.setAttribute('style', `background-image: url("${data.row.img}"); border-radius: 50px;`)
                currentLvl = data.row.level;
            }
            else {
                nameCity.textContent = 'Белгород';
                currentLvl = 1;
            }
        })
        .catch(error => console.error('Ошибка при получении количества кликов:', error));
}

// Отключаем контекстное меню для контейнера
clickerContainer.addEventListener('contextmenu', (event) => {
    event.preventDefault();
});

clickerContainer.addEventListener('click', (event) => {
    coldun++;

    let clickCount = parseInt(clickCountDisplay.textContent) + 1;
    clickCountDisplay.textContent = clickCount;
    if (coldun > 20) {
        coldun = 0;
        updateClickCount(clickCount);
    }

    if (clickCount >= 100 && currentLvl == 1) {
        //Белгород
        currentLvl++;
        updateLevel(currentLvl);
    }
    else if (clickCount >= 1000 && currentLvl == 2) {
        //Луганск
        currentLvl++;
        updateLevel(currentLvl);
    }
    else if (clickCount >= 5000 && currentLvl == 3) {
        //Донецк
        currentLvl++;
        updateLevel(currentLvl);
    }
    else if (clickCount >= 50000 && currentLvl == 4) {
        //Мариупль
        currentLvl++;
        updateLevel(currentLvl);
    }
    else if (clickCount >= 100000 && currentLvl == 5) {
        //Харьков
        currentLvl++;
        updateLevel(currentLvl);
    }
    else if (clickCount >= 500000 && currentLvl == 6) {
        //Одесса
        currentLvl++;
        updateLevel(currentLvl);
    }
    else if (clickCount >= 1000000 && currentLvl == 7) {
        //Киев
        currentLvl++;
        updateLevel(currentLvl);
    }
    else if (clickCount >= 10000000 && currentLvl == 8) {
        //Польша
        currentLvl++;
        updateLevel(currentLvl);
    }
    else if (clickCount >= 100000000 && currentLvl == 9) {
        //НАТО
        currentLvl++;
        updateLevel(currentLvl);
    }
    else if (clickCount >= 10000000000 && currentLvl == 10) {
        //ЗЕМЛЯ
        currentLvl++;
        updateLevel(currentLvl);
    }
    else if (clickCount >= 100000000000 && currentLvl == 11) {
        //СОЛНЕЧНАЯ СИСТЕМА
        currentLvl++;
        updateLevel(currentLvl);
    }
    else if (clickCount >= 10000000000000 && currentLvl == 12) {
        //МЛЕЧНЫЙ ПУТЬ
        currentLvl++;
        updateLevel(currentLvl);
    }

    const rect = clickerContainer.getBoundingClientRect();
    const offsetX = event.clientX - rect.left;
    const offsetY = event.clientY - rect.top;

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const moveX = (offsetX - centerX) / 10;
    const moveY = (offsetY - centerY) / 10;

    clickerContainer.style.transform = `translate(${moveX}px, ${moveY}px) scale(0.95)`;

    setTimeout(() => {
        clickerContainer.style.transform = 'translate(0, 0) scale(1)';
    }, 100);

    // Создаем элемент для отображения значения клика
    const clickValue = document.createElement('div');
    clickValue.className = 'click-value';
    clickValue.textContent = '+1';
    clickValue.style.left = `${offsetX}px`;
    clickValue.style.top = `${offsetY}px`;

    clickerContainer.appendChild(clickValue);

    // Удаляем элемент после завершения анимации
    setTimeout(() => {
        clickValue.remove();
    }, 1000);
});

// Получаем текущее количество кликов при загрузке страницы
getClickCount();
getCards();

function getCards() {
    var cardsPlace = document.getElementById('cards');
    cardsPlace.innerHTML = `<h2>Загрузка...</h2>`

    fetch('/cards')
        .then(response => response.json())
        .then(data => {
            console.log(data)
            const cardElement = document.createElement('div');
            cardElement.className = 'card mb-4';
            cardElement.style = "min-width: 18rem;"; // Минимальная ширина карточки
            cardsPlace.innerHTML = ``
            data.row.forEach(card => {
                cardsPlace.innerHTML += `
                    <div class="card">
                        <div class="card-body">
                            <img src="${card.img}" class="card-img-top" alt="Upgrade 2">
                            <h5 class="card-title">${card.name}</h5>
                            <p style="color: black" class="card-text">Цена: ${card.price}</p>
                            <p style="color: black" class="card-text">Плюс: ${card.plus}</p>
                            <button class="btn btn-primary upgrade-btn">Прокачать</button>
                        </div>
                     </div>
                    `
            });
            cardsPlace.appendChild(cardElement);

            console.log(data);

        })
        .catch(error => console.error('Ошибка при получении карточек:', error));
}
