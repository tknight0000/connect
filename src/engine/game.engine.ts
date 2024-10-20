/**
 * @author tknight-dev
 */

import { EvaluationLinearEngine } from './evaluation.linear.engine';
import { SkillEngine } from './skill.engine';
import { TraversalEngine } from './traversal.engine';
export { WorkingDataValues } from './types.engine'; // Make available under this primary module
import { Dimensions, MasterTraversalSetAndChains, WorkingData, WorkingDataValues } from './types.engine';

export class GameEngine {
	private callbackGameOver: ((oWon: boolean, winningPostionHashes: number[]) => void) | undefined;
	private callbackPlace: ((positionHash: number) => void) | undefined;
	private dimensions: Dimensions;
	private gameOver: boolean = false;
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
	private calc(): boolean {
		let t = this,
			masterSet: MasterTraversalSetAndChains;

		masterSet = TraversalEngine.masterSet(t.dimensions, t.workingData);

		if (masterSet.winning) {
			t.gameOver = true;

			if (t.callbackGameOver) {
				t.callbackGameOver(<boolean>masterSet.winningO, <number[]>masterSet.winningPositionHashes);
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
			positionHashesByValues: { [key: number]: number[] } = {},
			valuesByPositionHash: { [key: number]: { o: number; x: number } } = {};

		if (!t.initialized) {
			console.error('GameEngine > reset: engine not initialized yet');
			return;
		}

		positionHashesByValues = <any>new Object();
		positionHashesByValues[0] = [];

		// Initialize map values to 0
		for (let A = 0; A < aMaxEff; A++) {
			for (B = 0; B < bMaxEff; B++) {
				positionHash = ((A & 0xff) << 8) | (B & 0xff);

				placementsAvailableByPositionHash[positionHash] = null;
				positionHashesByValues[0].push(positionHash);
				valuesByPositionHash[positionHash] = { o: 0, x: 0 };
			}
		}

		t.gameOver = false;
		t.workingData = {
			placementsAvailableByPositionHash: placementsAvailableByPositionHash,
			placementsByPositionHash: {},
			positionHashesByValues: positionHashesByValues,
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
		delete t.workingData.placementsAvailableByPositionHash[positionHash];
		t.workingData.placementsByPositionHash[positionHash] = false; // false is X (human)
		if (!t.calc()) {
			// GameOver
			return true;
		}

		// Update board (working data) - Computer Placement
		// positionHash = SkillEngine.calc(t.skillO, t.workingData);
		// delete t.workingData.placementsAvailableByPositionHash[positionHash];
		delete t.workingData.placementsAvailableByPositionHash[0];
		// t.workingData.placementsByPositionHash[positionHash] = true; // true is O (computer)
		t.workingData.placementsByPositionHash[0] = true; // true is O (computer)
		if (!t.calc()) {
			// GameOver
			return true;
		}

		// Let system know human placement is expected
		if (t.callbackPlace) {
			// The computer played this position
			t.callbackPlace(0);
			// t.callbackPlace(positionHash);
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

		while (t.calc()) {
			if (turnO) {
				positionHash = SkillEngine.calc(skillO, workingData);
			} else {
				positionHash = SkillEngine.calc(skillX, workingData);
			}

			delete workingData.placementsAvailableByPositionHash[positionHash];
			workingData.placementsByPositionHash[positionHash] = turnO; // true is O

			turnO = !turnO;
		}
	}

	public static scale(input: number, inputMax: number, inputMin: number, outputMax: number, outputMin: number, round: boolean = false): number {
		let value: number = ((input - inputMin) / (inputMax - inputMin)) * (outputMax - outputMin) + outputMin;
		return round ? Math.round(value) : value;
	}

	public getValues(): WorkingDataValues | null {
		if (!this.initialized) {
			console.error('GameEngine > getValues: engine not initialized yet');
			return null;
		}
		return this.workingData.values;
	}

	/**
	 * @param callbackGameOver - called when the game has ended
	 */
	public setCallbackGameOver(callbackGameOver: (oWon: boolean, winningPostionHashes: number[]) => void): void {
		this.callbackGameOver = callbackGameOver;
	}

	/**
	 * @param callbackPlace - called when the computer has placed a piece. NULL indicates human moves first.
	 */
	public setCallbackPlace(callbackPlace: (positionHash: number) => void): void {
		this.callbackPlace = callbackPlace;
	}
}
