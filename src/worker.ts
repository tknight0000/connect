import { GameEngine } from './game/game.engine';

self.onmessage = (event: MessageEvent) => {
	let aMax: number = event.data.aMax,
		amount: number = event.data.amount,
		bMax: number = event.data.bMax,
		connectSize: number = event.data.connectSize,
		gameEngine: GameEngine = new GameEngine(),
		skill: number = event.data.skill,
		skillRandom: boolean = event.data.skillRandom,
		threadNumber: number = event.data.threadNumber;

	console.log('DBGenThread-' + threadNumber, aMax, amount, bMax, connectSize, skill);

	// Set dumby callbacks (never called)
	gameEngine.setCallbackGameOver(() => {
		console.log('DBGenThread-' + threadNumber + ': game over, post results');
		// self.postMessage({
		// 	value: '42',
		// });
	});
	gameEngine.setCallbackPlace(() => console.error('DBGenThread-' + threadNumber + ': callback place triggeered'));

	for (let i = 0; i < amount; i++) {
		gameEngine.initialize(aMax, bMax, connectSize, false, skillRandom ? Math.floor(Math.random() * 10) + 1 : skill);

		// TODO delete me
		self.postMessage({
			value: 'data-record-here',
		});
	}
};
