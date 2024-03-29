# Mat Table Extension

This library was generated with [Angular CLI](https://github.com/angular/angular-cli) version 14.2.10.
## Documentation

Check out the [demos and API](https://fastcode-inc.github.io/custom-table-doc).
## Installation

First, you should install and set up Angular Material. [Learn more about the setup](https://material.angular.io/guide/getting-started).

Install the Extension library:

```bash
$ npm i mat-table-ext
```

## Setup

Import the MatTableExtModule into imports array.

```ts
import { MatTableExtModule } from 'mat-table-ext';

@NgModule({
  ...
  imports: [MatTableExtModule,...],
  ...
})
export class YourAppModule {
}
```
```
After adding the MatTableExtModule to your application, add the path of assets of table to your application.
Add the following to your angular.json file under build and test (if required).
 {
   "assets": [
     {
       "glob": "**/*",
       "input": "./node_modules/mat-table-ext/assets",
       "output": "/assets/"
     }
   ]
 }
```
## Theming

After importing the module, you can pass your application theme to the mat-table-ext library by adding the following content to your theme file. [More details about theming.](https://material.angular.io/guide/theming).


```ts
@use '../node_modules/mat-table-ext/assets/theming' as matext;

@include matext.mat-table-ext-theme($your-theme);
```
## License

MIT
