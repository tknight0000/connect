/**
 * @author tknight-dev
 */

import { GameEngine } from './game/game.engine';

self.onmessage = (event: MessageEvent) => {
	let aMax: number = event.data.aMax,
		amount: number = 0,
		amountEffective: number = event.data.amountEffective,
		bMax: number = event.data.bMax,
		connectSize: number = event.data.connectSize,
		duationInMS: number = 30,
		formatCSV: number = event.data.formatCSV,
		gameEngine: GameEngine = new GameEngine(),
		skill1: number = event.data.skill1,
		skill1EngineAIML: boolean = event.data.skill1EngineAIML,
		skill1Shuffle: boolean = event.data.skill1Shuffle,
		skill2: number = event.data.skill2,
		skill2EngineAIML: boolean = event.data.skill2EngineAIML,
		skill2Shuffle: boolean = event.data.skill2Shuffle,
		threadId: number = event.data.threadId;

	// Set dumby callbacks (never called)
	gameEngine.setCallbackGameOver(() => {
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
			skill1Shuffle ? Math.floor(Math.random() * 10) + 1 : skill1,
			skill1EngineAIML,
			skill2Shuffle ? Math.floor(Math.random() * 10) + 1 : skill2,
			skill2EngineAIML,
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
