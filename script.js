const canvas = document.querySelector("#drawCanvas");
const context = canvas.getContext("2d");
const undoButton = document.querySelector("#undoButton");
const clearButton = document.querySelector("#clearButton");
const colorPalette = document.querySelector("#colorPalette");
let undoHistory = [];

const SECONDS = 90;

const playersDiv = document.querySelector(".players");
const canvasDiv = document.querySelector(".canvas");

const storedData = localStorage.getItem("jatekosok");
const data = storedData ? JSON.parse(storedData) : {};

var cdAudio = document.querySelector("#countdown");
var epicCdAudio = document.querySelector("#epicCountdown");
var buzzer = document.querySelector("#buzzer");
var victory = document.querySelector("#victory");
var wrong = document.querySelector("#wrong");
var bgMusic = document.querySelector("#bgMusic");
var bgMusicFast = document.querySelector("#bgMusicFast");

let prevGame = true;
let gameStart = false;

canvasDiv.hidden = true;

undoHistory.push(canvas.toDataURL());

function getJatekosok() {
	const storedData = localStorage.getItem("jatekosok");
	const jatekosokDiv = document.querySelector(".jatekosok");

	jatekosokDiv.innerHTML = "";

	if (storedData) {
		const data = JSON.parse(storedData);

		for (const jatekos in data) {
			const jatekosBigDiv = document.createElement("div");
			const jatekosDiv = document.createElement("div");
			jatekosDiv.classList.add("jatekos");
			jatekosDiv.dataset.nev = jatekos;
			jatekosBigDiv.classList.add("jatekosNagy");

			jatekosBigDiv.innerHTML = `<p>${jatekos}</p>`;
			jatekosDiv.innerHTML = `${data[jatekos].pontszam}`;

			jatekosBigDiv.appendChild(jatekosDiv);
			jatekosokDiv.appendChild(jatekosBigDiv);
		}
	}
}

const formDiv = document.querySelector("form");

formDiv.addEventListener("keydown", function (event) {
	if (event.code === "Enter") {
		addJatekos();
	}
});

function addJatekos() {
	const nev = document.querySelector("#jatekosNev").value;
	const pontszam = 0;

	// Játékosok lekérése a localStorage-ból
	const storedData = localStorage.getItem("jatekosok");
	const data = storedData ? JSON.parse(storedData) : {};

	// Új játékos hozzáadása
	data[nev] = {nev, pontszam};

	// Játékosok mentése a localStorage-be
	localStorage.setItem("jatekosok", JSON.stringify(data));

	// Frissítsük az oldalt
	getJatekosok();
}

getJatekosok();

const jatekosok = document.querySelectorAll(".jatekos");

jatekosok.forEach(jatekos => {
	jatekos.addEventListener("click", event => {
		console.log(data[event.target.dataset.nev].pontszam);
		addPoints(event, 1);
	});
	jatekos.addEventListener("contextmenu", event => {
		event.preventDefault();
		if (data[event.target.dataset.nev].pontszam > 0) {
			addPoints(event, -1);
		}
	});
});

function addPoints(event, number) {
	data[event.target.dataset.nev].pontszam += number;
	localStorage.setItem("jatekosok", JSON.stringify(data));
	event.target.innerText = data[event.target.dataset.nev].pontszam;
}

const canvasButton = document.querySelector(".showCanvas");
const playersButton = document.querySelector(".showPlayers");

canvasButton.addEventListener("click", () => {
	playersDiv.hidden = true;
	canvasDiv.hidden = false;
	canvasButton.style.backgroundColor = "rgb(67, 0, 0)";
	playersButton.style.backgroundColor = "white";
	document.querySelector("body").style.backgroundImage = "none";
});

playersButton.addEventListener("click", () => {
	playersDiv.hidden = false;
	canvasDiv.hidden = true;
	playersButton.style.backgroundColor = "rgb(67, 0, 0)";
	canvasButton.style.backgroundColor = "white";
	document.querySelector("body").style.backgroundImage = 'url("extrem_activity_rgb.jpg")';
});

let countdown;
let isPaused = true;
let secondsRemaining = SECONDS;

