var fs = require('fs');
var webResourceInliner = require('web-resource-inliner');

// Read HTML file
var html = fs.readFileSync('./dist/working/index.html', 'utf8');
if (process.platform === 'win32') {
	html = html.replace(/\r\n/g, '\n');
}

// Inline it
webResourceInliner.html(
	{
		fileContent: html,
		relativeTo: './dist/working',
	},
	function (error, results) {
		if (error) {
			throw new Error(error);
		} else {
			fs.writeFile('./dist/index.html', results, function (error) {
				if (error) {
					throw new Error(error);
				}
			});
		}
	},
);
