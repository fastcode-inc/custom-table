# Mat Table Extension

This library was generated with [Angular CLI](https://github.com/angular/angular-cli) version 14.2.10.

## Installation

At first, you should install the Angular Material and setup it. [Learn more about the setup](https://material.angular.io/guide/getting-started).

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
After adding the MatTableExtModule to your application, 
Now you have to add path of assets of table into your application.
Add following into your angular.json file under build and test(if required)
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
## Code scaffolding

Run `ng generate component component-name --project mat-table-ext` to generate a new component. You can also use `ng generate directive|pipe|service|class|guard|interface|enum|module --project mat-table-ext`.
> Note: Don't forget to add `--project mat-table-ext` or else it will be added to the default project in your `angular.json` file. 

## Build

Run `ng build mat-table-ext` to build the project. The build artifacts will be stored in the `dist/` directory.

## Running unit tests

Run `ng test mat-table-ext` to execute the unit tests via [Karma](https://karma-runner.github.io).

## Further help

To get more help on the Angular CLI use `ng help` or go check out the [Angular CLI Overview and Command Reference](https://angular.io/cli) page.
