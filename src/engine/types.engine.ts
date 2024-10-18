/**
 * @author tknight-dev
 */

export type Dimensions = {
	aMax: number;
	bMax: number;
	connectSize: number;
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
	positionHashesByValues: { [key: number]: number[] };
	values: WorkingDataValues;
};

export type WorkingDataValues = {
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
