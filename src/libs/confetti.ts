/**
 * @author Nicholas Suski - https://www.suskitech.org/code/confetti/
 *
 * Converted to TypeScript, modularized, and slightly shuffled things around
 *
 * @author tknight-dev
 */

export class Confetti {
	//-----------Var Inits--------------
	private canvas: HTMLCanvasElement;
	private static readonly colors: { front: string; back: string }[] = [
		{ front: 'red', back: 'darkred' },
		{ front: 'green', back: 'darkgreen' },
		{ front: 'blue', back: 'darkblue' },
		{ front: 'yellow', back: 'darkyellow' },
		{ front: 'orange', back: 'darkorange' },
		{ front: 'pink', back: 'darkpink' },
		{ front: 'purple', back: 'darkpurple' },
		{ front: 'turquoise', back: 'darkturquoise' },
	];
	private confetti: any[] = [];
	private static readonly confettiCount: number = 225;
	private static readonly drag: number = 0.1;
	private static readonly gravity: number = 0.5;
	private static readonly terminalVelocity: number = 5;
	private ctx: any;
	private cx: number;
	private cy: number;

	constructor(canvas: HTMLCanvasElement) {
		let t = this,
			ctx: any = canvas.getContext('2d');

		//-----------Var Inits--------------
		t.canvas = canvas;
		t.ctx = ctx;
		canvas.width = window.innerWidth;
		canvas.height = window.innerHeight;
		t.cx = ctx.canvas.width / 2;
		t.cy = ctx.canvas.height / 2;

		//----------Resize----------
		window.addEventListener('resize', () => {
			t.resizeCanvas();
		});
	}

	//---------Execution--------
	public trigger(): void {
		let t = this;

		t.confetti = new Array();
		t.initConfetti();
		t.render();
	}

	//-----------Functions--------------
	private initConfetti(): void {
		let t = this,
			canvas: HTMLCanvasElement = t.canvas,
			colors: { front: string; back: string }[] = Confetti.colors,
			confetti: any[] = t.confetti,
			confettiCount: number = Confetti.confettiCount,
			randomRange: (min: number, max: number) => number = t.randomRange;

		for (let i = 0; i < confettiCount; i++) {
			confetti.push({
				color: colors[Math.floor(randomRange(0, colors.length))],
				dimensions: {
					x: randomRange(10, 20),
					y: randomRange(10, 30),
				},

				position: {
					x: randomRange(0, canvas.width),
					y: canvas.height - 1,
				},

				rotation: randomRange(0, 2 * Math.PI),
				scale: {
					x: 1,
					y: 1,
				},

				velocity: {
					x: randomRange(-25, 25),
					y: randomRange(0, -50),
				},
			});
		}
	}

	private randomRange(min: number, max: number): number {
		return Math.random() * (max - min) + min;
	}

	private resizeCanvas(): void {
		let t = this;

		t.canvas.width = window.innerWidth;
		t.canvas.height = window.innerHeight;
		t.cx = t.ctx.canvas.width / 2;
		t.cy = t.ctx.canvas.height / 2;
	}

	//---------Render-----------
	private render(): void {
		let t = this,
			canvas: HTMLCanvasElement = t.canvas,
			colors: { front: string; back: string }[] = Confetti.colors,
			confetti: any[] = t.confetti,
			confettiCount: number = Confetti.confettiCount,
			ctx: any = t.ctx,
			height: number,
			randomRange: (min: number, max: number) => number = t.randomRange,
			width: number;

		ctx.clearRect(0, 0, canvas.width, canvas.height);

		confetti.forEach((confetto, index) => {
			width = confetto.dimensions.x * confetto.scale.x;
			height = confetto.dimensions.y * confetto.scale.y;

			// Move canvas to position and rotate
			ctx.translate(confetto.position.x, confetto.position.y);
			ctx.rotate(confetto.rotation);

			// Apply forces to velocity
			confetto.velocity.x -= confetto.velocity.x * Confetti.drag;
			confetto.velocity.y = Math.min(confetto.velocity.y + Confetti.gravity, Confetti.terminalVelocity);
			confetto.velocity.x += Math.random() > 0.5 ? Math.random() : -Math.random();

			// Set position
			confetto.position.x += confetto.velocity.x;
			confetto.position.y += confetto.velocity.y;

			// Delete confetti when out of frame
			if (confetto.position.y >= canvas.height) confetti.splice(index, 1);

			// Loop confetto x position
			if (confetto.position.x > canvas.width) confetto.position.x = 0;
			if (confetto.position.x < 0) confetto.position.x = canvas.width;

			// Spin confetto by scaling y
			confetto.scale.y = Math.cos(confetto.position.y * 0.1);
			ctx.fillStyle = confetto.scale.y > 0 ? confetto.color.front : confetto.color.back;

			// Draw confetto
			ctx.fillRect(-width / 2, -height / 2, width, height);

			// Reset transform matrix
			ctx.setTransform(1, 0, 0, 1, 0, 0);
		});

		window.requestAnimationFrame(t.render.bind(t));
	}
}
