/**
 * @author tknight-dev
 */

import {
	AlgorithmType,
	Dimensions,
	MasterTraversalSetAndChains,
	TraversalChain,
	TraversalChainPlacement,
	TraversalSetAndChains,
	TraversalType,
	WorkingData,
	WorkingDataPositionsByValues,
} from './types.engine';

export class EvaluationLinearEngine {
	/**
	 * @param algorithmType, only used during unit tests. Undefined is all algorithms.
	 */
	public static calc(
		dimensions: Dimensions,
		masterSet: MasterTraversalSetAndChains,
		workingData: WorkingData,
		algorithmType: AlgorithmType | undefined = undefined,
	): void {
		let positionHashesByValues: WorkingDataPositionsByValues = {
				data: {
					o: {},
					sum: {},
					x: {},
				},
				max: 0,
				min: 0,
			},
			dataO: { [key: number]: number[] } = positionHashesByValues.data.o,
			dataSum: { [key: number]: number[] } = positionHashesByValues.data.sum,
			dataX: { [key: number]: number[] } = positionHashesByValues.data.x,
			values: { o: number; x: number },
			valueSum: number,
			valuesMax: number = 0,
			valuesMin: number = Infinity,
			valuesByPositionHash: { [key: number]: { o: number; x: number } } = workingData.values.valuesByPositionHash;

		// Reset current values
		for (let i in valuesByPositionHash) {
			values = valuesByPositionHash[i];
			values.o = 0;
			values.x = 0;
		}

		// Eval
		EvaluationLinearEngine._calc(dimensions, masterSet, workingData, algorithmType);

		// NO MORE VIABLE POSITIONS

		// Map positionsHashes by value
		for (let [positionHash, values] of Object.entries(valuesByPositionHash)) {
			valueSum = values.o + values.x;
			if (valueSum) {
				// Don't register valueless positions
				if (!dataO[values.o]) {
					dataO[values.o] = [Number(positionHash)];
				} else {
					dataO[values.o].push(Number(positionHash));
				}
				if (!dataSum[valueSum]) {
					dataSum[valueSum] = [Number(positionHash)];
				} else {
					dataSum[valueSum].push(Number(positionHash));
				}
				if (!dataX[values.x]) {
					dataX[values.x] = [Number(positionHash)];
				} else {
					dataX[values.x].push(Number(positionHash));
				}

				if (valueSum > valuesMax) {
					valuesMax = valueSum;
				}
				if (valueSum < valuesMin) {
					valuesMin = valueSum;
				}
			}
		}

		positionHashesByValues.max = valuesMax;
		positionHashesByValues.min = valuesMin;
		workingData.positionHashesByValues = positionHashesByValues;
	}

