/**
 * @author tknight-dev
 */

import { Dimensions, TraversalChain, TraversalChainPlacement, TraversalType, TraversalSetAndChains, WorkingData } from './types.engine';

export class TraversalEngine {
	/**
	 * @return is positionHash
	 */
	public static masterSet(workingData: WorkingData): number {
		return 0;
	}

	public static getByType(dimensions: Dimensions, positionHash: number, type: TraversalType, workingData: WorkingData): TraversalSetAndChains {
		let t = this;
		switch (type) {
			case TraversalType.TYPE1_H:
				return t.getByType1H(dimensions, positionHash, workingData);
			case TraversalType.TYPE2_V:
				return t.getByType2V(dimensions, positionHash, workingData);
			case TraversalType.TYPE3_D:
				return t.getByType3D(dimensions, positionHash, workingData);
			case TraversalType.TYPE4_U:
				return t.getByType4U(dimensions, positionHash, workingData);
		}
	}

	/**
	 * Will return all chains found on B from A0 to Amax
	 *
	 * @param positionHash must reference a starting position
	 */
	public static getByType1H(dimensions: Dimensions, positionHash: number, workingData: WorkingData): TraversalSetAndChains {
		let aMaxEff: number = dimensions.aMax + 1,
			b: number = positionHash & 0xff,
			chainCurrent: TraversalChain | undefined,
			chainLast: TraversalChain | undefined,
			chains: TraversalChain[],
			gap: number = 0,
			placement: boolean | undefined, // true is O
			placementsByPositionHash: { [key: number]: boolean } = workingData.placementsByPositionHash, // true is O
			set: number[], // positionHash
			traversalSetAndChains: TraversalSetAndChains = {
				chains: [],
				set: [],
				type: TraversalType.TYPE1_H,
				winning: false,
				winningChains: undefined,
			};

		// Cache
		chains = traversalSetAndChains.chains;
		set = traversalSetAndChains.set;

		// Process
		for (let A = 0; A < aMaxEff; A++) {
			positionHash = ((A & 0xff) << 8) | b;
			placement = placementsByPositionHash[positionHash];
			set.push(positionHash);

			if (placement !== undefined) {
				if (!chainCurrent || chainCurrent.o !== placement) {
					// Update previous chain gap, if required
					if (gap !== 0 && chainLast) {
						chainLast.placement.gapAfter = gap;
					}

					// New chain
					chainCurrent = {
						o: placement,
						placement: {
							cells: [positionHash],
							gapAfter: 0,
							gapBefore: gap,
							index: A,
						},
					};
					chains.push(chainCurrent);
				} else {
					// Extend chain
					chainCurrent.placement.cells.push(positionHash);
				}
				gap = 0;
			} else {
				// free cell
				gap++;

				if (chainLast && A === aMaxEff - 1) {
					// Last iteration, update last chain's gap after
					chainLast.placement.gapAfter = gap;
				} else {
					if (chainCurrent) {
						chainLast = chainCurrent;
					}
					chainCurrent = undefined;
				}
			}
		}

		TraversalEngine.setWinners(dimensions.connectSize, traversalSetAndChains);

		return traversalSetAndChains;
	}

	/**
	 * Will return all chains found on A from B0 to Bmax
	 *
	 * @param positionHash must reference a starting position
	 */
	public static getByType2V(dimensions: Dimensions, positionHash: number, workingData: WorkingData): TraversalSetAndChains {
		let aOffset: number = positionHash & 0xff00,
			bMaxEff: number = dimensions.bMax + 1,
			chainCurrent: TraversalChain | undefined,
			chainLast: TraversalChain | undefined,
			chains: TraversalChain[],
			gap: number = 0,
			placement: boolean | undefined, // true is O
			placementsByPositionHash: { [key: number]: boolean } = workingData.placementsByPositionHash, // true is O
			set: number[], // positionHash
			traversalSetAndChains: TraversalSetAndChains = {
				chains: [],
				set: [],
				type: TraversalType.TYPE2_V,
				winning: false,
				winningChains: undefined,
			};

		// Cache
		chains = traversalSetAndChains.chains;
		set = traversalSetAndChains.set;

		// Process (largely copy-and-paste of getByType1H())
		for (let B = 0; B < bMaxEff; B++) {
			positionHash = aOffset | (B & 0xff);
			placement = placementsByPositionHash[positionHash];
			set.push(positionHash);

			if (placement !== undefined) {
				if (!chainCurrent || chainCurrent.o !== placement) {
					// Update previous chain gap, if required
					if (gap !== 0 && chainLast) {
						chainLast.placement.gapAfter = gap;
					}

					// New chain
					chainCurrent = {
						o: placement,
						placement: {
							cells: [positionHash],
							gapAfter: 0,
							gapBefore: gap,
							index: B,
						},
					};
					chains.push(chainCurrent);
				} else {
					// Extend chain
					chainCurrent.placement.cells.push(positionHash);
				}
				gap = 0;
			} else {
				// free cell
				gap++;

				if (chainLast && B === bMaxEff - 1) {
					// Last iteration, update last chain's gap after
					chainLast.placement.gapAfter = gap;
				} else {
					if (chainCurrent) {
						chainLast = chainCurrent;
					}
					chainCurrent = undefined;
				}
			}
		}

		TraversalEngine.setWinners(dimensions.connectSize, traversalSetAndChains);

		return traversalSetAndChains;
	}

