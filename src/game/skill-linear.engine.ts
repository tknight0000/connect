/**
 * Random selection from array performance: https://jsperf.com/random-object-property-selection
 *
 * @author tknight-dev
 */

export class SkillLinearEngine {
	// // _5 is expert (perfect)
	// private static _4: number[] = [0, 5, 20, 75];
	// private static _3: number[] = [25, 45, 25, 5];
	// private static _2: number[] = [50, 37, 10, 3];
	// // _1 is noob (random)

	/**
	 * @return is positionHash
	 */
	public static calc(
		skill: number,
		workingData: {
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
		},
	): number {
		if (skill === 5) {
			return 0;
		} else if (skill > 1) {
			return 0;
		} else {
			// This skill level is just random placement
			let keys: string[] = Object.keys(workingData.placementsAvailableByPositionHash);
			return Number(keys[(keys.length * Math.random()) << 0]);
		}
	}

	/**
	 * @return is positionHash
	 */
	public static placeFirst(
		aMax: number,
		bMax: number,
		skill: number,
		workingData: {
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
		},
	): number {
		let t = this;

		if (skill !== 1) {
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
			let keys: string[] = Object.keys(workingData.placementsAvailableByPositionHash);
			// Place randomly
			return Number(keys[(keys.length * Math.random()) << 0]);
		}
	}
}
