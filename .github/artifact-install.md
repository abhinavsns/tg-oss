# Installing the React 19 packages

Download and unzip the `tg-oss-react19-*` artifact from the `React 19 packages`
workflow run. Install both tarballs together so the OVE package resolves the matching UI package:

```sh
npm install ./teselagen-ui-0.11.0.tgz ./teselagen-ove-0.9.0.tgz
```

The consuming application must provide React and ReactDOM 18.3 or 19. Import the
styles explicitly:

```js
import "@teselagen/ui/style.css";
import "@teselagen/ove/style.css";
```
