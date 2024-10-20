/**
 * @author tknight-dev
 */

const colors = require('colors');
const util = require('util');
import { log } from 'console';
import { EvaluationLinearEngine } from './evaluation.linear.engine';
import { TraversalEngine } from './traversal.engine';
import { AlgorithmType, Dimensions, MasterTraversalSetAndChains, TraversalSetAndChains, TraversalType, WorkingData, WorkingDataValues } from './types.engine';

let dimensions: Dimensions = {
		aMax: 9,
		bMax: 9,
		connectSize: 5,
	},
	hashTo: (a: number, b: number) => number = (a: number, b: number) => ((a & 0xff) << 8) | (b & 0xff),
	masterSet: MasterTraversalSetAndChains = {
		traversalSetAndChainsGroup: [],
		winning: false,
		winningO: undefined,
		winningPositionHashes: undefined,
	},
	printGameboard: (displayOPieces?: boolean, note?: string) => void = (displayOPieces?: boolean, note?: string) => {
		let A: number,
			c: (param: any) => void = displayOPieces ? colors.red : colors.green,
			placementsByPositionHash: { [key: number]: boolean } = workingData.placementsByPositionHash,
			string: string = '',
			value: number,
			values: { o: number; x: number },
			valuesByPositionHash: { [key: number]: { o: number; x: number } } = workingData.values.valuesByPositionHash;

		for (let B = -1; B <= dimensions.aMax; B++) {
			for (A = -1; A <= dimensions.bMax; A++) {
				if (A === -1) {
					if (B !== -1) {
						string += 'B' + B + ' ';
					} else {
						string += '(' + c(displayOPieces ? 'o' : 'x') + ')';
					}
				} else {
					if (B === -1) {
						string += '  A' + A + ' ';
					} else if (placementsByPositionHash[hashTo(A, B)] !== undefined) {
						string += '[ ' + (placementsByPositionHash[hashTo(A, B)] ? 'O' : 'X') + ' ]';
					} else {
						values = valuesByPositionHash[hashTo(A, B)];
						value = displayOPieces ? values.o : values.x;

						if (value) {
							string += '[' + c(value.toString().padStart(3, ' ')) + ']';
						} else {
							string += '[   ]';
						}
					}
				}
			}
			string += '\n';
		}

		log(expect.getState().currentTestName + '\n' + (note ? '   - ' + note + '\n' : '') + string);
	},
	workingData: WorkingData = {
		placementsAvailableByPositionHash: {},
		placementsByPositionHash: {}, // true is O
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
			valuesByPositionHash: {},
			valuesOMax: 0,
			valuesXMax: 0,
		},
	};

// Initialize entries
for (let A = 0; A <= dimensions.aMax; A++) {
	for (let B = 0; B <= dimensions.bMax; B++) {
		workingData.values.valuesByPositionHash[hashTo(A, B)] = {
			o: 0,
			x: 0,
		};
	}
}

