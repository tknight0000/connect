/**
 * Skill refers to the percentage away from perfect a computer is allowed to play
 *
 * @author tknight-dev
 */

import { Dimensions, WorkingData } from './types.engine';

export class SkillEngine {
	private static readonly skillMax: number = 5;
	private static readonly skillMin: number = 1;

	/**
	 * @return is positionHash
	 */
	public static calc(skill: number, turnO: boolean, workingData: WorkingData): number {
		let minViableValue: number,
			positionHashesByValues: {
				o: { [key: number]: number[] };
				sum: { [key: number]: number[] };
				x: { [key: number]: number[] };
			} = workingData.positionHashesByValues.data,
			positionHashesByValuesMax: number = workingData.positionHashesByValues.max,
			positionHashesByValuesMin: number = workingData.positionHashesByValues.min,
			positionHash: number,
			positions: number[],
			valueOMax: number = workingData.values.valuesOMax,
			values: number[],
			valueXMax: number = workingData.values.valuesXMax;

		if (skill === SkillEngine.skillMax) {
			if (valueOMax > valueXMax) {
				positions = positionHashesByValues.o[valueOMax];
			} else if (valueXMax > valueOMax) {
				positions = positionHashesByValues.x[valueXMax];
			} else {
				// Undefined
				positions = positionHashesByValues.sum[positionHashesByValuesMax];
			}
		} else if (skill !== SkillEngine.skillMin) {
			minViableValue = SkillEngine.scale(skill, SkillEngine.skillMax, SkillEngine.skillMin, positionHashesByValuesMax, positionHashesByValuesMin);

			// Array of positionValues that meet the min value determined by skill
			values = Object.keys(positionHashesByValues.sum)
				.map((v) => Number(v))
				.filter((v) => v >= minViableValue);

			// Randomly select from values array to get positionHash[] corresponding to randomized value
			let rand: any = values[(values.length * Math.random()) << 0];
			positions = positionHashesByValues.sum[rand];

			// Undefined
		} else {
			positions = Object.keys(workingData.placementsAvailableByPositionHash).map((v) => Number(v));
		}

		// Place randomly: https://jsperf.com/random-object-property-selection
		return positions[(positions.length * Math.random()) << 0];
	}

	/**
	 * @return is positionHash
	 */
	public static placeFirst(dimensions: Dimensions, skill: number, workingData: WorkingData): number {
		let t = this,
			aMax = dimensions.aMax,
			bMax = dimensions.bMax;

		if (skill !== SkillEngine.skillMin) {
			let a: number,
				aPossible: number[] = [],
				b: number,
				bPossible: number[] = [];
			// Place randomly in center squares
			if (aMax % 2) {
				aPossible.push(Math.ceil(aMax / 2));
				aPossible.push(Math.floor(aMax / 2));
			} else {
				aPossible.push(aMax / 2);
			}
			a = aPossible[(aPossible.length * Math.random()) << 0];

			if (bMax % 2) {
				bPossible.push(Math.ceil(bMax / 2));
				bPossible.push(Math.floor(bMax / 2));
			} else {
				bPossible.push(bMax / 2);
			}
			b = bPossible[(bPossible.length * Math.random()) << 0];

			return ((a & 0xff) << 8) | (b & 0xff);
		} else {
			return SkillEngine.calc(SkillEngine.skillMin, false, workingData);
		}
	}

	public static scale(input: number, inputMax: number, inputMin: number, outputMax: number, outputMin: number, round: boolean = false): number {
		let value: number = ((input - inputMin) / (inputMax - inputMin)) * (outputMax - outputMin) + outputMin;
		return round ? Math.round(value) : value;
	}

	public static getSkillMax() {
		return SkillEngine.skillMax;
	}

	public static getSkillMin() {
		return SkillEngine.skillMin;
	}

	public static getSkillRandom() {
		return Math.floor(Math.random() * SkillEngine.skillMax) + SkillEngine.skillMin;
	}
}
