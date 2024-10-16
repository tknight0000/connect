export class GameEngine {
	private aMax: number = 0;
	private bMax: number = 0;
	private callbackGameOver: ((xWon: boolean) => void) | undefined;
	private callbackPlace: ((positionHash: number) => void) | undefined;
	private human: boolean = false;

	// TODO, every available position needs to be tracked by their value. This allows variable skills and selections.
	private mostValuableO: { positionHash: number; value: number } = { positionHash: 0, value: 0 };
	private mostValuableX: { positionHash: number; value: number } = { positionHash: 0, value: 0 };
	private mostValuable: { positionHash: number; value: number } = { positionHash: 0, value: 0 };

	private placementsByPositionHash: { [key: number]: boolean } = {}; // true is O
	private skill: number = 10;
	private valuesByPositionHash: { [key: number]: { o: number; x: number } } = {};

	public initialize(aMax: number, bMax: number, connectSize: number, human: boolean, skill: number): void {
		let t = this,
			valuesByPositionHash: any = {};

		t.aMax = aMax;
		t.bMax = bMax;
		t.human = human;
		t.placementsByPositionHash = <any>new Object();
		t.skill = skill;

		for (let a = 0; a < aMax; a++) {
			for (let b = 0; b < bMax; b++) {
				valuesByPositionHash[((a & 0xff) << 8) | (b & 0xff)] = { o: 0, x: 0 };
			}
		}
		t.valuesByPositionHash = valuesByPositionHash;

		if (!t.callbackGameOver) {
			console.warn('GameEngine > initialize: no game over callback set');
		}
		if (!t.callbackPlace) {
			console.warn('GameEngine > initialize: no placement callback set');
		}
	}

	/**
	 * Let the engine know where the human has placed their piece
	 */
	public place(positionHash: number): boolean {
		let t = this;

		if (!t.human) {
			console.error('GameEngine > place: human placements not configured');
			return false;
		} else if (t.placementsByPositionHash[positionHash]) {
			console.error('GameEngine > place: placement already used');
			return false;
		}

		console.log('GameEngine > place: TODO');

		if (t.callbackPlace) {
			t.callbackPlace(42069);
		} else {
			console.error('GameEngine > place: no placement callback set');
		}

		return true;
	}

	/**
	 * @param callbackGameOver - called when the game has ended
	 */
	public setCallbackGameOver(callbackGameOver: (xWon: boolean) => void): void {
		this.callbackGameOver = callbackGameOver;
	}

	/**
	 * @param callbackPlace - called when the computer has placed a piece
	 */
	public setCallbackPlace(callbackPlace: (positionHash: number) => void): void {
		this.callbackPlace = callbackPlace;
	}
}
