/**
 * @author tknight-dev
 */

import { EvaluationLinearEngine } from './evaluation.linear.engine';
import { SkillEngine } from './skill.engine';
import { TraversalEngine } from './traversal.engine';
export { HistoryReport, HistoryReportInstance, WorkingDataValues } from './types.engine'; // Make available under this primary module
import { Dimensions, MasterTraversalSetAndChains, WorkingData, WorkingDataValues } from './types.engine';

export class GameEngine {
	private bypassSkill: boolean = false;
	private callbackGameOver:
		| ((historyByPositionHash: number[], oWon: boolean | null, skillO: number, skillX: number, winningPostionHashes: number[] | null) => void)
		| undefined;
	private callbackHistory: ((positionHashes: number[], totalHashes: number) => void) | undefined;
	private callbackPlace: ((positionHash: number) => void) | undefined;
	private dimensions: Dimensions;
	private gameOver: boolean = false;
	private gameOverOWon: boolean | null;
	private historyByPositionHash: number[] = [];
	private historyDimensions: Dimensions;
	private historyMode: boolean = false;
	private historyModeIndex: number;
	private historyModePlay: boolean = false;
	private historyModePlayTimeout: ReturnType<typeof setTimeout>;
	private human: boolean = false; // human implies X piece
	private initialized: boolean = false;
	private skillO: number = 5;
	private skillOEngineAIML: boolean = false;
	private skillX: number = 5;
	private skillXEngineAIML: boolean = false;
	private workingData: WorkingData;

	/**
	 * Create cell evaluations
	 *
	 * @return boolean is gameover when false
	 */
	private calc(turnO?: boolean, historical?: boolean): boolean {
		let t = this,
			masterSet: MasterTraversalSetAndChains;

		if (historical) {
			masterSet = TraversalEngine.masterSet(t.historyDimensions, t.workingData);
			EvaluationLinearEngine.calc(t.historyDimensions, masterSet, t.workingData);
		} else {
			masterSet = TraversalEngine.masterSet(t.dimensions, t.workingData);

			if (Object.keys(t.workingData.placementsAvailableByPositionHash).length === 0) {
				t.gameOver = true;

				if (t.callbackGameOver) {
					t.gameOverOWon = null;
					t.callbackGameOver(t.historyByPositionHash, null, t.skillO, t.skillX, null);
				} else {
					console.error('GameEngine > place: no game over callback set');
				}

				return false;
			} else if (masterSet.winning) {
				t.gameOver = true;

				if (turnO) {
					if (t.callbackPlace) {
						// The computer played this position
						t.callbackPlace(t.historyByPositionHash[t.historyByPositionHash.length - 1]);
					} else {
						console.error('GameEngine > place: no placement callback set');
					}
				}

				if (t.callbackGameOver) {
					t.gameOverOWon = <boolean>masterSet.winningO;
					t.callbackGameOver(t.historyByPositionHash, <boolean>masterSet.winningO, t.skillO, t.skillX, <number[]>masterSet.winningPositionHashes);
				} else {
					console.error('GameEngine > place: no game over callback set');
				}

				return false;
			} else {
				// Evaluate Positions
				EvaluationLinearEngine.calc(t.dimensions, masterSet, t.workingData);
			}
		}

		return true;
	}

	/**
	 * @return null on failure
	 */
	public historical(history: string): {
		gameboardSizeA: number;
		gameboardSizeB: number;
		oWin: boolean | null;
	} | null {
		let t = this,
			data: {
				games: number[];
				oWin: boolean | null;
				settingsGameboardSizeA: number;
				settingsGameboardSizeB: number;
				settingsConnectSize: number;
			} | null;

		if (!t.callbackHistory) {
			console.error('GameEngine > historical: no history callback set');
			return null;
		}

		data = t.historyParse(history);
		if (data === null) {
			console.error('GameEngine > historical: received a historically inaccurate game');
			return null;
		}

		t.historyDimensions = {
			aMax: data.settingsGameboardSizeA - 1,
			bMax: data.settingsGameboardSizeB - 1,
			connectSize: data.settingsConnectSize,
		};
		t.historyMode = true;
		t.historyModeIndex = 0;
		t.initialize(
			data.settingsGameboardSizeA - 1,
			data.settingsGameboardSizeB - 1,
			data.settingsConnectSize,
			SkillEngine.getSkillMax(),
			false,
			SkillEngine.getSkillMax(),
			false,
		);
		t.historyByPositionHash = data.games;

		return {
			gameboardSizeA: data.settingsGameboardSizeA,
			gameboardSizeB: data.settingsGameboardSizeB,
			oWin: data.oWin,
		};
	}

