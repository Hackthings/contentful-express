contentful-express
==================

> Static site generator + development server for Contentful data in Node.js.



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



#### ProperJS/App scaffold
When using the default client-side application scaffold, you can start the project using bin scripts. This boots the dev server and runs webpack.
```shell
./bin/start
```



### About



#### Config.js
The `config.js` file is your settings file for this tool. It's set to work out of the box with all the defaults. Make sure you add your contentful `space ID` and `accessToken` to it.

```javascript
{
    contentful: {
        space: {spaceId}
        accessToken: {accessToken}
    }
}
```

All settings in this file can be changed.



#### Data + Routes
This tool maps your [Contentful](https://www.contentful.com/) `contentTypes` to a node dev server and a static site builder. How does that work?

If you have a contentType called `Artist` with an id of `artist` you get the following routes:

```shell
/artist/
/artist/:id
```

The first one is a listing of all `entries` for the contentType. The second one is a single `entry` post by `ID`.

No data from Contentful is altered in any way before passing it to your templates. The one modification is the addition of a property on an `Entry` called `static`. This makes an `Entry` look like this:

```javascript
{
    sys: {object},
    fields: {object},
    static: {
        url: {string}
    }
}
```

The addition of the static url is so you can create links in your templates to your entry details. Since the `urls` config option is available, this static url is correctly normalized for you and honored for the server and the static build.

Obviously you may not want your URLs to use the `:id` field for an entry detail template. That's ok. You can specify a field(s) to process as an entry slug. The value must be a regular expression.

```javascript
{
    urls: {
        field: /name|title/
    }
}
```



#### Templates
Your templates are generated in a similar way to how the routes are mapped. For each `contentType` you get an `entry.html` and an `entries.html` template. So, for `Artist` you get the following:

```shell
template/
    artist/
        entry.html
        entries.html
```

The default template language is [ejs](https://github.com/tj/ejs). This tool uses [consolidate](https://www.npmjs.com/package/consolidate) so you can use any of the supported languages there. You need to provide the template engine you wish to use. Say you would like to use mustache. You would do the following:

Install mustache as a local dependency for your project.
```shell
npm install mustache --save-dev
```

Provide the mustache ref to consolidate through `config.js`.
```javascript
{
    template: {
        lang: "mustache",
        engine: require( "mustache" )
    }
}
```

The following data context is exposed to all templates. The caveat being that `entry` and `entries` are contextual to whether you are looking at a contentType list of entries or a single entry by contentType.

```javascript
{
    space: {object},
    static: {object},
    staticPages: {array},
    contentTypes: {array},

    // Exposed to entry.html
    entry?: {object},

    // Exposed to entries.html
    entries?: {array}
}
```



#### Ignore Types
Most likely you'll not want all of your contentTypes to have a routing map. You can use the `ignore` field in `config.js` to specify an array of contentTypes to omit from routing and templating.

```javascript
{
    ignore: [
        "category",
        "location"
    ]
}
```



#### Data Mapping
You can specify data mapping to contentType routes and static page routes using the `mapping` option in `config.js`.

```javascript
{
    mapping: {
        // Map set of contentTypes to homepage, "/"
        // This will include all entries for all contentTypes mapped
        "index": [
            "artist",
            "category"
        ],

        // Map a single entry to a static page, "/about/"
        // This will include the single entry that is mapped by contentType
        "about": {
            // The contentType
            "type": "page",

            // How to match an entry by a field value
            "entry": {
                "field": "name",
                "value": "About"
            }
        }
    }
}
```



#### Scaffold
A scaffold is generated for you in the directory you call `prismic-express init` within. This starts your templates for the dev server and site generator.

It also pulls in [ProperJS/App](https://github.com/ProperJS/App) as your client-side application scaffold. Check the [ProperJS/App readme](https://github.com/ProperJS/App) for more on this.

If you don't want to use ProperJS/App, simply trash it and start from scratch or use some other boilerplate you prefer.


```shell
.gitignore
config.js
package.json
README.md
source/
static/
template/
webpack.config.js
```



#### Static Pages
Any `.html` file created in the templates root directory will be generated into a static page with no context data from Contentful. So, `about.html` becomes `/about/` as an active route. By default the `index.html` template is reserved as the homepage.



### Pull Requests
1. Fork it
2. Create your feature branch (`git checkout -b my-new-feature`)
3. Commit your changes (`git commit -am 'Add some feature'`)
4. Push to the branch (`git push origin my-new-feature`)
5. Create new Pull Request