	private static _calc(
		dimensions: Dimensions,
		masterSet: MasterTraversalSetAndChains,
		workingData: WorkingData,
		algorithmType: AlgorithmType | undefined = undefined,
	): void {
		let adder: (positionHash: number, value: number) => void,
			applied: boolean,
			chain: TraversalChain,
			chainEff: TraversalChain,
			chainPossibleWidth: number,
			chains: TraversalChain[],
			chainsLength: number,
			connectPossible: boolean,
			connectSize: number = dimensions.connectSize,
			gapEff: number,
			index: number,
			indexEff: number,
			indexSearchAfter: number,
			indexSearchBefore: number,
			j: number,
			k: number,
			o: boolean,
			oMax: number = 0,
			placement: TraversalChainPlacement,
			placementCellsLength: number,
			placementCellsLengthEff: number,
			placementCellsLengthEffValueOffsetAfter: number,
			placementCellsLengthEffValueOffsetBefore: number,
			placementEff: TraversalChainPlacement,
			set: number[], // positionHash[]
			traversalSetAndChains: TraversalSetAndChains,
			traversalSetAndChainsGroup: TraversalSetAndChains[] = masterSet.traversalSetAndChainsGroup,
			valuesByPositionHash: { [key: number]: { o: number; x: number } } = workingData.values.valuesByPositionHash,
			xMax: number = 0;

		adder = (positionHash: number, value: number) => {
			// Don't add eval values to already taken cells
			if (positionHash === undefined) {
				console.error('EvaluationLinearEngine > _calc: (addr) positionHash is undefined');

				// Let the error pass through if unit testing
				if (algorithmType !== undefined) {
					throw new Error('(addr) positionHash is undefined');
				}
			} else {
				let position: { o: number; x: number } = valuesByPositionHash[positionHash];

				if (position !== undefined) {
					// console.log('addr', positionHash, Number(positionHash).toString(16).padStart(4, '0'), value);
					try {
						if (o) {
							position.o += value;
							if (position.o > oMax) {
								oMax = position.o;
							}
						} else {
							position.x += value;
							if (position.x > xMax) {
								xMax = position.x;
							}
						}
					} catch (error: any) {
						console.error('EvaluationLinearEngine > _calc: (addr) postion ' + positionHash.toString(16).padStart(4, '0') + ' error: ' + error);

						// Let the error pass through if unit testing
						if (algorithmType !== undefined) {
							throw '(addr) postion ' + positionHash.toString(16).padStart(4, '0') + ' error: ' + error;
						}
					}
				} else {
					console.error('EvaluationLinearEngine > _calc: (addr) postion ' + positionHash.toString(16).padStart(4, '0') + ' undefined');

					// Let the error pass through if unit testing
					if (algorithmType !== undefined) {
						throw '(addr) postion ' + positionHash.toString(16).padStart(4, '0') + ' undefined';
					}
				}
			}
		};

		// Iterate through masterSet
		for (let i = 0; i < traversalSetAndChainsGroup.length; i++) {
			traversalSetAndChains = traversalSetAndChainsGroup[i];

			chains = traversalSetAndChains.chains;
			chainsLength = chains.length;
			set = traversalSetAndChains.set;

			for (j = 0; j < chainsLength; j++) {
				chain = chains[j];
				o = chain.o;
				placement = chain.placement;
				index = placement.index;
				placementCellsLength = placement.cells.length;
				indexSearchAfter = j;
				indexSearchBefore = j;

				/*
				 * Algorithm: 0 "EverybodyGetsAPoint"
				 *
				 * You get a point, you get a point, every neighbor gets a point
				 */
				if (algorithmType === undefined || algorithmType === AlgorithmType.TYPE0_EVERYBODY) {
					if (chain.placement.gapAfter > 0) {
						adder(set[placement.index + placementCellsLength], 1);
					}
					if (chain.placement.gapBefore > 0) {
						adder(set[placement.index - 1], 1);
					}
				}

				/*
				 * Algorithm: 1 "Viability"
				 *
				 * Check to see if the chain has enough room to even get a winning connectSize
				 */
				if (algorithmType === undefined || algorithmType === AlgorithmType.TYPE1_VIABILITY) {
					connectPossible = true;
					chainPossibleWidth = placement.gapBefore + placementCellsLength + placement.gapAfter;

					while (chainPossibleWidth < connectSize) {
						if (indexSearchBefore !== 0) {
							indexSearchBefore--;
							chainEff = chains[indexSearchBefore];

							if (chainEff.o !== o) {
								// Previous chain is for opponent, lock it out and continue
								indexSearchBefore = 0;
								continue;
							}

							placementEff = chainEff.placement;
							chainPossibleWidth += placementEff.gapBefore + placementEff.cells.length;
						} else if (indexSearchAfter !== chainsLength - 1) {
							indexSearchAfter++;
							chainEff = chains[indexSearchAfter];

							if (chainEff.o !== o) {
								// Previous chain is for opponent, lock it out and continue
								indexSearchAfter = chainsLength - 1;
								continue;
							}

							placementEff = chainEff.placement;
							chainPossibleWidth += placementEff.cells.length + placementEff.gapAfter;
						} else {
							connectPossible = false;
							break;
						}
					}

					if (algorithmType === AlgorithmType.TYPE1_VIABILITY && !connectPossible) {
						// Add flags to cells to indicate that the algorithm worked
						for (k = 0; k < placementCellsLength; k++) {
							adder(placement.cells[k], -1);
						}
					}

					if (!connectPossible) {
						continue;
					}
				}

				/*
				 * Algorithm: 2 "One to Win"
				 *
				 * Positions that force a win during this turn (first)
				 */
				if (algorithmType === undefined || algorithmType === AlgorithmType.TYPE2_ONETOWIN) {
					if (placementCellsLength === connectSize - 1) {
						placement.gapAfter && adder(set[index + placementCellsLength], connectSize * 10);
						placement.gapBefore && adder(set[index - 1], connectSize * 10);
						continue;
					} else if (
						j !== 0 &&
						placement.gapBefore === 1 &&
						chains[j - 1].o === o &&
						chains[j - 1].placement.cells.length + placementCellsLength >= connectSize - 1
					) {
						placement.gapBefore && adder(set[index - 1], connectSize * 10);
						continue;
					}
				}

				/*
				 * Algorithm: 3 "2ToWin"
				 *
				 * Positions that force a win by the next turn (second)
				 */
				if (algorithmType === undefined || algorithmType === AlgorithmType.TYPE3_TWOTOWIN) {
					if (placement.gapAfter > 0 && placement.gapBefore > 0 && placementCellsLength === connectSize - 2) {
						applied = false;
						if (placement.gapBefore === 1) {
							if (j !== 0 && chains[j - 1].o === o) {
								// console.log('A1', set[placement.index - 1], set[placement.index - 1].toString(16).padStart(4, '0'), TraversalType[traversalSetAndChains.type]);
								adder(set[placement.index - 1], connectSize * 5);
								applied = true;
							}
						} else {
							// console.log('A2', set[placement.index - 1], set[placement.index - 1].toString(16).padStart(4, '0'), TraversalType[traversalSetAndChains.type]);
							adder(set[placement.index - 1], connectSize * 5);
							applied = true;
						}

						if (placement.gapAfter === 1) {
							if (j !== chainsLength - 1 && chains[j + 1].o === o) {
								// console.log('A3', set[placement.index + placementCellsLength], set[placement.index + placementCellsLength].toString(16).padStart(4, '0'), TraversalType[traversalSetAndChains.type]);
								adder(set[placement.index + placementCellsLength], connectSize * 5);
								applied = true;
							}
						} else {
							// console.log('A4', set[placement.index + placementCellsLength], set[placement.index + placementCellsLength].toString(16).padStart(4, '0'), TraversalType[traversalSetAndChains.type]);
							adder(set[placement.index + placementCellsLength], connectSize * 5);
							applied = true;
						}

						if (applied) {
							continue;
						}
					}

					if (j !== 0 && chains[j - 1].o === o) {
						if (
							placement.gapBefore === 1 &&
							placement.gapAfter > 0 &&
							placementCellsLength + chains[j - 1].placement.cells.length >= connectSize - 2
						) {
							// console.log('B', set[placement.index - 1], set[placement.index - 1].toString(16).padStart(4, '0'), TraversalType[traversalSetAndChains.type]);
							adder(set[placement.index - 1], connectSize * 5);
							continue;
						}

						if (placement.gapBefore === 3 && placementCellsLength >= connectSize - 2 && chains[j - 1].placement.cells.length >= connectSize - 2) {
							// console.log('C', set[placement.index - 2], set[placement.index - 2].toString(16).padStart(4, '0'), TraversalType[traversalSetAndChains.type]);
							adder(set[placement.index - 2], connectSize * 5);
							continue;
						}
					}
				}

				/*
				 * Algorithm: 4 "Single Gap"
				 *
				 * Add a value to single gapped cell
				 */
				if (algorithmType === undefined || algorithmType === AlgorithmType.TYPE4_SINGLEGAP) {
					if (j !== 0 && placement.gapBefore === 1 && chains[j - 1].o === o) {
						adder(set[index - 1], 1);
					}
				}

				/*
				 * Algorithm: 5 "Echos"
				 *
				 * Add values, reducing from origin to destination, to neighboring cells. "Spaced" chains
				 * should inflate added values by one without increasing the number of neighbors effected.
				 */
				if (algorithmType === undefined || algorithmType === AlgorithmType.TYPE5_ECHOS) {
					placementCellsLengthEffValueOffsetAfter = 0;
					placementCellsLengthEffValueOffsetBefore = 0;

					// Free side bonus
					if (
						placement.gapAfter > placementCellsLength ||
						(placement.gapAfter <= placementCellsLength && j !== chainsLength - 1 && chains[j + 1].o === o)
					) {
						// or one after gap on my team
						placementCellsLengthEffValueOffsetAfter++;
					}
					if (placement.gapBefore > placementCellsLength || (placement.gapBefore <= placementCellsLength && j !== 0 && chains[j - 1].o === o)) {
						// or one after gap on my team
						placementCellsLengthEffValueOffsetBefore++;
					}
					if (placementCellsLengthEffValueOffsetAfter && placementCellsLengthEffValueOffsetBefore) {
						// Double free side bonus
						placementCellsLengthEffValueOffsetAfter++;
						placementCellsLengthEffValueOffsetBefore++;
					}

					// Add values: after
					gapEff = placement.gapAfter;
					indexEff = placement.index + placementCellsLength;
					placementCellsLengthEff = placementCellsLength;
					while (placementCellsLengthEff && gapEff) {
						// if(((set[indexEff] >> 8) & 0xff) < 0 ||
						// 	((set[indexEff] >> 8) & 0xff) > dimensions.aMax ||
						// 	(set[indexEff] & 0xff) < 0 ||
						// 	(set[indexEff] & 0xff) > dimensions.bMax) {
						// 	console.error('OUT OF RANGE 1', set[indexEff].toString(16).padStart(4, '0'), TraversalType[traversalSetAndChains.type]);
						// 	console.error('  >> set', traversalSetAndChains.set.map(v => v.toString(16).padStart(4,'0')));
						// }
						// console.log('A', set[indexEff], set[indexEff].toString(16).padStart(4, '0'), placementCellsLengthEff, placementCellsLengthEffValueOffsetAfter);
						adder(set[indexEff], placementCellsLengthEff + placementCellsLengthEffValueOffsetAfter);

						gapEff--;
						indexEff++;
						placementCellsLengthEff--;
					}

					// Add values: before
					indexEff = placement.index - 1;
					gapEff = placement.gapBefore;
					placementCellsLengthEff = placementCellsLength;
					while (placementCellsLengthEff && gapEff) {
						// if(((set[indexEff] >> 8) & 0xff) < 0 ||
						// 	((set[indexEff] >> 8) & 0xff) > dimensions.aMax ||
						// 	(set[indexEff] & 0xff) < 0 ||
						// 	(set[indexEff] & 0xff) > dimensions.bMax) {
						// 	console.error('OUT OF RANGE 2', set[indexEff].toString(16).padStart(4, '0'), TraversalType[traversalSetAndChains.type]);
						// 	console.error('  >> set', traversalSetAndChains.set.map(v => v.toString(16).padStart(4,'0')));
						// }
						// console.log('B', set[indexEff], set[indexEff].toString(16).padStart(4, '0'), placementCellsLengthEff, placementCellsLengthEffValueOffsetBefore);
						adder(set[indexEff], placementCellsLengthEff + placementCellsLengthEffValueOffsetBefore);

						indexEff--;
						gapEff--;
						placementCellsLengthEff--;
					}
				}
			}
		}

		// Update known ranges
		workingData.values.valuesOMax = oMax;
		workingData.values.valuesXMax = xMax;
	}
}
