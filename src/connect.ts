import { GameEngine } from './game/game.engine';
var globalPackageJSONVersion = require('../../package.json').version;

// App
class Connect {
	private elementBoard: HTMLElement;
	private elementBoardGrid: HTMLElement;
	private elementBoardGridCellsByPositionHash: { [key: number]: HTMLElement } = {};
	private elementConnectSize: HTMLElement;
	private elementMenuDB: HTMLElement;
	private elementMenuDBEnable: HTMLElement;
	private elementMenuDBDisable: HTMLElement;
	private elementMenuDBForm: HTMLFormElement;
	private elementMenuDBFormApply: HTMLElement;
	private elementMenuDBFormCancel: HTMLElement;
	private elementMenuInfo: HTMLElement;
	private elementMenuReset: HTMLElement;
	private elementMenuSettingsDisable: HTMLElement;
	private elementMenuSettingsEnable: HTMLElement;
	private elementMenuSettingsForm: HTMLFormElement;
	private elementMenuSettingsFormApply: HTMLElement;
	private elementMenuSettingsFormCancel: HTMLElement;
	private elementMenuDBFormSkill: HTMLInputElement;
	private elementMenuDBFormSkillRandom: HTMLInputElement;
	private elementSettings: HTMLElement;
	private elementSpinner: HTMLElement;
	private elementVersion: HTMLElement;
	private gameboardSizeA: number = 10;
	private gameboardSizeB: number = 10;
	private gameConnectSize: number = 5;
	private gameEngine: GameEngine = new GameEngine();
	private showEvaluations: boolean = true;
	private skill: number = 10;
	private spinnerStatus: boolean;

	constructor() {
		let t = this;

		// Cache element references
		t.elementBoard = <HTMLElement>document.getElementById('board');
		t.elementBoardGrid = <HTMLElement>document.getElementById('grid');
		t.elementConnectSize = <HTMLElement>document.getElementById('connect-size');
		t.elementMenuDB = <HTMLElement>document.getElementById('db');
		t.elementMenuDBDisable = <HTMLElement>document.getElementById('db-click-disable');
		t.elementMenuDBEnable = <HTMLElement>document.getElementById('db-click-enable');
		t.elementMenuDBForm = <HTMLFormElement>document.getElementById('dbForm');
		t.elementMenuDBFormApply = <HTMLElement>document.getElementById('dbFormApply');
		t.elementMenuDBFormCancel = <HTMLElement>document.getElementById('dbFormCancel');
		t.elementMenuDBFormSkill = <HTMLInputElement>document.getElementById('dbFormSkill');
		t.elementMenuDBFormSkillRandom = <HTMLInputElement>document.getElementById('dbFormSkillRandom');
		t.elementMenuInfo = <HTMLElement>document.getElementById('info-click');
		t.elementMenuReset = <HTMLElement>document.getElementById('reset-click');
		t.elementMenuSettingsDisable = <HTMLElement>document.getElementById('settings-click-disable');
		t.elementMenuSettingsEnable = <HTMLElement>document.getElementById('settings-click-enable');
		t.elementMenuSettingsForm = <HTMLFormElement>document.getElementById('settingsForm');
		t.elementMenuSettingsFormApply = <HTMLElement>document.getElementById('settingsFormApply');
		t.elementMenuSettingsFormCancel = <HTMLElement>document.getElementById('settingsFormCancel');
		t.elementSettings = <HTMLElement>document.getElementById('settings');
		t.elementSpinner = <HTMLElement>document.getElementById('spinner');
		t.elementVersion = <HTMLElement>document.getElementById('version');

		// Register onchanges
		t.elementMenuDBFormSkillRandom.onchange = (event: any) => {
			t.elementMenuDBFormSkill.disabled = (<HTMLInputElement>event.target).checked;
		};

		// Register onclicks
		t.elementMenuDBEnable.onclick = () => {
			t.dbDisplay(true);
		};
		t.elementMenuDBDisable.onclick = () => {
			t.dbDisplay(false);
		};
		t.elementMenuDBFormApply.onclick = () => {
			t.dbApply();
			return false;
		};
		t.elementMenuDBFormCancel.onclick = () => {
			t.dbDisplay(false);
			return false;
		};
		t.elementMenuReset.onclick = () => {
			t.boardGridBuild();
		};
		t.elementMenuSettingsDisable.onclick = () => {
			t.settingsDisplay(false);
		};
		t.elementMenuSettingsEnable.onclick = () => {
			t.settingsDisplay(true);
		};
		t.elementMenuSettingsFormApply.onclick = () => {
			t.settingsApply();
			return false;
		};
		t.elementMenuSettingsFormCancel.onclick = () => {
			t.settingsDisplay(false);
			return false;
		};

		t.elementVersion.innerText = 'v' + globalPackageJSONVersion;

		// Create gameboard grid
		t.boardGridBuild();
	}

