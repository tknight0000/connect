/**
 * @author tknight-dev
 */

import copy from 'copy-to-clipboard';
import { Confetti } from './libs/confetti';
import { GameEngine, HistoryReport, HistoryReportInstance, WorkingDataValues } from './engine/game.engine';
var globalPackageJSONVersion = require('../../package.json').version;

// App
class Connect {
	private confetti: Confetti;
	private descisionPromiseResolve: any;
	private elementBoard: HTMLElement;
	private elementBoardGrid: HTMLElement;
	private elementBoardGridCellsByPositionHash: { [key: number]: HTMLElement } = {};
	private elementBoardGridCellsColorByPositionHash: { [key: number]: { o: HTMLElement; x: HTMLElement } } = {};
	private elementConnectSize: HTMLElement;
	private elementDecision: HTMLElement;
	private elementDecisionMessage: HTMLElement;
	private elementDecisionNo: HTMLButtonElement;
	private elementDecisionYes: HTMLButtonElement;
	private elementDownload: HTMLElement;
	private elementGameOver: HTMLElement;
	private elementGameOverCanvas: HTMLCanvasElement;
	private elementGameOverCanvasContainer: HTMLElement;
	private elementGameOverModal: HTMLElement;
	private elementGameOverModalCopy: HTMLButtonElement;
	private elementGameOverModalReset: HTMLButtonElement;
	private elementHistory: HTMLElement;
	private elementHistoryCancel: HTMLElement;
	private elementHistoryControl: HTMLElement;
	private elementHistoryControlEnd: HTMLElement;
	private elementHistoryControlNext: HTMLElement;
	private elementHistoryControlPause: HTMLElement;
	private elementHistoryControlPlay: HTMLElement;
	private elementHistoryControlPrevious: HTMLElement;
	private elementHistoryControlStart: HTMLElement;
	private elementHistoryInput: HTMLInputElement;
	private elementHistoryPlay: HTMLButtonElement;
	private elementMenuContent: HTMLElement;
	private elementMenuContentClick: HTMLElement;
	private elementMenuDB: HTMLElement;
	private elementMenuDBEnable: HTMLElement;
	private elementMenuDBDisable: HTMLElement;
	private elementMenuDBForm: HTMLFormElement;
	private elementMenuDBFormApply: HTMLElement;
	private elementMenuSettingsFormGameboardA: HTMLInputElement;
	private elementMenuSettingsFormGameboardB: HTMLInputElement;
	private elementMenuDBFormCancel: HTMLElement;
	private elementMenuHistoricalReset: HTMLElement;
	private elementMenuInfo: HTMLElement;
	private elementMenuSettingsDisable: HTMLElement;
	private elementMenuSettingsEnable: HTMLElement;
	private elementMenuSettingsForm: HTMLFormElement;
	private elementMenuSettingsFormApply: HTMLElement;
	private elementMenuSettingsFormCancel: HTMLElement;
	private elementMenuDBFormSkillO: HTMLInputElement;
	private elementMenuDBFormSkillOShuffle: HTMLInputElement;
	private elementMenuDBFormSkillX: HTMLInputElement;
	private elementMenuDBFormSkillXShuffle: HTMLInputElement;
	private elementMenuDBFormThreads: HTMLInputElement;
	private elementMenuDBProgress: HTMLElement;
	private elementMenuDBProgressContainer: HTMLElement;
	private elementMenuDBProgressCancel: HTMLButtonElement;
	private elementMenuDBProgressDownload: HTMLButtonElement;
	private elementSettings: HTMLElement;
	private elementSpinner: HTMLElement;
	private elementVersion: HTMLElement;
	private gameboardSizeA: number = 9;
	private gameboardSizeB: number = 9;
	private gameConnectSize: number = 5;
	private gameEngine: GameEngine = new GameEngine();
	private historyGameboardSizeA: number;
	private historyGameboardSizeB: number;
	private historyOWin: boolean | null;
	private historyPlayAsX: boolean;
	private menuOpen: boolean;
	private playAsX: boolean = true;
	private playFirst: boolean = true;
	private showEvaluations: boolean = true;
	private skill: number = 5;
	private skillEngineAIML: boolean;
	private spinnerStatus: boolean;
	private workerDataAmax: number;
	private workerDataAmount: number;
	private workerDataBmax: number;
	private workerDataConnectSize: number;
	private workerData: string;
	private workerDataFormatCSV: boolean;
	private workers: Worker[];
	private workersElements: {
		progress: HTMLElement;
		progressText: HTMLElement;
		timingLeft: HTMLElement;
		timingRight: HTMLElement;
	}[];
	private workersRunning: boolean;
	private workersStats: {
		amount: number;
		amountRequested: number;
		threadId: number;
		timeTakenTotalInMS: number;
	}[];
	private workerProgressUpdateStartedInMs: number;
	private workerProgressUpdateTimestampInMs: number = new Date().getTime();