function startCountdown() {
	countdown = setInterval(function () {
		if (!isPaused) {
			displayTime(secondsRemaining);
			secondsRemaining--;
			if (secondsRemaining == 33) {
				cdAudio.play();
			}
			if (secondsRemaining == 29) {
				isPaused = true;
				document.querySelector(".timer p").style.color = "rgb(185, 0, 0)";
			}
			if (secondsRemaining == 2) {
				epicCdAudio.play();
			}
			if (secondsRemaining < -1) {
				clearInterval(countdown);
				document.querySelector(".timer p").innerHTML = "Lejárt az idő!";
			}
		}
	}, 1000);
}

function displayTime(seconds) {
	const minutes = Math.floor(seconds / 60);
	const remainingSeconds = seconds % 60;
	const formattedTime = `${padZero(minutes)}:${padZero(remainingSeconds)}`;
	document.querySelector(".timer p").innerText = formattedTime;
}

function padZero(value) {
	return value < 10 ? `0${value}` : value;
}

function togglePause() {
	isPaused = !isPaused;
}

function resetTimer() {
	document.querySelector(".timer p").style.color = "black";
	clearInterval(countdown);
	isPaused = true;
	secondsRemaining = SECONDS;
	displayTime(secondsRemaining);
	startCountdown();
}

document.querySelector(".removeAllP").addEventListener("click", function () {
	localStorage.clear();
	location.reload();
});

document.addEventListener("keydown", function (event) {
	if (gameStart) {
		if (event.code === "Space") {
			pause();
		}

		if (event.code === "KeyW") {
			//pause();
			victory.play();
			resetTimer();
			document.querySelector(".timer p").innerText = "KITALÁLTAD!";
			document.querySelector(".timer p").style.color = "green";
		}

		if (event.code === "KeyS") {
			wrong.play();
			pause();
		}
	}
});

function pause() {
	togglePause();
	epicCdAudio.pause();
	if (isPaused) {
		buzzer.play();
		bgMusic.pause();
		bgMusicFast.pause();
	} else if (secondsRemaining > 31) {
		bgMusic.play();
	} else if (secondsRemaining < 31) {
		bgMusicFast.play();
	}
}

document.querySelector(".timer p").addEventListener("click", function () {
	bgMusic.currentTime = 0;
	bgMusic.pause();
	document.querySelector(".ujJatekos").style.display = "none";
	gameStart = true;
	resetTimer();
});

startCountdown();

// Állítsd be a vászon méretét
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let isDrawing = false;
let cursorColor = "#000";

function startDrawing(e) {
	isDrawing = true;
	draw(e.clientX - canvas.offsetLeft, e.clientY - canvas.offsetTop);
}

function stopDrawing() {
	isDrawing = false;
	context.beginPath();
	saveCanvasState();
}

function draw(e) {
	if (!isDrawing) return;

	context.lineWidth = 5;
	context.lineCap = "round";
	context.strokeStyle = cursorColor;

	context.lineTo(e.clientX - canvas.offsetLeft, e.clientY - canvas.offsetTop);
	context.stroke();
	context.beginPath();
	context.moveTo(e.clientX - canvas.offsetLeft, e.clientY - canvas.offsetTop);
}

function saveCanvasState() {
	undoHistory.push(canvas.toDataURL());
}

function undoLastDraw() {
	if (undoHistory.length > 1) {
		undoHistory.pop();
		const img = new Image();
		img.src = undoHistory[undoHistory.length - 1];
		img.onload = function () {
			context.clearRect(0, 0, canvas.width, canvas.height);
			context.drawImage(img, 0, 0);
		};
	}
}

function simulateEvent(e, eventType) {
	const touch = e.touches[0];
	const simulatedEvent = new MouseEvent(eventType, {
		clientX: touch.clientX,
		clientY: touch.clientY
	});
	canvas.dispatchEvent(simulatedEvent);
	e.preventDefault();
}

function clearCanvas() {
	context.clearRect(0, 0, canvas.width, canvas.height);
}

function changeCursorColor(color) {
	cursorColor = color;
}

// Eseménykezelők hozzáadása
canvas.addEventListener("mousedown", startDrawing);
canvas.addEventListener("mouseup", stopDrawing);
canvas.addEventListener("mousemove", draw);
canvas.addEventListener("contextmenu", event => {
	event.preventDefault();
});

canvas.addEventListener("touchstart", function (e) {
	simulateEvent(e, "mousedown");
});

canvas.addEventListener("touchmove", function (e) {
	simulateEvent(e, "mousemove");
});

canvas.addEventListener("touchend", function (e) {
	stopDrawing();
});

undoButton.addEventListener("click", undoLastDraw);
clearButton.addEventListener("click", clearCanvas);