	private boardGridBuild(): void {
		let t = this,
			boardGridClick: any = t.boardGridClick,
			elementBoardGrid: HTMLElement | null = t.elementBoardGrid,
			elementTD: HTMLElement,
			elementTDOnClickFunction: HTMLElement,
			elementTDCoordinate: HTMLElement,
			elementTR: HTMLElement,
			gameboardSizeA: number = t.gameboardSizeA,
			gameboardSizeB: number = t.gameboardSizeB;

		if (!elementBoardGrid) {
			console.error('Connect > boardGridBuild: missing HTML reference');
			return;
		}

		// Hook gameEngine
		t.gameEngine.setCallbackGameOver(t.gameOver.bind(this));
		t.gameEngine.setCallbackPlace(t.boardGridPlaced.bind(this));

		// Initialize gameEngine
		t.gameEngine.initialize(gameboardSizeA, gameboardSizeB, t.gameConnectSize, true, t.skill);

		// Clean gameboard
		t.elementBoardGridCellsByPositionHash = <any>new Object();
		t.resetDisplay(false);
		while (elementBoardGrid.lastChild) {
			elementBoardGrid.removeChild(elementBoardGrid.lastChild);
		}

		// Build UI gameboard
		for (let b = 0; b < gameboardSizeB; b++) {
			// Create row
			elementTR = document.createElement('tr');

			for (let a = 0; a < gameboardSizeA; a++) {
				let positionHash = ((a & 0xff) << 8) | (b & 0xff);

				// Create elements
				elementTD = document.createElement('td');
				elementTDCoordinate = document.createElement('div');

				// Style cell
				elementTD.className = 'clickable';
				elementTD.id = 'cell-' + positionHash;
				elementTD.onclick = () => t.boardGridClick(positionHash);

				// Style cell coordinate
				elementTDCoordinate.className = 'coordinate';
				elementTDCoordinate.innerText = a + ',' + b;

				// Append elements
				elementTD.appendChild(elementTDCoordinate);
				elementTR.appendChild(elementTD);

				// Register element with position hash
				t.elementBoardGridCellsByPositionHash[positionHash] = elementTD;
			}

			// Append row
			elementBoardGrid.appendChild(elementTR);
		}

		// Done
		t.spinnerDisplay(false);
	}

	private boardGridClick(positionHash: number): void {
		let t = this,
			elementTD: HTMLElement = t.elementBoardGridCellsByPositionHash[positionHash],
			elementTDPiece: HTMLElement;

		t.spinnerDisplay(true);

		setTimeout(() => {
			// Remove clickable
			elementTD.className = '';
			elementTD.onclick = null;

			// Create/style/append piece element
			elementTDPiece = document.createElement('div');
			elementTDPiece.className = 'piece x';
			elementTD.appendChild(elementTDPiece);

			// Update gameEngine with placement
			t.gameEngine.place(positionHash);

			t.resetDisplay(true);
		});
	}

	private boardGridPlaced(positionHash: number): void {
		let t = this,
			elementTD: HTMLElement = t.elementBoardGridCellsByPositionHash[positionHash],
			elementTDPiece: HTMLElement;

		// Uncomment once engine is actually placing something
		// // Remove clickable
		// elementTD.className = '';
		// elementTD.onclick = null;

		// // Create/style/append piece element
		// elementTDPiece = document.createElement('div');
		// elementTDPiece.className = 'piece o';
		// elementTD.appendChild(elementTDPiece);

		// Done
		t.spinnerDisplay(false);
	}

	private dbApply(): void {
		let t = this,
			amountRequested: HTMLInputElement = <HTMLInputElement>t.elementMenuDBForm.elements[0],
			boardA: HTMLInputElement = <HTMLInputElement>t.elementMenuDBForm.elements[2],
			boardB: HTMLInputElement = <HTMLInputElement>t.elementMenuDBForm.elements[1],
			connectSize: HTMLInputElement = <HTMLInputElement>t.elementMenuDBForm.elements[3],
			format: HTMLInputElement = <HTMLInputElement>t.elementMenuDBForm.elements[4],
			skill: HTMLInputElement = <HTMLInputElement>t.elementMenuDBForm.elements[6],
			skillRandom: HTMLInputElement = <HTMLInputElement>t.elementMenuDBForm.elements[7],
			threads: HTMLInputElement = <HTMLInputElement>t.elementMenuDBForm.elements[8];

		t.dbApplyWebWorkers(
			Number(amountRequested.value),
			Number(boardA.value),
			Number(boardB.value),
			Number(connectSize.value),
			Boolean(format.checked),
			Number(skill.value),
			Boolean(skillRandom.checked),
			Number(threads.value),
		);
	}

