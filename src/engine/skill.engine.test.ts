/**
 * @author tknight-dev
 */

const util = require('util');
import { log } from 'console';
import { SkillEngine } from './skill.engine';

let hashTo: (a: number, b: number) => number = (a: number, b: number) => ((a & 0xff) << 8) | (b & 0xff);

describe('GameEngine: Skill', () => {
	test('Place First', () => {
		// Generate positionHash
		let positionHash: number;

		// Board size 10x10
		for (let i = 0; i < 300; i++) {
			// (.3e-38)% chance of missing a bad result
			positionHash = SkillEngine.placeFirst({ aMax: 9, bMax: 9, connectSize: 5 }, 5, <any>{});
			expect([hashTo(4, 4), hashTo(4, 5), hashTo(5, 4), hashTo(5, 5)]).toContain(positionHash);
		}

		// Board size 9x10
		for (let i = 0; i < 100; i++) {
			// (.7e-31)% chance of missing a bad result
			positionHash = SkillEngine.placeFirst({ aMax: 8, bMax: 9, connectSize: 5 }, 5, <any>{});
			expect([hashTo(4, 4), hashTo(4, 5)]).toContain(positionHash);
		}

		// Board size 10x9
		for (let i = 0; i < 100; i++) {
			// (.7e-31)% chance of missing a bad result
			positionHash = SkillEngine.placeFirst({ aMax: 9, bMax: 8, connectSize: 5 }, 5, <any>{});
			expect([hashTo(4, 4), hashTo(5, 4)]).toContain(positionHash);
		}

		// Board size 9x9
		positionHash = SkillEngine.placeFirst({ aMax: 8, bMax: 8, connectSize: 5 }, 5, <any>{});
		expect([hashTo(4, 4)]).toContain(positionHash);
	});
});