	public historicalControlEnd(): void {
		let t = this;

		if (!t.historyMode) {
			return;
		}
		t.historyModeIndex = t.historyByPositionHash.length - 1;
		t.historicalControlPlace();
		t.historicalControlPlayTimeout();
	}

	public historicalControlNext(): void {
		let t = this,
			nextIndex: number;

		if (!t.historyMode) {
			return;
		}
		nextIndex = Math.min(t.historyByPositionHash.length - 1, t.historyModeIndex + 1);

		if (nextIndex !== t.historyModeIndex) {
			t.historyModeIndex = nextIndex;
			t.historicalControlPlace();
		} else {
			clearTimeout(t.historyModePlayTimeout);
		}
	}

	public historicalControlPause(): void {
		let t = this;

		if (!t.historyMode) {
			return;
		}
		t.historyModePlay = false;
		clearTimeout(t.historyModePlayTimeout);
	}

	private historicalControlPlace(): void {
		let t = this,
			historySliceByPositionHash: number[] = t.historyByPositionHash.slice(0, t.historyModeIndex + 1),
			i: number = 0,
			positionHash: number = 0;

		// Configure placement memory
		t.reset(true);

		for (; i < historySliceByPositionHash.length; i++) {
			positionHash = historySliceByPositionHash[i];

			delete t.workingData.placementsAvailableByPositionHash[positionHash];
			if (i % 2) {
				t.workingData.placementsByPositionHash[positionHash] = true; // true is O (computer)
			} else {
				t.workingData.placementsByPositionHash[positionHash] = false; // false is X (human)
			}
		}

		// Run evaluations
		if (i !== 1) {
			t.calc(undefined, true);
		}

		if (t.callbackHistory) {
			t.callbackHistory(historySliceByPositionHash, t.historyByPositionHash.length);
		}
		t.historicalControlPlayTimeout();
	}

	public historicalControlPlay(): void {
		let t = this;

		if (!t.historyMode) {
			return;
		}
		t.historyModePlay = true;
		t.historicalControlPlayTimeout();
	}

	private historicalControlPlayTimeout(): void {
		let t = this;

		if (t.historyModePlay) {
			clearTimeout(t.historyModePlayTimeout);
			t.historyModePlayTimeout = setTimeout(() => {
				t.historicalControlNext();
			}, 1000);
		}
	}

	public historicalControlPrevious(): void {
		let t = this;

		if (!t.historyMode) {
			return;
		}
		t.historyModeIndex = Math.max(0, t.historyModeIndex - 1);
		t.historicalControlPlace();
	}

	public historicalControlStart(): void {
		let t = this;

		if (!t.historyMode) {
			return;
		}
		t.historyModeIndex = 0;
		t.historicalControlPlace();
	}

