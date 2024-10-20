/**
 * @author tknight-dev
 */

import { GameEngine } from './engine/game.engine';

self.onmessage = (event: MessageEvent) => {
	let aMax: number = event.data.aMax,
		amount: number = 0,
		amountEffective: number = event.data.amountEffective,
		bMax: number = event.data.bMax,
		connectSize: number = event.data.connectSize,
		duationInMS: number = 30,
		formatCSV: number = event.data.formatCSV,
		gameEngine: GameEngine = new GameEngine(),
		skillO: number = event.data.skillO,
		skillOEngineAIML: boolean = event.data.skillOEngineAIML,
		skillOShuffle: boolean = event.data.skillOShuffle,
		skillX: number = event.data.skillX,
		skillXEngineAIML: boolean = event.data.skillXEngineAIML,
		skillXShuffle: boolean = event.data.skillXShuffle,
		threadId: number = event.data.threadId;

	// Set dumby callbacks (never called)
	gameEngine.setCallbackGameOver((oWon: boolean, winningPostionHashes: number[]) => {
		console.log('Thread-' + threadId + ': game over, post results');
		amount++;
		// self.postMessage({
		// 	value: '42',
		// });
	});
	gameEngine.setCallbackPlace(() => console.error('Thread-' + threadId + ': callback place triggeered'));

	for (let i = 0; i < amountEffective; i++) {
		// Use promises to pause here until the game over callback is used
		gameEngine.initialize(
			aMax,
			bMax,
			connectSize,
			skillOShuffle ? Math.floor(Math.random() * 10) + 1 : skillO,
			skillOEngineAIML,
			skillXShuffle ? Math.floor(Math.random() * 10) + 1 : skillX,
			skillXEngineAIML,
		);

		// TODO delete me
		setTimeout(() => {
			self.postMessage({
				amount: i + 1,
				amountEffective: amountEffective,
				data: formatCSV ? 'csv' : {},
				duationInMS: duationInMS,
				threadId: threadId,
			});
		}, 3000);
	}
};
