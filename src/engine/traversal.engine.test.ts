/**
 * @author tknight-dev
 */

const util = require('util');
import { log } from 'console';
import { TraversalEngine } from './traversal.engine';
import { Dimensions, MasterTraversalSetAndChains, TraversalSetAndChains, TraversalType, WorkingData } from './types.engine';

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
			valuesOMax: 0,
			valuesXMax: 0,
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
		// log('placementsByPositionHash', util.inspect(placementsByPositionHash, {showHidden: false, depth: null, colors: true}));

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

		// Prepare placements
		placementsByPositionHash = <any>new Object();
		placementsByPositionHash[hashTo(1, 0)] = false;
		workingData.placementsByPositionHash = placementsByPositionHash;

		/*
		 * Strange
		 */

		// Prepare placements
		placementsByPositionHash = <any>new Object();
		placementsByPositionHash[hashTo(0, 3)] = false;
		placementsByPositionHash[hashTo(1, 3)] = false;
		placementsByPositionHash[hashTo(3, 3)] = false;
		placementsByPositionHash[hashTo(4, 3)] = false;
		placementsByPositionHash[hashTo(7, 3)] = false;
		placementsByPositionHash[hashTo(8, 3)] = false;
		workingData.placementsByPositionHash = placementsByPositionHash;
		// log('placementsByPositionHash', util.inspect(placementsByPositionHash, {showHidden: false, depth: null, colors: true}));

		// Generate chains
		traversalSetAndChains = TraversalEngine.getByType1H(dimensions, hashTo(0, 3), workingData);
		// log('traversalSetAndChains', util.inspect(traversalSetAndChains, {showHidden: false, depth: null, colors: true}));

		// Evaluate meta
		expect(traversalSetAndChains.set.length).toBe(dimensions.aMax + 1);
		expect(traversalSetAndChains.type).toBe(TraversalType.TYPE1_H);
		expect(traversalSetAndChains.winning).toBe(false);
		expect(traversalSetAndChains.winningChains).toBe(undefined);

		// Evaluate chains
		expect(traversalSetAndChains.chains.length).toBe(3);

		// Evaluate chains: Chain[0]
		expect(traversalSetAndChains.chains[0].o).toBe(false);
		expect(traversalSetAndChains.chains[0].placement.cells.length).toBe(2);
		expect(traversalSetAndChains.chains[0].placement.cells[0]).toBe(hashTo(0, 3));
		expect(traversalSetAndChains.chains[0].placement.gapAfter).toBe(1);
		expect(traversalSetAndChains.chains[0].placement.gapBefore).toBe(0);
		expect(traversalSetAndChains.chains[0].placement.index).toBe(0);

		// Evaluate chains: Chain[1]
		expect(traversalSetAndChains.chains[1].o).toBe(false);
		expect(traversalSetAndChains.chains[1].placement.cells.length).toBe(2);
		expect(traversalSetAndChains.chains[1].placement.cells[0]).toBe(hashTo(3, 3));
		expect(traversalSetAndChains.chains[1].placement.gapAfter).toBe(2);
		expect(traversalSetAndChains.chains[1].placement.gapBefore).toBe(1);
		expect(traversalSetAndChains.chains[1].placement.index).toBe(3);

		// Evaluate chains: Chain[2]
		expect(traversalSetAndChains.chains[2].o).toBe(false);
		expect(traversalSetAndChains.chains[2].placement.cells.length).toBe(2);
		expect(traversalSetAndChains.chains[2].placement.cells[0]).toBe(hashTo(7, 3));
		expect(traversalSetAndChains.chains[2].placement.gapAfter).toBe(1);
		expect(traversalSetAndChains.chains[2].placement.gapBefore).toBe(2);
		expect(traversalSetAndChains.chains[2].placement.index).toBe(7);
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

		/*
		 * Strange
		 */

		// Prepare placements
		placementsByPositionHash = <any>new Object();
		placementsByPositionHash[hashTo(3, 0)] = false;
		placementsByPositionHash[hashTo(3, 1)] = false;
		placementsByPositionHash[hashTo(3, 3)] = false;
		placementsByPositionHash[hashTo(3, 4)] = false;
		placementsByPositionHash[hashTo(3, 7)] = false;
		placementsByPositionHash[hashTo(3, 8)] = false;
		workingData.placementsByPositionHash = placementsByPositionHash;

		// Generate chains
		traversalSetAndChains = TraversalEngine.getByType2V(dimensions, hashTo(3, 0), workingData);
		// log('traversalSetAndChains', util.inspect(traversalSetAndChains, {showHidden: false, depth: null, colors: true}));

		// Evaluate meta
		expect(traversalSetAndChains.set.length).toBe(dimensions.aMax + 1);
		expect(traversalSetAndChains.type).toBe(TraversalType.TYPE2_V);
		expect(traversalSetAndChains.winning).toBe(false);
		expect(traversalSetAndChains.winningChains).toBe(undefined);

		// Evaluate chains
		expect(traversalSetAndChains.chains.length).toBe(3);

		// Evaluate chains: Chain[0]
		expect(traversalSetAndChains.chains[0].o).toBe(false);
		expect(traversalSetAndChains.chains[0].placement.cells.length).toBe(2);
		expect(traversalSetAndChains.chains[0].placement.cells[0]).toBe(hashTo(3, 0));
		expect(traversalSetAndChains.chains[0].placement.gapAfter).toBe(1);
		expect(traversalSetAndChains.chains[0].placement.gapBefore).toBe(0);
		expect(traversalSetAndChains.chains[0].placement.index).toBe(0);

		// Evaluate chains: Chain[1]
		expect(traversalSetAndChains.chains[1].o).toBe(false);
		expect(traversalSetAndChains.chains[1].placement.cells.length).toBe(2);
		expect(traversalSetAndChains.chains[1].placement.cells[0]).toBe(hashTo(3, 3));
		expect(traversalSetAndChains.chains[1].placement.gapAfter).toBe(2);
		expect(traversalSetAndChains.chains[1].placement.gapBefore).toBe(1);
		expect(traversalSetAndChains.chains[1].placement.index).toBe(3);

		// Evaluate chains: Chain[2]
		expect(traversalSetAndChains.chains[2].o).toBe(false);
		expect(traversalSetAndChains.chains[2].placement.cells.length).toBe(2);
		expect(traversalSetAndChains.chains[2].placement.cells[0]).toBe(hashTo(3, 7));
		expect(traversalSetAndChains.chains[2].placement.gapAfter).toBe(1);
		expect(traversalSetAndChains.chains[2].placement.gapBefore).toBe(2);
		expect(traversalSetAndChains.chains[2].placement.index).toBe(7);
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

	test('Type3-D Single Chain (2)', () => {
		let placementsByPositionHash: { [key: number]: boolean } = {}, // true is O
			positionStartA: number,
			positionStartB: number,
			traversalSetAndChains: TraversalSetAndChains;

		// Prepare placements
		positionStartA = 1;
		positionStartB = 0;
		placementsByPositionHash[hashTo(3, 2)] = false;
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
		expect(traversalSetAndChains.chains[0].placement.cells[0]).toBe(hashTo(3, 2));
		expect(traversalSetAndChains.chains[0].placement.gapAfter).toBe(6);
		expect(traversalSetAndChains.chains[0].placement.gapBefore).toBe(2);
		expect(traversalSetAndChains.chains[0].placement.index).toBe(2);
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

		/*
		 * Strange
		 */

		// Prepare placements
		placementsByPositionHash = <any>new Object();
		placementsByPositionHash[hashTo(0, 0)] = false;
		placementsByPositionHash[hashTo(1, 1)] = false;
		placementsByPositionHash[hashTo(3, 3)] = false;
		placementsByPositionHash[hashTo(4, 4)] = false;
		placementsByPositionHash[hashTo(7, 7)] = false;
		placementsByPositionHash[hashTo(8, 8)] = false;
		workingData.placementsByPositionHash = placementsByPositionHash;

		// Generate chains
		traversalSetAndChains = TraversalEngine.getByType3D(dimensions, hashTo(0, 0), workingData);
		// log('traversalSetAndChains', util.inspect(traversalSetAndChains, {showHidden: false, depth: null, colors: true}));

		// Evaluate meta
		expect(traversalSetAndChains.set.length).toBe(dimensions.aMax + 1);
		expect(traversalSetAndChains.type).toBe(TraversalType.TYPE3_D);
		expect(traversalSetAndChains.winning).toBe(false);
		expect(traversalSetAndChains.winningChains).toBe(undefined);

		// Evaluate chains
		expect(traversalSetAndChains.chains.length).toBe(3);

		// Evaluate chains: Chain[0]
		expect(traversalSetAndChains.chains[0].o).toBe(false);
		expect(traversalSetAndChains.chains[0].placement.cells.length).toBe(2);
		expect(traversalSetAndChains.chains[0].placement.cells[0]).toBe(hashTo(0, 0));
		expect(traversalSetAndChains.chains[0].placement.gapAfter).toBe(1);
		expect(traversalSetAndChains.chains[0].placement.gapBefore).toBe(0);
		expect(traversalSetAndChains.chains[0].placement.index).toBe(0);

		// Evaluate chains: Chain[1]
		expect(traversalSetAndChains.chains[1].o).toBe(false);
		expect(traversalSetAndChains.chains[1].placement.cells.length).toBe(2);
		expect(traversalSetAndChains.chains[1].placement.cells[0]).toBe(hashTo(3, 3));
		expect(traversalSetAndChains.chains[1].placement.gapAfter).toBe(2);
		expect(traversalSetAndChains.chains[1].placement.gapBefore).toBe(1);
		expect(traversalSetAndChains.chains[1].placement.index).toBe(3);

		// Evaluate chains: Chain[2]
		expect(traversalSetAndChains.chains[2].o).toBe(false);
		expect(traversalSetAndChains.chains[2].placement.cells.length).toBe(2);
		expect(traversalSetAndChains.chains[2].placement.cells[0]).toBe(hashTo(7, 7));
		expect(traversalSetAndChains.chains[2].placement.gapAfter).toBe(1);
		expect(traversalSetAndChains.chains[2].placement.gapBefore).toBe(2);
		expect(traversalSetAndChains.chains[2].placement.index).toBe(7);
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
		expect(traversalSetAndChains.chains[0].placement.index).toBe(0);

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
		expect(traversalSetAndChains.chains[0].placement.index).toBe(1);
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

		/*
		 * Strange
		 */

		// Prepare placements
		placementsByPositionHash = <any>new Object();
		placementsByPositionHash[hashTo(0, dimensions.bMax)] = false;
		placementsByPositionHash[hashTo(1, dimensions.bMax - 1)] = false;
		placementsByPositionHash[hashTo(3, dimensions.bMax - 3)] = false;
		placementsByPositionHash[hashTo(4, dimensions.bMax - 4)] = false;
		placementsByPositionHash[hashTo(7, dimensions.bMax - 7)] = false;
		placementsByPositionHash[hashTo(8, dimensions.bMax - 8)] = false;
		workingData.placementsByPositionHash = placementsByPositionHash;

		// Generate chains
		traversalSetAndChains = TraversalEngine.getByType4U(dimensions, hashTo(0, dimensions.bMax), workingData);
		// log('traversalSetAndChains', util.inspect(traversalSetAndChains, {showHidden: false, depth: null, colors: true}));

		// Evaluate meta
		expect(traversalSetAndChains.set.length).toBe(dimensions.aMax + 1);
		expect(traversalSetAndChains.type).toBe(TraversalType.TYPE4_U);
		expect(traversalSetAndChains.winning).toBe(false);
		expect(traversalSetAndChains.winningChains).toBe(undefined);

		// Evaluate chains
		expect(traversalSetAndChains.chains.length).toBe(3);

		// Evaluate chains: Chain[0]
		expect(traversalSetAndChains.chains[0].o).toBe(false);
		expect(traversalSetAndChains.chains[0].placement.cells.length).toBe(2);
		expect(traversalSetAndChains.chains[0].placement.cells[0]).toBe(hashTo(0, dimensions.bMax));
		expect(traversalSetAndChains.chains[0].placement.gapAfter).toBe(1);
		expect(traversalSetAndChains.chains[0].placement.gapBefore).toBe(0);
		expect(traversalSetAndChains.chains[0].placement.index).toBe(0);

		// Evaluate chains: Chain[1]
		expect(traversalSetAndChains.chains[1].o).toBe(false);
		expect(traversalSetAndChains.chains[1].placement.cells.length).toBe(2);
		expect(traversalSetAndChains.chains[1].placement.cells[0]).toBe(hashTo(3, dimensions.bMax - 3));
		expect(traversalSetAndChains.chains[1].placement.gapAfter).toBe(2);
		expect(traversalSetAndChains.chains[1].placement.gapBefore).toBe(1);
		expect(traversalSetAndChains.chains[1].placement.index).toBe(3);

		// Evaluate chains: Chain[2]
		expect(traversalSetAndChains.chains[2].o).toBe(false);
		expect(traversalSetAndChains.chains[2].placement.cells.length).toBe(2);
		expect(traversalSetAndChains.chains[2].placement.cells[0]).toBe(hashTo(7, dimensions.bMax - 7));
		expect(traversalSetAndChains.chains[2].placement.gapAfter).toBe(1);
		expect(traversalSetAndChains.chains[2].placement.gapBefore).toBe(2);
		expect(traversalSetAndChains.chains[2].placement.index).toBe(7);
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

	test('Type4-U Winning Chain', () => {
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

	test('MasterSet', () => {
		let j: number, masterTraversalSetAndChains: MasterTraversalSetAndChains, set: number[], traversalSetAndChainsGroup: TraversalSetAndChains[];

		// Generate chains
		masterTraversalSetAndChains = TraversalEngine.masterSet(dimensions, workingData);
		traversalSetAndChainsGroup = masterTraversalSetAndChains.traversalSetAndChainsGroup;
		// log('masterTraversalSetAndChains', util.inspect(masterTraversalSetAndChains, {showHidden: false, depth: null, colors: true}));

		// Verify postionHahes are valid
		for (let i in traversalSetAndChainsGroup) {
			set = traversalSetAndChainsGroup[i].set;
			// log('set['+i+']', util.inspect(set, {showHidden: false, depth: null, colors: true}));

			for (j = 0; j < set.length; j++) {
				// log('  >> ['+j+']:',set[j],set[j].toString(16).padStart(4,'0'),(set[j] >> 8) & 0xff, set[j] & 0xff);
				expect((set[j] >> 8) & 0xff).toBeGreaterThanOrEqual(0); // A
				expect(set[j] & 0xff).toBeGreaterThanOrEqual(0); // B

				expect((set[j] >> 8) & 0xff).toBeLessThanOrEqual(dimensions.aMax); // A
				expect(set[j] & 0xff).toBeLessThanOrEqual(dimensions.bMax); // B
			}
		}

		// Verify that there are no duplicate sets
		let setList: { [key: string]: string } = {},
			setString: string;
		for (let i in traversalSetAndChainsGroup) {
			set = traversalSetAndChainsGroup[i].set;
			setString = JSON.stringify(set);

			if (setList[setString] !== undefined) {
				// Duplicate
				expect(`duplicate: ${setString} (${setList[setString]})`).toBe('');
			}

			setList[setString] = TraversalType[traversalSetAndChainsGroup[i].type];
		}
	});

	test('MasterSet (2)', () => {
		let aMaxEff: number = dimensions.aMax + 1,
			bMaxEff: number = dimensions.bMax + 1,
			connectSize: number = dimensions.connectSize,
			positionHash: number,
			placementsByPositionHash: { [key: number]: boolean } = {}, // true is O
			placementsType1H: { [key: number]: boolean } = {},
			placementsType2V: { [key: number]: boolean } = {},
			placementsType3D: { [key: number]: boolean } = {},
			placementsType4U: { [key: number]: boolean } = {},
			traversalSetAndChainsGroup: TraversalSetAndChains[],
			masterTraversalSetAndChains: MasterTraversalSetAndChains;

		// Prepare placements
		for (let A = 0; A < aMaxEff; A++) {
			placementsType2V[hashTo(A, 0)] = false; // [A0, B0-B9]
			placementsByPositionHash[hashTo(A, 0)] = false; // Together covers all shared trigger points

			if (A < aMaxEff - connectSize + 2) {
				placementsByPositionHash[hashTo(A, dimensions.bMax)] = false; // Together covers all shared trigger points
			}
		}
		for (let B = 0; B < bMaxEff; B++) {
			placementsType1H[hashTo(0, B)] = false; // [A0-A9, B0]
			placementsByPositionHash[hashTo(0, B)] = false; // Together covers all shared trigger points
		}
		for (let A = 0; A < aMaxEff - (connectSize - 2); A++) {
			placementsType3D[hashTo(A, 0)] = false; // [A0-A6, 0]
			placementsType4U[hashTo(A, dimensions.bMax)] = false; // [A0-A6, B9]
		}
		for (let B = 1; B < bMaxEff - 1; B++) {
			if (B < bMaxEff - (connectSize - 2)) {
				placementsType3D[hashTo(0, B)] = false; // [A0, B1-B6]
			}
			if (B > connectSize - 3) {
				placementsType4U[hashTo(0, B)] = false; // [A0, B3-B8]
			}
		}
		workingData.placementsByPositionHash = placementsByPositionHash;
		// log('placementsByPositionHash', Object.keys(placementsByPositionHash).map((v) => Number(v).toString(16).padStart(4, '0')));

		// Generate chains
		masterTraversalSetAndChains = TraversalEngine.masterSet(dimensions, workingData);
		// log('masterTraversalSetAndChains', util.inspect(masterTraversalSetAndChains, {showHidden: false, depth: null, colors: true}));

		traversalSetAndChainsGroup = masterTraversalSetAndChains.traversalSetAndChainsGroup;
		for (let i = 0; i < traversalSetAndChainsGroup.length; i++) {
			if (traversalSetAndChainsGroup[i].chains.length) {
				positionHash = traversalSetAndChainsGroup[i].chains[0].placement.cells[0]; // Should be the first chain's first cell found also in trigger group

				// Filter out overlapping cells (EG [(A0, B0), (A1, B0)] are part of the trigger group but (A1, B0) would fail H1 as a 2nd trigger)
				switch (traversalSetAndChainsGroup[i].type) {
					case TraversalType.TYPE1_H:
						if (placementsType1H[positionHash] === undefined) {
							log(
								'placementsType1H',
								Object.keys(placementsType1H).map((v) => Number(v).toString(16).padStart(4, '0')),
							);
							throw new Error('placementsType1H[' + Number(positionHash).toString(16).padStart(4, '0') + ']: unexpected position hash');
						}
						placementsType1H[positionHash] = true;
						break;
					case TraversalType.TYPE2_V:
						if (placementsType2V[positionHash] === undefined) {
							log(
								'placementsType2V',
								Object.keys(placementsType2V).map((v) => Number(v).toString(16).padStart(4, '0')),
							);
							throw new Error('placementsType2V[' + Number(positionHash).toString(16).padStart(4, '0') + ']: unexpected position hash');
						}
						placementsType2V[positionHash] = true;
						break;
					case TraversalType.TYPE3_D:
						if (placementsType3D[positionHash] === undefined) {
							log(
								'placementsType3D',
								Object.keys(placementsType3D).map((v) => Number(v).toString(16).padStart(4, '0')),
							);
							throw new Error('placementsType3D[' + Number(positionHash).toString(16).padStart(4, '0') + ']: unexpected position hash');
						}
						placementsType3D[positionHash] = true;
						break;
					case TraversalType.TYPE4_U:
						if (placementsType4U[positionHash] === undefined) {
							log(
								'placementsType4U',
								Object.keys(placementsType4U).map((v) => Number(v).toString(16).padStart(4, '0')),
							);
							throw new Error('placementsType4U[' + Number(positionHash).toString(16).padStart(4, '0') + ']: unexpected position hash');
						}
						placementsType4U[positionHash] = true;
						break;
				}
			}
		}

		for (let i in placementsType1H) {
			if (!placementsType1H[i]) {
				log(
					'placementsType1H',
					Object.keys(placementsType1H).map((v) => Number(v).toString(16).padStart(4, '0')),
				);
				throw new Error('placementsType1H[' + Number(i).toString(16).padStart(4, '0') + ']: missing position hash');
			}
		}
		for (let i in placementsType2V) {
			if (!placementsType2V[i]) {
				log(
					'placementsType2V',
					Object.keys(placementsType2V).map((v) => Number(v).toString(16).padStart(4, '0')),
				);
				throw new Error('placementsType2V[' + Number(i).toString(16).padStart(4, '0') + ']: missing position hash');
			}
		}
		for (let i in placementsType3D) {
			if (!placementsType3D[i]) {
				log(
					'placementsType3D',
					Object.keys(placementsType3D).map((v) => Number(v).toString(16).padStart(4, '0')),
				);
				throw new Error('placementsType3D[' + Number(i).toString(16).padStart(4, '0') + ']: missing position hash');
			}
		}
		for (let i in placementsType4U) {
			if (!placementsType4U[i]) {
				log(
					'placementsType4U',
					Object.keys(placementsType4U).map((v) => Number(v).toString(16).padStart(4, '0')),
				);
				throw new Error('placementsType4U[' + Number(i).toString(16).padStart(4, '0') + ']: missing position hash');
			}
		}
	});

	test('MasterSet Winning Chain', () => {
		let placementsByPositionHash: { [key: number]: boolean } = {}, // true is O
			masterTraversalSetAndChains: MasterTraversalSetAndChains,
			winningPositionHashes: number[];

		// Prepare placements
		for (let A = 0; A < dimensions.connectSize; A++) {
			placementsByPositionHash[hashTo(A, 0)] = false;
		}
		workingData.placementsByPositionHash = placementsByPositionHash;
		// log('placementsByPositionHash', Object.keys(placementsByPositionHash).map((v) => Number(v).toString(16).padStart(4, '0')));

		// Generate chains
		masterTraversalSetAndChains = TraversalEngine.masterSet(dimensions, workingData);
		// log('masterTraversalSetAndChains', util.inspect(masterTraversalSetAndChains, {showHidden: false, depth: null, colors: true}));

		// Evaluate meta
		expect(masterTraversalSetAndChains.winning).toBe(true);
		expect(Array.isArray(masterTraversalSetAndChains.winningPositionHashes)).toBe(true);
		expect((<number[]>masterTraversalSetAndChains.winningPositionHashes).length).toBe(Object.keys(placementsByPositionHash).length);

		winningPositionHashes = <number[]>masterTraversalSetAndChains.winningPositionHashes;
		// log('winningPositionHashes', winningPositionHashes.map((v) => Number(v).toString(16).padStart(4, '0')));
		for (let i = 0; i < winningPositionHashes.length; i++) {
			if (placementsByPositionHash[winningPositionHashes[i]] === undefined) {
				throw new Error('winningPositionHashes[' + Number(winningPositionHashes[i]).toString(16).padStart(4, '0') + ']: unexpected');
			}
		}
	});

	test('MasterSet Winning Multi Chain (Global*)', () => {
		let aMax: number = 8,
			bMax: number = 8,
			aPrevious: number = dimensions.aMax,
			bPrevious: number = dimensions.bMax,
			placementsByPositionHash: { [key: number]: boolean } = {}, // true is O
			masterTraversalSetAndChains: MasterTraversalSetAndChains,
			winningPositionHashes: number[];

		// Change globals
		dimensions.aMax = aMax;
		dimensions.bMax = bMax;

		// Prepare placements
		for (let A = 0, B = 0; A <= aMax && B <= bMax; A++, B++) {
			placementsByPositionHash[hashTo(A, 4)] = false; // Type1H
			placementsByPositionHash[hashTo(4, B)] = false; // Type2V
			placementsByPositionHash[hashTo(A, B)] = false; // Type3D
			placementsByPositionHash[hashTo(A, bMax - B)] = false; // Type4U
		}
		workingData.placementsByPositionHash = placementsByPositionHash;
		// log('placementsByPositionHash', Object.keys(placementsByPositionHash).map((v) => Number(v).toString(16).padStart(4, '0')).sort());

		// Generate chains
		masterTraversalSetAndChains = TraversalEngine.masterSet(dimensions, workingData);
		// log('masterTraversalSetAndChains', util.inspect(masterTraversalSetAndChains, {showHidden: false, depth: null, colors: true}));

		// Evaluate meta
		expect(masterTraversalSetAndChains.winning).toBe(true);
		expect(Array.isArray(masterTraversalSetAndChains.winningPositionHashes)).toBe(true);
		expect((<number[]>masterTraversalSetAndChains.winningPositionHashes).length).toBe(Object.keys(placementsByPositionHash).length);

		winningPositionHashes = <number[]>masterTraversalSetAndChains.winningPositionHashes;
		// log('winningPositionHashes', winningPositionHashes.map((v) => Number(v).toString(16).padStart(4, '0')));
		for (let i = 0; i < winningPositionHashes.length; i++) {
			if (placementsByPositionHash[winningPositionHashes[i]] === undefined) {
				throw new Error('winningPositionHashes[' + Number(winningPositionHashes[i]).toString(16).padStart(4, '0') + ']: unexpected');
			}
		}

		// Restore globals
		dimensions.aMax = aPrevious;
		dimensions.bMax = bPrevious;
	});
});