	constructor() {
		let t = this,
			aspectRatio: number;

		// Cache element references
		t.elementBoard = <HTMLElement>document.getElementById('board');
		t.elementBoardGrid = <HTMLElement>document.getElementById('grid');
		t.elementConnectSize = <HTMLElement>document.getElementById('connect-size');
		t.elementDecision = <HTMLElement>document.getElementById('decision');
		t.elementDecisionMessage = <HTMLElement>document.getElementById('descision-message');
		t.elementDecisionNo = <HTMLButtonElement>document.getElementById('descision-no');
		t.elementDecisionYes = <HTMLButtonElement>document.getElementById('descision-yes');
		t.elementDownload = <HTMLElement>document.getElementById('download');
		t.elementGameOver = <HTMLElement>document.getElementById('gameover');
		t.elementGameOverCanvas = <HTMLCanvasElement>document.getElementById('gameover-canvas');
		t.elementGameOverCanvasContainer = <HTMLElement>document.getElementById('gameover-canvas-container');
		t.elementGameOverModal = <HTMLElement>document.getElementById('gameover-modal');
		t.elementGameOverModalCopy = <HTMLButtonElement>document.getElementById('gameover-modal-copy');
		t.elementGameOverModalReset = <HTMLButtonElement>document.getElementById('gameover-modal-reset');
		t.elementHistory = <HTMLElement>document.getElementById('history');
		t.elementHistoryCancel = <HTMLElement>document.getElementById('history-cancel');
		t.elementHistoryControl = <HTMLElement>document.getElementById('history-control');
		t.elementHistoryControlEnd = <HTMLElement>document.getElementById('history-control-end');
		t.elementHistoryControlNext = <HTMLElement>document.getElementById('history-control-next');
		t.elementHistoryControlPause = <HTMLElement>document.getElementById('history-control-pause');
		t.elementHistoryControlPlay = <HTMLElement>document.getElementById('history-control-play');
		t.elementHistoryControlPrevious = <HTMLElement>document.getElementById('history-control-previous');
		t.elementHistoryControlStart = <HTMLElement>document.getElementById('history-control-start');
		t.elementHistoryInput = <HTMLInputElement>document.getElementById('history-input');
		t.elementHistoryPlay = <HTMLButtonElement>document.getElementById('history-play');
		t.elementMenuContent = <HTMLElement>document.getElementById('menu-content');
		t.elementMenuContentClick = <HTMLElement>document.getElementById('menu-content-click');
		t.elementMenuDB = <HTMLElement>document.getElementById('db');
		t.elementMenuDBDisable = <HTMLElement>document.getElementById('db-click-disable');
		t.elementMenuDBEnable = <HTMLElement>document.getElementById('db-click-enable');
		t.elementMenuDBForm = <HTMLFormElement>document.getElementById('dbForm');
		t.elementMenuDBFormApply = <HTMLElement>document.getElementById('dbFormApply');
		t.elementMenuDBFormCancel = <HTMLElement>document.getElementById('dbFormCancel');
		t.elementMenuDBFormSkillO = <HTMLInputElement>document.getElementById('dbFormSkillO');
		t.elementMenuDBFormSkillOShuffle = <HTMLInputElement>document.getElementById('dbFormSkillOShuffle');
		t.elementMenuDBFormSkillX = <HTMLInputElement>document.getElementById('dbFormSkillX');
		t.elementMenuDBFormSkillXShuffle = <HTMLInputElement>document.getElementById('dbFormSkillXShuffle');
		t.elementMenuDBFormThreads = <HTMLInputElement>document.getElementById('dbFormthreads');
		t.elementMenuDBProgress = <HTMLElement>document.getElementById('dbProgress');
		t.elementMenuDBProgressContainer = <HTMLElement>document.getElementById('dbProgressContainer');
		t.elementMenuDBProgressCancel = <HTMLButtonElement>document.getElementById('db-progress-click-cancel');
		t.elementMenuDBProgressDownload = <HTMLButtonElement>document.getElementById('db-progress-click-download');
		t.elementMenuHistoricalReset = <HTMLElement>document.getElementById('toggle-click');
		t.elementMenuInfo = <HTMLElement>document.getElementById('info-click');
		t.elementMenuSettingsDisable = <HTMLElement>document.getElementById('settings-click-disable');
		t.elementMenuSettingsEnable = <HTMLElement>document.getElementById('settings-click-enable');
		t.elementMenuSettingsForm = <HTMLFormElement>document.getElementById('settingsForm');
		t.elementMenuSettingsFormApply = <HTMLElement>document.getElementById('settingsFormApply');
		t.elementMenuSettingsFormGameboardA = <HTMLInputElement>document.getElementById('settings-gameboard-A');
		t.elementMenuSettingsFormGameboardB = <HTMLInputElement>document.getElementById('settings-gameboard-B');
		t.elementMenuSettingsFormCancel = <HTMLElement>document.getElementById('settingsFormCancel');
		t.elementSettings = <HTMLElement>document.getElementById('settings');
		t.elementSpinner = <HTMLElement>document.getElementById('spinner');
		t.elementVersion = <HTMLElement>document.getElementById('version');

		// Default thread count
		if (navigator.hardwareConcurrency) {
			t.elementMenuDBFormThreads.value = String(Math.max(navigator.hardwareConcurrency / 4, 2));
		}

		// Register confetti
		t.confetti = new Confetti(t.elementGameOverCanvas);

		// Register onchanges
		t.elementHistoryInput.oninput = (event: any) => {
			if (t.gameEngine.historyParse(t.elementHistoryInput.value) !== null) {
				t.elementHistoryInput.className = '';
				t.elementHistoryPlay.disabled = false;
			} else {
				t.elementHistoryInput.className = 'invalid';
				t.elementHistoryPlay.disabled = true;
			}
		};
		t.elementMenuDBFormSkillOShuffle.onchange = (event: any) => {
			t.elementMenuDBFormSkillO.disabled = (<HTMLInputElement>event.target).checked;
		};
		t.elementMenuDBFormSkillXShuffle.onchange = (event: any) => {
			t.elementMenuDBFormSkillX.disabled = (<HTMLInputElement>event.target).checked;
		};

		// Register onclicks
		t.elementDecisionNo.onclick = () => {
			t.descisionClick(false);
		};
		t.elementDecisionYes.onclick = () => {
			t.descisionClick(true);
		};
		t.elementGameOverModalCopy.onclick = () => {
			let copyContent: string = '',
				history: number[] = t.gameEngine.getHistory();

			copyContent += t.playAsX ? 'X' : 'O';
			copyContent += String(t.gameboardSizeA).padStart(2, '0');
			copyContent += String(t.gameboardSizeB).padStart(2, '0');
			copyContent += String(t.gameConnectSize).padStart(2, '0');

			if (t.gameEngine.isSkillOAIML()) {
				copyContent += '0';
			} else {
				copyContent += t.gameEngine.getSkillO();
			}

			if (t.gameEngine.getGameOverOWon() === true) {
				copyContent += 'O';
			} else if (t.gameEngine.getGameOverOWon() === false) {
				copyContent += 'X';
			} else {
				copyContent += 'D';
			}

			copyContent += ';' + history.join(',');

			console.log("clipboarded '" + copyContent + "'");

			copy(copyContent);
			t.elementGameOverModalCopy.disabled = true;
		};
		t.elementGameOverModalReset.onclick = () => {
			t.gameOverDisplay(false, null);
			t.boardGridBuild();
		};
		t.elementHistoryCancel.onclick = () => {
			t.historyModalDisplay(false);
		};
		t.elementHistoryControlEnd.onclick = () => {
			t.gameEngine.historicalControlEnd();
		};
		t.elementHistoryControlNext.onclick = () => {
			t.gameEngine.historicalControlNext();
		};
		t.elementHistoryControlPause.onclick = () => {
			t.gameEngine.historicalControlPause();
			t.elementHistoryControlPlay.style.display = 'block';
			t.elementHistoryControlPause.style.display = 'none';
		};
		t.elementHistoryControlPlay.onclick = () => {
			t.gameEngine.historicalControlPlay();
			t.elementHistoryControlPlay.style.display = 'none';
			t.elementHistoryControlPause.style.display = 'block';
		};
		t.elementHistoryControlPrevious.onclick = () => {
			t.gameEngine.historicalControlPrevious();
		};
		t.elementHistoryControlStart.onclick = () => {
			t.gameEngine.historicalControlStart();
		};
		t.elementHistoryPlay.onclick = () => {
			let data: {
				gameboardSizeA: number;
				gameboardSizeB: number;
				oWin: boolean | null;
				playAsX: boolean;
			} | null = t.gameEngine.historical(t.elementHistoryInput.value);

			if (data) {
				t.historyGameboardSizeA = data.gameboardSizeA;
				t.historyGameboardSizeB = data.gameboardSizeB;
				t.historyOWin = data.oWin;
				t.historyPlayAsX = data.playAsX;
				t.boardGridBuildBoard(data.gameboardSizeA, data.gameboardSizeB);

				t.gameOverDisplay(false, null);
				t.historyControlDisplay(true);
				t.historyModalDisplay(false);
				t.resetDisplay(true);

				t.gameEngine.historicalControlStart();
			}

			return false;
		};
		t.elementMenuContentClick.onclick = () => {
			t.elementMenuContent.className = 'content open';

			setTimeout(() => {
				t.menuOpen = true;
			});
		};
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
		t.elementMenuDBProgressDownload.onclick = () => {
			t.dbDownload();
			return false;
		};
		t.elementMenuInfo.onclick = () => {
			(<any>window).open('https://tknight.dev/#/creations', '_blank').focus();
		};
		t.elementMenuHistoricalReset.onclick = () => {
			if (t.elementMenuHistoricalReset.innerText === 'Reset') {
				t.gameOverDisplay(false, null);
				t.boardGridBuild();
			} else {
				t.historyModalDisplay(true);
			}
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
		t.elementMenuDBProgressCancel.onclick = () => {
			if (t.workersRunning) {
				t.dbApplyWebWorkersCancel(false);
			} else {
				t.dbDisplay(false);
				t.dbProgressDisplay(false);
			}
			return false;
		};
		window.addEventListener('click', () => {
			if (t.menuOpen) {
				t.elementMenuContent.className = 'content';
				t.menuOpen = false;
			}
		});

		// Shrink game board if aspect ratio to far from square
		aspectRatio = window.innerHeight / window.innerWidth;
		if (aspectRatio > 1.6) {
			console.log('portrait mode activated');
			t.gameboardSizeA = 5;
			t.elementConnectSize.innerText = 'Connect ' + t.gameConnectSize;
		} else if (aspectRatio < 0.5) {
			console.log('landscape mode activated');
			t.gameboardSizeB = 5;
			t.elementConnectSize.innerText = 'Connect ' + t.gameConnectSize;
		}

		// Display Version
		t.elementVersion.innerText = 'v' + globalPackageJSONVersion;

		// Create gameboard grid
		t.boardGridBuild();
	}

	private boardGridBuild(): void {
		let t = this,
			elementBoardGrid: HTMLElement | null = t.elementBoardGrid,
			gameboardSizeA: number = t.gameboardSizeA,
			gameboardSizeB: number = t.gameboardSizeB;

		if (!elementBoardGrid) {
			console.error('Connect > boardGridBuild: missing HTML reference');
			return;
		}

		t.playFirst = true;

		// Hook gameEngine
		t.gameEngine.setCallbackGameOver(t.gameOver.bind(this));
		t.gameEngine.setCallbackPlace(t.boardGridPlaced.bind(this));
		t.gameEngine.setCallbackHistory(t.boardGridPlacedHistorically.bind(this));

		// Build the UI
		t.boardGridBuildBoard(gameboardSizeA, gameboardSizeB);

		// Initialize gameEngine (-1 from length 10 is array range 0-9 or aMax & bMax)
		t.gameEngine.initialize(gameboardSizeA - 1, gameboardSizeB - 1, t.gameConnectSize, t.playAsX, t.skill, t.skillEngineAIML);

		// Update the UI
		t.gameOverDisplay(false, null);
		t.historyControlDisplay(false);
		t.historyModalDisplay(false);
		t.resetDisplay(false);

		// Done
		t.spinnerDisplay(false);
	}

	private boardGridBuildBoard(gameboardSizeA: number, gameboardSizeB: number): void {
		let t = this,
			elementBoardGrid: HTMLElement | null = t.elementBoardGrid,
			elementTD: HTMLElement,
			elementTDColorO: HTMLElement,
			elementTDColorX: HTMLElement,
			elementTDCoordinate: HTMLElement,
			elementTR: HTMLElement;

		// Clean gameboard
		t.elementBoardGridCellsByPositionHash = <any>new Object();
		t.elementBoardGridCellsColorByPositionHash = <any>new Object();
		t.elementGameOverModalCopy.disabled = false;
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
				elementTDColorO = document.createElement('div');
				elementTDColorX = document.createElement('div');
				elementTDCoordinate = document.createElement('div');

				// Style cell
				elementTD.className = 'clickable';
				elementTD.id = 'cell-' + positionHash;
				elementTD.onclick = () => t.boardGridClick(positionHash);

				// Style cell color
				elementTDColorO.className = 'color o';
				elementTDColorX.className = 'color x';

				// Style cell coordinate
				elementTDCoordinate.className = 'coordinate';
				elementTDCoordinate.innerText = a + ',' + b;

				// Append elements
				elementTD.appendChild(elementTDColorO);
				elementTD.appendChild(elementTDColorX);
				elementTD.appendChild(elementTDCoordinate);
				elementTR.appendChild(elementTD);

				// Register element with position hash
				t.elementBoardGridCellsByPositionHash[positionHash] = elementTD;
				t.elementBoardGridCellsColorByPositionHash[positionHash] = {
					o: elementTDColorO,
					x: elementTDColorX,
				};
			}

			// Append row
			elementBoardGrid.appendChild(elementTR);
		}
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
			if (t.playAsX) {
				elementTDPiece.className = 'piece x';
			} else {
				elementTDPiece.className = 'piece o';
			}
			elementTD.appendChild(elementTDPiece);