	private dbApplyWebWorkers(
		amountRequested: number,
		aMax: number,
		bMax: number,
		connectSize: number,
		formatCSV: boolean,
		skill: number,
		skillRandom: boolean,
		threads: number,
	): void {
		let t = this,
			amountGenerated: number = 0,
			generateWorker: any,
			threadsLimit: number = Math.min(threads, amountRequested),
			worker: Worker,
			workers: Worker[] = new Array(threadsLimit);

		if (window.Worker) {
			// Spawn the workers (threads)
			for (let i = 0; i < threadsLimit; i++) {
				worker = new Worker(new URL('./worker', import.meta.url));
				workers[i] = worker; // Cache worker reference for cancelling early

				worker.postMessage({
					aMax: aMax,
					amount: Math.round(amountRequested / threadsLimit), // each thread should generate their portion of the load
					bMax: bMax,
					connectSize: connectSize,
					skill: skillRandom ? Math.floor(Math.random() * 10) + 1 : skill,
				});
				worker.onmessage = ({ data: { answer } }) => {
					amountGenerated++;
					console.log('we are ' + amountGenerated + '/' + amountRequested, answer);
				};
			}
		} else {
			alert('Web Workers are not supported by your browser');
		}
	}

	private dbDisplay(active: boolean): void {
		let t = this;

		if (active) {
			t.elementMenuDB.style.display = 'block';
			t.elementMenuDB.style.opacity = '1';
		} else {
			t.elementMenuDB.style.opacity = '0';
			setTimeout(() => {
				// Allow fade out
				t.elementMenuDB.style.display = 'none';
			}, 125);
		}
	}

	private gameOver(xWon: boolean): void {
		let t = this;

		console.log('gameOver: x won is', xWon);
	}

	private resetDisplay(active: boolean): void {
		let t = this;

		if (active) {
			t.elementMenuReset.style.visibility = 'visible';
		} else {
			t.elementMenuReset.style.visibility = 'hidden';
		}
	}

	private settingsApply(): void {
		let t = this,
			boardA: HTMLInputElement = <HTMLInputElement>t.elementMenuSettingsForm.elements[1],
			boardB: HTMLInputElement = <HTMLInputElement>t.elementMenuSettingsForm.elements[0],
			connectSize: HTMLInputElement = <HTMLInputElement>t.elementMenuSettingsForm.elements[2],
			connectSizeResolved: number = Number(connectSize.value),
			showEvaluations: HTMLInputElement = <HTMLInputElement>t.elementMenuSettingsForm.elements[3],
			skill: HTMLInputElement = <HTMLInputElement>t.elementMenuSettingsForm.elements[4];

		t.spinnerDisplay(true);

		setTimeout(() => {
			t.gameboardSizeA = Number(boardA.value);
			t.gameboardSizeB = Number(boardB.value);
			t.showEvaluations = Boolean(showEvaluations.checked);
			t.skill = Number(skill.value);

			if (connectSizeResolved > t.gameboardSizeA && connectSizeResolved > t.gameboardSizeA) {
				connectSizeResolved = Math.min(t.gameboardSizeA, t.gameboardSizeB);
				alert('ConnectSize decreased to ' + connectSizeResolved + ' due to board size limitation');
			}
			t.gameConnectSize = connectSizeResolved;

			t.elementConnectSize.innerText = 'Connect ' + connectSizeResolved;

			// Done
			t.boardGridBuild();
			t.settingsDisplay(false);
		});
	}

	private settingsDisplay(active: boolean): void {
		let t = this;

		if (active) {
			t.elementSettings.style.display = 'block';
			t.elementSettings.style.opacity = '1';
		} else {
			t.elementSettings.style.opacity = '0';
			setTimeout(() => {
				// Allow fade out
				t.elementSettings.style.display = 'none';
			}, 125);
		}
	}

	private spinnerDisplay(active: boolean): void {
		let t = this;

		t.spinnerStatus = active;

		if (active) {
			t.elementSpinner.style.display = 'flex';
			t.elementSpinner.style.opacity = '0';
			setTimeout(() => {
				// Use small timeout to prevent flickers
				t.elementSpinner.style.opacity = '1';
			}, 125);
		} else {
			t.elementSpinner.style.opacity = '0';
			setTimeout(() => {
				// Allow fade out
				t.elementSpinner.style.display = 'none';
			}, 125);
		}
	}

	private widthChange(gameboardSizeA: number) {
		console.log('widthChange', gameboardSizeA);
	}
}

// Bootstrap
new Connect();
