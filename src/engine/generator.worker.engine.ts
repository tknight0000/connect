/**
 * @author tknight-dev
 */

import { GameEngine, HistoryReport, HistoryReportInstance } from './game.engine';

self.onmessage = (event: MessageEvent) => {
	let aMax: number = event.data.aMax,
		amount: number = 0,
		amountEffective: number = event.data.amountEffective,
		bMax: number = event.data.bMax,
		connectSize: number = event.data.connectSize,
		dataCSV: string,
		dataJSON: HistoryReportInstance,
		duationInMS: number = 30,
		formatCSV: number = event.data.formatCSV,
		gameEngine: GameEngine = new GameEngine(),
		skillO: number = event.data.skillO,
		skillOEngineAIML: boolean = event.data.skillOEngineAIML,
		skillOShuffle: boolean = event.data.skillOShuffle,
		skillX: number = event.data.skillX,
		skillXEngineAIML: boolean = event.data.skillXEngineAIML,
		skillXShuffle: boolean = event.data.skillXShuffle,
		threadId: number = event.data.threadId,
		timestamp: number;

	// Set dumby callbacks (never called)
	gameEngine.setCallbackGameOver(
		(historyByPositionHash: number[], oWon: boolean | null, skillO: number, skillX: number, winningPostionHashes: number[] | undefined) => {
			amount++;
			if (formatCSV) {
				if (skillOEngineAIML) {
					skillO = 0;
				}
				if (skillXEngineAIML) {
					skillX = 0;
				}
				dataCSV = `${skillO}${skillX}${oWon !== null ? ':' : '!'}${historyByPositionHash.join(',')};`;
			} else {
				dataJSON = {
					h: historyByPositionHash,
					o: skillO,
					x: skillX,
					w: oWon,
				};
			}

			// Post data
			self.postMessage({
				amount: amount,
				amountEffective: amountEffective,
				data: formatCSV ? dataCSV : dataJSON,
				duationInMS: new Date().getTime() - timestamp,
				threadId: threadId,
			});
		},
	);
	gameEngine.setCallbackPlace(() => console.error('Thread-' + threadId + ': callback place triggered'));

	for (let i = 0; i < amountEffective; i++) {
		timestamp = new Date().getTime();
		gameEngine.initialize(
			aMax,
			bMax,
			connectSize,
			true,
			skillOShuffle ? GameEngine.getSkillRandom() : skillO,
			skillOEngineAIML,
			skillXShuffle ? GameEngine.getSkillRandom() : skillX,
			skillXEngineAIML,
		);
	}
};
