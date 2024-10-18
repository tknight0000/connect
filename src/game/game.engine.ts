/**
 * @author tknight-dev
 */

import { SkillLinearEngine } from './skill-linear.engine';

export class GameEngine {
	private aMax: number = 0;
	private bMax: number = 0;
	private callbackGameOver: ((xWon: boolean) => void) | undefined;
	private callbackPlace: ((positionHash: number) => void) | undefined;
	private connectSize: number = 5;
	private gameOver: boolean = false;
	private human: boolean = false; // human implies X piece
	private humanWon: boolean = false; // human implies X piece
	private humanPlacementExpected: boolean = false;
	private skill1: number = 5;
	private skill1EngineAIML: boolean = false;
	private skill2: number = 5;
	private skill2EngineAIML: boolean = false;
	private workingData: {
		placementsAvailableByPositionHash: { [key: number]: null };
		placementsByPositionHash: { [key: number]: boolean }; // true is O
		positionHashesByValues: { [key: number]: number[] };
		values: {
			valuesByPositionHash: { [key: number]: { o: number; x: number } };
			valuesO: {
				max: number;
				min: number;
			};
			valuesX: {
				max: number;
				min: number;
			};
		};
	};

	/**
	 * @return positionHash
	 */
	private calc(): number {
		let t = this;

		// gather master chain set
		// is game over?
		// evaluate positions
		// call skill system to make placement determination
		// return placement

		// TODO: remove below, random for now to give the ui something to work with
		let x: number, o: number;
		for (let i in t.workingData.values.valuesByPositionHash) {
			x = Math.floor(Math.random() * 91);
			o = Math.floor(Math.random() * 91);

			t.workingData.values.valuesByPositionHash[i].x = x;
			t.workingData.values.valuesByPositionHash[i].o = o;

			t.workingData.values.valuesO.max = Math.max(t.workingData.values.valuesO.max, o);
			t.workingData.values.valuesO.min = Math.min(t.workingData.values.valuesO.min, o);
			t.workingData.values.valuesX.max = Math.max(t.workingData.values.valuesX.max, x);
			t.workingData.values.valuesX.min = Math.min(t.workingData.values.valuesX.min, x);
		}

		let keys: string[] = Object.keys(t.workingData.placementsAvailableByPositionHash);
		return Number(keys[(keys.length * Math.random()) << 0]);
	}

	public initialize(
		aMax: number,
		bMax: number,
		connectSize: number,
		skill1: number,
		skill1EngineAIML: boolean,
		skill2: number = -1,
		skill2EngineAIML: boolean = false,
	): void {
		let t = this;

		t.aMax = aMax;
		t.bMax = bMax;
		t.connectSize = connectSize;
		t.human = skill2 === -1;
		t.skill1 = skill1;
		t.skill1EngineAIML = skill1EngineAIML;
		t.skill2 = skill2;
		t.skill2EngineAIML = skill2EngineAIML;

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
			positionHash: number,
			placementsAvailableByPositionHash: { [key: number]: null } = [],
			positionHashesByValues: { [key: number]: number[] } = {},
			valuesByPositionHash: { [key: number]: { o: number; x: number } } = {};

		positionHashesByValues = <any>new Object();
		positionHashesByValues[0] = [];

		// Initialize map values to 0
		for (let a = 0; a < t.aMax; a++) {
			for (let b = 0; b < t.bMax; b++) {
				positionHash = ((a & 0xff) << 8) | (b & 0xff);

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
				valuesO: {
					max: 0,
					min: 0,
				},
				valuesX: {
					max: 0,
					min: 0,
				},
			},
		};

		if (!t.human) {
			// computer place first
			positionHash = SkillLinearEngine.placeFirst(t.aMax, t.bMax, t.skill1, t.workingData);
			t.humanPlacementExpected = false;

			// TODO
			// while(!t.gameOver) {
			// 	t.calc();
			// }

			if (t.callbackGameOver) {
				t.callbackGameOver(t.humanWon);
			} else {
				console.error('GameEngine > place: no game over callback set');
			}
		}
	}

	/**
	 * Let the engine know where the human has placed their piece
	 */
	public place(positionHash: number): boolean {
		let t = this;

		if (!t.human) {
			console.error('GameEngine > place: human placements not configured');
			return false;
		} else if (t.workingData.placementsByPositionHash[positionHash]) {
			console.error('GameEngine > place: placement already used');
			return false;
		}

		// Update board (working data)
		delete t.workingData.placementsAvailableByPositionHash[positionHash];
		t.workingData.placementsByPositionHash[positionHash] = false; // false is X (human)

		// Get computer (engine) placement
		positionHash = t.calc();
		delete t.workingData.placementsAvailableByPositionHash[positionHash];
		t.workingData.placementsByPositionHash[positionHash] = true; // true is O (computer)

		if (t.callbackPlace) {
			// The computer played this position
			t.callbackPlace(positionHash);
		} else {
			console.error('GameEngine > place: no placement callback set');
		}

		return true;
	}

	public static scale(input: number, inputMax: number, inputMin: number, outputMax: number, outputMin: number, round: boolean = false): number {
		let value: number = ((input - inputMin) / (inputMax - inputMin)) * (outputMax - outputMin) + outputMin;
		return round ? Math.round(value) : value;
	}

	public getValues(): {
		valuesByPositionHash: { [key: number]: { o: number; x: number } };
		valuesO: {
			max: number;
			min: number;
		};
		valuesX: {
			max: number;
			min: number;
		};
	} {
		return this.workingData.values;
	}

	/**
	 * @param callbackGameOver - called when the game has ended
	 */
	public setCallbackGameOver(callbackGameOver: (xWon: boolean) => void): void {
		this.callbackGameOver = callbackGameOver;
	}

	/**
	 * @param callbackPlace - called when the computer has placed a piece. NULL indicates human moves first.
	 */
	public setCallbackPlace(callbackPlace: (positionHash: number) => void): void {
		this.callbackPlace = callbackPlace;
	}
}
