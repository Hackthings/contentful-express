contentful-express
==================

> Static site generator + development server for Contentful data in Node.js.



### About



#### Data + Routes + Templates
This tool maps your [Contentful](https://www.contentful.com/) `contentTypes` to a node dev server and a static site builder. How does that work?

If you have a contentType called `Artist` with an id of `artist` you get the following routes:

```shell
/artist/
/artist/:id
```

The first one is a listing of all `entries` for the contentType. The second one is a single `entry` post by `ID`.

The default template language is [ejs](https://github.com/tj/ejs). But since this tool uses [consolidate](https://www.npmjs.com/package/consolidate) you can use any of the supported languages there. Just change the `lang` field in `config.js` to whatever you like.


##### Template Data
The following data context is exposed to all templates. The caveat being that `entry` and `entries` are contextual to whether you are looking at a contentType list of entries or a single entry by contentType.

```javascript
{
    space: {object},
    static: {object},
    staticPages: {array},
    contentTypes: {array},
    entry: {object},
    entries: {array}
}
```



#### Config.js
The `config.js` file is your configuration file for this tool. It's set to work out of the box with all the defaults. Make sure you add your contentful `space ID` and `accessToken` to it.

All settings in this file can be changed. If you change the locations of output for `css` and `js` in your `package.json`, make sure you upate `static.js` or `static.css` in `config.js`.



#### Scaffold
A scaffold is generated for you in the directory you call `contentful-express init` within. You get the following.


```shell
.gitignore
config.js
package.json
README.md
source/
static/
template/
```



#### Source + Static
As a base, [ProperJS/App](https://github.com/ProperJS/App) is loaded for you as your `source` starting point for Javascript and SASS. Check the [readme](https://github.com/ProperJS/App#workflow) for all the great `npm` scripts that are already configured for this.

If you don't want to use that, simply trash it and start from scratch or use some other boilerplate you prefer.



#### Static Pages
Any `.html` file created in the templates root directory will be generated into a static page with no context data from Contentful. So, `about.html` becomes `/about/` as an active route. By default the `index.html` template is reserved as the homepage.




### Install
```shell
npm install contentful-express -g
```



### Usage

#### New Project
```shell
mkdir my-project

cd my-project

contentful-express init
```



#### Run Server
```shell
contentful-express server
```



#### Run Sync
```shell
contentful-express sync
```



#### Run Build
```shell
contentful-express build
```



#### Print Help
```shell
contentful-express help
```



### Pull Requests
1. Fork it
2. Create your feature branch (`git checkout -b my-new-feature`)
3. Commit your changes (`git commit -am 'Add some feature'`)
4. Push to the branch (`git push origin my-new-feature`)
5. Create new Pull Request
