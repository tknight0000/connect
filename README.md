# How To Play

-	Open the `connect.html` file from a website using your web browser. To run the app locally see the `Build` section.
	-	Start clicking on the gameboard!
-	To modify game settings just click `Settings`
	-	Skill is ranged between `1` and `5`
		-	`1` is random placement
		-	`2-4` allows for deviations from the best position by a specific percentage, when applicable
			-	`2` is `75%` deviation
			-	`3` is `50%` deviation
			-	`4` is `25%` deviation
		-	`5` is best placement or `0%` deviation

# Cool Stats

The following statistics were derived from 1,000,000 computer vs computer games at expert difficulty. 

-	Games Drawn: `15.92%`
-	O Wins: `39.84%`
-	X Wins: `60.16%`

To provide the statistics above, it took ~6 minutes for 8 threads to individually generate 125,000 games each at an average of 2.94 ms/game. See the `How To Generate AI/ML Datasets For Training` section to learn how to generate your own datesets for statistical analysis and AI/ML training!

# Build

### `Node.js` is required to build this app [nodejs.org](https://nodejs.org)

Output files from the build processes are stored in the `dist` directory

## All
-	`npm install` to download the dependencies to your `node_modules` directory

## Dev
-	This is for active coding/development
-	`npm run dev` to watch for code changes and live-reload browser if changed
-	`npm run test-dev` to watch for code changes and re-run unit tests [Jest](https://jestjs.io) if changed
	-	Leverage the `printGameboard(displayOPieces?: boolean, note?: string)` function to visualize the evaluations in the command line
		-	```
			*title-here*
			   - *note-here*
			(x)  A0   A1   A2   A3   A4   A5   A6   A7   A8   A9
			B0 [   ][   ][   ][   ][   ][   ][   ][   ][   ][   ]
			B1 [   ][   ][   ][   ][   ][   ][   ][   ][   ][   ]
			B2 [   ][   ][   ][   ][ 25][   ][   ][   ][   ][   ]
			B3 [   ][   ][   ][   ][ X ][   ][ 25][   ][   ][   ]
			B4 [   ][   ][ 25][ X ][ X ][ X ][ 25][   ][   ][   ]
			B5 [   ][   ][   ][   ][ X ][   ][   ][   ][   ][   ]
			B6 [   ][   ][   ][ X ][ 25][   ][   ][   ][   ][   ]
			B7 [   ][   ][ 25][   ][   ][   ][   ][   ][   ][   ]
			B8 [   ][   ][   ][   ][   ][   ][   ][   ][   ][   ]
			B9 [   ][   ][   ][   ][   ][   ][   ][   ][   ][   ]
			```

## Prod
-	This builds the final production grade version of the app
-	`npm run prod` to generate the optimized `connect.html` and `*.connect.js`
	-	Use `npm run serve` to start a web environment to use the built app with all the features

# How To Generate AI/ML Datasets For Training

-	Open the `connect.html` file in your web browser from a website or a local web server
-	Click on the `DB` link at the top of the page
-	Change configure the settings for your needs
-	Click the `Apply` button
-	Wait until threads complete and the data has been processed
-	Click the `Download` button to download the newly generated DB, in your specified format, to your computer

## MultiThreaded DB Generation

-	In the `Gameplay DB Generator` page, scroll down until you see `Threads`. Increase the number of threads to scale the multithreading capabilities of the generator.
-	MultiThreading is accomplished via JavaScript's [WebWorkers](https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API)

# DB Parsing

-	Common to all formats
	-	`X` always goes first
	-	Positions are hashed into hexadecimal format
		-	EG: Placement `(A2,B3)` is encoded as `0x0203`
		-	```typescript 
			// Decode
			(positionHash: number) => { A: ((positionHash >> 8) & 0xff), B: (positionHash & 0xff)}

			// Encode
			(A: number, B: number) => ((A & 0xff) << 8) | (B & 0xff)
			```
-	CSV
	-	This format is file size optimized
	-	Game data example `OX:1,2,3;OX:2,3,4!OX:4,5,6,7,8,9; ...`
		-	`OX:1,2,3;` the length of the array is 3. 3 is odd, so X won. Unless a `!` appears instead of a `:`.
			-	```typescript
				let winnerX: boolean = Boolean(array.length % 2)
				````
		-	`OX:...;`
			-	`O` represents the skill of `O` in a single digit. A value of `0` indicates an AI/ML engine was used.
			-	`X` represents the skill of `X` in a single digit. A value of `0` indicates an AI/ML engine was used.
		-	`OX!...;`
			-	The `!` instead of `:` indicates that the game was a draw
-	JSON
	-	This format is compute optimized
	-	Games are stored in `games: HistoryReportInstance[]`
		-	`HistoryReportInstance` is defined as
			-	```typescript
				{
					h: number[], // history of placements
					o: number, // skill of player o
					x: number, // skill of player x
					w: boolean, // true is o winner, false is x winner, and null is drawn game
				}
				```