			// Update gameEngine with placement
			t.gameEngine.place(positionHash);

			t.resetDisplay(true); // Shows the reset button
		});
	}

	private boardGridPlaced(positionHash: number, x?: boolean): void {
		let t = this,
			elementBoardGridCellsColorByPositionHash: { [key: number]: { o: HTMLElement; x: HTMLElement } } = t.elementBoardGridCellsColorByPositionHash,
			elementTD: HTMLElement = t.elementBoardGridCellsByPositionHash[positionHash],
			elementTDPiece: HTMLElement,
			values: WorkingDataValues | null;

		// Remove clickable
		elementTD.className = '';
		elementTD.onclick = null;

		// Create/style/append piece element
		elementTDPiece = document.createElement('div');
		if (x !== undefined) {
			if (x) {
				elementTDPiece.className = 'piece x';
			} else {
				elementTDPiece.className = 'piece o';
			}
		} else {
			if (!t.playAsX) {
				elementTDPiece.className = 'piece x';
			} else {
				elementTDPiece.className = 'piece o';
			}
		}
		elementTD.appendChild(elementTDPiece);

		if (t.showEvaluations && (t.playAsX || !t.playFirst)) {
			values = t.gameEngine.getValues();

			if (values) {
				let elements: { o: HTMLElement; x: HTMLElement },
					opacityMax: number = 50,
					opacityMin: number = 0,
					opacityO: number,
					opacityX: number,
					valuesByPositionHash: { [key: number]: { o: number; x: number } } = values.valuesByPositionHash,
					valuesOMax: number = values.valuesOMax,
					valuesXMax: number = values.valuesXMax;

				for (let [positionHash, evaluation] of Object.entries(valuesByPositionHash)) {
					opacityO = GameEngine.scale(evaluation.o, valuesOMax, 0, opacityMax, opacityMin, true);
					opacityX = GameEngine.scale(evaluation.x, valuesXMax, 0, opacityMax, opacityMin, true);

					elements = elementBoardGridCellsColorByPositionHash[Number(positionHash)];
					elements.o.style.opacity = String(opacityO / 100);
					elements.x.style.opacity = String(opacityX / 100);

					if (evaluation.o === valuesOMax) {
						elements.o.style.opacity = '.8';
					} else if (evaluation.x === valuesXMax) {
						elements.x.style.opacity = '.8';
					}
				}
			} else {
				console.warn('Connect > boardGridPlaced: engines values were null');
			}
		}

		// Done
		t.playFirst = false;
		if (x === undefined) {
			t.spinnerDisplay(false);
		}
	}

	private boardGridPlacedHistorically(positionHashes: number[], positionHashesWinning: number[] | undefined, totalHashes: number): void {
		let t = this,
			element: HTMLElement,
			elementPiece: HTMLElement,
			elementBoardGridCellsColorByPositionHash: { [key: number]: { o: HTMLElement; x: HTMLElement } },
			evaluationsEnabled: boolean = t.showEvaluations,
			gameover: boolean = false,
			historyOWin: boolean | null = t.historyOWin,
			historyPlayAsX: boolean = t.historyPlayAsX;

		// Reset the board UI
		t.boardGridBuildBoard(t.historyGameboardSizeA, t.historyGameboardSizeB);

		if (positionHashes.length === totalHashes) {
			gameover = true;
		}

		// Add the pieces to the board
		t.showEvaluations = false;
		for (let i = 0; i < positionHashes.length; i++) {
			if (!gameover && i !== 0 && i === positionHashes.length - 1) {
				t.showEvaluations = evaluationsEnabled;
			}
			t.boardGridPlaced(positionHashes[i], historyPlayAsX ? Boolean(i % 2) : !Boolean(i % 2));
		}
		t.showEvaluations = evaluationsEnabled;

		if (gameover) {
			if (evaluationsEnabled) {
				elementBoardGridCellsColorByPositionHash = t.elementBoardGridCellsColorByPositionHash;

				// Hide all colors
				for (let i in elementBoardGridCellsColorByPositionHash) {
					elementBoardGridCellsColorByPositionHash[i].o.style.opacity = '0';
					elementBoardGridCellsColorByPositionHash[i].x.style.opacity = '0';
				}

				// Reveal winning colors
				if (positionHashesWinning) {
					for (let i = 0; i < positionHashesWinning.length; i++) {
						if (historyOWin) {
							elementBoardGridCellsColorByPositionHash[positionHashesWinning[i]].o.style.opacity = '.8';
						} else {
							elementBoardGridCellsColorByPositionHash[positionHashesWinning[i]].x.style.opacity = '.8';
						}
					}
				}
			}

			if (t.historyOWin) {
				t.elementGameOver.className = 'gameover o';
			} else if (t.historyOWin === false) {
				t.elementGameOver.className = 'gameover x';
			} else {
				t.elementGameOver.className = 'gameover draw';
			}

			t.elementGameOver.style.display = 'block';
			t.elementGameOver.style.opacity = '1';
		} else {
			t.elementGameOver.style.display = 'none';
			t.elementGameOver.style.opacity = '0';
		}
	}

	private dbApply(): void {
		let t = this,
			amountRequested: HTMLInputElement = <HTMLInputElement>t.elementMenuDBForm.elements[0],
			boardA: HTMLInputElement = <HTMLInputElement>t.elementMenuDBForm.elements[2],
			boardAEff: number = Math.max(3, Math.min(20, Number(boardA.value))),
			boardB: HTMLInputElement = <HTMLInputElement>t.elementMenuDBForm.elements[1],
			boardBEff: number = Math.max(3, Math.min(20, Number(boardB.value))),
			connectSize: HTMLInputElement = <HTMLInputElement>t.elementMenuDBForm.elements[3],
			connectSizeEff: number = Math.max(3, Number(connectSize.value)),
			format: HTMLInputElement = <HTMLInputElement>t.elementMenuDBForm.elements[4],
			skillO: HTMLInputElement = <HTMLInputElement>t.elementMenuDBForm.elements[6],
			skillOEngineAIML: HTMLInputElement = <HTMLInputElement>t.elementMenuDBForm.elements[7],
			skillOShuffle: HTMLInputElement = <HTMLInputElement>t.elementMenuDBForm.elements[9],
			skillX: HTMLInputElement = <HTMLInputElement>t.elementMenuDBForm.elements[10],
			skillXEngineAIML: HTMLInputElement = <HTMLInputElement>t.elementMenuDBForm.elements[11],
			skillXShuffle: HTMLInputElement = <HTMLInputElement>t.elementMenuDBForm.elements[13],
			threads: HTMLInputElement = <HTMLInputElement>t.elementMenuDBForm.elements[14];

		if (connectSizeEff > boardAEff || connectSizeEff > boardBEff) {
			connectSizeEff = Math.min(boardAEff, boardBEff);
		}

		t.dbApplyWebWorkers(
			Number(amountRequested.value),
			boardAEff,
			boardBEff,
			connectSizeEff,
			Boolean(format.checked),
			Number(skillO.value),
			Boolean(skillOEngineAIML.checked),
			Boolean(skillOShuffle.checked),
			Number(skillX.value),
			Boolean(skillXEngineAIML.checked),
			Boolean(skillXShuffle.checked),
			Number(threads.value),
		);
	}

	private dbApplyWebWorkers(
		amountRequested: number,
		aMax: number,
		bMax: number,
		connectSize: number,
		formatCSV: boolean,
		skillO: number,
		skillOEngineAIML: boolean,
		skillOShuffle: boolean,
		skillX: number,
		skillXEngineAIML: boolean,
		skillXShuffle: boolean,
		threads: number,
	): void {
		let t = this,
			amountEffective: number,
			amountGenerated: number = 0,
			dataCSV: string[] = [],
			dataJSON: HistoryReportInstance[] = [],
			done: boolean = false,
			doneCommitted: boolean = false,
			threadsLimit: number = Math.min(threads, amountRequested),
			timeout: ReturnType<typeof setTimeout>,
			timeStartInMS: number,
			worker: Worker,
			workers: Worker[] = new Array(threadsLimit),
			workerStatGen: (threadId: number, amountEffective: number) => void;

		if (window.Worker) {
			amountEffective = Math.ceil(amountRequested / threadsLimit); // Round up to make sure we get enough
			t.workers = workers;
			t.workerDataAmax = aMax;
			t.workerDataAmount = amountRequested;
			t.workerDataBmax = bMax;
			t.workerDataConnectSize = connectSize;
			t.workerDataFormatCSV = formatCSV;
			t.workersRunning = true;
			t.workersElements = new Array(threadsLimit);
			t.workersStats = new Array(threadsLimit);
			t.workerProgressUpdateStartedInMs = new Date().getTime();

			workerStatGen = (threadId: number, amountEffective: number) => {
				t.workersStats[threadId] = {
					amount: 0,
					amountRequested: amountEffective,
					threadId: threadId,
					timeTakenTotalInMS: 0,
				};
			};

			t.dbDisplay(false);
			t.dbProgressDisplayCreateElements(threadsLimit);
			t.dbProgressDisplay(true);

			// Spawn the workers (threads)
			timeStartInMS = new Date().getTime();
			for (let i = 0; i < threadsLimit; i++) {
				worker = new Worker(new URL('./engine/generator.worker.engine', import.meta.url));
				workers[i] = worker; // Cache worker reference for cancelling early

				if (i === threadsLimit - 1) {
					/*
					 * Last thread:
					 *
					 * This ensures that we only generate the exact amount of games requested. As the rounding
					 * errors high. This runs fewer on the last thread to offset the rounding error.
					 */
					amountEffective -= amountEffective * threadsLimit - amountRequested;
				}

				workerStatGen(i, amountEffective);

				worker.postMessage({
					aMax: aMax,
					amountEffective: amountEffective, // each thread should generate their portion of the load
					bMax: bMax,
					connectSize: connectSize,
					formatCSV: formatCSV,
					skillO: skillO,
					skillOEngineAIML: skillOEngineAIML,
					skillOShuffle: skillOShuffle,
					skillX: skillX,
					skillXEngineAIML: skillXEngineAIML,
					skillXShuffle: skillXShuffle,
					threadId: i,
				});
				worker.onmessage = (event: MessageEvent) => {
					if (t.workersRunning) {
						let workerStat: {
							amount: number;
							amountRequested: number;
							threadId: number;
							timeTakenTotalInMS: number;
						} = t.workersStats[event.data.threadId];

						amountGenerated++;
						if (formatCSV) {
							dataCSV.push(event.data.data);
						} else {
							dataJSON.push(event.data.data);
						}

						// Update stats
						workerStat.amount = event.data.amount;
						workerStat.amountRequested = event.data.amountEffective;
						workerStat.timeTakenTotalInMS += event.data.duationInMS;
						t.dbProgressDisplayProgressUpdate();

						if (!done && amountGenerated >= amountRequested) {
							done = true;
							clearTimeout(timeout);
							timeout = setTimeout(() => {
								if (!doneCommitted) {
									doneCommitted = true;
									t.workersRunning = false;

									// Process and allow download
									t.spinnerDisplay(true);
									setTimeout(() => {
										t.dbProgressDisplayProgressUpdate(true);
										// Process Data
										t.dbApplyWebWorkersProcessData(
											amountGenerated,
											dataCSV,
											dataJSON,
											skillOEngineAIML,
											skillXEngineAIML,
											threadsLimit,
											new Date().getTime() - timeStartInMS,
										);

										// Update UI
										t.elementMenuDBProgressCancel.innerText = 'Close';
										t.elementMenuDBProgressDownload.disabled = false;
										t.spinnerDisplay(false);
									});
								}
							}, 1000);
						}
					}
				};
			}
		} else {
			alert('Web Workers are not supported by your browser');
		}
	}

	private async dbApplyWebWorkersCancel(confirmed: boolean) {
		let t = this,
			workers: Worker[] = t.workers;

		if (!t.workersRunning) {
			return;
		} else if (!confirmed) {
			if (!(await t.descisionDisplay('Are you sure?'))) {
				return;
			}
		}

		// Check again as it may have finished before the user hit the 'Ok' button in the confirm
		if (t.workersRunning) {
			t.workersRunning = false;
			t.spinnerDisplay(true);

			setTimeout(() => {
				// Cancel Work
				t.workersRunning = false;
				for (let i = 0; i < workers.length; i++) {
					workers[i].onmessage = () => {}; // Block results response
					workers[i].terminate();
				}
				t.workers = new Array();

				t.dbProgressDisplay(false);
				t.spinnerDisplay(false);
			});
		}
	}

	private dbApplyWebWorkersProcessData(
		amount: number,
		dataCSV: string[],
		dataJSON: HistoryReportInstance[],
		skillOEngineAIML: boolean,
		skillXEngineAIML: boolean,
		threadCount: number,
		durationInMs: number,
	): void {
		let t = this;

		console.log(
			`Connect > dbApplyWebWorkersProcessData: Generation Complete! ${threadCount} thread(s) generated ${amount} records in ${durationInMs}ms [format=${t.workerDataFormatCSV ? 'csv' : 'json'}]`,
		);

		if (t.workerDataFormatCSV) {
			t.workerData = 'data:text/csv;charset=utf-8,' + dataCSV.join('');
		} else {
			let draws: number = 0,
				historyReport: HistoryReport = {
					drawsPercentage: 0,
					games: dataJSON,
					skillOEngineAIML: skillOEngineAIML,
					skillXEngineAIML: skillXEngineAIML,
					oWinPercentage: 0,
					xWinPercentage: 0,
				},
				oWinCount: number = 0;

			dataJSON.forEach((instance: HistoryReportInstance) => {
				if (instance.w) {
					oWinCount++;
				} else if (instance.w === null) {
					draws++;
				}
			});
			historyReport.drawsPercentage = Math.round((draws / historyReport.games.length) * 10000) / 100;
			historyReport.oWinPercentage = Math.round((oWinCount / historyReport.games.length) * 10000) / 100;
			historyReport.xWinPercentage = 100 - historyReport.oWinPercentage;

			t.workerData = 'data:text/csv;charset=utf-8,' + JSON.stringify(historyReport);

			// Print a simplified version to the console
			historyReport.games = new Array();
			console.log('  >> historyReport(JSON)', historyReport);
		}
	}

	private dbDisplay(active: boolean): void {
		let t = this;

		if (active) {
			t.elementMenuDBProgressCancel.innerText = 'Cancel';
			t.elementMenuDBProgressContainer.innerText = '';
			t.elementMenuDBProgressDownload.disabled = true;
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

	private dbDownload(): void {
		let t = this,
			dataString: string,
			date: Date = new Date(),
			filename: string,
			elementDownload: HTMLElement = t.elementDownload,
			workerData: string = t.workerData;

		if (workerData.length) {
			filename =
				'tknight-dev_connect_gameplay_db_' +
				date.getFullYear() +
				'_' +
				String(date.getMonth() + 1).padStart(2, '0') +
				'_' +
				String(date.getDay()).padStart(2, '0') +
				'_' +
				t.workerDataAmax +
				'x' +
				t.workerDataBmax +
				'_c' +
				t.workerDataConnectSize +
				'_r' +
				t.workerDataAmount;

			if (t.workerDataFormatCSV) {
				filename += '.csv';
			} else {
				filename += '.json';
			}

			elementDownload.setAttribute('href', t.workerData);
			elementDownload.setAttribute('download', filename);

			// Free RAM
			t.workerData = '';
		}

		elementDownload.click();
	}

	private dbProgressDisplay(active: boolean): void {
		let t = this;

		if (active) {
			t.elementMenuDBProgress.style.display = 'block';
			t.elementMenuDBProgress.style.opacity = '1';
		} else {
			t.elementMenuDBProgress.style.opacity = '0';
			setTimeout(() => {
				// Allow fade out
				t.elementMenuDBProgress.style.display = 'none';

				// Free RAM
				t.elementDownload.setAttribute('href', '');
			}, 125);
		}
	}

	private dbProgressDisplayCreateElements(threads: number): void {
		let t = this,
			elementContainer: HTMLElement,
			elementContainerLeft: HTMLElement,
			elementContainerProgressBar: HTMLElement,
			elementContainerProgressBarContainer: HTMLElement,
			elementContainerProgressBarContainerProgress: HTMLElement,
			elementContainerProgressBarContainerProgressColor: HTMLElement,
			elementContainerProgressBarContainerProgressOverlay: HTMLElement,
			elementContainerProgressText: HTMLElement,
			elementContainerRight: HTMLElement,
			elementContainerTiming: HTMLElement,
			elementContainerTimingLeft: HTMLElement,
			elementContainerTimingRight: HTMLElement,
			elementMenuDBProgressContainer: HTMLElement = t.elementMenuDBProgressContainer,
			workersElements: {
				progress: HTMLElement;
				progressText: HTMLElement;
				timingLeft: HTMLElement;
				timingRight: HTMLElement;
			}[] = t.workersElements;

		for (let i = 0; i < threads; i++) {
			// Create/style container element
			elementContainer = document.createElement('div');
			elementContainer.className = 'thread-progress-container';
			elementContainer.id = 'thread-' + i;

			/*
			 * Left - Thread ID
			 */
			// Create/style thread id
			elementContainerLeft = document.createElement('div');
			elementContainerLeft.className = 'container-left';
			elementContainerLeft.innerText = 't' + i;

			/*
			 * Right
			 */
			// Create/style thread id
			elementContainerRight = document.createElement('div');
			elementContainerRight.className = 'container-right';

			/*
			 * Progress Bar
			 */
			// Create/style progress bar
			elementContainerProgressBar = document.createElement('div');
			elementContainerProgressBar.className = 'progress-bar';

			elementContainerProgressBarContainer = document.createElement('div');
			elementContainerProgressBarContainer.className = 'progress-container';

			elementContainerProgressBarContainerProgress = document.createElement('div');
			elementContainerProgressBarContainerProgress.className = 'progress';

			elementContainerProgressBarContainerProgressColor = document.createElement('div');
			elementContainerProgressBarContainerProgressColor.className = 'color';

			elementContainerProgressBarContainerProgressOverlay = document.createElement('div');
			elementContainerProgressBarContainerProgressOverlay.className = 'overlay';

			// Append elements
			elementContainerProgressBarContainerProgress.appendChild(elementContainerProgressBarContainerProgressColor);
			elementContainerProgressBarContainerProgress.appendChild(elementContainerProgressBarContainerProgressOverlay);
			elementContainerProgressBarContainer.appendChild(elementContainerProgressBarContainerProgress);
			elementContainerProgressBar.appendChild(elementContainerProgressBarContainer);

			/*
			 * Progress Text
			 */
			// Create/style progress text
			elementContainerProgressText = document.createElement('div');
			elementContainerProgressText.className = 'progress-text';

			/*
			 * Timing
			 */
			// Create/style timing container
			elementContainerTiming = document.createElement('div');
			elementContainerTiming.className = 'timing';

			elementContainerTimingLeft = document.createElement('div');
			elementContainerTimingLeft.className = 'left';

			elementContainerTimingRight = document.createElement('div');
			elementContainerTimingRight.className = 'right';

			// Append elements
			elementContainerTiming.appendChild(elementContainerTimingLeft);
			elementContainerTiming.appendChild(elementContainerTimingRight);

			// Append all right elements
			elementContainerRight.appendChild(elementContainerProgressBar);
			elementContainerRight.appendChild(elementContainerProgressText);
			elementContainerRight.appendChild(elementContainerTiming);

			/*
			 * Done
			 */
			// Append container element
			elementContainer.appendChild(elementContainerLeft);
			elementContainer.appendChild(elementContainerRight);

			// Final append
			elementMenuDBProgressContainer.appendChild(elementContainer);

			// Register elements
			workersElements[i] = {
				progress: elementContainerProgressBarContainerProgress,
				progressText: elementContainerProgressText,
				timingLeft: elementContainerTimingLeft,
				timingRight: elementContainerTimingRight,
			};
		}
	}

	private dbProgressDisplayProgressUpdate(done?: boolean): void {
		let t = this,
			avgMSPerGame: number,
			scratch: number,
			timestampInMs: number = new Date().getTime(),
			workersElement: any,
			workersElements: {
				progress: HTMLElement;
				progressText: HTMLElement;
				timingLeft: HTMLElement;
				timingRight: HTMLElement;
			}[] = t.workersElements,
			workersStat: any,
			workersStats: {
				amount: number;
				amountRequested: number;
				threadId: number;
				timeTakenTotalInMS: number;
			}[] = t.workersStats;

		// Only update the visuals every Xms
		if (done || timestampInMs - t.workerProgressUpdateTimestampInMs > 100) {
			t.workerProgressUpdateTimestampInMs = timestampInMs;

			for (let i = 0; i < workersElements.length; i++) {
				workersElement = workersElements[i];
				workersStat = workersStats[i];

				// integers are faster to draw
				workersElement.progress.style.width = Math.round((workersStat.amount / workersStat.amountRequested) * 100) + '%';
				workersElement.progressText.innerText = workersStat.amount + '/' + workersStat.amountRequested;

				// timing left
				avgMSPerGame = workersStat.timeTakenTotalInMS / workersStat.amount;
				workersElement.timingLeft.innerText = avgMSPerGame.toFixed(2) + 'ms-avg/game';

				// timing left
				if (workersStat.amount >= workersStat.amountRequested) {
					workersElement.progress.className = 'progress complete';

					scratch = workersStat.timeTakenTotalInMS / 1000;
					if (scratch > 60) {
						workersElement.timingRight.innerText = 'Completed in ' + (scratch / 60).toFixed(1) + 'min';
					} else {
						workersElement.timingRight.innerText = 'Completed in ' + scratch.toFixed(1) + 's';
					}
				} else {
					scratch = ((workersStat.amountRequested - workersStat.amount) * avgMSPerGame) / 1000;
					if (scratch > 60) {
						workersElement.timingRight.innerText = (scratch / 60).toFixed(1) + 'min remaining';
					} else {
						workersElement.timingRight.innerText = scratch.toFixed(1) + 's remaining';
					}
				}
			}
		}
	}

	private descisionClick(yes: boolean): void {
		let t = this;

		t.descisionPromiseResolve(yes);
		t.elementSettings.style.opacity = '0';
		setTimeout(() => {
			// Allow fade out
			t.elementDecision.style.display = 'none';
		}, 125);
	}

	private descisionDisplay(message: string): Promise<boolean> {
		let t = this,
			promise: Promise<boolean> = new Promise((resolve, reject) => {
				t.descisionPromiseResolve = resolve;
			});

		t.elementDecisionMessage.innerText = message;
		t.elementDecision.style.display = 'block';
		t.elementDecision.style.opacity = '1';

		return promise;
	}

	private gameOver(historyByPositionHash: number[], oWon: boolean | null, skillO: number, skillX: number, winningPostionHashes: number[] | undefined): void {
		let t = this,
			elementBoardGridCellsColorByPositionHash: { [key: number]: { o: HTMLElement; x: HTMLElement } } = t.elementBoardGridCellsColorByPositionHash;

		if (t.showEvaluations) {
			// Hide all colors
			for (let i in elementBoardGridCellsColorByPositionHash) {
				elementBoardGridCellsColorByPositionHash[i].o.style.opacity = '0';
				elementBoardGridCellsColorByPositionHash[i].x.style.opacity = '0';
			}

			// Reveal winning colors
			if (winningPostionHashes) {
				for (let i = 0; i < winningPostionHashes.length; i++) {
					if (oWon) {
						elementBoardGridCellsColorByPositionHash[winningPostionHashes[i]].o.style.opacity = '.8';
					} else {
						elementBoardGridCellsColorByPositionHash[winningPostionHashes[i]].x.style.opacity = '.8';
					}
				}
			}
		}

		// Done
		t.gameOverDisplay(true, oWon);
		t.spinnerDisplay(false);
	}

	private gameOverDisplay(active: boolean, oWon: boolean | null): void {
		let t = this;

		t.gameOverModalDisplay(active);

		if (active) {
			if (oWon) {
				t.elementGameOver.className = 'gameover o';
			} else if (oWon === false) {
				t.elementGameOver.className = 'gameover x';
			} else {
				t.elementGameOver.className = 'gameover draw';
			}

			t.elementGameOver.style.display = 'block';
			t.elementGameOver.style.opacity = '1';
			t.elementGameOverCanvasContainer.style.display = 'block';
			t.elementGameOverCanvasContainer.style.opacity = '1';

			setTimeout(() => {
				if (t.playAsX) {
					if (oWon === false) {
						t.confetti.trigger();
					}
				} else {
					if (oWon === true) {
						t.confetti.trigger();
					}
				}
			}, 1000);
		} else {
			t.elementGameOver.style.opacity = '0';
			t.elementGameOverCanvasContainer.style.opacity = '0';
			setTimeout(() => {
				// Allow fade out
				t.elementGameOver.style.display = 'none';
				t.elementGameOverCanvasContainer.style.display = 'none';
			}, 125);
		}
	}

	private gameOverModalDisplay(active: boolean): void {
		let t = this;

		if (active) {
			t.elementGameOverModal.style.display = 'block';
			t.elementGameOverModal.style.opacity = '1';
		} else {
			t.elementGameOverModal.style.opacity = '0';
			setTimeout(() => {
				// Allow fade out
				t.elementGameOverModal.style.display = 'none';
			}, 125);
		}
	}

	private historyControlDisplay(active: boolean): void {
		let t = this;

		if (active) {
			t.elementHistoryControl.style.display = 'flex';
			t.elementHistoryControl.style.opacity = '1';
		} else {
			t.elementHistoryControl.style.opacity = '0';
			setTimeout(() => {
				// Allow fade out
				t.elementHistoryControl.style.display = 'none';
			}, 125);
		}
	}

	private historyModalDisplay(active: boolean): void {
		let t = this;

		if (active) {
			t.elementHistory.style.display = 'block';
			t.elementHistory.style.opacity = '1';
		} else {
			t.elementHistory.style.opacity = '0';
			setTimeout(() => {
				// Allow fade out
				t.elementHistory.style.display = 'none';
				t.elementHistoryInput.value = '';
			}, 125);
		}
	}

	private resetDisplay(active: boolean): void {
		let t = this;

		if (active) {
			t.elementMenuHistoricalReset.innerText = 'Reset';
		} else {
			t.elementMenuHistoricalReset.innerText = 'Historical';
		}
	}

	private settingsApply(): void {
		let t = this,
			boardA: HTMLInputElement = <HTMLInputElement>t.elementMenuSettingsForm.elements[1],
			boardB: HTMLInputElement = <HTMLInputElement>t.elementMenuSettingsForm.elements[0],
			connectSize: HTMLInputElement = <HTMLInputElement>t.elementMenuSettingsForm.elements[2],
			connectSizeResolved: number = Math.max(Number(connectSize.value), 3),
			playAsX: HTMLInputElement = <HTMLInputElement>t.elementMenuSettingsForm.elements[3],
			showEvaluations: HTMLInputElement = <HTMLInputElement>t.elementMenuSettingsForm.elements[5],
			skill: HTMLInputElement = <HTMLInputElement>t.elementMenuSettingsForm.elements[6],
			skillEngineAIML: HTMLInputElement = <HTMLInputElement>t.elementMenuDBForm.elements[7];

		t.spinnerDisplay(true);

		setTimeout(() => {
			t.gameboardSizeA = Math.max(3, Math.min(20, Number(boardA.value)));
			t.gameboardSizeB = Math.max(3, Math.min(20, Number(boardB.value)));
			t.playAsX = Boolean(playAsX.checked);
			t.showEvaluations = Boolean(showEvaluations.checked);
			t.skill = Number(skill.value);
			t.skillEngineAIML = Boolean(skillEngineAIML.checked);

			if (connectSizeResolved > t.gameboardSizeA || connectSizeResolved > t.gameboardSizeB) {
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
}

// Bootstrap
new Connect();
