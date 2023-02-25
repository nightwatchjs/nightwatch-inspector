
# Nightwatch Selector Playground 🎮
<p align="center">
  <img alt="Nightwatch.js Logo" src="https://raw.githubusercontent.com/nightwatchjs/nightwatch/main/.github/assets/nightwatch-logo.png" width=200 />
</p>

Nightwatch Selector Playground is a devtool which currently supports Google Chrome. This tool helps to find CSS selectors for elements on a webpage. It also allows you to tests nightwatch commands directly from the browser in Nightwatch debug mode. 

Nightwatch Selector Playground requires no setup or downloads. Simply use the Nightwatch version where this tool is supported. It is specifically designed to work with Nightwatch.js, a popular end-to-end testing framework. 

## 🚀 Getting Started With Nightwatch 
1. No downloads or setup necessary. Just ensure that your Nightwatch version supports the Nightwatch Selector Playground.
2. Add `pause` or `debug` command in your test to wait
3. Run your Nightwatch tests by passing `--debug` flag

   ```sh
    npx nightwatch ./nightwatch/examples/basic/ecosia.js -e chrome --debug
   ```
4. Go to the browser and inspect elements and go to `Selector Playground` tab
5. Click the `Explore Mode` button to find CSS selectors for elements of the webpage
6. Click `Try` button to test the Commands 


## 🎉 Key Features
- Easily find CSS selectors for elements on a webpage
- Test Nightwatch commands directly from the browser
- Copy selectors to clipboard with one click
- Highlight elements on hover for easy identification
- History table of selectors and commands.


## 🎥 Demo

![playground](https://user-images.githubusercontent.com/94462364/221351842-f47ac331-325f-4098-b540-be3bd637496f.gif)


## 🔧 Use in Other Projects (with a limitation)
This tool is not limited to Nightwatch.js and can be used in any project that needs CSS selectors. However, it comes with a limitation; you cannot test Nightwatch commands directly from the browser because it doesn't connected to the Nightwatch Server.

```js
import {crxfile} from 'nightwatch-selector-playground';
```

This code snippet shows how to import the Nightwatch Selector Playground in other projects. 💻

## 🤝 Contributing
Contributions are always welcome! If you have any suggestions, bug reports, or pull requests, please feel free to open an issue or pull request.

## 📄 License

[MIT](https://github.com/harshit-bs/nightwatch-selector-playground/blob/main/LICENSE)
