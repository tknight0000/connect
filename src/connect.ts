/**
 * @author tknight-dev
 */

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
	private elementDecisionNo: HTMLElement;
	private elementDecisionYes: HTMLElement;
	private elementDownload: HTMLElement;
	private elementGameOver: HTMLElement;
	private elementGameOverCanvas: HTMLCanvasElement;
	private elementGameOverCanvasContainer: HTMLElement;
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
	private elementMenuDBFormSkillO: HTMLInputElement;
	private elementMenuDBFormSkillOShuffle: HTMLInputElement;
	private elementMenuDBFormSkillX: HTMLInputElement;
	private elementMenuDBFormSkillXShuffle: HTMLInputElement;
	private elementMenuDBFormThreads: HTMLInputElement;
	private elementMenuDBProgress: HTMLElement;
	private elementMenuDBProgressContainer: HTMLElement;
	private elementMenuDBProgressCancel: HTMLInputElement;
	private elementMenuDBProgressDownload: HTMLInputElement;
	private elementSettings: HTMLElement;
	private elementSpinner: HTMLElement;
	private elementVersion: HTMLElement;
	private gameboardSizeA: number = 10;
	private gameboardSizeB: number = 10;
	private gameConnectSize: number = 5;
	private gameEngine: GameEngine = new GameEngine();
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
		let t = this;

		// Cache element references
		t.elementBoard = <HTMLElement>document.getElementById('board');
		t.elementBoardGrid = <HTMLElement>document.getElementById('grid');
		t.elementConnectSize = <HTMLElement>document.getElementById('connect-size');
		t.elementDecision = <HTMLElement>document.getElementById('decision');
		t.elementDecisionMessage = <HTMLElement>document.getElementById('descision-message');
		t.elementDecisionNo = <HTMLElement>document.getElementById('descision-no');
		t.elementDecisionYes = <HTMLElement>document.getElementById('descision-yes');
		t.elementDownload = <HTMLElement>document.getElementById('download');
		t.elementGameOver = <HTMLElement>document.getElementById('gameover');
		t.elementGameOverCanvas = <HTMLCanvasElement>document.getElementById('gameover-canvas');
		t.elementGameOverCanvasContainer = <HTMLElement>document.getElementById('gameover-canvas-container');
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
		t.elementMenuDBProgressCancel = <HTMLInputElement>document.getElementById('db-progress-click-cancel');
		t.elementMenuDBProgressDownload = <HTMLInputElement>document.getElementById('db-progress-click-download');
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

		// Default thread count
		if (navigator.hardwareConcurrency) {
			t.elementMenuDBFormThreads.value = String(Math.max(navigator.hardwareConcurrency / 4, 2));
		}

		// Register confetti
		t.confetti = new Confetti(t.elementGameOverCanvas);

		// Register onchanges
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
		t.elementMenuReset.onclick = () => {
			t.gameOverDisplay(false, null);
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
		t.elementMenuDBProgressCancel.onclick = () => {
			if (t.workersRunning) {
				t.dbApplyWebWorkersCancel(false);
			} else {
				t.dbDisplay(false);
				t.dbProgressDisplay(false);
			}
			return false;
		};

		// Shrink game board is taller than wider
		if (window.innerWidth < window.innerHeight) {
			console.log('vertical mode activated');
			t.gameboardSizeA = 5;
			t.gameConnectSize = 4;
			t.elementConnectSize.innerText = 'Connect ' + t.gameConnectSize;
		}

		// Display Version
		t.elementVersion.innerText = 'v' + globalPackageJSONVersion;

		// Create gameboard grid
		t.boardGridBuild();
	}

	private boardGridBuild(): void {
		let t = this,
			boardGridClick: any = t.boardGridClick,
			elementBoardGrid: HTMLElement | null = t.elementBoardGrid,
			elementTD: HTMLElement,
			elementTDColorO: HTMLElement,
			elementTDColorX: HTMLElement,
			elementTDCoordinate: HTMLElement,
			elementTDOnClickFunction: HTMLElement,
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

		// Initialize gameEngine (-1 from length 10 is array range 0-9 or aMax & bMax)
		t.gameEngine.initialize(gameboardSizeA - 1, gameboardSizeB - 1, t.gameConnectSize, t.skill, t.skillEngineAIML);

		// Clean gameboard
		t.elementBoardGridCellsByPositionHash = <any>new Object();
		t.elementBoardGridCellsColorByPositionHash = <any>new Object();
		t.gameOverDisplay(false, null);
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

			t.resetDisplay(true); // Shows the reset button
		});
	}

	/**
	 * @param positionHash the computer played this position
	 */
	private boardGridPlaced(positionHash: number): void {
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
		elementTDPiece.className = 'piece o';
		elementTD.appendChild(elementTDPiece);

		if (t.showEvaluations) {
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
						elements.o.className = 'color o max';
						elements.o.style.opacity = '.8';
					} else if (evaluation.x === valuesXMax) {
						elements.x.className = 'color x max';
						elements.x.style.opacity = '.8';
					}
				}
			} else {
				console.warn('Connect > boardGridPlaced: engines values were null');
			}
		}

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
			skillO: HTMLInputElement = <HTMLInputElement>t.elementMenuDBForm.elements[6],
			skillOEngineAIML: HTMLInputElement = <HTMLInputElement>t.elementMenuDBForm.elements[7],
			skillOShuffle: HTMLInputElement = <HTMLInputElement>t.elementMenuDBForm.elements[9],
			skillX: HTMLInputElement = <HTMLInputElement>t.elementMenuDBForm.elements[10],
			skillXEngineAIML: HTMLInputElement = <HTMLInputElement>t.elementMenuDBForm.elements[11],
			skillXShuffle: HTMLInputElement = <HTMLInputElement>t.elementMenuDBForm.elements[13],
			threads: HTMLInputElement = <HTMLInputElement>t.elementMenuDBForm.elements[14];

		t.dbApplyWebWorkers(
			Number(amountRequested.value),
			Number(boardA.value),
			Number(boardB.value),
			Number(connectSize.value),
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
				worker = new Worker(new URL('./worker', import.meta.url));
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
				console.log('Connect > dbApplyWebWorkersCancel: cancel aborted');
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

	private gameOver(historyByPositionHash: number[], oWon: boolean | null, skillO: number, skillX: number, winningPostionHashes: number[] | null): void {
		let t = this,
			elementBoardGridCellsColorByPositionHash: { [key: number]: { o: HTMLElement; x: HTMLElement } } = t.elementBoardGridCellsColorByPositionHash;

		if (t.showEvaluations && winningPostionHashes) {
			// Update evaluation
			for (let i in elementBoardGridCellsColorByPositionHash) {
				elementBoardGridCellsColorByPositionHash[i].o.style.opacity = '0';
				elementBoardGridCellsColorByPositionHash[i].x.style.opacity = '0';
			}

			for (let i = 0; i < winningPostionHashes.length; i++) {
				if (oWon) {
					elementBoardGridCellsColorByPositionHash[winningPostionHashes[i]].o.style.opacity = '50';
				} else {
					elementBoardGridCellsColorByPositionHash[winningPostionHashes[i]].x.style.opacity = '50';
				}
			}
		}

		// Done
		t.gameOverDisplay(true, oWon);
		t.spinnerDisplay(false);
	}

	private gameOverDisplay(active: boolean, oWon: boolean | null): void {
		let t = this;

		if (active) {
			if (oWon) {
				t.elementGameOver.className = 'gameover o';
			} else {
				t.elementGameOver.className = 'gameover x';
			}

			t.elementGameOver.style.display = 'block';
			t.elementGameOver.style.opacity = '1';
			t.elementGameOverCanvasContainer.style.display = 'block';
			t.elementGameOverCanvasContainer.style.opacity = '1';

			setTimeout(() => {
				if (!oWon) {
					t.confetti.trigger();
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
			skill: HTMLInputElement = <HTMLInputElement>t.elementMenuSettingsForm.elements[4],
			skillEngineAIML: HTMLInputElement = <HTMLInputElement>t.elementMenuDBForm.elements[5];

		t.spinnerDisplay(true);

		setTimeout(() => {
			t.gameboardSizeA = Number(boardA.value);
			t.gameboardSizeB = Number(boardB.value);
			t.showEvaluations = Boolean(showEvaluations.checked);
			t.skill = Number(skill.value);
			t.skillEngineAIML = Boolean(skillEngineAIML.checked);

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
}

// Bootstrap
new Connect();
