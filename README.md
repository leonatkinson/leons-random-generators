# Leon's Random Generators

Leon's Random Generators as WordPress Gutenberg blocks and a Node.js text generation engine.

## Installation

1. Clone or place this repository into your WordPress plugins directory (`wp-content/plugins/leons-random-generators`).  Alternatively, use `wp-cli` to install the plugin
   like this: `wp plugin install --force https://github.com/leonatkinson/leons-random-generators/archive/refs/heads/master.zip`
2. Activate the plugin in your WordPress admin dashboard.
3. Optionally, get a Flickr API key and enter it in settings.
4. Add one of the nine blocks into a page. The generator will preview exactly as it appears on the public side.

## Configuring Flickr API for Album Covers

By default, album covers use a random solid background color. To pull photos from Flickr:
1. Navigate to **Settings > Leon's Random Generators** in your WordPress admin.
2. Enter your Flickr API key in the password field.
3. Click **Save Changes**.

## Development

1. Run `npm install` inside the plugin directory to install dependencies.
2. Build the assets for production:
   ```bash
   npm run build
   ```

## Command-Line Scripts

You can run random generators from the command line using npm scripts:

```bash
npm run generate -- <generator-type> [--seed <number>] [--text "<text>"]
```

Available generator types:
- `band`
- `album`
- `lyrics`
- `song`
- `jokes`
- `advice`
- `essay`
- `comic`
- `translate`

### Examples:
Generate a random band name with a seed:
```bash
npm run generate -- band --seed 42
```

Translate input text:
```bash
npm run generate -- translate --text "the cat sees the dog"
```

## Customizing the Dictionary

The dictionary source data is stored as a CSV in `src/data/dictionary.csv`. 
If you modify `src/data/dictionary.csv`, you can compile it into `src/data/dictionary.json` on demand by running:

```bash
npm run build-dictionary
```
*(Note: `npm run build` also automatically builds the dictionary before compiling the WordPress blocks.)*

Run unit tests:
```bash
npm test
```

Run test coverage report:
```bash
npm run coverage
```

## License

MIT License. See [LICENSE](LICENSE).
