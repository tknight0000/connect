import { GameEngine } from './game/game.engine';
var globalPackageJSONVersion = require('../../package.json').version;

// App
class Connect {
	private elementBoard: HTMLElement;
	private elementBoardGrid: HTMLElement;
	private elementBoardGridCellsByPositionHash: { [key: number]: HTMLElement } = {};
	private elementConnectSize: HTMLElement;
	private elementDownload: HTMLElement;
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
	private elementMenuDBFormSkill1: HTMLInputElement;
	private elementMenuDBFormSkill1Shuffle: HTMLInputElement;
	private elementMenuDBFormSkill2: HTMLInputElement;
	private elementMenuDBFormSkill2Shuffle: HTMLInputElement;
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
	private skill: number = 10;
	private skillEngineAIML: boolean;
	private spinnerStatus: boolean;
	private workerData: string[] | {}[]; // csv | {}[json]
	private workerDataAmax: number;
	private workerDataAmount: number;
	private workerDataBmax: number;
	private workerDataConnectSize: number;
	private workerDataCSV: boolean;
	private workers: Worker[];
	private workersElements: {
		progress: HTMLElement;
		progressText: HTMLElement;
		timeEstCompleteInS: HTMLElement;
		timeTakenAvgInMS: HTMLElement;
	}[];
	private workersRunning: boolean;
	private workersStats: {
		amount: number;
		amountRequested: number;
		threadId: number;
		timeTakenTotalInMS: number;
	}[];

