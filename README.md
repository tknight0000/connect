# Build

### `Node.js` is required to build this app [https://nodejs.org](nodejs.org)

Output files from the build processes are stored in the `dist` directory

## Dev
-	`npm run dev` to watch for code changes and live-reload browser if changed

## Prod
-	`npm run prod` to generate the compressed `connect.html`
	-	Use `npm run serve` to start a web environment to use the app locally

### Prod - Known Issues

- https://github.com/remy/inliner/issues/225
	-	 Comment out the following in `node_modules\inliner\lib\tasks\js.js` to avoid library issue
```
if (type && type.toLowerCase() !== 'text/javascript') {
	debug('skipping %s', type);
	return false;
}
```

# How To Play

-	Open the `connect.html` file in your web browser