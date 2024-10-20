# How To Play

-	Open the `connect.html` file in your web browser

# How To Generate AI/ML Datasets For Training

-	Open the `connect.html` file in your web browser
-	Click on the `DB` link at the top of the page
-	Change configure the settings for your needs
-	Click the `Apply` button
-	Wait until thread(s) complete
-	Click the `Download` button to download the file containing the newly generated DB, in your specified format, to your computer

# Build

### `Node.js` is required to build this app [nodejs.org](https://nodejs.org)

Output files from the build processes are stored in the `dist` directory

## Dev
-	`npm run dev` to watch for code changes and live-reload browser if changed
-	`npm run test-dev` to watch for code changes and re-run unit tests [Jest](https://jestjs.io) if changed
	-	Leverage the `printGameboard(displayOPieces?: boolean, note?: string)` to visualize the evaluations in the command line
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
-	`npm run prod` to generate the optimized `connect.html`
	-	Use `npm run serve` to start a web environment to use the app locally

### Prod - Known Issues

- https://github.com/remy/inliner/issues/225
	-	 Comment out the following in `node_modules\inliner\lib\tasks\js.js` (line 18) to avoid library issue
```
if (type && type.toLowerCase() !== 'text/javascript') {
	debug('skipping %s', type);
	return false;
}
```

# TODO

-	Allow copy-and-paste AI/ML functions to be run in the `Gameplay DB Generator` and `Settings`