/**
 * @author tknight-dev
 */

const util = require('util');
import { log } from 'console';
import { TraversalEngine } from './traversal.engine';
import { Dimensions, TraversalSetAndChains, TraversalType, WorkingData } from './types.engine';

let dimensions: Dimensions = {
		aMax: 9,
		bMax: 9,
		connectSize: 5,
	},
	hashTo: (a: number, b: number) => number = (a: number, b: number) => ((a & 0xff) << 8) | (b & 0xff),
	workingData: WorkingData = {
		placementsAvailableByPositionHash: {},
		placementsByPositionHash: {}, // true is O
		positionHashesByValues: {},
		values: {
			valuesByPositionHash: {},
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

describe('GameEngine: Traversal', () => {
	test('Type1-H Single Chain', () => {
		let placementsByPositionHash: { [key: number]: boolean } = {}, // true is O
			traversalSetAndChains: TraversalSetAndChains;

		/*
		 * !Gapped
		 */

		// Prepare placements
		placementsByPositionHash[hashTo(0, 0)] = false;
		workingData.placementsByPositionHash = placementsByPositionHash;

		// Generate chains
		traversalSetAndChains = TraversalEngine.getByType1H(dimensions, hashTo(0, 0), workingData);
		// log('traversalSetAndChains', util.inspect(traversalSetAndChains, {showHidden: false, depth: null, colors: true}));

		// Evaluate meta
		expect(traversalSetAndChains.set.length).toBe(dimensions.aMax + 1);
		expect(traversalSetAndChains.type).toBe(TraversalType.TYPE1_H);
		expect(traversalSetAndChains.winning).toBe(false);
		expect(traversalSetAndChains.winningChains).toBe(undefined);

		// Evaluate chains
		expect(traversalSetAndChains.chains.length).toBe(1);

		// Evaluate chains: Chain[0]
		expect(traversalSetAndChains.chains[0].o).toBe(false);
		expect(traversalSetAndChains.chains[0].placement.cells.length).toBe(1);
		expect(traversalSetAndChains.chains[0].placement.cells[0]).toBe(hashTo(0, 0));
		expect(traversalSetAndChains.chains[0].placement.gapAfter).toBe(9);
		expect(traversalSetAndChains.chains[0].placement.gapBefore).toBe(0);
		expect(traversalSetAndChains.chains[0].placement.index).toBe(0);

		/*
		 * Gapped
		 */

		// Prepare placements
		placementsByPositionHash = <any>new Object();
		placementsByPositionHash[hashTo(1, 0)] = false;
		workingData.placementsByPositionHash = placementsByPositionHash;

		// Generate chains
		traversalSetAndChains = TraversalEngine.getByType1H(dimensions, hashTo(0, 0), workingData);
		// log('traversalSetAndChains', util.inspect(traversalSetAndChains, {showHidden: false, depth: null, colors: true}));

		// Evaluate meta
		expect(traversalSetAndChains.set.length).toBe(dimensions.aMax + 1);
		expect(traversalSetAndChains.type).toBe(TraversalType.TYPE1_H);
		expect(traversalSetAndChains.winning).toBe(false);
		expect(traversalSetAndChains.winningChains).toBe(undefined);

		// Evaluate chains
		expect(traversalSetAndChains.chains.length).toBe(1);

		// Evaluate chains: Chain[0]
		expect(traversalSetAndChains.chains[0].o).toBe(false);
		expect(traversalSetAndChains.chains[0].placement.cells.length).toBe(1);
		expect(traversalSetAndChains.chains[0].placement.cells[0]).toBe(hashTo(1, 0));
		expect(traversalSetAndChains.chains[0].placement.gapAfter).toBe(8);
		expect(traversalSetAndChains.chains[0].placement.gapBefore).toBe(1);
		expect(traversalSetAndChains.chains[0].placement.index).toBe(1);
	});

	test('Type1-H Multi Chain', () => {
		let placementsByPositionHash: { [key: number]: boolean } = {}, // true is O
			traversalSetAndChains: TraversalSetAndChains;

		// Prepare placements
		placementsByPositionHash[hashTo(0, 0)] = false;
		placementsByPositionHash[hashTo(1, 0)] = false;
		placementsByPositionHash[hashTo(3, 0)] = false;
		placementsByPositionHash[hashTo(4, 0)] = true;
		placementsByPositionHash[hashTo(5, 0)] = true;
		placementsByPositionHash[hashTo(6, 0)] = false;
		placementsByPositionHash[hashTo(dimensions.aMax, 0)] = true;
		workingData.placementsByPositionHash = placementsByPositionHash;

		// Generate chains
		traversalSetAndChains = TraversalEngine.getByType1H(dimensions, hashTo(0, 0), workingData);
		// log('traversalSetAndChains', util.inspect(traversalSetAndChains, {showHidden: false, depth: null, colors: true}));

		// Evaluate meta
		expect(traversalSetAndChains.set.length).toBe(dimensions.aMax + 1);
		expect(traversalSetAndChains.type).toBe(TraversalType.TYPE1_H);
		expect(traversalSetAndChains.winning).toBe(false);
		expect(traversalSetAndChains.winningChains).toBe(undefined);

		// Evaluate chains
		expect(traversalSetAndChains.chains.length).toBe(5);

		// Evaluate chains: Chain[0]
		expect(traversalSetAndChains.chains[0].o).toBe(false);
		expect(traversalSetAndChains.chains[0].placement.cells.length).toBe(2);
		expect(traversalSetAndChains.chains[0].placement.cells[0]).toBe(hashTo(0, 0));
		expect(traversalSetAndChains.chains[0].placement.cells[1]).toBe(hashTo(1, 0));
		expect(traversalSetAndChains.chains[0].placement.gapAfter).toBe(1);
		expect(traversalSetAndChains.chains[0].placement.gapBefore).toBe(0);
		expect(traversalSetAndChains.chains[0].placement.index).toBe(0);

		// Evaluate chains: Chain[1]
		expect(traversalSetAndChains.chains[1].o).toBe(false);
		expect(traversalSetAndChains.chains[1].placement.cells.length).toBe(1);
		expect(traversalSetAndChains.chains[1].placement.cells[0]).toBe(hashTo(3, 0));
		expect(traversalSetAndChains.chains[1].placement.gapAfter).toBe(0);
		expect(traversalSetAndChains.chains[1].placement.gapBefore).toBe(1);
		expect(traversalSetAndChains.chains[1].placement.index).toBe(3);

		// Evaluate chains: Chain[2]
		expect(traversalSetAndChains.chains[2].o).toBe(true);
		expect(traversalSetAndChains.chains[2].placement.cells.length).toBe(2);
		expect(traversalSetAndChains.chains[2].placement.cells[0]).toBe(hashTo(4, 0));
		expect(traversalSetAndChains.chains[2].placement.cells[1]).toBe(hashTo(5, 0));
		expect(traversalSetAndChains.chains[2].placement.gapAfter).toBe(0);
		expect(traversalSetAndChains.chains[2].placement.gapBefore).toBe(0);
		expect(traversalSetAndChains.chains[2].placement.index).toBe(4);

		// Evaluate chains: Chain[3]
		expect(traversalSetAndChains.chains[3].o).toBe(false);
		expect(traversalSetAndChains.chains[3].placement.cells.length).toBe(1);
		expect(traversalSetAndChains.chains[3].placement.cells[0]).toBe(hashTo(6, 0));
		expect(traversalSetAndChains.chains[3].placement.gapAfter).toBe(2);
		expect(traversalSetAndChains.chains[3].placement.gapBefore).toBe(0);
		expect(traversalSetAndChains.chains[3].placement.index).toBe(6);

		// Evaluate chains: Chain[4]
		expect(traversalSetAndChains.chains[4].o).toBe(true);
		expect(traversalSetAndChains.chains[4].placement.cells.length).toBe(1);
		expect(traversalSetAndChains.chains[4].placement.cells[0]).toBe(hashTo(dimensions.aMax, 0));
		expect(traversalSetAndChains.chains[4].placement.gapAfter).toBe(0);
		expect(traversalSetAndChains.chains[4].placement.gapBefore).toBe(2);
		expect(traversalSetAndChains.chains[4].placement.index).toBe(dimensions.aMax);
	});

	test('Type1-H Winning Chain', () => {
		let placementsByPositionHash: { [key: number]: boolean } = {}, // true is O
			traversalSetAndChains: TraversalSetAndChains;

		// Prepare placements
		placementsByPositionHash[hashTo(0, 0)] = false;
		for (let i = 0; i < dimensions.connectSize + 1; i++) {
			placementsByPositionHash[hashTo(i + 2, 0)] = false;
		}
		placementsByPositionHash[hashTo(dimensions.aMax, 0)] = false;
		workingData.placementsByPositionHash = placementsByPositionHash;

		// Generate chains
		traversalSetAndChains = TraversalEngine.getByType1H(dimensions, hashTo(0, 0), workingData);
		// log('traversalSetAndChains', util.inspect(traversalSetAndChains, {showHidden: false, depth: null, colors: true}));

		// Evaluate meta
		expect(traversalSetAndChains.set.length).toBe(dimensions.aMax + 1);
		expect(traversalSetAndChains.type).toBe(TraversalType.TYPE1_H);
		expect(traversalSetAndChains.winning).toBe(true);
		expect(traversalSetAndChains.winningChains).toStrictEqual([1]);
	});

	test('Type1-H Winning Multi Chains', () => {
		let placementsByPositionHash: { [key: number]: boolean } = {}, // true is O
			traversalSetAndChains: TraversalSetAndChains;

		// Change global values
		let previous: number = dimensions.connectSize;
		dimensions.connectSize = 2;

		// Prepare placements
		placementsByPositionHash[hashTo(0, 0)] = false;
		placementsByPositionHash[hashTo(1, 0)] = false;
		placementsByPositionHash[hashTo(2, 0)] = true;
		placementsByPositionHash[hashTo(3, 0)] = true;
		placementsByPositionHash[hashTo(5, 0)] = false;
		placementsByPositionHash[hashTo(7, 0)] = false;
		placementsByPositionHash[hashTo(8, 0)] = false;
		placementsByPositionHash[hashTo(9, 0)] = false;
		workingData.placementsByPositionHash = placementsByPositionHash;

		// Generate chains
		traversalSetAndChains = TraversalEngine.getByType1H(dimensions, hashTo(0, 0), workingData);
		// log('traversalSetAndChains', util.inspect(traversalSetAndChains, {showHidden: false, depth: null, colors: true}));

		// Evaluate meta
		expect(traversalSetAndChains.set.length).toBe(dimensions.aMax + 1);
		expect(traversalSetAndChains.type).toBe(TraversalType.TYPE1_H);
		expect(traversalSetAndChains.winning).toBe(true);
		expect(traversalSetAndChains.winningChains).toStrictEqual([0, 1, 3]);

		// Reset global values
		dimensions.connectSize = previous;
	});

	test('Type2-V Single Chain', () => {
		let placementsByPositionHash: { [key: number]: boolean } = {}, // true is O
			traversalSetAndChains: TraversalSetAndChains;

		/*
		 * !Gapped
		 */

		// Prepare placements
		placementsByPositionHash[hashTo(0, 0)] = false;
		workingData.placementsByPositionHash = placementsByPositionHash;

		// Generate chains
		traversalSetAndChains = TraversalEngine.getByType2V(dimensions, hashTo(0, 0), workingData);
		// log('traversalSetAndChains', util.inspect(traversalSetAndChains, {showHidden: false, depth: null, colors: true}));

		// Evaluate meta
		expect(traversalSetAndChains.set.length).toBe(dimensions.bMax + 1);
		expect(traversalSetAndChains.type).toBe(TraversalType.TYPE2_V);
		expect(traversalSetAndChains.winning).toBe(false);
		expect(traversalSetAndChains.winningChains).toBe(undefined);

		// Evaluate chains
		expect(traversalSetAndChains.chains.length).toBe(1);

		// Evaluate chains: Chain[0]
		expect(traversalSetAndChains.chains[0].o).toBe(false);
		expect(traversalSetAndChains.chains[0].placement.cells.length).toBe(1);
		expect(traversalSetAndChains.chains[0].placement.cells[0]).toBe(hashTo(0, 0));
		expect(traversalSetAndChains.chains[0].placement.gapAfter).toBe(9);
		expect(traversalSetAndChains.chains[0].placement.gapBefore).toBe(0);
		expect(traversalSetAndChains.chains[0].placement.index).toBe(0);

		/*
		 * Gapped
		 */

		// Prepare placements
		placementsByPositionHash = <any>new Object();
		placementsByPositionHash[hashTo(0, 1)] = false;
		workingData.placementsByPositionHash = placementsByPositionHash;

		// Generate chains
		traversalSetAndChains = TraversalEngine.getByType2V(dimensions, hashTo(0, 0), workingData);
		// log('traversalSetAndChains', util.inspect(traversalSetAndChains, {showHidden: false, depth: null, colors: true}));

		// Evaluate meta
		expect(traversalSetAndChains.set.length).toBe(dimensions.bMax + 1);
		expect(traversalSetAndChains.type).toBe(TraversalType.TYPE2_V);
		expect(traversalSetAndChains.winning).toBe(false);
		expect(traversalSetAndChains.winningChains).toBe(undefined);

		// Evaluate chains
		expect(traversalSetAndChains.chains.length).toBe(1);

		// Evaluate chains: Chain[0]
		expect(traversalSetAndChains.chains[0].o).toBe(false);
		expect(traversalSetAndChains.chains[0].placement.cells.length).toBe(1);
		expect(traversalSetAndChains.chains[0].placement.cells[0]).toBe(hashTo(0, 1));
		expect(traversalSetAndChains.chains[0].placement.gapAfter).toBe(8);
		expect(traversalSetAndChains.chains[0].placement.gapBefore).toBe(1);
		expect(traversalSetAndChains.chains[0].placement.index).toBe(1);
	});

	test('Type2-V Multi Chain', () => {
		let placementsByPositionHash: { [key: number]: boolean } = {}, // true is O
			traversalSetAndChains: TraversalSetAndChains;

		// Prepare placements
		placementsByPositionHash[hashTo(0, 0)] = false;
		placementsByPositionHash[hashTo(0, 1)] = false;
		placementsByPositionHash[hashTo(0, 3)] = false;
		placementsByPositionHash[hashTo(0, 4)] = true;
		placementsByPositionHash[hashTo(0, 5)] = true;
		placementsByPositionHash[hashTo(0, 6)] = false;
		placementsByPositionHash[hashTo(0, dimensions.bMax)] = true;
		workingData.placementsByPositionHash = placementsByPositionHash;

		// Generate chains
		traversalSetAndChains = TraversalEngine.getByType2V(dimensions, hashTo(0, 0), workingData);
		// log('traversalSetAndChains', util.inspect(traversalSetAndChains, {showHidden: false, depth: null, colors: true}));

		// Evaluate meta
		expect(traversalSetAndChains.set.length).toBe(dimensions.bMax + 1);
		expect(traversalSetAndChains.type).toBe(TraversalType.TYPE2_V);
		expect(traversalSetAndChains.winning).toBe(false);
		expect(traversalSetAndChains.winningChains).toBe(undefined);

		// Evaluate chains
		expect(traversalSetAndChains.chains.length).toBe(5);

		// Evaluate chains: Chain[0]
		expect(traversalSetAndChains.chains[0].o).toBe(false);
		expect(traversalSetAndChains.chains[0].placement.cells.length).toBe(2);
		expect(traversalSetAndChains.chains[0].placement.cells[0]).toBe(hashTo(0, 0));
		expect(traversalSetAndChains.chains[0].placement.cells[1]).toBe(hashTo(0, 1));
		expect(traversalSetAndChains.chains[0].placement.gapAfter).toBe(1);
		expect(traversalSetAndChains.chains[0].placement.gapBefore).toBe(0);
		expect(traversalSetAndChains.chains[0].placement.index).toBe(0);

		// Evaluate chains: Chain[1]
		expect(traversalSetAndChains.chains[1].o).toBe(false);
		expect(traversalSetAndChains.chains[1].placement.cells.length).toBe(1);
		expect(traversalSetAndChains.chains[1].placement.cells[0]).toBe(hashTo(0, 3));
		expect(traversalSetAndChains.chains[1].placement.gapAfter).toBe(0);
		expect(traversalSetAndChains.chains[1].placement.gapBefore).toBe(1);
		expect(traversalSetAndChains.chains[1].placement.index).toBe(3);

		// Evaluate chains: Chain[2]
		expect(traversalSetAndChains.chains[2].o).toBe(true);
		expect(traversalSetAndChains.chains[2].placement.cells.length).toBe(2);
		expect(traversalSetAndChains.chains[2].placement.cells[0]).toBe(hashTo(0, 4));
		expect(traversalSetAndChains.chains[2].placement.cells[1]).toBe(hashTo(0, 5));
		expect(traversalSetAndChains.chains[2].placement.gapAfter).toBe(0);
		expect(traversalSetAndChains.chains[2].placement.gapBefore).toBe(0);
		expect(traversalSetAndChains.chains[2].placement.index).toBe(4);

		// Evaluate chains: Chain[3]
		expect(traversalSetAndChains.chains[3].o).toBe(false);
		expect(traversalSetAndChains.chains[3].placement.cells.length).toBe(1);
		expect(traversalSetAndChains.chains[3].placement.cells[0]).toBe(hashTo(0, 6));
		expect(traversalSetAndChains.chains[3].placement.gapAfter).toBe(2);
		expect(traversalSetAndChains.chains[3].placement.gapBefore).toBe(0);
		expect(traversalSetAndChains.chains[3].placement.index).toBe(6);

		// Evaluate chains: Chain[4]
		expect(traversalSetAndChains.chains[4].o).toBe(true);
		expect(traversalSetAndChains.chains[4].placement.cells.length).toBe(1);
		expect(traversalSetAndChains.chains[4].placement.cells[0]).toBe(hashTo(0, dimensions.bMax));
		expect(traversalSetAndChains.chains[4].placement.gapAfter).toBe(0);
		expect(traversalSetAndChains.chains[4].placement.gapBefore).toBe(2);
		expect(traversalSetAndChains.chains[4].placement.index).toBe(dimensions.bMax);
	});

	test('Type2-V Winning Chain', () => {
		let placementsByPositionHash: { [key: number]: boolean } = {}, // true is O
			traversalSetAndChains: TraversalSetAndChains;

		// Prepare placements
		placementsByPositionHash[hashTo(0, 0)] = false;
		for (let i = 0; i < dimensions.connectSize + 1; i++) {
			placementsByPositionHash[hashTo(0, i + 2)] = false;
		}
		placementsByPositionHash[hashTo(0, dimensions.bMax)] = false;
		workingData.placementsByPositionHash = placementsByPositionHash;

		// Generate chains
		traversalSetAndChains = TraversalEngine.getByType2V(dimensions, hashTo(0, 0), workingData);
		// log('traversalSetAndChains', util.inspect(traversalSetAndChains, {showHidden: false, depth: null, colors: true}));

		// Evaluate meta
		expect(traversalSetAndChains.set.length).toBe(dimensions.bMax + 1);
		expect(traversalSetAndChains.type).toBe(TraversalType.TYPE2_V);
		expect(traversalSetAndChains.winning).toBe(true);
		expect(traversalSetAndChains.winningChains).toStrictEqual([1]);
	});

	test('Type2-V Winning Multi Chains', () => {
		let placementsByPositionHash: { [key: number]: boolean } = {}, // true is O
			traversalSetAndChains: TraversalSetAndChains;

		// Change global values
		let previous: number = dimensions.connectSize;
		dimensions.connectSize = 2;

		// Prepare placements
		placementsByPositionHash[hashTo(0, 0)] = false;
		placementsByPositionHash[hashTo(0, 1)] = false;
		placementsByPositionHash[hashTo(0, 2)] = true;
		placementsByPositionHash[hashTo(0, 3)] = true;
		placementsByPositionHash[hashTo(0, 5)] = false;
		placementsByPositionHash[hashTo(0, 7)] = false;
		placementsByPositionHash[hashTo(0, 8)] = false;
		placementsByPositionHash[hashTo(0, 9)] = false;
		workingData.placementsByPositionHash = placementsByPositionHash;

		// Generate chains
		traversalSetAndChains = TraversalEngine.getByType2V(dimensions, hashTo(0, 0), workingData);
		// log('traversalSetAndChains', util.inspect(traversalSetAndChains, {showHidden: false, depth: null, colors: true}));

		// Evaluate meta
		expect(traversalSetAndChains.set.length).toBe(dimensions.bMax + 1);
		expect(traversalSetAndChains.type).toBe(TraversalType.TYPE2_V);
		expect(traversalSetAndChains.winning).toBe(true);
		expect(traversalSetAndChains.winningChains).toStrictEqual([0, 1, 3]);

		// Reset global values
		dimensions.connectSize = previous;
	});

	test('Type3-D Single Chain', () => {
		let placementsByPositionHash: { [key: number]: boolean } = {}, // true is O
			positionStartA: number,
			positionStartB: number,
			traversalSetAndChains: TraversalSetAndChains;

		/*
		 * !Gapped
		 */

		// Prepare placements
		positionStartA = 0;
		positionStartB = 0;
		placementsByPositionHash[hashTo(0, 0)] = false;
		workingData.placementsByPositionHash = placementsByPositionHash;

		// Generate chains
		traversalSetAndChains = TraversalEngine.getByType3D(dimensions, hashTo(positionStartA, positionStartB), workingData);
		// log('traversalSetAndChains', util.inspect(traversalSetAndChains, {showHidden: false, depth: null, colors: true}));

		// Evaluate meta
		expect(traversalSetAndChains.set.length).toBe(Math.min(dimensions.aMax - positionStartA, dimensions.bMax - positionStartB) + 1);
		expect(traversalSetAndChains.type).toBe(TraversalType.TYPE3_D);
		expect(traversalSetAndChains.winning).toBe(false);
		expect(traversalSetAndChains.winningChains).toBe(undefined);

		// Evaluate chains
		expect(traversalSetAndChains.chains.length).toBe(1);

		// Evaluate chains: Chain[0]
		expect(traversalSetAndChains.chains[0].o).toBe(false);
		expect(traversalSetAndChains.chains[0].placement.cells.length).toBe(1);
		expect(traversalSetAndChains.chains[0].placement.cells[0]).toBe(hashTo(0, 0));
		expect(traversalSetAndChains.chains[0].placement.gapAfter).toBe(9);
		expect(traversalSetAndChains.chains[0].placement.gapBefore).toBe(0);
		expect(traversalSetAndChains.chains[0].placement.index).toBe(0);

		/*
		 * Gapped
		 */

		// Prepare placements
		positionStartA = 0;
		positionStartB = 0;
		placementsByPositionHash = <any>new Object();
		placementsByPositionHash[hashTo(1, 1)] = false;
		workingData.placementsByPositionHash = placementsByPositionHash;

		// Generate chains
		traversalSetAndChains = TraversalEngine.getByType3D(dimensions, hashTo(positionStartA, positionStartB), workingData);
		// log('traversalSetAndChains', util.inspect(traversalSetAndChains, {showHidden: false, depth: null, colors: true}));

		// Evaluate meta
		expect(traversalSetAndChains.set.length).toBe(Math.min(dimensions.aMax - positionStartA, dimensions.bMax - positionStartB) + 1);
		expect(traversalSetAndChains.type).toBe(TraversalType.TYPE3_D);
		expect(traversalSetAndChains.winning).toBe(false);
		expect(traversalSetAndChains.winningChains).toBe(undefined);

		// Evaluate chains
		expect(traversalSetAndChains.chains.length).toBe(1);

		// Evaluate chains: Chain[0]
		expect(traversalSetAndChains.chains[0].o).toBe(false);
		expect(traversalSetAndChains.chains[0].placement.cells.length).toBe(1);
		expect(traversalSetAndChains.chains[0].placement.cells[0]).toBe(hashTo(1, 1));
		expect(traversalSetAndChains.chains[0].placement.gapAfter).toBe(8);
		expect(traversalSetAndChains.chains[0].placement.gapBefore).toBe(1);
		expect(traversalSetAndChains.chains[0].placement.index).toBe(1);
	});

	test('Type3-D Single Chain Offset', () => {
		let placementsByPositionHash: { [key: number]: boolean } = {}, // true is O
			positionStartA: number,
			positionStartB: number,
			traversalSetAndChains: TraversalSetAndChains;

		/*
		 * !Gapped
		 */

		// Prepare placements
		positionStartA = 0;
		positionStartB = 1;
		placementsByPositionHash[hashTo(0, 1)] = false;
		workingData.placementsByPositionHash = placementsByPositionHash;

		// Generate chains
		traversalSetAndChains = TraversalEngine.getByType3D(dimensions, hashTo(positionStartA, positionStartB), workingData);
		// log('traversalSetAndChains', util.inspect(traversalSetAndChains, {showHidden: false, depth: null, colors: true}));

		// Evaluate meta
		expect(traversalSetAndChains.set.length).toBe(Math.min(dimensions.aMax - positionStartA, dimensions.bMax - positionStartB) + 1);
		expect(traversalSetAndChains.type).toBe(TraversalType.TYPE3_D);
		expect(traversalSetAndChains.winning).toBe(false);
		expect(traversalSetAndChains.winningChains).toBe(undefined);

		// Evaluate chains
		expect(traversalSetAndChains.chains.length).toBe(1);

		// Evaluate chains: Chain[0]
		expect(traversalSetAndChains.chains[0].o).toBe(false);
		expect(traversalSetAndChains.chains[0].placement.cells.length).toBe(1);
		expect(traversalSetAndChains.chains[0].placement.cells[0]).toBe(hashTo(0, 1));
		expect(traversalSetAndChains.chains[0].placement.gapAfter).toBe(8);
		expect(traversalSetAndChains.chains[0].placement.gapBefore).toBe(0);
		expect(traversalSetAndChains.chains[0].placement.index).toBe(0);

		/*
		 * Gapped
		 */

		// Prepare placements
		positionStartA = 0;
		positionStartB = 1;
		placementsByPositionHash = <any>new Object();
		placementsByPositionHash[hashTo(1, 2)] = false;
		workingData.placementsByPositionHash = placementsByPositionHash;

		// Generate chains
		traversalSetAndChains = TraversalEngine.getByType3D(dimensions, hashTo(positionStartA, positionStartB), workingData);
		// log('traversalSetAndChains', util.inspect(traversalSetAndChains, {showHidden: false, depth: null, colors: true}));

		// Evaluate meta
		expect(traversalSetAndChains.set.length).toBe(Math.min(dimensions.aMax - positionStartA, dimensions.bMax - positionStartB) + 1);
		expect(traversalSetAndChains.type).toBe(TraversalType.TYPE3_D);
		expect(traversalSetAndChains.winning).toBe(false);
		expect(traversalSetAndChains.winningChains).toBe(undefined);

		// Evaluate chains
		expect(traversalSetAndChains.chains.length).toBe(1);

		// Evaluate chains: Chain[0]
		expect(traversalSetAndChains.chains[0].o).toBe(false);
		expect(traversalSetAndChains.chains[0].placement.cells.length).toBe(1);
		expect(traversalSetAndChains.chains[0].placement.cells[0]).toBe(hashTo(1, 2));
		expect(traversalSetAndChains.chains[0].placement.gapAfter).toBe(7);
		expect(traversalSetAndChains.chains[0].placement.gapBefore).toBe(1);
		expect(traversalSetAndChains.chains[0].placement.index).toBe(1);
	});

	test('Type3-D Multi Chain', () => {
		let placementsByPositionHash: { [key: number]: boolean } = {}, // true is O
			positionStartA: number,
			positionStartB: number,
			traversalSetAndChains: TraversalSetAndChains;

		// Prepare placements
		positionStartA = 0;
		positionStartB = 0;
		placementsByPositionHash[hashTo(0, 0)] = false;
		placementsByPositionHash[hashTo(1, 1)] = false;
		placementsByPositionHash[hashTo(3, 3)] = false;
		placementsByPositionHash[hashTo(4, 4)] = true;
		placementsByPositionHash[hashTo(5, 5)] = true;
		placementsByPositionHash[hashTo(6, 6)] = false;
		placementsByPositionHash[hashTo(dimensions.aMax, dimensions.bMax)] = true;
		workingData.placementsByPositionHash = placementsByPositionHash;

		// Generate chains
		traversalSetAndChains = TraversalEngine.getByType3D(dimensions, hashTo(positionStartA, positionStartB), workingData);
		// log('traversalSetAndChains', util.inspect(traversalSetAndChains, {showHidden: false, depth: null, colors: true}));

		// Evaluate meta
		expect(traversalSetAndChains.set.length).toBe(Math.min(dimensions.aMax - positionStartA, dimensions.bMax - positionStartB) + 1);
		expect(traversalSetAndChains.type).toBe(TraversalType.TYPE3_D);
		expect(traversalSetAndChains.winning).toBe(false);
		expect(traversalSetAndChains.winningChains).toBe(undefined);

		// Evaluate chains
		expect(traversalSetAndChains.chains.length).toBe(5);

		// Evaluate chains: Chain[0]
		expect(traversalSetAndChains.chains[0].o).toBe(false);
		expect(traversalSetAndChains.chains[0].placement.cells.length).toBe(2);
		expect(traversalSetAndChains.chains[0].placement.cells[0]).toBe(hashTo(0, 0));
		expect(traversalSetAndChains.chains[0].placement.cells[1]).toBe(hashTo(1, 1));
		expect(traversalSetAndChains.chains[0].placement.gapAfter).toBe(1);
		expect(traversalSetAndChains.chains[0].placement.gapBefore).toBe(0);
		expect(traversalSetAndChains.chains[0].placement.index).toBe(0);

		// Evaluate chains: Chain[1]
		expect(traversalSetAndChains.chains[1].o).toBe(false);
		expect(traversalSetAndChains.chains[1].placement.cells.length).toBe(1);
		expect(traversalSetAndChains.chains[1].placement.cells[0]).toBe(hashTo(3, 3));
		expect(traversalSetAndChains.chains[1].placement.gapAfter).toBe(0);
		expect(traversalSetAndChains.chains[1].placement.gapBefore).toBe(1);
		expect(traversalSetAndChains.chains[1].placement.index).toBe(3);

		// Evaluate chains: Chain[2]
		expect(traversalSetAndChains.chains[2].o).toBe(true);
		expect(traversalSetAndChains.chains[2].placement.cells.length).toBe(2);
		expect(traversalSetAndChains.chains[2].placement.cells[0]).toBe(hashTo(4, 4));
		expect(traversalSetAndChains.chains[2].placement.cells[1]).toBe(hashTo(5, 5));
		expect(traversalSetAndChains.chains[2].placement.gapAfter).toBe(0);
		expect(traversalSetAndChains.chains[2].placement.gapBefore).toBe(0);
		expect(traversalSetAndChains.chains[2].placement.index).toBe(4);

		// Evaluate chains: Chain[3]
		expect(traversalSetAndChains.chains[3].o).toBe(false);
		expect(traversalSetAndChains.chains[3].placement.cells.length).toBe(1);
		expect(traversalSetAndChains.chains[3].placement.cells[0]).toBe(hashTo(6, 6));
		expect(traversalSetAndChains.chains[3].placement.gapAfter).toBe(2);
		expect(traversalSetAndChains.chains[3].placement.gapBefore).toBe(0);
		expect(traversalSetAndChains.chains[3].placement.index).toBe(6);

		// Evaluate chains: Chain[4]
		expect(traversalSetAndChains.chains[4].o).toBe(true);
		expect(traversalSetAndChains.chains[4].placement.cells.length).toBe(1);
		expect(traversalSetAndChains.chains[4].placement.cells[0]).toBe(hashTo(dimensions.aMax, dimensions.bMax));
		expect(traversalSetAndChains.chains[4].placement.gapAfter).toBe(0);
		expect(traversalSetAndChains.chains[4].placement.gapBefore).toBe(2);
		expect(traversalSetAndChains.chains[4].placement.index).toBe(Math.min(dimensions.aMax, dimensions.bMax));
	});

	test('Type3-D Multi Chain Offset', () => {
		let placementsByPositionHash: { [key: number]: boolean } = {}, // true is O
			positionStartA: number,
			positionStartB: number,
			traversalSetAndChains: TraversalSetAndChains;

		// Prepare placements
		positionStartA = 0;
		positionStartB = 1;
		placementsByPositionHash[hashTo(0, 1)] = false;
		placementsByPositionHash[hashTo(1, 2)] = false;
		placementsByPositionHash[hashTo(3, 4)] = false;
		placementsByPositionHash[hashTo(4, 5)] = true;
		placementsByPositionHash[hashTo(5, 6)] = true;
		placementsByPositionHash[hashTo(6, 7)] = false;
		placementsByPositionHash[hashTo(dimensions.aMax - 1, dimensions.bMax)] = true;
		workingData.placementsByPositionHash = placementsByPositionHash;

		// Generate chains
		traversalSetAndChains = TraversalEngine.getByType3D(dimensions, hashTo(positionStartA, positionStartB), workingData);

		// Evaluate meta
		expect(traversalSetAndChains.set.length).toBe(Math.min(dimensions.aMax - positionStartA, dimensions.bMax - positionStartB) + 1);
		expect(traversalSetAndChains.type).toBe(TraversalType.TYPE3_D);
		expect(traversalSetAndChains.winning).toBe(false);
		expect(traversalSetAndChains.winningChains).toBe(undefined);

		// Evaluate chains
		expect(traversalSetAndChains.chains.length).toBe(5);

		// Evaluate chains: Chain[0]
		expect(traversalSetAndChains.chains[0].o).toBe(false);
		expect(traversalSetAndChains.chains[0].placement.cells.length).toBe(2);
		expect(traversalSetAndChains.chains[0].placement.cells[0]).toBe(hashTo(0, 1));
		expect(traversalSetAndChains.chains[0].placement.cells[1]).toBe(hashTo(1, 2));
		expect(traversalSetAndChains.chains[0].placement.gapAfter).toBe(1);
		expect(traversalSetAndChains.chains[0].placement.gapBefore).toBe(0);
		expect(traversalSetAndChains.chains[0].placement.index).toBe(0);

		// Evaluate chains: Chain[1]
		expect(traversalSetAndChains.chains[1].o).toBe(false);
		expect(traversalSetAndChains.chains[1].placement.cells.length).toBe(1);
		expect(traversalSetAndChains.chains[1].placement.cells[0]).toBe(hashTo(3, 4));
		expect(traversalSetAndChains.chains[1].placement.gapAfter).toBe(0);
		expect(traversalSetAndChains.chains[1].placement.gapBefore).toBe(1);
		expect(traversalSetAndChains.chains[1].placement.index).toBe(3);

		// Evaluate chains: Chain[2]
		expect(traversalSetAndChains.chains[2].o).toBe(true);
		expect(traversalSetAndChains.chains[2].placement.cells.length).toBe(2);
		expect(traversalSetAndChains.chains[2].placement.cells[0]).toBe(hashTo(4, 5));
		expect(traversalSetAndChains.chains[2].placement.cells[1]).toBe(hashTo(5, 6));
		expect(traversalSetAndChains.chains[2].placement.gapAfter).toBe(0);
		expect(traversalSetAndChains.chains[2].placement.gapBefore).toBe(0);
		expect(traversalSetAndChains.chains[2].placement.index).toBe(4);

		// Evaluate chains: Chain[3]
		expect(traversalSetAndChains.chains[3].o).toBe(false);
		expect(traversalSetAndChains.chains[3].placement.cells.length).toBe(1);
		expect(traversalSetAndChains.chains[3].placement.cells[0]).toBe(hashTo(6, 7));
		expect(traversalSetAndChains.chains[3].placement.gapAfter).toBe(1);
		expect(traversalSetAndChains.chains[3].placement.gapBefore).toBe(0);
		expect(traversalSetAndChains.chains[3].placement.index).toBe(6);

		// Evaluate chains: Chain[4]
		expect(traversalSetAndChains.chains[4].o).toBe(true);
		expect(traversalSetAndChains.chains[4].placement.cells.length).toBe(1);
		expect(traversalSetAndChains.chains[4].placement.cells[0]).toBe(hashTo(dimensions.aMax - 1, dimensions.bMax));
		expect(traversalSetAndChains.chains[4].placement.gapAfter).toBe(0);
		expect(traversalSetAndChains.chains[4].placement.gapBefore).toBe(1);
		expect(traversalSetAndChains.chains[4].placement.index).toBe(Math.min(dimensions.aMax - 1, dimensions.bMax));
	});

	test('Type3-D Winning Chain', () => {
		let placementsByPositionHash: { [key: number]: boolean } = {}, // true is O
			positionStartA: number,
			positionStartB: number,
			traversalSetAndChains: TraversalSetAndChains;

		// Prepare placements
		positionStartA = 0;
		positionStartB = 0;
		placementsByPositionHash[hashTo(0, 0)] = false;
		for (let i = 0; i < dimensions.connectSize + 1; i++) {
			placementsByPositionHash[hashTo(i + 2, i + 2)] = false;
		}
		placementsByPositionHash[hashTo(dimensions.aMax, dimensions.bMax)] = false;
		workingData.placementsByPositionHash = placementsByPositionHash;

		// Generate chains
		traversalSetAndChains = TraversalEngine.getByType3D(dimensions, hashTo(positionStartA, positionStartB), workingData);
		// log('traversalSetAndChains', util.inspect(traversalSetAndChains, {showHidden: false, depth: null, colors: true}));

		// Evaluate meta
		expect(traversalSetAndChains.set.length).toBe(Math.min(dimensions.aMax - positionStartA, dimensions.bMax - positionStartB) + 1);
		expect(traversalSetAndChains.type).toBe(TraversalType.TYPE3_D);
		expect(traversalSetAndChains.winning).toBe(true);
		expect(traversalSetAndChains.winningChains).toStrictEqual([1]);
	});

	test('Type3-D Winning Multi Chains', () => {
		let placementsByPositionHash: { [key: number]: boolean } = {}, // true is O
			positionStartA: number,
			positionStartB: number,
			traversalSetAndChains: TraversalSetAndChains;

		// Change global values
		let previous: number = dimensions.connectSize;
		dimensions.connectSize = 2;

		// Prepare placements
		positionStartA = 0;
		positionStartB = 0;
		placementsByPositionHash[hashTo(0, 0)] = false;
		placementsByPositionHash[hashTo(1, 1)] = false;
		placementsByPositionHash[hashTo(2, 2)] = true;
		placementsByPositionHash[hashTo(3, 3)] = true;
		placementsByPositionHash[hashTo(5, 5)] = false;
		placementsByPositionHash[hashTo(7, 7)] = false;
		placementsByPositionHash[hashTo(8, 8)] = false;
		placementsByPositionHash[hashTo(9, 9)] = false;
		workingData.placementsByPositionHash = placementsByPositionHash;

		// Generate chains
		traversalSetAndChains = TraversalEngine.getByType3D(dimensions, hashTo(positionStartA, positionStartB), workingData);
		// log('traversalSetAndChains', util.inspect(traversalSetAndChains, {showHidden: false, depth: null, colors: true}));

		// Evaluate meta
		expect(traversalSetAndChains.set.length).toBe(Math.min(dimensions.aMax - positionStartA, dimensions.bMax - positionStartB) + 1);
		expect(traversalSetAndChains.type).toBe(TraversalType.TYPE3_D);
		expect(traversalSetAndChains.winning).toBe(true);
		expect(traversalSetAndChains.winningChains).toStrictEqual([0, 1, 3]);

		// Reset global values
		dimensions.connectSize = previous;
	});

	test('Type4-U Single Chain', () => {
		let placementsByPositionHash: { [key: number]: boolean } = {}, // true is O
			positionStartA: number,
			positionStartB: number,
			traversalSetAndChains: TraversalSetAndChains;

		/*
		 * !Gapped
		 */

		// Prepare placements
		positionStartA = 0;
		positionStartB = dimensions.bMax;
		placementsByPositionHash[hashTo(0, dimensions.bMax)] = false;
		workingData.placementsByPositionHash = placementsByPositionHash;

		// Generate chains
		traversalSetAndChains = TraversalEngine.getByType4U(dimensions, hashTo(positionStartA, positionStartB), workingData);
		// log('traversalSetAndChains', util.inspect(traversalSetAndChains, {showHidden: false, depth: null, colors: true}));

		// Evaluate meta
		expect(traversalSetAndChains.set.length).toBe(Math.min(dimensions.aMax - positionStartA, positionStartB) + 1);
		expect(traversalSetAndChains.type).toBe(TraversalType.TYPE4_U);
		expect(traversalSetAndChains.winning).toBe(false);
		expect(traversalSetAndChains.winningChains).toBe(undefined);

		// Evaluate chains
		expect(traversalSetAndChains.chains.length).toBe(1);

		// Evaluate chains: Chain[0]
		expect(traversalSetAndChains.chains[0].o).toBe(false);
		expect(traversalSetAndChains.chains[0].placement.cells.length).toBe(1);
		expect(traversalSetAndChains.chains[0].placement.cells[0]).toBe(hashTo(0, dimensions.bMax));
		expect(traversalSetAndChains.chains[0].placement.gapAfter).toBe(9);
		expect(traversalSetAndChains.chains[0].placement.gapBefore).toBe(0);
		expect(traversalSetAndChains.chains[0].placement.index).toBe(0);

		/*
		 * Gapped
		 */

		// Prepare placements
		positionStartA = 0;
		positionStartB = dimensions.bMax;
		placementsByPositionHash = <any>new Object();
		placementsByPositionHash[hashTo(1, dimensions.bMax - 1)] = false;
		workingData.placementsByPositionHash = placementsByPositionHash;

		// Generate chains
		traversalSetAndChains = TraversalEngine.getByType4U(dimensions, hashTo(positionStartA, positionStartB), workingData);
		// log('traversalSetAndChains', util.inspect(traversalSetAndChains, {showHidden: false, depth: null, colors: true}));

		// Evaluate meta
		expect(traversalSetAndChains.set.length).toBe(Math.min(dimensions.aMax - positionStartA, positionStartB) + 1);
		expect(traversalSetAndChains.type).toBe(TraversalType.TYPE4_U);
		expect(traversalSetAndChains.winning).toBe(false);
		expect(traversalSetAndChains.winningChains).toBe(undefined);

		// Evaluate chains
		expect(traversalSetAndChains.chains.length).toBe(1);

		// Evaluate chains: Chain[0]
		expect(traversalSetAndChains.chains[0].o).toBe(false);
		expect(traversalSetAndChains.chains[0].placement.cells.length).toBe(1);
		expect(traversalSetAndChains.chains[0].placement.cells[0]).toBe(hashTo(1, dimensions.bMax - 1));
		expect(traversalSetAndChains.chains[0].placement.gapAfter).toBe(8);
		expect(traversalSetAndChains.chains[0].placement.gapBefore).toBe(1);
		expect(traversalSetAndChains.chains[0].placement.index).toBe(1);
	});

	test('Type4-U Single Chain Offset', () => {
		let placementsByPositionHash: { [key: number]: boolean } = {}, // true is O
			positionStartA: number,
			positionStartB: number,
			traversalSetAndChains: TraversalSetAndChains;

		/*
		 * !Gapped
		 */

		// Prepare placements
		positionStartA = 1;
		positionStartB = dimensions.bMax;
		placementsByPositionHash[hashTo(1, dimensions.bMax)] = false;
		workingData.placementsByPositionHash = placementsByPositionHash;

		// Generate chains
		traversalSetAndChains = TraversalEngine.getByType4U(dimensions, hashTo(positionStartA, positionStartB), workingData);
		// log('traversalSetAndChains', util.inspect(traversalSetAndChains, {showHidden: false, depth: null, colors: true}));

		// Evaluate meta
		expect(traversalSetAndChains.set.length).toBe(Math.min(dimensions.aMax - positionStartA, positionStartB) + 1);
		expect(traversalSetAndChains.type).toBe(TraversalType.TYPE4_U);
		expect(traversalSetAndChains.winning).toBe(false);
		expect(traversalSetAndChains.winningChains).toBe(undefined);

		// Evaluate chains
		expect(traversalSetAndChains.chains.length).toBe(1);

		// Evaluate chains: Chain[0]
		expect(traversalSetAndChains.chains[0].o).toBe(false);
		expect(traversalSetAndChains.chains[0].placement.cells.length).toBe(1);
		expect(traversalSetAndChains.chains[0].placement.cells[0]).toBe(hashTo(1, dimensions.bMax));
		expect(traversalSetAndChains.chains[0].placement.gapAfter).toBe(8);
		expect(traversalSetAndChains.chains[0].placement.gapBefore).toBe(0);
		expect(traversalSetAndChains.chains[0].placement.index).toBe(1);

		/*
		 * Gapped
		 */

		// Prepare placements
		positionStartA = 1;
		positionStartB = dimensions.bMax;
		placementsByPositionHash = <any>new Object();
		placementsByPositionHash[hashTo(2, dimensions.bMax - 1)] = false;
		workingData.placementsByPositionHash = placementsByPositionHash;

		// Generate chains
		traversalSetAndChains = TraversalEngine.getByType4U(dimensions, hashTo(positionStartA, positionStartB), workingData);
		// log('traversalSetAndChains', util.inspect(traversalSetAndChains, {showHidden: false, depth: null, colors: true}));

		// Evaluate meta
		expect(traversalSetAndChains.set.length).toBe(Math.min(dimensions.aMax - positionStartA, positionStartB) + 1);
		expect(traversalSetAndChains.type).toBe(TraversalType.TYPE4_U);
		expect(traversalSetAndChains.winning).toBe(false);
		expect(traversalSetAndChains.winningChains).toBe(undefined);

		// Evaluate chains
		expect(traversalSetAndChains.chains.length).toBe(1);

		// Evaluate chains: Chain[0]
		expect(traversalSetAndChains.chains[0].o).toBe(false);
		expect(traversalSetAndChains.chains[0].placement.cells.length).toBe(1);
		expect(traversalSetAndChains.chains[0].placement.cells[0]).toBe(hashTo(2, dimensions.bMax - 1));
		expect(traversalSetAndChains.chains[0].placement.gapAfter).toBe(7);
		expect(traversalSetAndChains.chains[0].placement.gapBefore).toBe(1);
		expect(traversalSetAndChains.chains[0].placement.index).toBe(2);
	});

	test('Type4-U Multi Chain', () => {
		let placementsByPositionHash: { [key: number]: boolean } = {}, // true is O
			positionStartA: number,
			positionStartB: number,
			traversalSetAndChains: TraversalSetAndChains;

		// Prepare placements
		positionStartA = 0;
		positionStartB = dimensions.bMax;
		placementsByPositionHash[hashTo(0, dimensions.bMax)] = false;
		placementsByPositionHash[hashTo(1, dimensions.bMax - 1)] = false;
		placementsByPositionHash[hashTo(3, dimensions.bMax - 3)] = false;
		placementsByPositionHash[hashTo(4, dimensions.bMax - 4)] = true;
		placementsByPositionHash[hashTo(5, dimensions.bMax - 5)] = true;
		placementsByPositionHash[hashTo(6, dimensions.bMax - 6)] = false;
		placementsByPositionHash[hashTo(dimensions.aMax, 0)] = true;
		workingData.placementsByPositionHash = placementsByPositionHash;

		// Generate chains
		traversalSetAndChains = TraversalEngine.getByType4U(dimensions, hashTo(positionStartA, positionStartB), workingData);
		// log('traversalSetAndChains', util.inspect(traversalSetAndChains, {showHidden: false, depth: null, colors: true}));

		// Evaluate meta
		expect(traversalSetAndChains.set.length).toBe(Math.min(dimensions.aMax - positionStartA, positionStartB) + 1);
		expect(traversalSetAndChains.type).toBe(TraversalType.TYPE4_U);
		expect(traversalSetAndChains.winning).toBe(false);
		expect(traversalSetAndChains.winningChains).toBe(undefined);

		// Evaluate chains
		expect(traversalSetAndChains.chains.length).toBe(5);

		// Evaluate chains: Chain[0]
		expect(traversalSetAndChains.chains[0].o).toBe(false);
		expect(traversalSetAndChains.chains[0].placement.cells.length).toBe(2);
		expect(traversalSetAndChains.chains[0].placement.cells[0]).toBe(hashTo(0, dimensions.bMax));
		expect(traversalSetAndChains.chains[0].placement.cells[1]).toBe(hashTo(1, dimensions.bMax - 1));
		expect(traversalSetAndChains.chains[0].placement.gapAfter).toBe(1);
		expect(traversalSetAndChains.chains[0].placement.gapBefore).toBe(0);
		expect(traversalSetAndChains.chains[0].placement.index).toBe(0);

		// Evaluate chains: Chain[1]
		expect(traversalSetAndChains.chains[1].o).toBe(false);
		expect(traversalSetAndChains.chains[1].placement.cells.length).toBe(1);
		expect(traversalSetAndChains.chains[1].placement.cells[0]).toBe(hashTo(3, dimensions.bMax - 3));
		expect(traversalSetAndChains.chains[1].placement.gapAfter).toBe(0);
		expect(traversalSetAndChains.chains[1].placement.gapBefore).toBe(1);
		expect(traversalSetAndChains.chains[1].placement.index).toBe(3);

		// Evaluate chains: Chain[2]
		expect(traversalSetAndChains.chains[2].o).toBe(true);
		expect(traversalSetAndChains.chains[2].placement.cells.length).toBe(2);
		expect(traversalSetAndChains.chains[2].placement.cells[0]).toBe(hashTo(4, dimensions.bMax - 4));
		expect(traversalSetAndChains.chains[2].placement.cells[1]).toBe(hashTo(5, dimensions.bMax - 5));
		expect(traversalSetAndChains.chains[2].placement.gapAfter).toBe(0);
		expect(traversalSetAndChains.chains[2].placement.gapBefore).toBe(0);
		expect(traversalSetAndChains.chains[2].placement.index).toBe(4);

		// Evaluate chains: Chain[3]
		expect(traversalSetAndChains.chains[3].o).toBe(false);
		expect(traversalSetAndChains.chains[3].placement.cells.length).toBe(1);
		expect(traversalSetAndChains.chains[3].placement.cells[0]).toBe(hashTo(6, dimensions.bMax - 6));
		expect(traversalSetAndChains.chains[3].placement.gapAfter).toBe(2);
		expect(traversalSetAndChains.chains[3].placement.gapBefore).toBe(0);
		expect(traversalSetAndChains.chains[3].placement.index).toBe(6);

		// Evaluate chains: Chain[4]
		expect(traversalSetAndChains.chains[4].o).toBe(true);
		expect(traversalSetAndChains.chains[4].placement.cells.length).toBe(1);
		expect(traversalSetAndChains.chains[4].placement.cells[0]).toBe(hashTo(dimensions.aMax, 0));
		expect(traversalSetAndChains.chains[4].placement.gapAfter).toBe(0);
		expect(traversalSetAndChains.chains[4].placement.gapBefore).toBe(2);
		expect(traversalSetAndChains.chains[4].placement.index).toBe(dimensions.aMax);
	});

	test('Type4-U Multi Chain Offset', () => {
		let placementsByPositionHash: { [key: number]: boolean } = {}, // true is O
			positionStartA: number,
			positionStartB: number,
			traversalSetAndChains: TraversalSetAndChains;

		// Prepare placements
		positionStartA = 0;
		positionStartB = dimensions.bMax - 1;
		placementsByPositionHash[hashTo(0, dimensions.bMax - 1)] = false;
		placementsByPositionHash[hashTo(1, dimensions.bMax - 2)] = false;
		placementsByPositionHash[hashTo(3, dimensions.bMax - 4)] = false;
		placementsByPositionHash[hashTo(4, dimensions.bMax - 5)] = true;
		placementsByPositionHash[hashTo(5, dimensions.bMax - 6)] = true;
		placementsByPositionHash[hashTo(6, dimensions.bMax - 7)] = false;
		placementsByPositionHash[hashTo(dimensions.aMax - 1, 0)] = true;
		workingData.placementsByPositionHash = placementsByPositionHash;

		// Generate chains
		traversalSetAndChains = TraversalEngine.getByType4U(dimensions, hashTo(positionStartA, positionStartB), workingData);
		// log('traversalSetAndChains', util.inspect(traversalSetAndChains, {showHidden: false, depth: null, colors: true}));

		// Evaluate meta
		expect(traversalSetAndChains.set.length).toBe(Math.min(dimensions.aMax - positionStartA, positionStartB) + 1);
		expect(traversalSetAndChains.type).toBe(TraversalType.TYPE4_U);
		expect(traversalSetAndChains.winning).toBe(false);
		expect(traversalSetAndChains.winningChains).toBe(undefined);

		// Evaluate chains
		expect(traversalSetAndChains.chains.length).toBe(5);

		// Evaluate chains: Chain[0]
		expect(traversalSetAndChains.chains[0].o).toBe(false);
		expect(traversalSetAndChains.chains[0].placement.cells.length).toBe(2);
		expect(traversalSetAndChains.chains[0].placement.cells[0]).toBe(hashTo(0, dimensions.bMax - 1));
		expect(traversalSetAndChains.chains[0].placement.cells[1]).toBe(hashTo(1, dimensions.bMax - 2));
		expect(traversalSetAndChains.chains[0].placement.gapAfter).toBe(1);
		expect(traversalSetAndChains.chains[0].placement.gapBefore).toBe(0);
		expect(traversalSetAndChains.chains[0].placement.index).toBe(0);

		// Evaluate chains: Chain[1]
		expect(traversalSetAndChains.chains[1].o).toBe(false);
		expect(traversalSetAndChains.chains[1].placement.cells.length).toBe(1);
		expect(traversalSetAndChains.chains[1].placement.cells[0]).toBe(hashTo(3, dimensions.bMax - 4));
		expect(traversalSetAndChains.chains[1].placement.gapAfter).toBe(0);
		expect(traversalSetAndChains.chains[1].placement.gapBefore).toBe(1);
		expect(traversalSetAndChains.chains[1].placement.index).toBe(3);

		// Evaluate chains: Chain[2]
		expect(traversalSetAndChains.chains[2].o).toBe(true);
		expect(traversalSetAndChains.chains[2].placement.cells.length).toBe(2);
		expect(traversalSetAndChains.chains[2].placement.cells[0]).toBe(hashTo(4, dimensions.bMax - 5));
		expect(traversalSetAndChains.chains[2].placement.cells[1]).toBe(hashTo(5, dimensions.bMax - 6));
		expect(traversalSetAndChains.chains[2].placement.gapAfter).toBe(0);
		expect(traversalSetAndChains.chains[2].placement.gapBefore).toBe(0);
		expect(traversalSetAndChains.chains[2].placement.index).toBe(4);

		// Evaluate chains: Chain[3]
		expect(traversalSetAndChains.chains[3].o).toBe(false);
		expect(traversalSetAndChains.chains[3].placement.cells.length).toBe(1);
		expect(traversalSetAndChains.chains[3].placement.cells[0]).toBe(hashTo(6, dimensions.bMax - 7));
		expect(traversalSetAndChains.chains[3].placement.gapAfter).toBe(1);
		expect(traversalSetAndChains.chains[3].placement.gapBefore).toBe(0);
		expect(traversalSetAndChains.chains[3].placement.index).toBe(6);

		// Evaluate chains: Chain[4]
		expect(traversalSetAndChains.chains[4].o).toBe(true);
		expect(traversalSetAndChains.chains[4].placement.cells.length).toBe(1);
		expect(traversalSetAndChains.chains[4].placement.cells[0]).toBe(hashTo(dimensions.aMax - 1, 0));
		expect(traversalSetAndChains.chains[4].placement.gapAfter).toBe(0);
		expect(traversalSetAndChains.chains[4].placement.gapBefore).toBe(1);
		expect(traversalSetAndChains.chains[4].placement.index).toBe(dimensions.aMax - 1);
	});

	test('Type3-D Winning Chain', () => {
		let placementsByPositionHash: { [key: number]: boolean } = {}, // true is O
			positionStartA: number,
			positionStartB: number,
			traversalSetAndChains: TraversalSetAndChains;

		// Prepare placements
		positionStartA = 0;
		positionStartB = dimensions.bMax;
		placementsByPositionHash[hashTo(0, dimensions.bMax)] = false;
		for (let i = 0; i < dimensions.connectSize + 1; i++) {
			placementsByPositionHash[hashTo(i + 2, dimensions.bMax - (i + 2))] = false;
		}
		placementsByPositionHash[hashTo(dimensions.aMax, 0)] = false;
		workingData.placementsByPositionHash = placementsByPositionHash;

		// Generate chains
		traversalSetAndChains = TraversalEngine.getByType4U(dimensions, hashTo(positionStartA, positionStartB), workingData);
		// log('traversalSetAndChains', util.inspect(traversalSetAndChains, {showHidden: false, depth: null, colors: true}));

		// Evaluate meta
		expect(traversalSetAndChains.set.length).toBe(Math.min(dimensions.aMax - positionStartA, positionStartB) + 1);
		expect(traversalSetAndChains.type).toBe(TraversalType.TYPE4_U);
		expect(traversalSetAndChains.winning).toBe(true);
		expect(traversalSetAndChains.winningChains).toStrictEqual([1]);
	});

	test('Type4-U Winning Multi Chains', () => {
		let placementsByPositionHash: { [key: number]: boolean } = {}, // true is O
			positionStartA: number,
			positionStartB: number,
			traversalSetAndChains: TraversalSetAndChains;

		// Change global values
		let previous: number = dimensions.connectSize;
		dimensions.connectSize = 2;

		// Prepare placements
		positionStartA = 0;
		positionStartB = dimensions.bMax;
		placementsByPositionHash[hashTo(0, dimensions.bMax)] = false;
		placementsByPositionHash[hashTo(1, dimensions.bMax - 1)] = false;
		placementsByPositionHash[hashTo(2, dimensions.bMax - 2)] = true;
		placementsByPositionHash[hashTo(3, dimensions.bMax - 3)] = true;
		placementsByPositionHash[hashTo(5, dimensions.bMax - 5)] = false;
		placementsByPositionHash[hashTo(7, dimensions.bMax - 7)] = false;
		placementsByPositionHash[hashTo(8, dimensions.bMax - 8)] = false;
		placementsByPositionHash[hashTo(9, dimensions.bMax - 9)] = false;
		workingData.placementsByPositionHash = placementsByPositionHash;

		// Generate chains
		traversalSetAndChains = TraversalEngine.getByType4U(dimensions, hashTo(positionStartA, positionStartB), workingData);
		// log('traversalSetAndChains', util.inspect(traversalSetAndChains, {showHidden: false, depth: null, colors: true}));

		// Evaluate meta
		expect(traversalSetAndChains.set.length).toBe(Math.min(dimensions.aMax - positionStartA, positionStartB) + 1);
		expect(traversalSetAndChains.type).toBe(TraversalType.TYPE4_U);
		expect(traversalSetAndChains.winning).toBe(true);
		expect(traversalSetAndChains.winningChains).toStrictEqual([0, 1, 3]);

		// Reset global values
		dimensions.connectSize = previous;
	});
});
