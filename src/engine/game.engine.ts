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
	private callbackPlace: ((positionHash: number) => void) | undefined;
	private dimensions: Dimensions;
	private gameOver: boolean = false;
	private historyByPositionHash: number[] = [];
	private human: boolean = false; // human implies X piece
	private humanWon: boolean = false; // human implies X piece
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
	private calc(turnO?: boolean): boolean {
		let t = this,
			masterSet: MasterTraversalSetAndChains;

		masterSet = TraversalEngine.masterSet(t.dimensions, t.workingData);

		if (Object.keys(t.workingData.placementsAvailableByPositionHash).length === 0) {
			t.gameOver = true;

			if (t.callbackGameOver) {
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
				t.callbackGameOver(t.historyByPositionHash, <boolean>masterSet.winningO, t.skillO, t.skillX, <number[]>masterSet.winningPositionHashes);
			} else {
				console.error('GameEngine > place: no game over callback set');
			}

			return false;
		} else {
			// Evaluate Positions
			EvaluationLinearEngine.calc(t.dimensions, masterSet, t.workingData);

			return true;
		}
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

	public reset(): void {
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

		// Initialize map values to 0
		for (let A = 0; A < aMaxEff; A++) {
			for (B = 0; B < bMaxEff; B++) {
				positionHash = ((A & 0xff) << 8) | (B & 0xff);

				placementsAvailableByPositionHash[positionHash] = null;
				valuesByPositionHash[positionHash] = { o: 0, x: 0 };
			}
		}

		t.gameOver = false;
		t.historyByPositionHash = new Array();
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

		if (!t.human) {
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
	 * @param callbackPlace - called when the computer has placed a piece. NULL indicates human moves first.
	 */
	public setCallbackPlace(callbackPlace: (positionHash: number) => void): void {
		this.callbackPlace = callbackPlace;
	}

	public static getSkillMax() {
		return SkillEngine.getSkillMax();
	}

	public static getSkillMin() {
		return SkillEngine.getSkillMin();
	}

	public static getSkillRandom() {
		return SkillEngine.getSkillRandom();
	}
}