	/**
	 * Will return all chains found on A0 to Amax from B0 to Bmax
	 *
	 * @param positionHash must reference a starting position
	 */
	public static getByType3D(dimensions: Dimensions, positionHash: number, workingData: WorkingData): TraversalSetAndChains {
		let a: number = (positionHash >> 8) & 0xff,
			aMaxEff: number = dimensions.aMax + 1,
			b: number = positionHash & 0xff,
			bMaxEff: number = dimensions.bMax + 1,
			chainCurrent: TraversalChain | undefined,
			chainLast: TraversalChain | undefined,
			chains: TraversalChain[],
			gap: number = 0,
			placement: boolean | undefined, // true is O
			placementsByPositionHash: { [key: number]: boolean } = workingData.placementsByPositionHash, // true is O
			set: number[], // positionHash
			traversalSetAndChains: TraversalSetAndChains = {
				chains: [],
				set: [],
				type: TraversalType.TYPE3_D,
				winning: false,
				winningChains: undefined,
			};

		// Cache
		chains = traversalSetAndChains.chains;
		set = traversalSetAndChains.set;

		// Process (largely copy-and-paste of getByType1H())
		for (let A = a, B = b; A < aMaxEff && B < bMaxEff; A++, B++) {
			positionHash = ((A & 0xff) << 8) | (B & 0xff);
			placement = placementsByPositionHash[positionHash];
			set.push(positionHash);

			if (placement !== undefined) {
				if (!chainCurrent || chainCurrent.o !== placement) {
					// Update previous chain gap, if required
					if (gap !== 0 && chainLast) {
						chainLast.placement.gapAfter = gap;
					}

					// New chain
					chainCurrent = {
						o: placement,
						placement: {
							cells: [positionHash],
							gapAfter: 0,
							gapBefore: gap,
							index: A, // B works here too
						},
					};
					chains.push(chainCurrent);
				} else {
					// Extend chain
					chainCurrent.placement.cells.push(positionHash);
				}
				gap = 0;
			} else {
				// free cell
				gap++;

				if (chainLast && (A === aMaxEff - 1 || B === bMaxEff - 1)) {
					// Last iteration, update last chain's gap after
					chainLast.placement.gapAfter = gap;
				} else {
					if (chainCurrent) {
						chainLast = chainCurrent;
					}
					chainCurrent = undefined;
				}
			}
		}

		TraversalEngine.setWinners(dimensions.connectSize, traversalSetAndChains);

		return traversalSetAndChains;
	}

	/**
	 * Will return all chains found on A0 to Amax from Bmax to Bmax
	 *
	 * @param positionHash must reference a starting position
	 */
	public static getByType4U(dimensions: Dimensions, positionHash: number, workingData: WorkingData): TraversalSetAndChains {
		let a: number = (positionHash >> 8) & 0xff,
			aMaxEff: number = dimensions.aMax + 1,
			b: number = positionHash & 0xff,
			bMax: number = dimensions.bMax,
			chainCurrent: TraversalChain | undefined,
			chainLast: TraversalChain | undefined,
			chains: TraversalChain[],
			gap: number = 0,
			placement: boolean | undefined, // true is O
			placementsByPositionHash: { [key: number]: boolean } = workingData.placementsByPositionHash, // true is O
			set: number[], // positionHash
			traversalSetAndChains: TraversalSetAndChains = {
				chains: [],
				set: [],
				type: TraversalType.TYPE4_U,
				winning: false,
				winningChains: undefined,
			};

		// Cache
		chains = traversalSetAndChains.chains;
		set = traversalSetAndChains.set;

		// Process (largely copy-and-paste of getByType3D())
		for (let A = a, B = b; A < aMaxEff && B > -1; A++, B--) {
			positionHash = ((A & 0xff) << 8) | (B & 0xff);
			placement = placementsByPositionHash[positionHash];
			set.push(positionHash);

			if (placement !== undefined) {
				if (!chainCurrent || chainCurrent.o !== placement) {
					// Update previous chain gap, if required
					if (gap !== 0 && chainLast) {
						chainLast.placement.gapAfter = gap;
					}

					// New chain
					chainCurrent = {
						o: placement,
						placement: {
							cells: [positionHash],
							gapAfter: 0,
							gapBefore: gap,
							index: A, // B works here too
						},
					};
					chains.push(chainCurrent);
				} else {
					// Extend chain
					chainCurrent.placement.cells.push(positionHash);
				}
				gap = 0;
			} else {
				// free cell
				gap++;

				if (chainLast && (A === aMaxEff - 1 || B === 0)) {
					// Last iteration, update last chain's gap after
					chainLast.placement.gapAfter = gap;
				} else {
					if (chainCurrent) {
						chainLast = chainCurrent;
					}
					chainCurrent = undefined;
				}
			}
		}

		TraversalEngine.setWinners(dimensions.connectSize, traversalSetAndChains);

		return traversalSetAndChains;
	}

	private static setWinners(connectSize: number, traversalSetAndChains: TraversalSetAndChains) {
		let chains: TraversalChain[] = traversalSetAndChains.chains,
			winning: boolean = false,
			winningChains: number[] | undefined;

		// Check for winning chains
		for (let i = 0; i < chains.length; i++) {
			if (chains[i].placement.cells.length >= connectSize) {
				winning = true;

				if (!winningChains) {
					winningChains = [i];
				} else {
					winningChains.push(i);
				}
			}
		}
		traversalSetAndChains.winning = winning;
		traversalSetAndChains.winningChains = winningChains;
	}
}