	constructor() {
		let t = this;

		// Cache element references
		t.elementBoard = <HTMLElement>document.getElementById('board');
		t.elementBoardGrid = <HTMLElement>document.getElementById('grid');
		t.elementConnectSize = <HTMLElement>document.getElementById('connect-size');
		t.elementDownload = <HTMLElement>document.getElementById('download');
		t.elementMenuDB = <HTMLElement>document.getElementById('db');
		t.elementMenuDBDisable = <HTMLElement>document.getElementById('db-click-disable');
		t.elementMenuDBEnable = <HTMLElement>document.getElementById('db-click-enable');
		t.elementMenuDBForm = <HTMLFormElement>document.getElementById('dbForm');
		t.elementMenuDBFormApply = <HTMLElement>document.getElementById('dbFormApply');
		t.elementMenuDBFormCancel = <HTMLElement>document.getElementById('dbFormCancel');
		t.elementMenuDBFormSkill1 = <HTMLInputElement>document.getElementById('dbFormSkill1');
		t.elementMenuDBFormSkill1Shuffle = <HTMLInputElement>document.getElementById('dbFormSkill1Shuffle');
		t.elementMenuDBFormSkill2 = <HTMLInputElement>document.getElementById('dbFormSkill2');
		t.elementMenuDBFormSkill2Shuffle = <HTMLInputElement>document.getElementById('dbFormSkill2Shuffle');
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

		// Register onchanges
		t.elementMenuDBFormSkill1Shuffle.onchange = (event: any) => {
			t.elementMenuDBFormSkill1.disabled = (<HTMLInputElement>event.target).checked;
		};
		t.elementMenuDBFormSkill2Shuffle.onchange = (event: any) => {
			t.elementMenuDBFormSkill2.disabled = (<HTMLInputElement>event.target).checked;
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
		t.elementMenuDBProgressDownload.onclick = () => {
			t.dbDownload();
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
		t.elementMenuDBProgressCancel.onclick = () => {
			if (t.workersRunning) {
				t.dbApplyWebWorkersCancel(false);
			} else {
				t.dbDisplay(false);
				t.dbProgressDisplay(false);
			}
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
		t.gameEngine.initialize(gameboardSizeA, gameboardSizeB, t.gameConnectSize, t.skill, t.skillEngineAIML);

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
			skill1: HTMLInputElement = <HTMLInputElement>t.elementMenuDBForm.elements[6],
			skill1EngineAIML: HTMLInputElement = <HTMLInputElement>t.elementMenuDBForm.elements[7],
			skill1Shuffle: HTMLInputElement = <HTMLInputElement>t.elementMenuDBForm.elements[9],
			skill2: HTMLInputElement = <HTMLInputElement>t.elementMenuDBForm.elements[10],
			skill2EngineAIML: HTMLInputElement = <HTMLInputElement>t.elementMenuDBForm.elements[11],
			skill2Shuffle: HTMLInputElement = <HTMLInputElement>t.elementMenuDBForm.elements[13],
			threads: HTMLInputElement = <HTMLInputElement>t.elementMenuDBForm.elements[14];

		t.dbApplyWebWorkers(
			Number(amountRequested.value),
			Number(boardA.value),
			Number(boardB.value),
			Number(connectSize.value),
			Boolean(format.checked),
			Number(skill1.value),
			Boolean(skill1EngineAIML.checked),
			Boolean(skill1Shuffle.checked),
			Number(skill2.value),
			Boolean(skill2EngineAIML.checked),
			Boolean(skill2Shuffle.checked),
			Number(threads.value),
		);
	}

	private dbApplyWebWorkers(
		amountRequested: number,
		aMax: number,
		bMax: number,
		connectSize: number,
		formatCSV: boolean,
		skill1: number,
		skill1EngineAIML: boolean,
		skill1Shuffle: boolean,
		skill2: number,
		skill2EngineAIML: boolean,
		skill2Shuffle: boolean,
		threads: number,
	): void {
		let t = this,
			amountEffective: number,
			amountGenerated: number = 0,
			done: boolean = false,
			doneCommitted: boolean = false,
			generateWorker: any,
			threadsLimit: number = Math.min(threads, amountRequested),
			timeout: ReturnType<typeof setTimeout>,
			timeStartInMS: number,
			timeStopInMS: number,
			worker: Worker,
			workers: Worker[] = new Array(threadsLimit),
			workerStatGen: (threadId: number, amountEffective: number) => void;

		if (window.Worker) {
			amountEffective = Math.ceil(amountRequested / threadsLimit); // Round up to make sure we get enough
			t.workers = workers;
			t.workerData = new Array();
			t.workerDataAmax = aMax;
			t.workerDataAmount = amountRequested;
			t.workerDataBmax = bMax;
			t.workerDataConnectSize = connectSize;
			t.workerDataCSV = formatCSV;
			t.workersRunning = true;
			t.workersElements = new Array(threadsLimit);
			t.workersStats = new Array(threadsLimit);

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
					skill1: skill1,
					skill1EngineAIML: skill1EngineAIML,
					skill1Shuffle: skill1Shuffle,
					skill2: skill2,
					skill2EngineAIML: skill2EngineAIML,
					skill2Shuffle: skill2Shuffle,
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
						t.workerData.push(event.data.data);

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
									timeStopInMS = new Date().getTime() - 1000;

									t.elementMenuDBProgressCancel.innerText = 'Close';
									t.elementMenuDBProgressDownload.disabled = false;
									console.log(
										'workers complete:',
										t.workerData.length,
										'records; it took',
										threadsLimit,
										'threads a total of',
										timeStopInMS - timeStartInMS,
										'ms; format csv =',
										formatCSV,
									);
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

	private dbApplyWebWorkersCancel(confirmed: boolean) {
		let t = this,
			workers: Worker[] = t.workers;

		if (!t.workersRunning) {
			return;
		} else if (!confirmed) {
			if (!confirm('Are you sure?')) {
				console.log('Coonect > dbApplyWebWorkersCancel: cancel aborted');
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
			workerData: string[] | {}[] = t.workerData; // string[csv] | {}[json];

		if (workerData.length) {
			filename =
				'tknight-dev_connect_gameplay_db_' +
				date.getFullYear() +
				'_' +
				String(date.getMonth() + 1).padStart(2, '0') +
				'_' +
				String(date.getDay()).padStart(2, '0') +
				'_' +
				t.workerDataAmount +
				'_' +
				t.workerDataAmax +
				'x' +
				t.workerDataBmax +
				'c' +
				t.workerDataConnectSize;

			if (!t.workerDataCSV) {
				dataString = 'data:text/csv;charset=utf-8,' + workerData.join('');
				filename += '.csv';
			} else {
				dataString = 'data:text/json;charset=utf-8,' + JSON.stringify(workerData);
				filename += '.json';
			}

			// Free RAM
			t.workerData = new Array();

			elementDownload.setAttribute('href', dataString);
			elementDownload.setAttribute('download', filename);
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
				timeEstCompleteInS: HTMLElement;
				timeTakenAvgInMS: HTMLElement;
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
				timeEstCompleteInS: elementContainerTimingRight,
				timeTakenAvgInMS: elementContainerTimingLeft,
			};
		}
	}

	private dbProgressDisplayProgressUpdate(): void {
		let t = this,
			avgMSPerGame: number,
			complete: number,
			workersElement: any,
			workersElements: {
				progress: HTMLElement;
				progressText: HTMLElement;
				timeEstCompleteInS: HTMLElement;
				timeTakenAvgInMS: HTMLElement;
			}[] = t.workersElements,
			workersStat: any,
			workersStats: {
				amount: number;
				amountRequested: number;
				threadId: number;
				timeTakenTotalInMS: number;
			}[] = t.workersStats;

		for (let i = 0; i < workersElements.length; i++) {
			workersElement = workersElements[i];
			workersStat = workersStats[i];

			workersElement.progress.style.width = Math.round(workersStat.amount / workersStat.amountRequested) * 100 + '%'; // integers are faster to draw
			workersElement.progressText.innerText = workersStat.amount + '/' + workersStat.amountRequested;

			avgMSPerGame = workersStat.timeTakenTotalInMS / workersStat.amount;
			workersElement.timeTakenAvgInMS.innerText = Math.round(avgMSPerGame) + 'ms-avg/game';

			if (workersStat.amount >= workersStat.amountRequested) {
				workersElement.progress.className = 'progress complete';
				workersElement.timeEstCompleteInS.innerText = 'Complete';
			} else {
				workersElement.timeEstCompleteInS.innerText =
					'Est ' + Math.round(((workersStat.amountRequested / workersStat.amount) * avgMSPerGame) / 1000) + 's remaining';
			}
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
