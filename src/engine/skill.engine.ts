/**
 * Skill is between and including 1 and 5
 *
 * @author tknight-dev
 */

import { Dimensions, WorkingData } from './types.engine';

export class SkillEngine {
	/**
	 * @return is positionHash
	 */
	public static calc(skill: number, workingData: WorkingData): number {
		if (skill > 1) {
			// Place randomly: https://jsperf.com/random-object-property-selection
			let keys: string[] = Object.keys(workingData.placementsAvailableByPositionHash);
			return Number(keys[(keys.length * Math.random()) << 0]);
		} else {
			// Place randomly: https://jsperf.com/random-object-property-selection
			let keys: string[] = Object.keys(workingData.placementsAvailableByPositionHash);
			return Number(keys[(keys.length * Math.random()) << 0]);
		}
	}

	/**
	 * @return is positionHash
	 */
	public static placeFirst(dimensions: Dimensions, skill: number, workingData: WorkingData): number {
		let t = this,
			aMax = dimensions.aMax,
			bMax = dimensions.bMax;

		if (skill > 1) {
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
			return SkillEngine.calc(1, workingData);
		}
	}
}