	/**
	 * @return is null on failure
	 */
	public historyParse(history: string): {
		games: number[];
		oWin: boolean | null;
		settingsGameboardSizeA: number;
		settingsGameboardSizeB: number;
		settingsConnectSize: number;
	} | null {
		let A: number,
			B: number,
			games: number[],
			histories: string[] = history.trim().split(';'),
			oWin: boolean | null,
			oWinString: string,
			positionHash: number,
			settings: string,
			settingsGameboardSizeA: number,
			settingsGameboardSizeB: number,
			settingsConnectSize: number;

		if (histories.length !== 2) {
			// console.error("GameEngine > historyParse: split failed");
			return null;
		} else if (!/^[0-9,]*$/.test(histories[1])) {
			// console.error("GameEngine > historyParse: bad game history format");
			return null;
		}

		// Settings
		settings = histories[0];
		if (settings.length !== 8) {
			// console.error("GameEngine > historyParse: settings failed");
			return null;
		}

		oWinString = settings.substring(7, 8);
		settingsGameboardSizeA = Number(settings.substring(0, 2));
		settingsGameboardSizeB = Number(settings.substring(2, 4));
		settingsConnectSize = Number(settings.substring(4, 6));

		if (oWinString !== 'O' && oWinString !== 'X' && oWinString !== 'D') {
			// console.error("GameEngine > historyParse: invalid result");
			return null;
		} else if (settingsGameboardSizeA < 3 || settingsGameboardSizeA > 20) {
			// console.error("GameEngine > historyParse: invalid A gameboard size");
			return null;
		} else if (settingsGameboardSizeB < 3 || settingsGameboardSizeB > 20) {
			// console.error("GameEngine > historyParse: invalid B gameboard size");
			return null;
		} else if (settingsConnectSize < 3 || settingsConnectSize > settingsGameboardSizeA || settingsConnectSize > settingsGameboardSizeB) {
			// console.error("GameEngine > historyParse: invalid connect size");
			return null;
		}

		if (oWinString === 'O') {
			oWin = true;
		} else if (oWinString === 'X') {
			oWin = false;
		} else {
			oWin = null;
		}

		// Games
		try {
			games = JSON.parse('[' + histories[1] + ']');
		} catch (error) {
			// console.error("GameEngine > historyParse: invalid game history");
			return null;
		}

		if (games.length === 0 || games.length > settingsGameboardSizeA * settingsGameboardSizeB) {
			// console.error("GameEngine > historyParse: invalid game history size");
			return null;
		}

		for (let i = 0; i < games.length; i++) {
			positionHash = games[i];

			A = (positionHash >> 8) & 0xff;
			if (A < 0 || A >= settingsGameboardSizeA) {
				// console.error("GameEngine > historyParse: invalid A position at placement", i);
				return null;
			}

			B = positionHash & 0xff;
			if (B < 0 || B >= settingsGameboardSizeB) {
				// console.error("GameEngine > historyParse: invalid B position at placement", i);
				return null;
			}
		}

		return {
			games: games,
			oWin: oWin,
			settingsGameboardSizeA: settingsGameboardSizeA,
			settingsGameboardSizeB: settingsGameboardSizeB,
			settingsConnectSize: settingsConnectSize,
		};
	}

	public initialize(
		aMax: number,
		bMax: number,
		connectSize: number,
		skillO: number,
		skillOEngineAIML: boolean,
		skillX: number = -1,
		skillXEngineAIML: boolean = false,
	): void {
		let t = this,
			dimensions: Dimensions = {
				aMax: aMax,
				bMax: bMax,
				connectSize: connectSize,
			};

		t.dimensions = dimensions;
		t.human = skillX === -1;
		t.skillO = skillO;
		t.skillOEngineAIML = skillOEngineAIML;
		t.skillX = skillX;
		t.skillXEngineAIML = skillXEngineAIML;
		t.initialized = true;

		t.reset();

		// Done
		if (!t.callbackGameOver) {
			console.warn('GameEngine > initialize: no game over callback set');
		}
		if (!t.callbackPlace) {
			console.warn('GameEngine > initialize: no placement callback set');
		}
	}

	public reset(historical?: boolean): void {
		let t = this,
			aMaxEff: number = t.dimensions.aMax + 1,
			B: number,
			bMaxEff: number = t.dimensions.bMax + 1,
			positionHash: number,
			placementsAvailableByPositionHash: { [key: number]: null } = [],
			valuesByPositionHash: { [key: number]: { o: number; x: number } } = {};

		if (!t.initialized) {
			console.error('GameEngine > reset: engine not initialized yet');
			return;
		}

		if (historical) {
			aMaxEff = t.historyDimensions.aMax + 1;
			bMaxEff = t.historyDimensions.bMax + 1;
		}

		// Initialize map values to 0
		for (let A = 0; A < aMaxEff; A++) {
			for (B = 0; B < bMaxEff; B++) {
				positionHash = ((A & 0xff) << 8) | (B & 0xff);

				placementsAvailableByPositionHash[positionHash] = null;
				valuesByPositionHash[positionHash] = { o: 0, x: 0 };
			}
		}

		if (!historical) {
			t.historyByPositionHash = new Array();
		}

		t.gameOver = false;
		t.workingData = {
			placementsAvailableByPositionHash: placementsAvailableByPositionHash,
			placementsByPositionHash: {},
			positionHashesByValues: {
				data: {
					o: {},
					sum: {},
					x: {},
				},
				max: 0,
				min: 0,
			},
			values: {
				valuesByPositionHash: valuesByPositionHash,
				valuesOMax: 0,
				valuesXMax: 0,
			},
		};

		if (!t.human && !historical) {
			t.placeAuto();
		}
	}

