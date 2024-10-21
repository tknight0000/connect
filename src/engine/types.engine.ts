/**
 * @author tknight-dev
 */

export enum AlgorithmType {
	TYPE0_EVERYBODY,
	TYPE1_VIABILITY,
	TYPE2_ONETOWIN,
	TYPE3_TWOTOWIN,
	TYPE4_SINGLEGAP,
	TYPE5_ECHOS,
}

export type Dimensions = {
	aMax: number;
	bMax: number;
	connectSize: number;
};

export type HistoryReport = {
	drawsPercentage: number;
	games: HistoryReportInstance[];
	skillOEngineAIML: boolean;
	skillXEngineAIML: boolean;
	oWinPercentage: number;
	xWinPercentage: number;
};

export type HistoryReportInstance = {
	h: number[]; // if length odd then x won
	o: number;
	x: number;
	w: boolean | null; // true is o won, null is a draw
};

export type MasterTraversalSetAndChains = {
	traversalSetAndChainsGroup: TraversalSetAndChains[];
	winning: boolean;
	winningO: boolean | undefined;
	winningPositionHashes: number[] | undefined;
};

export type TraversalChain = {
	o: boolean;
	placement: TraversalChainPlacement;
};

export type TraversalChainPlacement = {
	cells: number[]; // positionHash[]
	gapAfter: number;
	gapBefore: number;
	index: number;
};

export type TraversalSetAndChains = {
	chains: TraversalChain[];
	set: number[]; // positionHash[]
	type: TraversalType;
	winning: boolean;
	winningChains: number[] | undefined; // array of chain indices
};

export enum TraversalType {
	TYPE1_H, // Horizontal, left to right
	TYPE2_V, // Vertical, top to bottom
	TYPE3_D, // Down, top-left to bottom-right
	TYPE4_U, // Up, bottom-left to top-right
}

export type WorkingData = {
	placementsAvailableByPositionHash: { [key: number]: null };
	placementsByPositionHash: { [key: number]: boolean }; // true is O
	positionHashesByValues: WorkingDataPositionsByValues;
	values: WorkingDataValues;
};

export type WorkingDataPositionsByValues = {
	data: {
		o: { [key: number]: number[] };
		sum: { [key: number]: number[] };
		x: { [key: number]: number[] };
	};
	max: number;
	min: number;
};

export type WorkingDataValues = {
	valuesByPositionHash: { [key: number]: { o: number; x: number } };
	valuesOMax: number;
	valuesXMax: number;
};