describe('GameEngine: Evaluation', () => {
	test('Algorithm: Type1-Viability, Taversal: Type1-H', () => {
		let algorithmType: AlgorithmType = AlgorithmType.TYPE1_VIABILITY,
			placementsByPositionHash: { [key: number]: boolean } = {}, // true is O
			traversalSetAndChainsGroup: TraversalSetAndChains[] = masterSet.traversalSetAndChainsGroup,
			values: WorkingDataValues = workingData.values,
			valuesByPositionHash: { [key: number]: { o: number; x: number } } = values.valuesByPositionHash;

		/*
		 * !Gapped
		 */

		// Prepare placements
		placementsByPositionHash[hashTo(1, 0)] = false;
		placementsByPositionHash[hashTo(dimensions.connectSize - 1, 0)] = true;
		workingData.placementsByPositionHash = placementsByPositionHash;
		// log('placementsByPositionHash', util.inspect(placementsByPositionHash, {showHidden: false, depth: null, colors: true}));

		// Generate chains
		traversalSetAndChainsGroup.push(TraversalEngine.getByType1H(dimensions, hashTo(0, 0), workingData));
		// log('traversalSetAndChains', util.inspect(traversalSetAndChainsGroup[0], {showHidden: false, depth: null, colors: true}));

		// Evaluate chains
		EvaluationLinearEngine.calc(dimensions, masterSet, workingData, algorithmType);
		// printGameboard();

		// Test values
		expect(values.valuesOMax).toBe(0);
		expect(values.valuesXMax).toBe(0);
		expect(valuesByPositionHash[hashTo(1, 0)].o).toBe(0);
		expect(valuesByPositionHash[hashTo(1, 0)].x).toBe(-1);
		expect(valuesByPositionHash[hashTo(2, 0)].o).toBe(0);
		expect(valuesByPositionHash[hashTo(2, 0)].x).toBe(0);

		// Cleanup
		masterSet.traversalSetAndChainsGroup = new Array();
	});

	test('Algorithm: Type2-OneToWin, Taversal: Type1-H', () => {
		let algorithmType: AlgorithmType = AlgorithmType.TYPE2_ONETOWIN,
			placementsByPositionHash: { [key: number]: boolean } = {}, // true is O
			traversalSetAndChainsGroup: TraversalSetAndChains[] = masterSet.traversalSetAndChainsGroup,
			values: WorkingDataValues = workingData.values,
			valuesByPositionHash: { [key: number]: { o: number; x: number } } = values.valuesByPositionHash;

		/*
		 * !Gapped
		 */

		// Prepare placements
		for (let i = 0; i < dimensions.connectSize - 1; i++) {
			placementsByPositionHash[hashTo(1 + i, 0)] = false;
		}
		workingData.placementsByPositionHash = placementsByPositionHash;
		// log('placementsByPositionHash', util.inspect(placementsByPositionHash, {showHidden: false, depth: null, colors: true}));

		// Generate chains
		traversalSetAndChainsGroup.push(TraversalEngine.getByType1H(dimensions, hashTo(0, 0), workingData));
		// log('traversalSetAndChains', util.inspect(traversalSetAndChainsGroup[0], {showHidden: false, depth: null, colors: true}));

		// Evaluate chains
		EvaluationLinearEngine.calc(dimensions, masterSet, workingData, algorithmType);
		// printGameboard();

		// Test values
		expect(values.valuesOMax).toBe(0);
		expect(values.valuesXMax).toBe(dimensions.connectSize * 10);
		expect(valuesByPositionHash[hashTo(0, 0)].o).toBe(0);
		expect(valuesByPositionHash[hashTo(0, 0)].x).toBe(dimensions.connectSize * 10);
		for (let i = 0; i < dimensions.connectSize - 1; i++) {
			expect(valuesByPositionHash[hashTo(1 + i, 0)].o).toBe(0);
			expect(valuesByPositionHash[hashTo(1 + i, 0)].x).toBe(0);
		}
		expect(valuesByPositionHash[hashTo(dimensions.connectSize, 0)].o).toBe(0);
		expect(valuesByPositionHash[hashTo(dimensions.connectSize, 0)].x).toBe(dimensions.connectSize * 10);
		expect(valuesByPositionHash[hashTo(dimensions.connectSize + 1, 0)].o).toBe(0);
		expect(valuesByPositionHash[hashTo(dimensions.connectSize + 1, 0)].x).toBe(0);

		// Cleanup
		masterSet.traversalSetAndChainsGroup = new Array();
	});

	test('Algorithm: Type3-TwoToWin, Taversal: Type2-V', () => {
		let algorithmType: AlgorithmType = AlgorithmType.TYPE3_TWOTOWIN,
			placementsByPositionHash: { [key: number]: boolean } = {}, // true is O
			traversalSetAndChainsGroup: TraversalSetAndChains[] = masterSet.traversalSetAndChainsGroup,
			values: WorkingDataValues = workingData.values,
			valuesByPositionHash: { [key: number]: { o: number; x: number } } = values.valuesByPositionHash;

		// Prepare placements
		placementsByPositionHash[hashTo(0, 3)] = false;
		placementsByPositionHash[hashTo(0, 4)] = false;
		placementsByPositionHash[hashTo(0, 5)] = false;
		workingData.placementsByPositionHash = placementsByPositionHash;
		// log('placementsByPositionHash', util.inspect(placementsByPositionHash, {showHidden: false, depth: null, colors: true}));

		// Generate chains
		traversalSetAndChainsGroup.push(TraversalEngine.getByType2V(dimensions, hashTo(0, 0), workingData));
		// log('traversalSetAndChains', util.inspect(traversalSetAndChainsGroup[0], {showHidden: false, depth: null, colors: true}));

		// Evaluate chains
		EvaluationLinearEngine.calc(dimensions, masterSet, workingData, algorithmType);
		// printGameboard();

		// Test values
		expect(values.valuesOMax).toBe(0);
		expect(values.valuesXMax).toBe(dimensions.connectSize * 5);
		expect(valuesByPositionHash[hashTo(0, 0)].o).toBe(0);
		expect(valuesByPositionHash[hashTo(0, 0)].x).toBe(0);
		expect(valuesByPositionHash[hashTo(0, 1)].o).toBe(0);
		expect(valuesByPositionHash[hashTo(0, 1)].x).toBe(0);
		expect(valuesByPositionHash[hashTo(0, 2)].o).toBe(0);
		expect(valuesByPositionHash[hashTo(0, 2)].x).toBe(dimensions.connectSize * 5);
		expect(valuesByPositionHash[hashTo(0, 3)].o).toBe(0);
		expect(valuesByPositionHash[hashTo(0, 3)].x).toBe(0);
		expect(valuesByPositionHash[hashTo(0, 4)].o).toBe(0);
		expect(valuesByPositionHash[hashTo(0, 4)].x).toBe(0);
		expect(valuesByPositionHash[hashTo(0, 5)].o).toBe(0);
		expect(valuesByPositionHash[hashTo(0, 5)].x).toBe(0);
		expect(valuesByPositionHash[hashTo(0, 6)].o).toBe(0);
		expect(valuesByPositionHash[hashTo(0, 6)].x).toBe(dimensions.connectSize * 5);
		expect(valuesByPositionHash[hashTo(0, 7)].o).toBe(0);
		expect(valuesByPositionHash[hashTo(0, 7)].x).toBe(0);
		expect(valuesByPositionHash[hashTo(0, 8)].o).toBe(0);
		expect(valuesByPositionHash[hashTo(0, 8)].x).toBe(0);
		expect(valuesByPositionHash[hashTo(0, 9)].o).toBe(0);
		expect(valuesByPositionHash[hashTo(0, 9)].x).toBe(0);

		// Cleanup
		masterSet.traversalSetAndChainsGroup = new Array();
	});

	test('Algorithm: Type3-TwoToWin, Taversal: Type2-V (2)', () => {
		let algorithmType: AlgorithmType = AlgorithmType.TYPE3_TWOTOWIN,
			placementsByPositionHash: { [key: number]: boolean } = {}, // true is O
			traversalSetAndChainsGroup: TraversalSetAndChains[] = masterSet.traversalSetAndChainsGroup,
			values: WorkingDataValues = workingData.values,
			valuesByPositionHash: { [key: number]: { o: number; x: number } } = values.valuesByPositionHash;

		// Prepare placements
		placementsByPositionHash[hashTo(0, 0)] = false;
		placementsByPositionHash[hashTo(0, 1)] = false;
		placementsByPositionHash[hashTo(0, 3)] = false;
		placementsByPositionHash[hashTo(0, 5)] = false;
		placementsByPositionHash[hashTo(0, 7)] = false;
		placementsByPositionHash[hashTo(0, 8)] = false;
		workingData.placementsByPositionHash = placementsByPositionHash;
		// log('placementsByPositionHash', util.inspect(placementsByPositionHash, {showHidden: false, depth: null, colors: true}));

		// Generate chains
		traversalSetAndChainsGroup.push(TraversalEngine.getByType2V(dimensions, hashTo(0, 0), workingData));
		// log('traversalSetAndChains', util.inspect(traversalSetAndChainsGroup[0], {showHidden: false, depth: null, colors: true}));

		// Evaluate chains
		EvaluationLinearEngine.calc(dimensions, masterSet, workingData, algorithmType);
		// printGameboard();

		// Test values
		expect(values.valuesOMax).toBe(0);
		expect(values.valuesXMax).toBe(dimensions.connectSize * 5);
		expect(valuesByPositionHash[hashTo(0, 0)].o).toBe(0);
		expect(valuesByPositionHash[hashTo(0, 0)].x).toBe(0);
		expect(valuesByPositionHash[hashTo(0, 1)].o).toBe(0);
		expect(valuesByPositionHash[hashTo(0, 1)].x).toBe(0);
		expect(valuesByPositionHash[hashTo(0, 2)].o).toBe(0);
		expect(valuesByPositionHash[hashTo(0, 2)].x).toBe(dimensions.connectSize * 5);
		expect(valuesByPositionHash[hashTo(0, 3)].o).toBe(0);
		expect(valuesByPositionHash[hashTo(0, 3)].x).toBe(0);
		expect(valuesByPositionHash[hashTo(0, 4)].o).toBe(0);
		expect(valuesByPositionHash[hashTo(0, 4)].x).toBe(0);
		expect(valuesByPositionHash[hashTo(0, 5)].o).toBe(0);
		expect(valuesByPositionHash[hashTo(0, 5)].x).toBe(0);
		expect(valuesByPositionHash[hashTo(0, 6)].o).toBe(0);
		expect(valuesByPositionHash[hashTo(0, 6)].x).toBe(dimensions.connectSize * 5);
		expect(valuesByPositionHash[hashTo(0, 7)].o).toBe(0);
		expect(valuesByPositionHash[hashTo(0, 7)].x).toBe(0);
		expect(valuesByPositionHash[hashTo(0, 8)].o).toBe(0);
		expect(valuesByPositionHash[hashTo(0, 8)].x).toBe(0);
		expect(valuesByPositionHash[hashTo(0, 9)].o).toBe(0);
		expect(valuesByPositionHash[hashTo(0, 9)].x).toBe(0);

		// Cleanup
		masterSet.traversalSetAndChainsGroup = new Array();
	});

	test('Algorithm: Type3-TwoToWin, Taversal: Type2-V (3 [Global*])', () => {
		let algorithmType: AlgorithmType = AlgorithmType.TYPE3_TWOTOWIN,
			aMaxPrevious: number = dimensions.aMax,
			bMaxPrevious: number = dimensions.bMax,
			placementsByPositionHash: { [key: number]: boolean } = {}, // true is O
			traversalSetAndChainsGroup: TraversalSetAndChains[] = masterSet.traversalSetAndChainsGroup,
			values: WorkingDataValues = workingData.values,
			valuesByPositionHash: { [key: number]: { o: number; x: number } } = values.valuesByPositionHash;

		// Alter globals
		dimensions.aMax = 8;
		dimensions.bMax = 8;

		// Prepare placements
		placementsByPositionHash[hashTo(0, 0)] = false;
		placementsByPositionHash[hashTo(0, 1)] = false;
		placementsByPositionHash[hashTo(0, 2)] = false;
		placementsByPositionHash[hashTo(0, 6)] = false;
		placementsByPositionHash[hashTo(0, 7)] = false;
		placementsByPositionHash[hashTo(0, 8)] = false;
		workingData.placementsByPositionHash = placementsByPositionHash;
		// log('placementsByPositionHash', util.inspect(placementsByPositionHash, {showHidden: false, depth: null, colors: true}));

		// Generate chains
		traversalSetAndChainsGroup.push(TraversalEngine.getByType2V(dimensions, hashTo(0, 0), workingData));
		// log('traversalSetAndChains', util.inspect(traversalSetAndChainsGroup[0], {showHidden: false, depth: null, colors: true}));

		// Evaluate chains
		EvaluationLinearEngine.calc(dimensions, masterSet, workingData, algorithmType);
		// printGameboard();

		// Test values
		expect(values.valuesOMax).toBe(0);
		expect(values.valuesXMax).toBe(dimensions.connectSize * 5);
		expect(valuesByPositionHash[hashTo(0, 0)].o).toBe(0);
		expect(valuesByPositionHash[hashTo(0, 0)].x).toBe(0);
		expect(valuesByPositionHash[hashTo(0, 1)].o).toBe(0);
		expect(valuesByPositionHash[hashTo(0, 1)].x).toBe(0);
		expect(valuesByPositionHash[hashTo(0, 2)].o).toBe(0);
		expect(valuesByPositionHash[hashTo(0, 2)].x).toBe(0);
		expect(valuesByPositionHash[hashTo(0, 3)].o).toBe(0);
		expect(valuesByPositionHash[hashTo(0, 3)].x).toBe(0);
		expect(valuesByPositionHash[hashTo(0, 4)].o).toBe(0);
		expect(valuesByPositionHash[hashTo(0, 4)].x).toBe(dimensions.connectSize * 5);
		expect(valuesByPositionHash[hashTo(0, 5)].o).toBe(0);
		expect(valuesByPositionHash[hashTo(0, 5)].x).toBe(0);
		expect(valuesByPositionHash[hashTo(0, 6)].o).toBe(0);
		expect(valuesByPositionHash[hashTo(0, 6)].x).toBe(0);
		expect(valuesByPositionHash[hashTo(0, 7)].o).toBe(0);
		expect(valuesByPositionHash[hashTo(0, 7)].x).toBe(0);
		expect(valuesByPositionHash[hashTo(0, 8)].o).toBe(0);
		expect(valuesByPositionHash[hashTo(0, 8)].x).toBe(0);
		expect(valuesByPositionHash[hashTo(0, 9)].o).toBe(0);
		expect(valuesByPositionHash[hashTo(0, 9)].x).toBe(0);

		// Cleanup
		masterSet.traversalSetAndChainsGroup = new Array();

		// Restore globals
		dimensions.aMax = aMaxPrevious;
		dimensions.bMax = bMaxPrevious;
	});

	test('Algorithm: Type3-TwoToWin, Taversal: Type2-V (4)', () => {
		let algorithmType: AlgorithmType = AlgorithmType.TYPE3_TWOTOWIN,
			placementsByPositionHash: { [key: number]: boolean } = {}, // true is O
			traversalSetAndChainsGroup: TraversalSetAndChains[] = masterSet.traversalSetAndChainsGroup,
			values: WorkingDataValues = workingData.values,
			valuesByPositionHash: { [key: number]: { o: number; x: number } } = values.valuesByPositionHash;

		// Prepare placements
		placementsByPositionHash[hashTo(0, 1)] = false;
		placementsByPositionHash[hashTo(0, 2)] = false;
		placementsByPositionHash[hashTo(0, 3)] = false;
		workingData.placementsByPositionHash = placementsByPositionHash;
		// log('placementsByPositionHash', util.inspect(placementsByPositionHash, {showHidden: false, depth: null, colors: true}));

		// Generate chains
		traversalSetAndChainsGroup.push(TraversalEngine.getByType2V(dimensions, hashTo(0, 0), workingData));
		// log('traversalSetAndChains', util.inspect(traversalSetAndChainsGroup[0], {showHidden: false, depth: null, colors: true}));

		// Evaluate chains
		EvaluationLinearEngine.calc(dimensions, masterSet, workingData, algorithmType);
		// printGameboard();

		// Test values
		expect(values.valuesOMax).toBe(0);
		expect(values.valuesXMax).toBe(dimensions.connectSize * 5);
		expect(valuesByPositionHash[hashTo(0, 0)].o).toBe(0);
		expect(valuesByPositionHash[hashTo(0, 0)].x).toBe(0);
		expect(valuesByPositionHash[hashTo(0, 1)].o).toBe(0);
		expect(valuesByPositionHash[hashTo(0, 1)].x).toBe(0);
		expect(valuesByPositionHash[hashTo(0, 2)].o).toBe(0);
		expect(valuesByPositionHash[hashTo(0, 2)].x).toBe(0);
		expect(valuesByPositionHash[hashTo(0, 3)].o).toBe(0);
		expect(valuesByPositionHash[hashTo(0, 3)].x).toBe(0);
		expect(valuesByPositionHash[hashTo(0, 4)].o).toBe(0);
		expect(valuesByPositionHash[hashTo(0, 4)].x).toBe(dimensions.connectSize * 5);
		expect(valuesByPositionHash[hashTo(0, 5)].o).toBe(0);
		expect(valuesByPositionHash[hashTo(0, 5)].x).toBe(0);
		expect(valuesByPositionHash[hashTo(0, 6)].o).toBe(0);
		expect(valuesByPositionHash[hashTo(0, 6)].x).toBe(0);
		expect(valuesByPositionHash[hashTo(0, 7)].o).toBe(0);
		expect(valuesByPositionHash[hashTo(0, 7)].x).toBe(0);
		expect(valuesByPositionHash[hashTo(0, 8)].o).toBe(0);
		expect(valuesByPositionHash[hashTo(0, 8)].x).toBe(0);
		expect(valuesByPositionHash[hashTo(0, 9)].o).toBe(0);
		expect(valuesByPositionHash[hashTo(0, 9)].x).toBe(0);

		// Cleanup
		masterSet.traversalSetAndChainsGroup = new Array();
	});

	test('Algorithm: Type3-TwoToWin, Taversal: Type2-V (5)', () => {
		let algorithmType: AlgorithmType = AlgorithmType.TYPE3_TWOTOWIN,
			placementsByPositionHash: { [key: number]: boolean } = {}, // true is O
			traversalSetAndChainsGroup: TraversalSetAndChains[] = masterSet.traversalSetAndChainsGroup,
			values: WorkingDataValues = workingData.values,
			valuesByPositionHash: { [key: number]: { o: number; x: number } } = values.valuesByPositionHash;

		// Prepare placements
		placementsByPositionHash[hashTo(0, 1)] = false;
		placementsByPositionHash[hashTo(0, 2)] = false;
		placementsByPositionHash[hashTo(0, 3)] = false;
		workingData.placementsByPositionHash = placementsByPositionHash;
		// log('placementsByPositionHash', util.inspect(placementsByPositionHash, {showHidden: false, depth: null, colors: true}));

		// Generate chains
		traversalSetAndChainsGroup.push(TraversalEngine.getByType2V(dimensions, hashTo(0, 0), workingData));
		// log('traversalSetAndChains', util.inspect(traversalSetAndChainsGroup[0], {showHidden: false, depth: null, colors: true}));

		// Evaluate chains
		EvaluationLinearEngine.calc(dimensions, masterSet, workingData, algorithmType);
		// printGameboard();

		// Test values
		expect(values.valuesOMax).toBe(0);
		expect(values.valuesXMax).toBe(dimensions.connectSize * 5);
		expect(valuesByPositionHash[hashTo(0, 0)].o).toBe(0);
		expect(valuesByPositionHash[hashTo(0, 0)].x).toBe(0);
		expect(valuesByPositionHash[hashTo(0, 1)].o).toBe(0);
		expect(valuesByPositionHash[hashTo(0, 1)].x).toBe(0);
		expect(valuesByPositionHash[hashTo(0, 2)].o).toBe(0);
		expect(valuesByPositionHash[hashTo(0, 2)].x).toBe(0);
		expect(valuesByPositionHash[hashTo(0, 3)].o).toBe(0);
		expect(valuesByPositionHash[hashTo(0, 3)].x).toBe(0);
		expect(valuesByPositionHash[hashTo(0, 4)].o).toBe(0);
		expect(valuesByPositionHash[hashTo(0, 4)].x).toBe(dimensions.connectSize * 5);
		expect(valuesByPositionHash[hashTo(0, 5)].o).toBe(0);
		expect(valuesByPositionHash[hashTo(0, 5)].x).toBe(0);
		expect(valuesByPositionHash[hashTo(0, 6)].o).toBe(0);
		expect(valuesByPositionHash[hashTo(0, 6)].x).toBe(0);
		expect(valuesByPositionHash[hashTo(0, 7)].o).toBe(0);
		expect(valuesByPositionHash[hashTo(0, 7)].x).toBe(0);
		expect(valuesByPositionHash[hashTo(0, 8)].o).toBe(0);
		expect(valuesByPositionHash[hashTo(0, 8)].x).toBe(0);
		expect(valuesByPositionHash[hashTo(0, 9)].o).toBe(0);
		expect(valuesByPositionHash[hashTo(0, 9)].x).toBe(0);

		// Cleanup
		masterSet.traversalSetAndChainsGroup = new Array();
	});

	test('Algorithm: Type3-TwoToWin, Taversal: Type2-V (6)', () => {
		let algorithmType: AlgorithmType = AlgorithmType.TYPE3_TWOTOWIN,
			placementsByPositionHash: { [key: number]: boolean } = {}, // true is O
			traversalSetAndChainsGroup: TraversalSetAndChains[] = masterSet.traversalSetAndChainsGroup,
			values: WorkingDataValues = workingData.values,
			valuesByPositionHash: { [key: number]: { o: number; x: number } } = values.valuesByPositionHash;

		// Prepare placements
		placementsByPositionHash[hashTo(0, 6)] = false;
		placementsByPositionHash[hashTo(0, 7)] = false;
		placementsByPositionHash[hashTo(0, 8)] = false;
		workingData.placementsByPositionHash = placementsByPositionHash;
		// log('placementsByPositionHash', util.inspect(placementsByPositionHash, {showHidden: false, depth: null, colors: true}));

		// Generate chains
		traversalSetAndChainsGroup.push(TraversalEngine.getByType2V(dimensions, hashTo(0, 0), workingData));
		// log('traversalSetAndChains', util.inspect(traversalSetAndChainsGroup[0], {showHidden: false, depth: null, colors: true}));

		// Evaluate chains
		EvaluationLinearEngine.calc(dimensions, masterSet, workingData, algorithmType);
		// printGameboard();

		// Test values
		expect(values.valuesOMax).toBe(0);
		expect(values.valuesXMax).toBe(dimensions.connectSize * 5);
		expect(valuesByPositionHash[hashTo(0, 0)].o).toBe(0);
		expect(valuesByPositionHash[hashTo(0, 0)].x).toBe(0);
		expect(valuesByPositionHash[hashTo(0, 1)].o).toBe(0);
		expect(valuesByPositionHash[hashTo(0, 1)].x).toBe(0);
		expect(valuesByPositionHash[hashTo(0, 2)].o).toBe(0);
		expect(valuesByPositionHash[hashTo(0, 2)].x).toBe(0);
		expect(valuesByPositionHash[hashTo(0, 3)].o).toBe(0);
		expect(valuesByPositionHash[hashTo(0, 3)].x).toBe(0);
		expect(valuesByPositionHash[hashTo(0, 4)].o).toBe(0);
		expect(valuesByPositionHash[hashTo(0, 4)].x).toBe(0);
		expect(valuesByPositionHash[hashTo(0, 5)].o).toBe(0);
		expect(valuesByPositionHash[hashTo(0, 5)].x).toBe(dimensions.connectSize * 5);
		expect(valuesByPositionHash[hashTo(0, 6)].o).toBe(0);
		expect(valuesByPositionHash[hashTo(0, 6)].x).toBe(0);
		expect(valuesByPositionHash[hashTo(0, 7)].o).toBe(0);
		expect(valuesByPositionHash[hashTo(0, 7)].x).toBe(0);
		expect(valuesByPositionHash[hashTo(0, 8)].o).toBe(0);
		expect(valuesByPositionHash[hashTo(0, 8)].x).toBe(0);
		expect(valuesByPositionHash[hashTo(0, 9)].o).toBe(0);
		expect(valuesByPositionHash[hashTo(0, 9)].x).toBe(0);

		// Cleanup
		masterSet.traversalSetAndChainsGroup = new Array();
	});

	test('Algorithm: Type3-TwoToWin, Taversal: All', () => {
		let connectSize: number = dimensions.connectSize,
			placementsByPositionHash: { [key: number]: boolean } = {}, // true is O
			masterTraversalSetAndChains: MasterTraversalSetAndChains,
			values: WorkingDataValues = workingData.values;

		// Prepare placements
		placementsByPositionHash[hashTo(4, 3)] = false;
		placementsByPositionHash[hashTo(3, 4)] = false;
		placementsByPositionHash[hashTo(4, 4)] = false;
		placementsByPositionHash[hashTo(5, 4)] = false;
		placementsByPositionHash[hashTo(4, 5)] = false;
		placementsByPositionHash[hashTo(3, 6)] = false;
		workingData.placementsByPositionHash = placementsByPositionHash;

		// Generate chains
		masterTraversalSetAndChains = TraversalEngine.masterSet(dimensions, workingData);
		masterSet.traversalSetAndChainsGroup = masterTraversalSetAndChains.traversalSetAndChainsGroup;

		// Evaluate chains
		EvaluationLinearEngine.calc(dimensions, masterSet, workingData, AlgorithmType.TYPE3_TWOTOWIN);
		// printGameboard();

		// Test values
		expect(values.valuesOMax).toBe(0);
		expect(values.valuesXMax).toBe(connectSize * 5);

		expect(values.valuesByPositionHash[hashTo(4, 2)].x).toBe(connectSize * 5);
		expect(values.valuesByPositionHash[hashTo(6, 3)].x).toBe(connectSize * 5);
		expect(values.valuesByPositionHash[hashTo(2, 4)].x).toBe(connectSize * 5);
		expect(values.valuesByPositionHash[hashTo(6, 4)].x).toBe(connectSize * 5);
		expect(values.valuesByPositionHash[hashTo(4, 6)].x).toBe(connectSize * 5);
		expect(values.valuesByPositionHash[hashTo(2, 7)].x).toBe(connectSize * 5);

		// Cleanup
		masterSet.traversalSetAndChainsGroup = new Array();
	});

	test('Algorithm: Type4-SingleGap, Taversal: Type1-H', () => {
		let algorithmType: AlgorithmType = AlgorithmType.TYPE4_SINGLEGAP,
			placementsByPositionHash: { [key: number]: boolean } = {}, // true is O
			traversalSetAndChainsGroup: TraversalSetAndChains[] = masterSet.traversalSetAndChainsGroup,
			values: WorkingDataValues = workingData.values,
			valuesByPositionHash: { [key: number]: { o: number; x: number } } = values.valuesByPositionHash;

		// Prepare placements
		placementsByPositionHash[hashTo(1, 0)] = false;
		placementsByPositionHash[hashTo(3, 0)] = false;
		placementsByPositionHash[hashTo(5, 0)] = false;
		placementsByPositionHash[hashTo(8, 0)] = false;
		workingData.placementsByPositionHash = placementsByPositionHash;
		// log('placementsByPositionHash', util.inspect(placementsByPositionHash, {showHidden: false, depth: null, colors: true}));

		// Generate chains
		traversalSetAndChainsGroup.push(TraversalEngine.getByType1H(dimensions, hashTo(0, 0), workingData));
		// log('traversalSetAndChains', util.inspect(traversalSetAndChainsGroup[0], {showHidden: false, depth: null, colors: true}));

		// Evaluate chains
		EvaluationLinearEngine.calc(dimensions, masterSet, workingData, algorithmType);
		// printGameboard();

		// Test values
		expect(values.valuesOMax).toBe(0);
		expect(values.valuesXMax).toBe(1);
		expect(valuesByPositionHash[hashTo(0, 0)].o).toBe(0);
		expect(valuesByPositionHash[hashTo(0, 0)].x).toBe(0);
		expect(valuesByPositionHash[hashTo(1, 0)].o).toBe(0);
		expect(valuesByPositionHash[hashTo(1, 0)].x).toBe(0);
		expect(valuesByPositionHash[hashTo(2, 0)].o).toBe(0);
		expect(valuesByPositionHash[hashTo(2, 0)].x).toBe(1);
		expect(valuesByPositionHash[hashTo(3, 0)].o).toBe(0);
		expect(valuesByPositionHash[hashTo(3, 0)].x).toBe(0);
		expect(valuesByPositionHash[hashTo(4, 0)].o).toBe(0);
		expect(valuesByPositionHash[hashTo(4, 0)].x).toBe(1);
		expect(valuesByPositionHash[hashTo(5, 0)].o).toBe(0);
		expect(valuesByPositionHash[hashTo(5, 0)].x).toBe(0);
		expect(valuesByPositionHash[hashTo(6, 0)].o).toBe(0);
		expect(valuesByPositionHash[hashTo(6, 0)].x).toBe(0);
		expect(valuesByPositionHash[hashTo(7, 0)].o).toBe(0);
		expect(valuesByPositionHash[hashTo(7, 0)].x).toBe(0);
		expect(valuesByPositionHash[hashTo(8, 0)].o).toBe(0);
		expect(valuesByPositionHash[hashTo(8, 0)].x).toBe(0);
		expect(valuesByPositionHash[hashTo(9, 0)].o).toBe(0);
		expect(valuesByPositionHash[hashTo(9, 0)].x).toBe(0);

		// Cleanup
		masterSet.traversalSetAndChainsGroup = new Array();
	});

	test('Algorithm: Type5-Echos, Taversal: Type2-V', () => {
		let algorithmType: AlgorithmType = AlgorithmType.TYPE5_ECHOS,
			placementsByPositionHash: { [key: number]: boolean } = {}, // true is O
			traversalSetAndChainsGroup: TraversalSetAndChains[] = masterSet.traversalSetAndChainsGroup,
			values: WorkingDataValues = workingData.values,
			valuesByPositionHash: { [key: number]: { o: number; x: number } } = values.valuesByPositionHash;

		// Prepare placements
		placementsByPositionHash[hashTo(0, 1)] = false;
		workingData.placementsByPositionHash = placementsByPositionHash;
		// log('placementsByPositionHash', util.inspect(placementsByPositionHash, {showHidden: false, depth: null, colors: true}));

		// Generate chains
		traversalSetAndChainsGroup.push(TraversalEngine.getByType2V(dimensions, hashTo(0, 0), workingData));
		// log('traversalSetAndChains', util.inspect(traversalSetAndChainsGroup[0], {showHidden: false, depth: null, colors: true}));

		// Evaluate chains
		EvaluationLinearEngine.calc(dimensions, masterSet, workingData, algorithmType);
		// printGameboard();

		// Test values
		expect(values.valuesOMax).toBe(0);
		expect(values.valuesXMax).toBe(2);
		expect(valuesByPositionHash[hashTo(0, 0)].o).toBe(0);
		expect(valuesByPositionHash[hashTo(0, 0)].x).toBe(1);
		expect(valuesByPositionHash[hashTo(0, 1)].o).toBe(0);
		expect(valuesByPositionHash[hashTo(0, 1)].x).toBe(0);
		expect(valuesByPositionHash[hashTo(0, 2)].o).toBe(0);
		expect(valuesByPositionHash[hashTo(0, 2)].x).toBe(2);
		expect(valuesByPositionHash[hashTo(0, 3)].o).toBe(0);
		expect(valuesByPositionHash[hashTo(0, 3)].x).toBe(0);

		// Cleanup
		masterSet.traversalSetAndChainsGroup = new Array();
	});

	test('Algorithm: Type5-Echos, Taversal: Type2-V (2)', () => {
		let algorithmType: AlgorithmType = AlgorithmType.TYPE5_ECHOS,
			placementsByPositionHash: { [key: number]: boolean } = {}, // true is O
			traversalSetAndChainsGroup: TraversalSetAndChains[] = masterSet.traversalSetAndChainsGroup,
			values: WorkingDataValues = workingData.values,
			valuesByPositionHash: { [key: number]: { o: number; x: number } } = values.valuesByPositionHash;

		// Prepare placements
		placementsByPositionHash[hashTo(0, 1)] = false;
		placementsByPositionHash[hashTo(0, 5)] = false;
		placementsByPositionHash[hashTo(0, 7)] = false;
		placementsByPositionHash[hashTo(0, 9)] = false;
		workingData.placementsByPositionHash = placementsByPositionHash;
		// log('placementsByPositionHash', util.inspect(placementsByPositionHash, {showHidden: false, depth: null, colors: true}));

		// Generate chains
		traversalSetAndChainsGroup.push(TraversalEngine.getByType2V(dimensions, hashTo(0, 0), workingData));
		// log('traversalSetAndChains', util.inspect(traversalSetAndChainsGroup[0], {showHidden: false, depth: null, colors: true}));

		// Evaluate chains
		EvaluationLinearEngine.calc(dimensions, masterSet, workingData, algorithmType);
		// printGameboard();

		// Test values
		expect(values.valuesOMax).toBe(0);
		expect(values.valuesXMax).toBe(6); // would be 7 with Algo3
		expect(valuesByPositionHash[hashTo(0, 0)].o).toBe(0);
		expect(valuesByPositionHash[hashTo(0, 0)].x).toBe(1);
		expect(valuesByPositionHash[hashTo(0, 1)].o).toBe(0);
		expect(valuesByPositionHash[hashTo(0, 1)].x).toBe(0);
		expect(valuesByPositionHash[hashTo(0, 2)].o).toBe(0);
		expect(valuesByPositionHash[hashTo(0, 2)].x).toBe(2);
		expect(valuesByPositionHash[hashTo(0, 3)].o).toBe(0);
		expect(valuesByPositionHash[hashTo(0, 3)].x).toBe(0);
		expect(valuesByPositionHash[hashTo(0, 4)].o).toBe(0);
		expect(valuesByPositionHash[hashTo(0, 4)].x).toBe(3);
		expect(valuesByPositionHash[hashTo(0, 5)].o).toBe(0);
		expect(valuesByPositionHash[hashTo(0, 5)].x).toBe(0);
		expect(valuesByPositionHash[hashTo(0, 6)].o).toBe(0);
		expect(valuesByPositionHash[hashTo(0, 6)].x).toBe(6); // would be 7 with Algo3
		expect(valuesByPositionHash[hashTo(0, 7)].o).toBe(0);
		expect(valuesByPositionHash[hashTo(0, 7)].x).toBe(0);
		expect(valuesByPositionHash[hashTo(0, 8)].o).toBe(0);
		expect(valuesByPositionHash[hashTo(0, 8)].x).toBe(5); // would be 6 with Algo3
		expect(valuesByPositionHash[hashTo(0, 9)].o).toBe(0);
		expect(valuesByPositionHash[hashTo(0, 9)].x).toBe(0);

		// Cleanup
		masterSet.traversalSetAndChainsGroup = new Array();
	});

	test('Algorithm: Type5-Echos, Taversal: Type2-V (3)', () => {
		let algorithmType: AlgorithmType = AlgorithmType.TYPE5_ECHOS,
			placementsByPositionHash: { [key: number]: boolean } = {}, // true is O
			traversalSetAndChainsGroup: TraversalSetAndChains[] = masterSet.traversalSetAndChainsGroup,
			values: WorkingDataValues = workingData.values,
			valuesByPositionHash: { [key: number]: { o: number; x: number } } = values.valuesByPositionHash;

		// Prepare placements
		placementsByPositionHash[hashTo(1, 3)] = false;
		placementsByPositionHash[hashTo(1, 4)] = false;
		placementsByPositionHash[hashTo(1, 8)] = false;
		placementsByPositionHash[hashTo(1, 9)] = false;
		workingData.placementsByPositionHash = placementsByPositionHash;
		// log('placementsByPositionHash', util.inspect(placementsByPositionHash, {showHidden: false, depth: null, colors: true}));

		// Generate chains
		traversalSetAndChainsGroup.push(TraversalEngine.getByType2V(dimensions, hashTo(1, 0), workingData));
		// log('traversalSetAndChains', util.inspect(traversalSetAndChainsGroup[0], {showHidden: false, depth: null, colors: true}));

		// Evaluate chains
		EvaluationLinearEngine.calc(dimensions, masterSet, workingData, algorithmType);
		// printGameboard();

		// Test values
		expect(values.valuesOMax).toBe(0);
		expect(values.valuesXMax).toBe(5);
		expect(valuesByPositionHash[hashTo(1, 0)].o).toBe(0);
		expect(valuesByPositionHash[hashTo(1, 0)].x).toBe(0);
		expect(valuesByPositionHash[hashTo(1, 1)].o).toBe(0);
		expect(valuesByPositionHash[hashTo(1, 1)].x).toBe(3);
		expect(valuesByPositionHash[hashTo(1, 2)].o).toBe(0);
		expect(valuesByPositionHash[hashTo(1, 2)].x).toBe(4);
		expect(valuesByPositionHash[hashTo(1, 3)].o).toBe(0);
		expect(valuesByPositionHash[hashTo(1, 3)].x).toBe(0);
		expect(valuesByPositionHash[hashTo(1, 4)].o).toBe(0);
		expect(valuesByPositionHash[hashTo(1, 4)].x).toBe(0);
		expect(valuesByPositionHash[hashTo(1, 5)].o).toBe(0);
		expect(valuesByPositionHash[hashTo(1, 5)].x).toBe(4);
		expect(valuesByPositionHash[hashTo(1, 6)].o).toBe(0);
		expect(valuesByPositionHash[hashTo(1, 6)].x).toBe(5);
		expect(valuesByPositionHash[hashTo(1, 7)].o).toBe(0);
		expect(valuesByPositionHash[hashTo(1, 7)].x).toBe(3);
		expect(valuesByPositionHash[hashTo(1, 8)].o).toBe(0);
		expect(valuesByPositionHash[hashTo(1, 8)].x).toBe(0);
		expect(valuesByPositionHash[hashTo(1, 9)].o).toBe(0);
		expect(valuesByPositionHash[hashTo(1, 9)].x).toBe(0);

		// Cleanup
		masterSet.traversalSetAndChainsGroup = new Array();
	});

	test('Algorithm: Type5-Echos, Taversal: Type2-V (4)', () => {
		let algorithmType: AlgorithmType = AlgorithmType.TYPE5_ECHOS,
			placementsByPositionHash: { [key: number]: boolean } = {}, // true is O
			traversalSetAndChainsGroup: TraversalSetAndChains[] = masterSet.traversalSetAndChainsGroup,
			values: WorkingDataValues = workingData.values,
			valuesByPositionHash: { [key: number]: { o: number; x: number } } = values.valuesByPositionHash;

		// Prepare placements
		placementsByPositionHash[hashTo(2, 1)] = false;
		placementsByPositionHash[hashTo(2, 2)] = false;
		placementsByPositionHash[hashTo(2, 4)] = false;
		placementsByPositionHash[hashTo(2, 6)] = false;
		placementsByPositionHash[hashTo(2, 8)] = false;
		placementsByPositionHash[hashTo(2, 9)] = false;
		workingData.placementsByPositionHash = placementsByPositionHash;
		// log('placementsByPositionHash', util.inspect(placementsByPositionHash, {showHidden: false, depth: null, colors: true}));

		// Generate chains
		traversalSetAndChainsGroup.push(TraversalEngine.getByType2V(dimensions, hashTo(2, 0), workingData));
		// log('traversalSetAndChains', util.inspect(traversalSetAndChainsGroup[0], {showHidden: false, depth: null, colors: true}));

		// Evaluate chains
		EvaluationLinearEngine.calc(dimensions, masterSet, workingData, algorithmType);
		// printGameboard();

		// Test values
		expect(values.valuesOMax).toBe(0);
		expect(values.valuesXMax).toBe(6);
		expect(valuesByPositionHash[hashTo(2, 0)].o).toBe(0);
		expect(valuesByPositionHash[hashTo(2, 0)].x).toBe(2);
		expect(valuesByPositionHash[hashTo(2, 1)].o).toBe(0);
		expect(valuesByPositionHash[hashTo(2, 1)].x).toBe(0);
		expect(valuesByPositionHash[hashTo(2, 2)].o).toBe(0);
		expect(valuesByPositionHash[hashTo(2, 2)].x).toBe(0);
		expect(valuesByPositionHash[hashTo(2, 3)].o).toBe(0);
		expect(valuesByPositionHash[hashTo(2, 3)].x).toBe(6);
		expect(valuesByPositionHash[hashTo(2, 4)].o).toBe(0);
		expect(valuesByPositionHash[hashTo(2, 4)].x).toBe(0);
		expect(valuesByPositionHash[hashTo(2, 5)].o).toBe(0);
		expect(valuesByPositionHash[hashTo(2, 5)].x).toBe(6);
		expect(valuesByPositionHash[hashTo(2, 6)].o).toBe(0);
		expect(valuesByPositionHash[hashTo(2, 6)].x).toBe(0);
		expect(valuesByPositionHash[hashTo(2, 7)].o).toBe(0);
		expect(valuesByPositionHash[hashTo(2, 7)].x).toBe(6);
		expect(valuesByPositionHash[hashTo(2, 8)].o).toBe(0);
		expect(valuesByPositionHash[hashTo(2, 8)].x).toBe(0);
		expect(valuesByPositionHash[hashTo(2, 9)].o).toBe(0);
		expect(valuesByPositionHash[hashTo(2, 9)].x).toBe(0);

		// Cleanup
		masterSet.traversalSetAndChainsGroup = new Array();
	});

	test('Algorithm: Type5-Echos, Taversal: Type2-V (5)', () => {
		let algorithmType: AlgorithmType = AlgorithmType.TYPE5_ECHOS,
			placementsByPositionHash: { [key: number]: boolean } = {}, // true is O
			traversalSetAndChainsGroup: TraversalSetAndChains[] = masterSet.traversalSetAndChainsGroup,
			values: WorkingDataValues = workingData.values,
			valuesByPositionHash: { [key: number]: { o: number; x: number } } = values.valuesByPositionHash;

		// Prepare placements
		placementsByPositionHash[hashTo(3, 0)] = false;
		placementsByPositionHash[hashTo(3, 1)] = false;
		placementsByPositionHash[hashTo(3, 3)] = false;
		placementsByPositionHash[hashTo(3, 4)] = false;
		placementsByPositionHash[hashTo(3, 7)] = false;
		placementsByPositionHash[hashTo(3, 8)] = false;
		workingData.placementsByPositionHash = placementsByPositionHash;
		// log('placementsByPositionHash', util.inspect(placementsByPositionHash, {showHidden: false, depth: null, colors: true}));

		// Generate chains
		traversalSetAndChainsGroup.push(TraversalEngine.getByType2V(dimensions, hashTo(3, 0), workingData));
		// log('traversalSetAndChains', util.inspect(traversalSetAndChainsGroup[0], {showHidden: false, depth: null, colors: true}));

		// Evaluate chains
		EvaluationLinearEngine.calc(dimensions, masterSet, workingData, algorithmType);
		// printGameboard();

		// Test values
		expect(values.valuesOMax).toBe(0);
		expect(values.valuesXMax).toBe(7);
		expect(valuesByPositionHash[hashTo(3, 0)].o).toBe(0);
		expect(valuesByPositionHash[hashTo(3, 0)].x).toBe(0);
		expect(valuesByPositionHash[hashTo(3, 1)].o).toBe(0);
		expect(valuesByPositionHash[hashTo(3, 1)].x).toBe(0);
		expect(valuesByPositionHash[hashTo(3, 2)].o).toBe(0);
		expect(valuesByPositionHash[hashTo(3, 2)].x).toBe(7);
		expect(valuesByPositionHash[hashTo(3, 3)].o).toBe(0);
		expect(valuesByPositionHash[hashTo(3, 3)].x).toBe(0);
		expect(valuesByPositionHash[hashTo(3, 4)].o).toBe(0);
		expect(valuesByPositionHash[hashTo(3, 4)].x).toBe(0);
		expect(valuesByPositionHash[hashTo(3, 5)].o).toBe(0);
		expect(valuesByPositionHash[hashTo(3, 5)].x).toBe(6);
		expect(valuesByPositionHash[hashTo(3, 6)].o).toBe(0);
		expect(valuesByPositionHash[hashTo(3, 6)].x).toBe(6);
		expect(valuesByPositionHash[hashTo(3, 7)].o).toBe(0);
		expect(valuesByPositionHash[hashTo(3, 7)].x).toBe(0);
		expect(valuesByPositionHash[hashTo(3, 8)].o).toBe(0);
		expect(valuesByPositionHash[hashTo(3, 8)].x).toBe(0);
		expect(valuesByPositionHash[hashTo(3, 9)].o).toBe(0);
		expect(valuesByPositionHash[hashTo(3, 9)].x).toBe(2);

		// Cleanup
		masterSet.traversalSetAndChainsGroup = new Array();
	});
});