	/**
	 * Let the engine know where the human has placed their piece
	 */
	public place(positionHash: number): boolean {
		let t = this;

		if (!t.initialized) {
			console.error('GameEngine > place: engine not initialized yet');
			return false;
		} else if (!t.human) {
			console.error('GameEngine > place: human placements not configured');
			return false;
		} else if (t.gameOver) {
			console.error('GameEngine > place: the game is complete');
			return false;
		} else if (t.workingData.placementsByPositionHash[positionHash]) {
			console.error('GameEngine > place: placement already used');
			return false;
		}

		// Update board (working data) - Human Placement
		t.historyByPositionHash.push(positionHash);
		delete t.workingData.placementsAvailableByPositionHash[positionHash];
		t.workingData.placementsByPositionHash[positionHash] = false; // false is X (human)
		if (!t.calc(false)) {
			// GameOver
			return true;
		}

		// Update board (working data) - Computer Placement
		if (t.bypassSkill) {
			// Forces the computer to only play in the top left corner
			positionHash = 0;
		} else {
			positionHash = SkillEngine.calc(t.skillO, true, t.workingData);
		}
		t.historyByPositionHash.push(positionHash);
		delete t.workingData.placementsAvailableByPositionHash[positionHash];
		t.workingData.placementsByPositionHash[positionHash] = true; // true is O (computer)
		if (!t.calc(true)) {
			// GameOver
			return true;
		}

		// Let system know human placement is expected
		if (t.callbackPlace) {
			// The computer played this position
			t.callbackPlace(positionHash);
		} else {
			console.error('GameEngine > place: no placement callback set');
		}

		return true;
	}

	/**
	 * Used one Computer Vs Computer
	 */
	private placeAuto(): void {
		let t = this,
			positionHash: number,
			skillO: number = t.skillO,
			skillX: number = t.skillX,
			turnO: boolean = true,
			workingData: WorkingData = t.workingData;

		// computer place first
		positionHash = SkillEngine.placeFirst(t.dimensions, skillX, workingData);
		delete workingData.placementsAvailableByPositionHash[positionHash];
		workingData.placementsByPositionHash[positionHash] = false; // true is O
		t.historyByPositionHash.push(positionHash);

		while (t.calc()) {
			if (turnO) {
				positionHash = SkillEngine.calc(skillO, turnO, workingData);
			} else {
				positionHash = SkillEngine.calc(skillX, turnO, workingData);
			}

			t.historyByPositionHash.push(positionHash);
			delete workingData.placementsAvailableByPositionHash[positionHash];
			workingData.placementsByPositionHash[positionHash] = turnO; // true is O

			turnO = !turnO;
		}
	}

	public static scale = SkillEngine.scale;

	public getValues(): WorkingDataValues | null {
		if (!this.initialized) {
			console.error('GameEngine > getValues: engine not initialized yet');
			return null;
		}
		return this.workingData.values;
	}

	/**
	 * @param callbackGameOver - called when the game has ended. oWon is null on a tie game.
	 */
	public setCallbackGameOver(
		callbackGameOver: (
			historyByPositionHash: number[],
			oWon: boolean | null,
			skillO: number,
			skillX: number,
			winningPostionHashes: number[] | null,
		) => void,
	): void {
		this.callbackGameOver = callbackGameOver;
	}

	/**
	 * @param callbackHistory - called when the playing the history of a previous game
	 */
	public setCallbackHistory(callbackHistory: (positionHashes: number[], totalHashes: number) => void): void {
		this.callbackHistory = callbackHistory;
	}

	/**
	 * @param callbackPlace - called when the computer has placed a piece. NULL indicates human moves first.
	 */
	public setCallbackPlace(callbackPlace: (positionHash: number) => void): void {
		this.callbackPlace = callbackPlace;
	}

	public isGameOver(): boolean {
		return this.gameOver;
	}

	public getGameOverOWon(): boolean | null {
		return this.gameOverOWon;
	}

	public getHistory(): number[] {
		return this.historyByPositionHash;
	}

	public static getSkillMax(): number {
		return SkillEngine.getSkillMax();
	}

	public static getSkillMin(): number {
		return SkillEngine.getSkillMin();
	}

	public getSkillO(): number {
		return this.skillO;
	}

	public isSkillOAIML(): boolean {
		return this.skillOEngineAIML;
	}

	public getSkillX(): number {
		return this.skillX;
	}

	public isSkillXAIML(): boolean {
		return this.skillXEngineAIML;
	}

	public static getSkillRandom(): number {
		return SkillEngine.getSkillRandom();
	}
}
